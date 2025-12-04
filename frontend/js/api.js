/**
 * CropMagix - API Service
 * Handles all backend communication
 */

// API Configuration
const API_CONFIG = {
    // Auto-detect backend URL based on environment
    BASE_URL: (() => {
        // Check for saved URL first
        const saved = localStorage.getItem('cropmagix_api_url');
        if (saved) return saved;
        
        // Local development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        }
        
        // Production - try to detect from Vercel environment or use Render backend
        // Update this with your actual Render backend URL
        return 'https://agroai-backend.onrender.com';
    })(),
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 2
};

/**
 * API Service Class
 */
class ApiService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    }
    
    /**
     * Set backend URL (for dynamic configuration)
     */
    setBaseUrl(url) {
        this.baseUrl = url;
        localStorage.setItem('cropmagix_api_url', url);
    }
    
    /**
     * Get configured base URL
     */
    getBaseUrl() {
        return localStorage.getItem('cropmagix_api_url') || this.baseUrl;
    }
    
    /**
     * Make API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.getBaseUrl()}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: API_CONFIG.TIMEOUT
        };
        
        const config = { ...defaultOptions, ...options };
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || `HTTP ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw error;
        }
    }
    
    // ============ Health Analysis ============
    
    /**
     * Convert Blob/File to base64
     */
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    
    /**
     * Analyze plant health from image (accepts Blob or base64)
     */
    async analyzeHealth(imageInput, plantType = null, language = null) {
        let imageBase64 = imageInput;
        
        // Convert Blob/File to base64 if needed
        if (imageInput instanceof Blob || imageInput instanceof File) {
            imageBase64 = await this.blobToBase64(imageInput);
        }
        
        // Get language from storage
        const lang = language || localStorage.getItem('cropmagix-lang') || 'en';
        
        return this.request('/api/analyze-health', {
            method: 'POST',
            body: JSON.stringify({
                image_base64: imageBase64,
                plant_type: plantType,
                language: lang
            })
        });
    }
    
    // ============ Plant Chat ============
    
    /**
     * Chat with plant
     */
    async chatWithPlant(message, plantType = 'Unknown', healthStatus = 'healthy', language = null) {
        const lang = language || localStorage.getItem('cropmagix-lang') || 'en';
        return this.request('/api/chat-with-plant', {
            method: 'POST',
            body: JSON.stringify({
                message: message,
                plant_type: plantType,
                health_status: healthStatus,
                diseases: [],
                conversation_history: [],
                language: lang
            })
        });
    }
    
    // ============ Future Generation ============
    
    /**
     * Generate future prediction (accepts Blob or base64)
     */
    async generateFuture(imageInput, disease, daysAhead = 14, scenario = 'untreated', language = null) {
        let imageBase64 = imageInput;
        
        if (imageInput instanceof Blob || imageInput instanceof File) {
            imageBase64 = await this.blobToBase64(imageInput);
        }
        
        const lang = language || localStorage.getItem('cropmagix-lang') || 'en';
        
        return this.request('/api/generate-future', {
            method: 'POST',
            body: JSON.stringify({
                image_base64: imageBase64,
                scenario: scenario,
                disease: disease,
                days_ahead: daysAhead,
                language: lang
            })
        });
    }
    
    // ============ Soil & Weather ============
    
    /**
     * Get weather and farming advice
     */
    async getSoilWeather(latitude, longitude, soilImageInput = null, language = null) {
        let soilImageBase64 = null;
        
        if (soilImageInput instanceof Blob || soilImageInput instanceof File) {
            soilImageBase64 = await this.blobToBase64(soilImageInput);
        } else if (soilImageInput) {
            soilImageBase64 = soilImageInput;
        }
        
        const lang = language || localStorage.getItem('cropmagix-lang') || 'en';
        
        return this.request('/api/soil-weather', {
            method: 'POST',
            body: JSON.stringify({
                image_base64: soilImageBase64,
                latitude: latitude,
                longitude: longitude,
                language: lang
            })
        });
    }
    
    /**
     * Analyze soil from image
     */
    async analyzeSoil(imageInput, latitude, longitude, language = null) {
        return this.getSoilWeather(latitude, longitude, imageInput, language);
    }
    
    /**
     * Get weather only (no soil)
     */
    async getWeather(latitude, longitude, language = null) {
        const lang = language || localStorage.getItem('cropmagix-lang') || 'en';
        return this.request(`/api/weather?lat=${latitude}&lon=${longitude}&language=${lang}`);
    }
    
    // ============ Health Check ============
    
    /**
     * Check if backend is available
     */
    async healthCheck() {
        try {
            const result = await this.request('/health');
            return result.status === 'healthy';
        } catch (e) {
            return false;
        }
    }
}

// Create singleton instance
const api = new ApiService();

// Alias for backward compatibility
const API = api;

// Export for use in other modules
window.api = api;
window.API = api;
