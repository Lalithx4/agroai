/**
 * CropMagix - Pest Tracking & Alert System
 * Regional pest monitoring with weather-based predictions
 */

class PestTracker {
    constructor() {
        this.dbName = 'CropMagixPestDB';
        this.db = null;
        
        // Regional pest data for India
        this.pestDatabase = {
            // Common pests with seasonal patterns
            'fall_armyworm': {
                name: { en: 'Fall Armyworm', hi: 'फॉल आर्मीवर्म', te: 'ఫాల్ ఆర్మీవార్మ్' },
                crops: ['maize', 'rice', 'sorghum', 'sugarcane'],
                season: ['kharif', 'monsoon'],
                conditions: { tempMin: 25, tempMax: 35, humidityMin: 60 },
                severity: 'high',
                spread: 'very fast',
                symptoms: ['Ragged holes in leaves', 'Frass visible', 'Damaged whorls'],
                control: {
                    chemical: 'Emamectin Benzoate 5% SG @ 0.4g/L',
                    organic: 'Neem oil 5ml/L + Bacillus thuringiensis',
                    cultural: 'Early planting, pheromone traps'
                }
            },
            'whitefly': {
                name: { en: 'Whitefly', hi: 'सफेद मक्खी', te: 'తెల్ల ఈగ' },
                crops: ['cotton', 'tomato', 'brinjal', 'chili', 'okra'],
                season: ['kharif', 'summer'],
                conditions: { tempMin: 28, tempMax: 38, humidityMax: 70 },
                severity: 'high',
                spread: 'fast',
                symptoms: ['Yellow leaves', 'Sticky honeydew', 'Sooty mold', 'Leaf curl virus'],
                control: {
                    chemical: 'Spiromesifen 22.9% SC @ 0.8ml/L',
                    organic: 'Yellow sticky traps, Neem oil spray',
                    cultural: 'Remove alternate hosts, avoid overlapping crops'
                }
            },
            'pink_bollworm': {
                name: { en: 'Pink Bollworm', hi: 'गुलाबी सुंडी', te: 'గులాబీ పురుగు' },
                crops: ['cotton'],
                season: ['kharif'],
                conditions: { tempMin: 25, tempMax: 30, humidityMin: 50 },
                severity: 'critical',
                spread: 'moderate',
                symptoms: ['Rosetted flowers', 'Damaged bolls', 'Premature boll opening'],
                control: {
                    chemical: 'Profenophos 50% EC @ 2ml/L',
                    organic: 'Pheromone traps, Trichogramma release',
                    cultural: 'Destroy crop residues, synchronous planting'
                }
            },
            'brown_planthopper': {
                name: { en: 'Brown Planthopper', hi: 'भूरा फुदका', te: 'గోధుమ రంగు మిడత' },
                crops: ['rice'],
                season: ['kharif', 'rabi'],
                conditions: { tempMin: 25, tempMax: 30, humidityMin: 80 },
                severity: 'critical',
                spread: 'very fast',
                symptoms: ['Hopper burn', 'Circular patches', 'Honeydew', 'Sooty mold'],
                control: {
                    chemical: 'Pymetrozine 50% WG @ 0.6g/L',
                    organic: 'Drain water periodically, conserve natural enemies',
                    cultural: 'Avoid excess nitrogen, alternate wetting-drying'
                }
            },
            'stem_borer': {
                name: { en: 'Stem Borer', hi: 'तना छेदक', te: 'కాండం తొలిచే పురుగు' },
                crops: ['rice', 'sugarcane', 'maize'],
                season: ['kharif', 'rabi'],
                conditions: { tempMin: 22, tempMax: 32, humidityMin: 70 },
                severity: 'high',
                spread: 'moderate',
                symptoms: ['Dead hearts', 'White heads', 'Bore holes in stem'],
                control: {
                    chemical: 'Cartap hydrochloride 4G @ 25kg/ha',
                    organic: 'Trichogramma release, light traps',
                    cultural: 'Destroy stubbles, clip leaf tips'
                }
            },
            'aphids': {
                name: { en: 'Aphids', hi: 'माहू', te: 'పేనుబంక' },
                crops: ['wheat', 'mustard', 'vegetables', 'cotton'],
                season: ['rabi', 'winter'],
                conditions: { tempMin: 15, tempMax: 28, humidityMin: 50 },
                severity: 'medium',
                spread: 'fast',
                symptoms: ['Curled leaves', 'Stunted growth', 'Honeydew', 'Virus transmission'],
                control: {
                    chemical: 'Dimethoate 30% EC @ 1.7ml/L',
                    organic: 'Neem oil 5ml/L, ladybird beetles',
                    cultural: 'Remove weeds, reflective mulches'
                }
            },
            'fruit_fly': {
                name: { en: 'Fruit Fly', hi: 'फल मक्खी', te: 'పండు ఈగ' },
                crops: ['mango', 'guava', 'citrus', 'cucurbits'],
                season: ['summer', 'monsoon'],
                conditions: { tempMin: 25, tempMax: 35, humidityMin: 60 },
                severity: 'high',
                spread: 'moderate',
                symptoms: ['Oviposition marks', 'Fruit decay', 'Maggots inside fruit'],
                control: {
                    chemical: 'Malathion 50% EC @ 2ml/L (bait spray)',
                    organic: 'Methyl eugenol traps, neem oil',
                    cultural: 'Collect and destroy fallen fruits'
                }
            },
            'red_spider_mite': {
                name: { en: 'Red Spider Mite', hi: 'लाल मकड़ी', te: 'ఎర్ర సాలెపురుగు' },
                crops: ['brinjal', 'okra', 'cotton', 'tea'],
                season: ['summer', 'dry'],
                conditions: { tempMin: 30, tempMax: 40, humidityMax: 50 },
                severity: 'medium',
                spread: 'fast',
                symptoms: ['Bronze/yellow leaves', 'Webbing', 'Leaf drop'],
                control: {
                    chemical: 'Spiromesifen 22.9% SC @ 0.8ml/L',
                    organic: 'Sulfur spray, predatory mites',
                    cultural: 'Maintain humidity, avoid water stress'
                }
            },
            'thrips': {
                name: { en: 'Thrips', hi: 'थ्रिप्स', te: 'తామర పురుగు' },
                crops: ['chili', 'onion', 'garlic', 'grapes', 'cotton'],
                season: ['summer', 'kharif'],
                conditions: { tempMin: 25, tempMax: 35, humidityMax: 60 },
                severity: 'high',
                spread: 'fast',
                symptoms: ['Silvery patches', 'Curled leaves', 'Bud necrosis'],
                control: {
                    chemical: 'Fipronil 5% SC @ 1.5ml/L',
                    organic: 'Blue sticky traps, Neem oil',
                    cultural: 'Overhead irrigation, remove weeds'
                }
            },
            'diamondback_moth': {
                name: { en: 'Diamondback Moth', hi: 'डायमंडबैक मॉथ', te: 'డైమండ్‌బ్యాక్ మోత్' },
                crops: ['cabbage', 'cauliflower', 'broccoli', 'mustard'],
                season: ['rabi', 'winter'],
                conditions: { tempMin: 15, tempMax: 25, humidityMin: 60 },
                severity: 'high',
                spread: 'moderate',
                symptoms: ['Windows in leaves', 'Larval damage', 'Skeletonized leaves'],
                control: {
                    chemical: 'Spinosad 45% SC @ 0.3ml/L',
                    organic: 'Bt spray, parasitoid wasps',
                    cultural: 'Crop rotation, remove cruciferous weeds'
                }
            }
        };
        
        // State/district pest prevalence data (sample)
        this.regionalData = {
            'telangana': {
                commonPests: ['whitefly', 'pink_bollworm', 'fall_armyworm', 'brown_planthopper'],
                alertLevel: 'medium',
                currentOutbreaks: []
            },
            'andhra_pradesh': {
                commonPests: ['fall_armyworm', 'stem_borer', 'brown_planthopper', 'thrips'],
                alertLevel: 'medium',
                currentOutbreaks: []
            },
            'maharashtra': {
                commonPests: ['pink_bollworm', 'fall_armyworm', 'whitefly', 'fruit_fly'],
                alertLevel: 'high',
                currentOutbreaks: ['fall_armyworm']
            },
            'punjab': {
                commonPests: ['aphids', 'pink_bollworm', 'brown_planthopper', 'stem_borer'],
                alertLevel: 'low',
                currentOutbreaks: []
            },
            'karnataka': {
                commonPests: ['fall_armyworm', 'fruit_fly', 'thrips', 'red_spider_mite'],
                alertLevel: 'medium',
                currentOutbreaks: []
            },
            'tamil_nadu': {
                commonPests: ['brown_planthopper', 'stem_borer', 'fruit_fly', 'whitefly'],
                alertLevel: 'medium',
                currentOutbreaks: []
            },
            'default': {
                commonPests: ['aphids', 'whitefly', 'thrips', 'fall_armyworm'],
                alertLevel: 'low',
                currentOutbreaks: []
            }
        };
        
        // Community sightings storage
        this.sightings = [];
        
        this.init();
    }
    
