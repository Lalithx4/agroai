/**
 * CropMagix - API Service
 * Handles all backend communication
 */

const API_CONFIG = {
    BASE_URL: typeof window !== 'undefined' 
        ? localStorage.getItem('cropmagix_api_url') || 
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:8000'
            : 'https://agroai-backend.onrender.com')
        : 'http://localhost:8000',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 2
};

async function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

async function apiRequest(endpoint, options = {}) {
    const baseUrl = typeof window !== 'undefined' 
        ? localStorage.getItem('cropmagix_api_url') || API_CONFIG.BASE_URL
        : API_CONFIG.BASE_URL;
    const url = `${baseUrl}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    const config = { ...defaultOptions, ...options };
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
        
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

export async function analyzeHealth(imageInput, plantType = null, language = null) {
    let imageBase64 = imageInput;
    
    if (imageInput instanceof Blob || imageInput instanceof File) {
        imageBase64 = await blobToBase64(imageInput);
    }
    
    const lang = language || (typeof window !== 'undefined' ? localStorage.getItem('cropmagix-lang') : 'en') || 'en';
    
    return apiRequest('/api/analyze-health', {
        method: 'POST',
        body: JSON.stringify({
            image_base64: imageBase64,
            plant_type: plantType,
            language: lang
        })
    });
}

export async function chatWithPlant(message, plantType = 'Unknown', healthStatus = 'healthy', language = null) {
    const lang = language || (typeof window !== 'undefined' ? localStorage.getItem('cropmagix-lang') : 'en') || 'en';
    return apiRequest('/api/chat-with-plant', {
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

export async function generateFuture(imageInput, disease, daysAhead = 14, scenario = 'untreated', language = null) {
    let imageBase64 = imageInput;
    
    if (imageInput instanceof Blob || imageInput instanceof File) {
        imageBase64 = await blobToBase64(imageInput);
    }
    
    const lang = language || (typeof window !== 'undefined' ? localStorage.getItem('cropmagix-lang') : 'en') || 'en';
    
    return apiRequest('/api/generate-future', {
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

export async function getSoilWeather(latitude, longitude, soilImageInput = null, language = null) {
    let soilImageBase64 = null;
    
    if (soilImageInput instanceof Blob || soilImageInput instanceof File) {
        soilImageBase64 = await blobToBase64(soilImageInput);
    } else if (soilImageInput) {
        soilImageBase64 = soilImageInput;
    }
    
    const lang = language || (typeof window !== 'undefined' ? localStorage.getItem('cropmagix-lang') : 'en') || 'en';
    
    return apiRequest('/api/soil-weather', {
        method: 'POST',
        body: JSON.stringify({
            image_base64: soilImageBase64,
            latitude: latitude,
            longitude: longitude,
            language: lang
        })
    });
}

export async function healthCheck() {
    try {
        const result = await apiRequest('/health');
        return result.status === 'healthy';
    } catch (e) {
        return false;
    }
}

export function setBaseUrl(url) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('cropmagix_api_url', url);
    }
}

export function getBaseUrl() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('cropmagix_api_url') || API_CONFIG.BASE_URL;
    }
    return API_CONFIG.BASE_URL;
}
