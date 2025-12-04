/**
 * CropMagix - Text-to-Speech Service
 * Makes plants "speak" to farmers
 */

class TTSService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.enabled = true;
        this.currentUtterance = null;
        this.voices = [];
        
        // Load voices
        this.loadVoices();
        
        // Voices might load asynchronously
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
    }
    
    /**
     * Load available voices
     */
    loadVoices() {
        this.voices = this.synth.getVoices();
    }
    
    /**
     * Get voice for language
     */
    getVoice(language) {
        // Language to voice mapping
        const langMap = {
            'en': ['en-IN', 'en-US', 'en-GB', 'en'],
            'hi': ['hi-IN', 'hi'],
            'te': ['te-IN', 'te']
        };
        
        const preferredLangs = langMap[language] || langMap['en'];
        
        // Try to find a matching voice
        for (const lang of preferredLangs) {
            const voice = this.voices.find(v => v.lang.startsWith(lang));
            if (voice) return voice;
        }
        
        // Fallback to first available voice
        return this.voices[0] || null;
    }
    
    /**
     * Speak text
     */
    speak(text, language = 'en') {
        if (!this.enabled || !this.synth) {
            console.warn('TTS not available or disabled');
            return;
        }
        
        // Cancel any ongoing speech
        this.stop();
        
        // Create utterance
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Set voice
        const voice = this.getVoice(language);
        if (voice) {
            this.currentUtterance.voice = voice;
        }
        
        // Configure
        this.currentUtterance.rate = 0.9;  // Slightly slower for farmers
        this.currentUtterance.pitch = 1.0;
        this.currentUtterance.volume = 1.0;
        
        // Event handlers
        this.currentUtterance.onstart = () => {
            console.log('TTS started');
            this.updateSpeakButton(true);
        };
        
        this.currentUtterance.onend = () => {
            console.log('TTS ended');
            this.updateSpeakButton(false);
        };
        
        this.currentUtterance.onerror = (e) => {
            console.error('TTS error:', e);
            this.updateSpeakButton(false);
        };
        
        // Speak
        this.synth.speak(this.currentUtterance);
    }
    
    /**
     * Stop speaking
     */
    stop() {
        if (this.synth) {
            this.synth.cancel();
        }
        this.updateSpeakButton(false);
    }
    
    /**
     * Toggle TTS enabled state
     */
    toggle() {
        this.enabled = !this.enabled;
        
        if (!this.enabled) {
            this.stop();
        }
        
        // Save preference
        cache.updateSetting('ttsEnabled', this.enabled);
        
        // Update UI
        const ttsBtn = document.getElementById('tts-toggle');
        if (ttsBtn) {
            ttsBtn.classList.toggle('active', this.enabled);
            ttsBtn.textContent = this.enabled ? '🔊' : '🔇';
        }
        
        return this.enabled;
    }
    
    /**
     * Update speak button state
     */
    updateSpeakButton(speaking) {
        const ttsBtn = document.getElementById('tts-toggle');
        if (ttsBtn) {
            ttsBtn.classList.toggle('speaking', speaking);
        }
    }
    
    /**
     * Check if currently speaking
     */
    isSpeaking() {
        return this.synth && this.synth.speaking;
    }
    
    /**
     * Check if TTS is supported
     */
    isSupported() {
        return 'speechSynthesis' in window;
    }
    
    /**
     * Get available voices for display
     */
    getAvailableLanguages() {
        const languages = new Set();
        this.voices.forEach(voice => {
            const lang = voice.lang.split('-')[0];
            languages.add(lang);
        });
        return Array.from(languages);
    }
}

// Create singleton instance
const tts = new TTSService();

// Export for use in other modules
window.tts = tts;

// Global toggle function
function toggleTTS() {
    const enabled = tts.toggle();
    showToast(enabled ? 'Voice enabled' : 'Voice disabled');
}