    async init() {
        await this.initDB();
        await this.loadSightings();
    }
    
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                
                // Pest sightings store
                if (!db.objectStoreNames.contains('sightings')) {
                    const store = db.createObjectStore('sightings', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('pestId', 'pestId', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('location', 'location', { unique: false });
                }
                
                // Alerts store
                if (!db.objectStoreNames.contains('alerts')) {
                    const store = db.createObjectStore('alerts', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('pestId', 'pestId', { unique: false });
                    store.createIndex('read', 'read', { unique: false });
                }
            };
        });
    }
    
    async loadSightings() {
        if (!this.db) return;
        
        return new Promise((resolve) => {
            const tx = this.db.transaction('sightings', 'readonly');
            const store = tx.objectStore('sightings');
            const request = store.getAll();
            
            request.onsuccess = () => {
                this.sightings = request.result || [];
                resolve(this.sightings);
            };
            request.onerror = () => resolve([]);
        });
    }
    
    /**
     * Get pests likely to appear based on weather conditions
     */
    getPestRiskFromWeather(weather) {
        const temp = weather.temp || weather.temperature;
        const humidity = weather.humidity;
        
        const risks = [];
        
        for (const [pestId, pest] of Object.entries(this.pestDatabase)) {
            const conditions = pest.conditions;
            let risk = 0;
            
            // Check temperature match
            if (temp >= conditions.tempMin && temp <= conditions.tempMax) {
                risk += 40;
            } else if (temp >= conditions.tempMin - 5 && temp <= conditions.tempMax + 5) {
                risk += 20;
            }
            
            // Check humidity match
            if (conditions.humidityMin && humidity >= conditions.humidityMin) {
                risk += 30;
            } else if (conditions.humidityMax && humidity <= conditions.humidityMax) {
                risk += 30;
            } else {
                risk += 10; // Neutral
            }
            
            // Season boost
            const month = new Date().getMonth();
            const currentSeason = this.getCurrentSeason(month);
            if (pest.season.includes(currentSeason)) {
                risk += 30;
            }
            
            if (risk >= 50) {
                risks.push({
                    pestId,
                    ...pest,
                    riskLevel: risk >= 80 ? 'high' : risk >= 60 ? 'medium' : 'low',
                    riskScore: risk
                });
            }
        }
        
        return risks.sort((a, b) => b.riskScore - a.riskScore);
    }
    
    getCurrentSeason(month) {
        // Indian agricultural seasons
        if (month >= 5 && month <= 9) return 'kharif'; // June-Oct
        if (month >= 10 || month <= 2) return 'rabi'; // Nov-March
        return 'summer'; // April-May
    }
    
    /**
     * Get pests common for a specific crop
     */
    getPestsForCrop(cropName) {
        const normalizedCrop = cropName.toLowerCase();
        const pests = [];
        
        for (const [pestId, pest] of Object.entries(this.pestDatabase)) {
            if (pest.crops.some(c => c.includes(normalizedCrop) || normalizedCrop.includes(c))) {
                pests.push({ pestId, ...pest });
            }
        }
        
        return pests;
    }
    
    /**
     * Get regional pest alerts
     */
    getRegionalAlerts(state) {
        const normalizedState = state?.toLowerCase().replace(/\s+/g, '_') || 'default';
        const regional = this.regionalData[normalizedState] || this.regionalData['default'];
        
        const alerts = [];
        
        // Current outbreaks
        for (const pestId of regional.currentOutbreaks) {
            const pest = this.pestDatabase[pestId];
            if (pest) {
                alerts.push({
                    type: 'outbreak',
                    severity: 'critical',
                    pestId,
                    pest,
                    message: `Active ${pest.name.en} outbreak in ${state || 'your region'}!`
                });
            }
        }
        
        // Common pest warnings
        for (const pestId of regional.commonPests.slice(0, 3)) {
            const pest = this.pestDatabase[pestId];
            if (pest && !regional.currentOutbreaks.includes(pestId)) {
                alerts.push({
                    type: 'warning',
                    severity: pest.severity,
                    pestId,
                    pest,
                    message: `${pest.name.en} commonly affects crops in ${state || 'your region'}`
                });
            }
        }
        
        return {
            alerts,
            alertLevel: regional.alertLevel,
            region: state || 'Unknown'
        };
    }
    
    /**
     * Report a pest sighting (community feature)
     */
    async reportSighting(pestId, location, notes, imageData = null) {
        if (!this.db) return null;
        
        const sighting = {
            pestId,
            location: location || 'Unknown',
            notes,
            imageData,
            timestamp: Date.now(),
            verified: false
        };
        
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('sightings', 'readwrite');
            const store = tx.objectStore('sightings');
            const request = store.add(sighting);
            
            request.onsuccess = () => {
                sighting.id = request.result;
                this.sightings.push(sighting);
                resolve(sighting);
            };
            request.onerror = () => reject(request.error);
        });
    }
    
    /**
     * Get recent sightings in area
     */
    async getRecentSightings(daysBack = 7) {
        const cutoff = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
        return this.sightings.filter(s => s.timestamp >= cutoff);
    }
    
    /**
     * Get pest details by ID
     */
    getPestDetails(pestId) {
        return this.pestDatabase[pestId] || null;
    }
    
    /**
     * Search pests by symptom
     */
    searchBySymptom(symptom) {
        const normalizedSymptom = symptom.toLowerCase();
        const matches = [];
        
        for (const [pestId, pest] of Object.entries(this.pestDatabase)) {
            for (const s of pest.symptoms) {
                if (s.toLowerCase().includes(normalizedSymptom)) {
                    matches.push({ pestId, ...pest, matchedSymptom: s });
                    break;
                }
            }
        }
        
        return matches;
    }
    
    /**
     * Generate pest calendar for the year
     */
    generatePestCalendar(crops = []) {
        const calendar = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (let i = 0; i < 12; i++) {
            const season = this.getCurrentSeason(i);
            calendar[months[i]] = {
                season,
                pests: []
            };
            
            for (const [pestId, pest] of Object.entries(this.pestDatabase)) {
                // Filter by crops if specified
                if (crops.length > 0) {
                    const hasCrop = pest.crops.some(c => 
                        crops.some(uc => uc.toLowerCase().includes(c) || c.includes(uc.toLowerCase()))
                    );
                    if (!hasCrop) continue;
                }
                
                if (pest.season.includes(season)) {
                    calendar[months[i]].pests.push({
                        pestId,
                        name: pest.name,
                        severity: pest.severity,
                        crops: pest.crops
                    });
                }
            }
        }
        
        return calendar;
    }
    
    /**
     * Get quick action alerts based on analysis results
     */
    getAnalysisBasedAlerts(analysisResult) {
        const alerts = [];
        
        // Check if analysis detected pest damage
        const healthDetails = analysisResult.health_details || '';
        const disease = analysisResult.disease_detected || '';
        
        // Search for matching pests
        const keywords = ['mite', 'aphid', 'worm', 'fly', 'borer', 'thrip', 'hopper'];
        for (const keyword of keywords) {
            if (healthDetails.toLowerCase().includes(keyword) || 
                disease.toLowerCase().includes(keyword)) {
                const matches = this.searchBySymptom(keyword);
                if (matches.length > 0) {
                    alerts.push({
                        type: 'detected',
                        pest: matches[0],
                        confidence: 'high',
                        action: 'immediate'
                    });
                }
            }
        }
        
        return alerts;
    }
    
    /**
     * Format for display (multi-language)
     */
    formatPestInfo(pest, language = 'en') {
        return {
            name: pest.name[language] || pest.name.en,
            crops: pest.crops.join(', '),
            severity: pest.severity,
            symptoms: pest.symptoms,
            control: pest.control
        };
    }
}

// Create singleton
const pestTracker = new PestTracker();
window.pestTracker = pestTracker;
