/**
 * CropMagix - Cache Manager
 * Persistent storage using LocalStorage + IndexedDB
 * Data survives page refresh, only cleared on explicit reset
 */

const CACHE_KEYS = {
    LANGUAGE: 'cropmagix_language',
    SCAN_HISTORY: 'cropmagix_scan_history',
    LAST_ANALYSIS: 'cropmagix_last_analysis',
    CHAT_HISTORY: 'cropmagix_chat_history',
    WEATHER_CACHE: 'cropmagix_weather_cache',
    USER_LOCATION: 'cropmagix_user_location',
    SETTINGS: 'cropmagix_settings'
};

// Cache TTL (Time To Live) in milliseconds
const CACHE_TTL = {
    WEATHER: 15 * 60 * 1000,  // 15 minutes
    ANALYSIS: 24 * 60 * 60 * 1000,  // 24 hours
    PERMANENT: null  // Never expires
};

/**
 * Cache Manager Class
 */
class CacheManager {
    constructor() {
        this.dbName = 'CropMagixDB';
        this.dbVersion = 1;
        this.db = null;
        this.initIndexedDB();
    }
    
    /**
     * Initialize IndexedDB for larger data storage
     */
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.warn('IndexedDB not available, using LocalStorage only');
                resolve(null);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('images')) {
                    db.createObjectStore('images', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('analyses')) {
                    db.createObjectStore('analyses', { keyPath: 'id' });
                }
            };
        });
    }
    
    // ============ LocalStorage Methods ============
    
    /**
     * Save data to LocalStorage
     */
    set(key, value, ttl = null) {
        try {
            const item = {
                value: value,
                timestamp: Date.now(),
                ttl: ttl
            };
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (e) {
            console.error('Cache set error:', e);
            return false;
        }
    }
    
    /**
     * Get data from LocalStorage
     */
    get(key) {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return null;
            
            const item = JSON.parse(itemStr);
            
            // Check if expired
            if (item.ttl && (Date.now() - item.timestamp) > item.ttl) {
                localStorage.removeItem(key);
                return null;
            }
            
            return item.value;
        } catch (e) {
            console.error('Cache get error:', e);
            return null;
        }
    }
    
    /**
     * Remove item from LocalStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // ============ Scan History Methods ============
    
    /**
     * Add a scan to history
     */
    addScanToHistory(scanData) {
        const history = this.getScanHistory();
        
        const scan = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            imagePreview: scanData.imagePreview,  // Small thumbnail
            plantType: scanData.plantType,
            healthStatus: scanData.healthStatus,
            diseases: scanData.diseases || [],
            recommendations: scanData.recommendations || [],
            confidence: scanData.confidence
        };
        
        // Add to beginning of array
        history.unshift(scan);
        
        // Keep only last 50 scans
        if (history.length > 50) {
            history.pop();
        }
        
        this.set(CACHE_KEYS.SCAN_HISTORY, history, CACHE_TTL.PERMANENT);
        
        return scan;
    }
    
    /**
     * Get scan history
     */
    getScanHistory() {
        return this.get(CACHE_KEYS.SCAN_HISTORY) || [];
    }
    
    /**
     * Get single scan by ID
     */
    getScanById(id) {
        const history = this.getScanHistory();
        return history.find(scan => scan.id === id);
    }
    
    /**
     * Delete scan from history
     */
    deleteScan(id) {
        const history = this.getScanHistory();
        const filtered = history.filter(scan => scan.id !== id);
        this.set(CACHE_KEYS.SCAN_HISTORY, filtered, CACHE_TTL.PERMANENT);
    }
    
    // ============ Last Analysis Methods ============
    
    /**
     * Save last analysis result
     */
    saveLastAnalysis(analysis) {
        this.set(CACHE_KEYS.LAST_ANALYSIS, analysis, CACHE_TTL.ANALYSIS);
    }
    
    /**
     * Get last analysis result
     */
    getLastAnalysis() {
        return this.get(CACHE_KEYS.LAST_ANALYSIS);
    }
    
    // ============ Chat History Methods ============
    
    /**
     * Save chat history
     */
    saveChatHistory(messages) {
        this.set(CACHE_KEYS.CHAT_HISTORY, messages, CACHE_TTL.PERMANENT);
    }
    
    /**
     * Get chat history
     */
    getChatHistory() {
        return this.get(CACHE_KEYS.CHAT_HISTORY) || [];
    }
    
    /**
     * Add message to chat history
     */
    addChatMessage(message) {
        const history = this.getChatHistory();
        history.push({
            ...message,
            timestamp: Date.now()
        });
        
        // Keep only last 100 messages
        if (history.length > 100) {
            history.shift();
        }
        
        this.saveChatHistory(history);
        return history;
    }
    
    /**
     * Clear chat history
     */
    clearChatHistory() {
        this.set(CACHE_KEYS.CHAT_HISTORY, [], CACHE_TTL.PERMANENT);
    }
    
    // ============ Weather Cache Methods ============
    
    /**
     * Save weather data
     */
    saveWeatherData(lat, lon, data) {
        const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
        const weatherCache = this.get(CACHE_KEYS.WEATHER_CACHE) || {};
        
        weatherCache[cacheKey] = {
            data: data,
            timestamp: Date.now()
        };
        
        this.set(CACHE_KEYS.WEATHER_CACHE, weatherCache, CACHE_TTL.PERMANENT);
    }
    
    /**
     * Get cached weather data
     */
    getWeatherData(lat, lon) {
        const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
        const weatherCache = this.get(CACHE_KEYS.WEATHER_CACHE) || {};
        
        const cached = weatherCache[cacheKey];
        if (!cached) return null;
        
        // Check if still valid (15 min TTL)
        if ((Date.now() - cached.timestamp) > CACHE_TTL.WEATHER) {
            return null;
        }
        
        return cached.data;
    }
    
    // ============ User Location Methods ============
    
    /**
     * Save user location
     */
    saveUserLocation(lat, lon) {
        this.set(CACHE_KEYS.USER_LOCATION, { lat, lon }, CACHE_TTL.PERMANENT);
    }
    
    /**
     * Get saved user location
     */
    getUserLocation() {
        return this.get(CACHE_KEYS.USER_LOCATION);
    }
    
    // ============ Settings Methods ============
    
    /**
     * Save app settings
     */
    saveSettings(settings) {
        this.set(CACHE_KEYS.SETTINGS, settings, CACHE_TTL.PERMANENT);
    }
    
    /**
     * Get app settings
     */
    getSettings() {
        return this.get(CACHE_KEYS.SETTINGS) || {
            ttsEnabled: true,
            autoScan: false,
            darkMode: false
        };
    }
    
    /**
     * Update single setting
     */
    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.saveSettings(settings);
    }
    
    // ============ IndexedDB Image Storage ============
    
    /**
     * Save image to IndexedDB (for larger images)
     */
    async saveImage(id, imageData) {
        if (!this.db) return false;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            
            const request = store.put({
                id: id,
                data: imageData,
                timestamp: Date.now()
            });
            
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(false);
        });
    }
    
    /**
     * Get image from IndexedDB
     */
    async getImage(id) {
        if (!this.db) return null;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['images'], 'readonly');
            const store = transaction.objectStore('images');
            
            const request = store.get(id);
            
            request.onsuccess = () => resolve(request.result?.data || null);
            request.onerror = () => reject(null);
        });
    }
    
    // ============ Reset Methods ============
    
    /**
     * Clear all cached data
     */
    clearAll() {
        // Clear LocalStorage
        Object.values(CACHE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Clear IndexedDB
        if (this.db) {
            const transaction = this.db.transaction(['images', 'analyses'], 'readwrite');
            transaction.objectStore('images').clear();
            transaction.objectStore('analyses').clear();
        }
        
        console.log('All cache cleared');
        return true;
    }
    
    /**
     * Get cache statistics
     */
    getStats() {
        const scanHistory = this.getScanHistory();
        const chatHistory = this.getChatHistory();
        
        return {
            scansCount: scanHistory.length,
            messagesCount: chatHistory.length,
            lastScan: scanHistory[0]?.timestamp || null,
            storageUsed: this._getStorageUsed()
        };
    }
    
    /**
     * Get approximate storage used
     */
    _getStorageUsed() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2; // UTF-16
            }
        }
        return (total / 1024).toFixed(2) + ' KB';
    }
}

// Create singleton instance
const cache = new CacheManager();

// Export for use in other modules
window.cache = cache;
window.CACHE_KEYS = CACHE_KEYS;
