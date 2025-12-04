// CropMagix AR Module - Real Plant Detection with HuggingFace

class ARScanner {
    constructor() {
        this.video = document.getElementById('camera-video');
        this.canvas = document.getElementById('ar-canvas');
        this.ctx = this.canvas?.getContext('2d');
        this.markersContainer = document.getElementById('ar-markers');
        this.isActive = false;
        this.stream = null;
        this.flashEnabled = false;
        this.arEnabled = true;
        this.lastFrameTime = 0;
        this.fps = 0;
        this.detections = [];
        this.isAnalyzing = false;
        this.lastAnalysisTime = 0;
        this.analysisInterval = 4000; // Analyze every 4 seconds to save API calls (free tier)
        
        // HuggingFace API - using free inference API
        this.HF_API_URL = 'https://api-inference.huggingface.co/models/';
        // Using free, efficient models for plant detection
        this.diseaseModel = 'linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification';
        this.fallbackModel = 'google/vit-base-patch16-224';
    }

    async start() {
        if (this.isActive) return;
        
        try {
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve();
                };
            });

            this.isActive = true;
            this.updateStatus('Scanning');
            this.startARLoop();
            
            return true;
        } catch (err) {
            console.error('Camera error:', err);
            this.updateStatus('No camera');
            showToast('Camera access denied', 'error');
            return false;
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.isActive = false;
        this.video.srcObject = null;
    }

    startARLoop() {
        if (!this.isActive) return;

        const now = performance.now();
        const delta = now - this.lastFrameTime;
        
        if (delta >= 100) { // 10 FPS for AR overlay updates
            this.fps = Math.round(1000 / delta);
            this.lastFrameTime = now;
            
            document.getElementById('ar-fps').textContent = `${this.fps} FPS`;
            
            if (this.arEnabled) {
                this.updateCanvas();
                // Real-time detection with throttling for free tier
                this.performRealTimeDetection();
            }
        }

        requestAnimationFrame(() => this.startARLoop());
    }

    updateCanvas() {
        if (!this.canvas || !this.video) return;
        
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        // Clear previous frame
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    async performRealTimeDetection() {
        const now = Date.now();
        
        // Throttle API calls - only analyze every 4 seconds and if not already analyzing
        if (this.isAnalyzing || (now - this.lastAnalysisTime) < this.analysisInterval) {
            return;
        }
        
        // Check if we have a clear frame
        if (!this.video || this.video.videoWidth === 0) return;
        
        this.isAnalyzing = true;
        this.lastAnalysisTime = now;
        this.updateStatus('Analyzing...');
        
        try {
            const imageBlob = await this.captureSmallFrame();
            if (!imageBlob) {
                this.isAnalyzing = false;
                return;
            }
            
            // Detect plants/diseases using HuggingFace free API
            const detection = await this.analyzeWithHuggingFace(imageBlob);
            
            if (detection && detection.confidence > 0.25) {
                this.clearMarkers();
                this.renderMarker(detection);
                
                // Auto-remove after 6 seconds
                setTimeout(() => {
                    this.removeMarker(detection.id);
                }, 6000);
            }
            
            this.updateStatus('Scanning');
        } catch (error) {
            console.error('Detection error:', error);
            this.updateStatus('Scanning');
        } finally {
            this.isAnalyzing = false;
        }
    }

    async captureSmallFrame() {
        if (!this.video || this.video.videoWidth === 0) return null;
        
        const canvas = document.createElement('canvas');
        canvas.width = 224; // Resize for faster API processing
        canvas.height = 224;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, 224, 224);
        
        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
        });
    }

    async analyzeWithHuggingFace(imageBlob) {
        try {
            const arrayBuffer = await imageBlob.arrayBuffer();
            
            // Try plant disease model first
            let result = await this.queryHuggingFace(this.diseaseModel, arrayBuffer);
            
            if (!result || result.length === 0 || result.error) {
                // Fallback to general image model
                result = await this.queryHuggingFace(this.fallbackModel, arrayBuffer);
            }
            
            if (result && result.length > 0 && !result.error) {
                const topResult = result[0];
                const label = this.parseLabel(topResult.label);
                
                return {
                    id: Date.now(),
                    x: 30 + Math.random() * 40,
                    y: 30 + Math.random() * 40,
                    width: 20,
                    height: 20,
                    label: label.name,
                    confidence: topResult.score,
                    type: label.type,
                    rawLabel: topResult.label
                };
            }
        } catch (error) {
            console.error('HuggingFace API error:', error);
            if (error.message && error.message.includes('loading')) {
                this.updateStatus('Model loading...');
            }
        }
        
        return null;
    }

    async queryHuggingFace(model, imageData) {
        try {
            const response = await fetch(this.HF_API_URL + model, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
                body: imageData
            });
            
            if (!response.ok) {
                if (response.status === 503) {
                    const data = await response.json();
                    if (data.estimated_time) {
                        this.updateStatus(`Loading model...`);
                    }
                    return null;
                }
                return null;
            }
            
            return await response.json();
        } catch (error) {
            return null;
        }
    }

    parseLabel(rawLabel) {
        const label = rawLabel.toLowerCase();
        
        // Plant disease detection patterns
        const patterns = {
            'healthy': { name: 'Healthy Plant ✅', type: 'healthy' },
            'early_blight': { name: 'Early Blight', type: 'disease' },
            'late_blight': { name: 'Late Blight', type: 'disease' },
            'leaf_spot': { name: 'Leaf Spot', type: 'disease' },
            'bacterial_spot': { name: 'Bacterial Spot', type: 'disease' },
            'target_spot': { name: 'Target Spot', type: 'disease' },
            'mosaic_virus': { name: 'Mosaic Virus', type: 'disease' },
            'yellow_leaf': { name: 'Yellow Leaf Curl', type: 'disease' },
            'powdery_mildew': { name: 'Powdery Mildew', type: 'disease' },
            'rust': { name: 'Rust Disease', type: 'disease' },
            'septoria': { name: 'Septoria Leaf Spot', type: 'disease' },
            'spider_mite': { name: 'Spider Mite Damage', type: 'disease' },
            'tomato': { name: 'Tomato Plant', type: 'plant' },
            'potato': { name: 'Potato Plant', type: 'plant' },
            'pepper': { name: 'Pepper Plant', type: 'plant' },
            'corn': { name: 'Corn/Maize', type: 'plant' },
            'grape': { name: 'Grape Vine', type: 'plant' },
            'apple': { name: 'Apple Tree', type: 'plant' },
            'strawberry': { name: 'Strawberry', type: 'plant' },
            'leaf': { name: 'Leaf Detected', type: 'plant' },
            'plant': { name: 'Plant Detected', type: 'plant' },
        };
        
        for (const [key, value] of Object.entries(patterns)) {
            if (label.includes(key)) {
                return value;
            }
        }
        
        // Clean up label for display
        let cleanLabel = rawLabel
            .replace(/_/g, ' ')
            .replace(/,.*$/, '')
            .split(' ')
            .slice(0, 3)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
        
        const isDisease = label.includes('disease') || label.includes('blight') || 
                          label.includes('spot') || label.includes('wilt') || label.includes('mildew');
        
        return { 
            name: cleanLabel || 'Object Detected', 
            type: isDisease ? 'disease' : 'plant'
        };
    }

    renderMarker(detection) {
        const marker = document.createElement('div');
        marker.className = `ar-marker ${detection.type}`;
        marker.id = `marker-${detection.id}`;
        marker.style.cssText = `
            left: ${detection.x}%;
            top: ${detection.y}%;
            width: ${detection.width}%;
            height: ${detection.height}%;
        `;

        const icon = detection.type === 'disease' ? '⚠️' : detection.type === 'healthy' ? '✅' : '🌿';
        
        const label = document.createElement('div');
        label.className = 'ar-marker-label';
        label.innerHTML = `
            <span class="marker-icon">${icon}</span>
            <span class="marker-text">${detection.label}</span>
            <span class="marker-confidence">${Math.round(detection.confidence * 100)}%</span>
        `;
        marker.appendChild(label);

        this.markersContainer.appendChild(marker);
        this.detections.push(detection);
        
        // Show tooltip with details
        this.showTooltip(detection);
    }

    showTooltip(detection) {
        const tooltip = document.getElementById('ar-tooltip');
        const title = document.getElementById('tooltip-title');
        const body = document.getElementById('tooltip-body');
        
        if (!tooltip || !title || !body) return;
        
        title.textContent = detection.label;
        
        let bodyContent = `<p><strong>Confidence:</strong> ${Math.round(detection.confidence * 100)}%</p>`;
        
        if (detection.type === 'disease') {
            bodyContent += `<p class="tooltip-warning">⚠️ Issue detected! Capture for detailed analysis</p>`;
        } else if (detection.type === 'healthy') {
            bodyContent += `<p class="tooltip-success">✅ Plant looks healthy</p>`;
        } else {
            bodyContent += `<p>📸 Tap capture for full diagnosis</p>`;
        }
        
        body.innerHTML = bodyContent;
        tooltip.classList.remove('hidden');
        
        setTimeout(() => {
            tooltip.classList.add('hidden');
        }, 5000);
    }

    removeMarker(id) {
        const marker = document.getElementById(`marker-${id}`);
        if (marker) {
            marker.style.opacity = '0';
            setTimeout(() => marker.remove(), 300);
        }
        this.detections = this.detections.filter(d => d.id !== id);
    }

    updateStatus(status) {
        const el = document.getElementById('ar-status');
        if (el) el.textContent = status;
    }

    toggleAR() {
        this.arEnabled = !this.arEnabled;
        const toggle = document.getElementById('ar-toggle');
        const icon = document.getElementById('ar-toggle-icon');
        
        if (this.arEnabled) {
            toggle.classList.remove('off');
            icon.textContent = '🎯';
            this.updateStatus('Scanning');
        } else {
            toggle.classList.add('off');
            icon.textContent = '⏸️';
            this.updateStatus('Paused');
            this.clearMarkers();
        }
    }

    clearMarkers() {
        this.markersContainer.innerHTML = '';
        this.detections = [];
        const tooltip = document.getElementById('ar-tooltip');
        if (tooltip) tooltip.classList.add('hidden');
    }

    async toggleFlash() {
        if (!this.stream) return;
        
        const track = this.stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        
        if (capabilities.torch) {
            this.flashEnabled = !this.flashEnabled;
            await track.applyConstraints({
                advanced: [{ torch: this.flashEnabled }]
            });
            
            const icon = document.getElementById('flash-icon');
            icon.textContent = this.flashEnabled ? '💡' : '⚡';
        } else {
            showToast('Flash not available on this device', 'error');
        }
    }

    async capture() {
        if (!this.video || !this.isActive) {
            // Use file input fallback
            document.getElementById('file-input').click();
            return null;
        }

        // Create capture canvas at full resolution
        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = this.video.videoWidth;
        captureCanvas.height = this.video.videoHeight;
        
        const ctx = captureCanvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0);
        
        // Flash effect
        const flashOverlay = document.createElement('div');
        flashOverlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: white;
            z-index: 9999;
            animation: flashFade 0.3s ease-out forwards;
        `;
        document.body.appendChild(flashOverlay);
        setTimeout(() => flashOverlay.remove(), 300);
        
        // Convert to blob
        return new Promise((resolve) => {
            captureCanvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.9);
        });
    }

    getFrame() {
        if (!this.video || !this.isActive) return null;
        
        const canvas = document.createElement('canvas');
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0);
        
        return canvas.toDataURL('image/jpeg', 0.8);
    }
    
    // Get last detection for context in full analysis
    getLastDetection() {
        return this.detections.length > 0 ? this.detections[this.detections.length - 1] : null;
    }
}

// Initialize AR Scanner
const arScanner = new ARScanner();

// Export for global access
window.arScanner = arScanner;
