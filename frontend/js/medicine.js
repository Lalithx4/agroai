/**
 * CropMagix - Medicine/Pesticide Recommender
 * Disease-based treatment suggestions with organic alternatives
 */

class MedicineRecommender {
    constructor() {
        // Comprehensive disease-treatment database
        this.treatmentDatabase = {
            // Fungal Diseases
            'early blight': {
                category: 'fungal',
                chemical: [
                    { name: 'Mancozeb 75% WP', dosage: '2-2.5g per liter water', frequency: 'Every 7-10 days', brand: 'Dithane M-45' },
                    { name: 'Chlorothalonil', dosage: '2g per liter water', frequency: 'Every 10-14 days', brand: 'Kavach' },
                    { name: 'Copper Oxychloride', dosage: '3g per liter water', frequency: 'Every 7 days', brand: 'Blitox' }
                ],
                organic: [
                    { name: 'Neem Oil', dosage: '5ml per liter water', frequency: 'Every 5-7 days', preparation: 'Mix with mild soap' },
                    { name: 'Baking Soda Spray', dosage: '1 tbsp per liter water', frequency: 'Weekly', preparation: 'Add few drops of liquid soap' },
                    { name: 'Trichoderma viride', dosage: '5g per liter water', frequency: 'Every 15 days', preparation: 'Bio-fungicide' }
                ],
                prevention: [
                    'Remove infected leaves immediately',
                    'Avoid overhead watering',
                    'Maintain proper plant spacing',
                    'Rotate crops yearly'
                ]
            },
            'late blight': {
                category: 'fungal',
                chemical: [
                    { name: 'Metalaxyl + Mancozeb', dosage: '2.5g per liter water', frequency: 'Every 7 days', brand: 'Ridomil Gold' },
                    { name: 'Cymoxanil + Mancozeb', dosage: '3g per liter water', frequency: 'Every 5-7 days', brand: 'Curzate' },
                    { name: 'Dimethomorph', dosage: '1g per liter water', frequency: 'Every 7 days', brand: 'Acrobat' }
                ],
                organic: [
                    { name: 'Bordeaux Mixture', dosage: '1% solution', frequency: 'Every 7 days', preparation: 'Mix copper sulphate + lime' },
                    { name: 'Copper Hydroxide', dosage: '2g per liter water', frequency: 'Every 7 days', preparation: 'Organic approved' },
                    { name: 'Garlic Extract', dosage: '50g crushed in 1L water', frequency: 'Every 5 days', preparation: 'Strain and spray' }
                ],
                prevention: [
                    'Destroy infected plants immediately',
                    'Improve air circulation',
                    'Water early morning only',
                    'Use resistant varieties'
                ]
            },
            'powdery mildew': {
                category: 'fungal',
                chemical: [
                    { name: 'Sulphur 80% WP', dosage: '2g per liter water', frequency: 'Every 10-15 days', brand: 'Sulfex' },
                    { name: 'Hexaconazole', dosage: '1ml per liter water', frequency: 'Every 15 days', brand: 'Contaf' },
                    { name: 'Myclobutanil', dosage: '0.5g per liter water', frequency: 'Every 14 days', brand: 'Systhane' }
                ],
                organic: [
                    { name: 'Milk Spray', dosage: '1 part milk : 9 parts water', frequency: 'Every 7 days', preparation: 'Use fresh milk' },
                    { name: 'Potassium Bicarbonate', dosage: '3g per liter water', frequency: 'Weekly', preparation: 'Add vegetable oil' },
                    { name: 'Neem Oil', dosage: '5ml per liter water', frequency: 'Every 7 days', preparation: 'Mix with soap' }
                ],
                prevention: [
                    'Ensure good air circulation',
                    'Avoid excess nitrogen fertilizer',
                    'Water at soil level, not on leaves',
                    'Remove infected parts promptly'
                ]
            },
            'rust': {
                category: 'fungal',
                chemical: [
                    { name: 'Propiconazole', dosage: '1ml per liter water', frequency: 'Every 15 days', brand: 'Tilt' },
                    { name: 'Tebuconazole', dosage: '1ml per liter water', frequency: 'Every 14 days', brand: 'Folicur' },
                    { name: 'Mancozeb', dosage: '2.5g per liter water', frequency: 'Every 10 days', brand: 'Indofil M-45' }
                ],
                organic: [
                    { name: 'Sulfur Dust', dosage: 'Light dusting', frequency: 'Every 7 days', preparation: 'Apply in morning' },
                    { name: 'Baking Soda + Oil', dosage: '1 tbsp + 1 tsp oil per liter', frequency: 'Weekly', preparation: 'Mix thoroughly' },
                    { name: 'Neem Cake Extract', dosage: '50g per liter water', frequency: 'Every 10 days', preparation: 'Soak overnight, strain' }
                ],
                prevention: [
                    'Remove and destroy infected leaves',
                    'Avoid wetting foliage',
                    'Improve plant spacing',
                    'Use resistant varieties'
                ]
            },
            'leaf spot': {
                category: 'fungal',
                chemical: [
                    { name: 'Carbendazim', dosage: '1g per liter water', frequency: 'Every 10-15 days', brand: 'Bavistin' },
                    { name: 'Mancozeb', dosage: '2.5g per liter water', frequency: 'Every 7-10 days', brand: 'Dithane M-45' },
                    { name: 'Copper Oxychloride', dosage: '3g per liter water', frequency: 'Every 7 days', brand: 'Blitox' }
                ],
                organic: [
                    { name: 'Bordeaux Mixture', dosage: '1% solution', frequency: 'Every 10 days', preparation: 'Fresh preparation' },
                    { name: 'Turmeric + Neem', dosage: '2g + 5ml per liter', frequency: 'Every 7 days', preparation: 'Mix well' },
                    { name: 'Pseudomonas fluorescens', dosage: '10g per liter', frequency: 'Every 15 days', preparation: 'Bio-agent' }
                ],
                prevention: [
                    'Remove fallen leaves',
                    'Avoid overhead irrigation',
                    'Maintain proper spacing',
                    'Crop rotation'
                ]
            },
            'anthracnose': {
                category: 'fungal',
                chemical: [
                    { name: 'Carbendazim + Mancozeb', dosage: '2g per liter water', frequency: 'Every 10 days', brand: 'SAAF' },
                    { name: 'Propineb', dosage: '2g per liter water', frequency: 'Every 7-10 days', brand: 'Antracol' },
                    { name: 'Azoxystrobin', dosage: '1ml per liter water', frequency: 'Every 14 days', brand: 'Amistar' }
                ],
                organic: [
                    { name: 'Copper Spray', dosage: '3g per liter water', frequency: 'Every 7 days', preparation: 'Copper hydroxide' },
                    { name: 'Garlic + Chili Extract', dosage: '50g each per liter', frequency: 'Every 5 days', preparation: 'Blend and strain' },
                    { name: 'Trichoderma harzianum', dosage: '5g per liter', frequency: 'Every 15 days', preparation: 'Bio-fungicide' }
                ],
                prevention: [
                    'Use disease-free seeds',
                    'Hot water seed treatment',
                    'Remove infected fruits',
                    'Avoid working in wet fields'
                ]
            },
            
            // Bacterial Diseases
            'bacterial spot': {
                category: 'bacterial',
                chemical: [
                    { name: 'Streptomycin Sulphate', dosage: '0.5g per liter water', frequency: 'Every 7 days', brand: 'Streptocycline' },
                    { name: 'Copper Hydroxide', dosage: '2g per liter water', frequency: 'Every 5-7 days', brand: 'Kocide' },
                    { name: 'Kasugamycin', dosage: '2ml per liter water', frequency: 'Every 10 days', brand: 'Kasumin' }
                ],
                organic: [
                    { name: 'Copper Soap', dosage: '2g per liter water', frequency: 'Every 7 days', preparation: 'OMRI approved' },
                    { name: 'Bacillus subtilis', dosage: '5g per liter water', frequency: 'Every 7 days', preparation: 'Bio-bactericide' },
                    { name: 'Sour Buttermilk', dosage: '100ml per liter water', frequency: 'Every 5 days', preparation: 'Natural antibacterial' }
                ],
                prevention: [
                    'Use certified disease-free seeds',
                    'Avoid handling wet plants',
                    'Disinfect tools regularly',
                    'Rotate crops for 2-3 years'
                ]
            },
            'bacterial wilt': {
                category: 'bacterial',
                chemical: [
                    { name: 'Streptomycin + Tetracycline', dosage: '1g per liter water', frequency: 'Soil drench weekly', brand: 'Plantomycin' },
                    { name: 'Bleaching Powder', dosage: '10g per pit', frequency: 'Before planting', brand: 'Any' },
                    { name: 'Copper Oxychloride', dosage: '3g per liter water', frequency: 'Soil drench', brand: 'Blitox' }
                ],
                organic: [
                    { name: 'Trichoderma + Pseudomonas', dosage: '10g each per liter', frequency: 'Soil application', preparation: 'Mix with compost' },
                    { name: 'Neem Cake', dosage: '250g per plant', frequency: 'At planting', preparation: 'Mix with soil' },
                    { name: 'Mustard Cake', dosage: '200g per plant', frequency: 'Monthly', preparation: 'Decomposed' }
                ],
                prevention: [
                    'Use resistant varieties',
                    'Solarize soil before planting',
                    'Improve drainage',
                    'Remove infected plants with soil'
                ]
            },
            
            // Viral Diseases
            'mosaic virus': {
                category: 'viral',
                chemical: [
                    { name: 'Imidacloprid (vector control)', dosage: '0.5ml per liter water', frequency: 'Every 15 days', brand: 'Confidor' },
                    { name: 'Thiamethoxam', dosage: '0.5g per liter water', frequency: 'Every 14 days', brand: 'Actara' },
                    { name: 'No direct cure', dosage: 'Control vectors', frequency: '-', brand: 'Prevention only' }
                ],
                organic: [
                    { name: 'Neem Oil (vector control)', dosage: '5ml per liter water', frequency: 'Every 5 days', preparation: 'Controls aphids' },
                    { name: 'Yellow Sticky Traps', dosage: '20-25 per acre', frequency: 'Replace weekly', preparation: 'Monitor vectors' },
                    { name: 'Milk Spray', dosage: '1:9 with water', frequency: 'Every 3 days', preparation: 'May reduce spread' }
                ],
                prevention: [
                    'Remove infected plants immediately',
                    'Control aphid vectors',
                    'Use virus-free seeds',
                    'Reflective mulches deter aphids'
                ]
            },
            'yellow leaf curl virus': {
                category: 'viral',
                chemical: [
                    { name: 'Imidacloprid', dosage: '0.3ml per liter water', frequency: 'Every 10-15 days', brand: 'Confidor' },
                    { name: 'Acetamiprid', dosage: '0.5g per liter water', frequency: 'Every 14 days', brand: 'Manik' },
                    { name: 'Spiromesifen', dosage: '0.8ml per liter water', frequency: 'Every 14 days', brand: 'Oberon' }
                ],
                organic: [
                    { name: 'Neem + Garlic Extract', dosage: '5ml + 20ml per liter', frequency: 'Every 5 days', preparation: 'Whitefly control' },
                    { name: 'Beauveria bassiana', dosage: '5g per liter water', frequency: 'Every 7 days', preparation: 'Bio-insecticide' },
                    { name: 'Yellow Sticky Traps', dosage: '30-40 per acre', frequency: 'Replace weekly', preparation: 'Whitefly monitoring' }
                ],
                prevention: [
                    'Use resistant varieties',
                    'Control whitefly populations',
                    'Avoid planting near infected fields',
                    'Use insect-proof nets in nursery'
                ]
            },
            
            // Pest Damage
            'spider mites': {
                category: 'pest',
                chemical: [
                    { name: 'Abamectin', dosage: '0.5ml per liter water', frequency: 'Every 7 days', brand: 'Vertimec' },
                    { name: 'Spiromesifen', dosage: '0.8ml per liter water', frequency: 'Every 14 days', brand: 'Oberon' },
                    { name: 'Fenazaquin', dosage: '2ml per liter water', frequency: 'Every 10 days', brand: 'Magister' }
                ],
                organic: [
                    { name: 'Neem Oil', dosage: '5ml per liter water', frequency: 'Every 3-5 days', preparation: 'Add soap' },
                    { name: 'Sulfur Spray', dosage: '3g per liter water', frequency: 'Every 7 days', preparation: 'Not in hot weather' },
                    { name: 'Predatory Mites', dosage: '5000 per acre', frequency: 'Once, establish', preparation: 'Phytoseiulus persimilis' }
                ],
                prevention: [
                    'Maintain adequate humidity',
                    'Avoid water stress',
                    'Regular monitoring',
                    'Remove heavily infested leaves'
                ]
            },
            
            // Nutrient Issues
            'nutrient deficiency': {
                category: 'nutrient',
                chemical: [
                    { name: 'NPK 19-19-19', dosage: '5g per liter water', frequency: 'Every 15 days', brand: 'Any balanced' },
                    { name: 'Micronutrient Mix', dosage: '2g per liter water', frequency: 'Every 15 days', brand: 'Multiplex' },
                    { name: 'Urea (Nitrogen)', dosage: '5g per liter water', frequency: 'For yellowing', brand: 'Any' }
                ],
                organic: [
                    { name: 'Vermicompost Tea', dosage: '1:10 with water', frequency: 'Every 7 days', preparation: 'Soak 24 hours' },
                    { name: 'Panchagavya', dosage: '30ml per liter water', frequency: 'Every 15 days', preparation: 'Traditional mix' },
                    { name: 'Seaweed Extract', dosage: '3ml per liter water', frequency: 'Every 10 days', preparation: 'Kelp-based' }
                ],
                prevention: [
                    'Regular soil testing',
                    'Balanced fertilization',
                    'Add organic matter',
                    'Maintain proper pH'
                ]
            },
            
            // Default for unknown
            'unknown': {
                category: 'general',
                chemical: [
                    { name: 'Mancozeb + Carbendazim', dosage: '2g per liter water', frequency: 'Every 7-10 days', brand: 'SAAF' },
                    { name: 'Copper Oxychloride', dosage: '3g per liter water', frequency: 'Every 7 days', brand: 'Blitox' }
                ],
                organic: [
                    { name: 'Neem Oil', dosage: '5ml per liter water', frequency: 'Every 5-7 days', preparation: 'General purpose' },
                    { name: 'Bordeaux Mixture', dosage: '1% solution', frequency: 'Every 10 days', preparation: 'Broad spectrum' }
                ],
                prevention: [
                    'Consult local agriculture officer',
                    'Take sample to lab for diagnosis',
                    'Monitor plant closely',
                    'Maintain good hygiene'
                ]
            }
        };
    }
    
