/**
 * CropMagix - Cache Manager
 * Persistent storage using LocalStorage
 */

const CACHE_KEYS = {
    LANGUAGE: 'cropmagix_language',
    SCAN_HISTORY: 'cropmagix_scan_history',
    LAST_ANALYSIS: 'cropmagix_last_analysis',
    CHAT_HISTORY: 'cropmagix_chat_history',
    WEATHER_CACHE: 'cropmagix_weather',
    USER_LOCATION: 'cropmagix_location',
    SETTINGS: 'cropmagix_settings'
};

function isBrowser() {
    return typeof window !== 'undefined';
}

export function set(key, value, ttl = null) {
    if (!isBrowser()) return;

    const item = {
        value,
        timestamp: Date.now(),
        ttl
    };

    try {
        localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
        console.warn('LocalStorage full, clearing old data');
        clearOldData();
        try {
            localStorage.setItem(key, JSON.stringify(item));
        } catch (e2) {
            console.error('Failed to save to localStorage:', e2);
        }
    }
}

export function get(key) {
    if (!isBrowser()) return null;

    try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        const item = JSON.parse(itemStr);

        if (item.ttl && Date.now() - item.timestamp > item.ttl) {
            localStorage.removeItem(key);
            return null;
        }

        return item.value;
    } catch (e) {
        return null;
    }
}

export function remove(key) {
    if (!isBrowser()) return;
    localStorage.removeItem(key);
}

function clearOldData() {
    if (!isBrowser()) return;
    const history = getScanHistory();
    if (history.length > 10) {
        const trimmed = history.slice(0, 10);
        set(CACHE_KEYS.SCAN_HISTORY, trimmed);
    }
}

// Scan History
export function addScanToHistory(scanData) {
    if (!isBrowser()) return;

    const history = getScanHistory();

    const newScan = {
        id: scanData.id || `scan_${Date.now()}`,
        plant_name: scanData.plant_name || 'Unknown Plant',
        plant_type: scanData.plant_type || 'plant',
        health_status: scanData.health_status || 'unknown',
        diseases: scanData.diseases || [],
        recommendations: scanData.recommendations || [],
        confidence: scanData.confidence || 0,
        image: scanData.image || null,
        timestamp: scanData.timestamp || Date.now()
    };

    history.unshift(newScan);

    // Keep only last 50 scans
    const trimmed = history.slice(0, 50);
    set(CACHE_KEYS.SCAN_HISTORY, trimmed);
}

export function getScanHistory() {
    return get(CACHE_KEYS.SCAN_HISTORY) || [];
}

export function getScanById(id) {
    const history = getScanHistory();
    return history.find(scan => scan.id === id);
}

export function deleteScan(id) {
    const history = getScanHistory();
    const filtered = history.filter(scan => scan.id !== id);
    set(CACHE_KEYS.SCAN_HISTORY, filtered);
}

// Last Analysis
export function saveLastAnalysis(analysis) {
    set(CACHE_KEYS.LAST_ANALYSIS, analysis);
}

export function getLastAnalysis() {
    return get(CACHE_KEYS.LAST_ANALYSIS);
}

// Chat History
export function saveChatHistory(messages) {
    set(CACHE_KEYS.CHAT_HISTORY, messages);
}

export function getChatHistory() {
    return get(CACHE_KEYS.CHAT_HISTORY) || [];
}

export function addChatMessage(message) {
    const history = getChatHistory();
    history.push({
        ...message,
        timestamp: Date.now()
    });
    // Keep last 100 messages
    const trimmed = history.slice(-100);
    saveChatHistory(trimmed);
}

export function clearChatHistory() {
    remove(CACHE_KEYS.CHAT_HISTORY);
}

// Weather Cache
export function saveWeatherData(lat, lon, data) {
    const key = `${CACHE_KEYS.WEATHER_CACHE}_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    set(key, data, 15 * 60 * 1000); // 15 min TTL
}

export function getWeatherData(lat, lon) {
    const key = `${CACHE_KEYS.WEATHER_CACHE}_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    return get(key);
}

// User Location
export function saveUserLocation(lat, lon) {
    set(CACHE_KEYS.USER_LOCATION, { lat, lon });
}

export function getUserLocation() {
    return get(CACHE_KEYS.USER_LOCATION);
}

// Settings
export function saveSettings(settings) {
    set(CACHE_KEYS.SETTINGS, settings);
}

export function getSettings() {
    return get(CACHE_KEYS.SETTINGS) || {
        language: 'en',
        ttsEnabled: true,
        notificationsEnabled: true,
        organicPreference: false
    };
}

export function updateSetting(key, value) {
    const settings = getSettings();
    settings[key] = value;
    saveSettings(settings);
}

// Clear All
export function clearAll() {
    if (!isBrowser()) return;

    Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key);
    });

    // Also clear any weather caches
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cropmagix_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
}

// Stats
export function getStats() {
    const history = getScanHistory();
    const total = history.length;
    const healthy = history.filter(s => s.health_status === 'healthy').length;
    const issues = total - healthy;

    return { total, healthy, issues };
}

export { CACHE_KEYS };