    /**
     * Get treatment recommendations for a disease
     */
    getRecommendations(diseaseName, preferOrganic = false) {
        // Normalize disease name
        const normalizedName = diseaseName.toLowerCase().replace(/[_-]/g, ' ');
        
        // Find matching disease
        let treatment = null;
        for (const [key, value] of Object.entries(this.treatmentDatabase)) {
            if (normalizedName.includes(key) || key.includes(normalizedName.split(' ')[0])) {
                treatment = { disease: key, ...value };
                break;
            }
        }
        
        // Fallback to unknown
        if (!treatment) {
            treatment = { disease: normalizedName, ...this.treatmentDatabase['unknown'] };
        }
        
        return {
            disease: treatment.disease,
            category: treatment.category,
            recommended: preferOrganic ? treatment.organic : treatment.chemical,
            alternative: preferOrganic ? treatment.chemical : treatment.organic,
            prevention: treatment.prevention,
            isOrganic: preferOrganic
        };
    }
    
    /**
     * Get all treatments for multiple diseases
     */
    getMultipleRecommendations(diseases, preferOrganic = false) {
        return diseases.map(disease => ({
            diseaseName: disease.name || disease,
            severity: disease.severity || 'medium',
            ...this.getRecommendations(disease.name || disease, preferOrganic)
        }));
    }
    
    /**
     * Format recommendations for display (multi-language)
     */
    formatForDisplay(recommendations, language = 'en') {
        const labels = {
            en: {
                chemical: '💊 Chemical Treatment',
                organic: '🌿 Organic Alternative',
                prevention: '🛡️ Prevention Tips',
                dosage: 'Dosage',
                frequency: 'Frequency',
                brand: 'Brand'
            },
            hi: {
                chemical: '💊 रासायनिक उपचार',
                organic: '🌿 जैविक विकल्प',
                prevention: '🛡️ रोकथाम के उपाय',
                dosage: 'खुराक',
                frequency: 'आवृत्ति',
                brand: 'ब्रांड'
            },
            te: {
                chemical: '💊 రసాయన చికిత్స',
                organic: '🌿 సేంద్రీయ ప్రత్యామ్నాయం',
                prevention: '🛡️ నివారణ చిట్కాలు',
                dosage: 'మోతాదు',
                frequency: 'తరచుదనం',
                brand: 'బ్రాండ్'
            }
        };
        
        const l = labels[language] || labels.en;
        
        return {
            labels: l,
            recommendations: recommendations
        };
    }
    
    /**
     * Get emergency first-aid for severe infections
     */
    getEmergencyTreatment(severity) {
        if (severity === 'critical' || severity === 'severe') {
            return {
                immediate: [
                    'Remove and burn all severely affected plants',
                    'Isolate infected area',
                    'Apply systemic fungicide immediately',
                    'Contact local agriculture officer'
                ],
                warning: 'Severe infection detected! Immediate action required to prevent spread.'
            };
        }
        return null;
    }
}

// Create singleton
const medicineRecommender = new MedicineRecommender();
window.medicineRecommender = medicineRecommender;
