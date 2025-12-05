'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/layout/BackButton';
import './soil.css';
import {
    Camera,
    FolderOpen,
    Loader2,
    Droplets,
    Thermometer,
    Leaf,
    FlaskConical,
    Sun,
    Bug,
    ArrowLeft,
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    Sparkles,
    Zap,
    TreeDeciduous,
    Wheat,
    Apple,
    Carrot,
    Info,
    TrendingUp,
    TrendingDown,
    Minus,
    Beaker,
    TestTube,
    Layers,
    Target,
    Clock,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function SoilAnalysisPage() {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const router = useRouter();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    
    const [stream, setStream] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [expandedSection, setExpandedSection] = useState('nutrients');

    const startCamera = async () => {
        try {
            // Try back camera first (strict)
            let mediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { exact: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
                });
            } catch {
                // Fallback to any available camera
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
                });
            }
            setStream(mediaStream);
            setCameraActive(true);
        } catch (error) {
            console.error('Camera error:', error);
            showToast('Camera not available. Please upload an image.', 'error');
        }
    };

    // Connect stream to video element when both are ready
    useEffect(() => {
        if (stream && videoRef.current && cameraActive) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(console.error);
        }
    }, [stream, cameraActive]);

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        canvas.toBlob(async (blob) => {
            if (blob) {
                const imageUrl = URL.createObjectURL(blob);
                setCapturedImage(imageUrl);
                stopCamera();
                await analyzeSoil(blob);
            }
        }, 'image/jpeg', 0.9);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setCapturedImage(imageUrl);
            await analyzeSoil(file);
        }
    };

    const analyzeSoil = async (imageBlob) => {
        setIsAnalyzing(true);
        try {
            const formData = new FormData();
            formData.append('image', imageBlob);
            formData.append('language', language);

            const response = await fetch('/api/analyze-soil', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (data.success && data.analysis) {
                setAnalysisResult(data.analysis);
                showToast('🌱 Soil analysis complete!', 'success');
            } else if (data.notSoil) {
                // Not a soil image - show friendly message and reset
                showToast('📷 Please take a photo of soil, not a person or other object.', 'warning');
                setCapturedImage(null);
            } else {
                showToast(data.error || 'Analysis failed. Please try again.', 'error');
                setCapturedImage(null);
            }
        } catch (error) {
            console.error('Analysis error:', error);
            showToast('Failed to analyze soil. Please try again.', 'error');
            setCapturedImage(null);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetAnalysis = () => {
        setAnalysisResult(null);
        setCapturedImage(null);
    };

    const getNutrientIcon = (level) => {
        switch (level) {
            case 'high': return <TrendingUp className="nutrient-icon high" />;
            case 'adequate': return <Minus className="nutrient-icon adequate" />;
            case 'low': return <TrendingDown className="nutrient-icon low" />;
            case 'deficient': return <AlertCircle className="nutrient-icon deficient" />;
            default: return <Minus className="nutrient-icon" />;
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#eab308';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    };

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="soil-page">
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />

            {/* Header */}
            <div className="soil-header">
                <button className="back-btn" onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </button>
                <h1>🌍 {t('soilAnalysisTitle')}</h1>
                {analysisResult && (
                    <button className="reset-btn" onClick={resetAnalysis}>
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Main Content */}
            <div className="soil-content">
                {!analysisResult ? (
                    /* Capture Mode */
                    <div className="capture-section">
                        {cameraActive ? (
                            <div className="camera-container">
                                <video ref={videoRef} autoPlay playsInline muted />
                                <div className="camera-overlay">
                                    <div className="focus-ring" />
                                    <p className="camera-hint">{language === 'hi' ? 'मिट्टी का नमूना फ्रेम में रखें' : language === 'te' ? 'మట్టి నమూనాను ఫ్రేమ్‌లో ఉంచండి' : 'Position soil sample in frame'}</p>
                                </div>
                                <div className="camera-controls">
                                    <button className="cancel-btn" onClick={stopCamera}>
                                        <X size={24} />
                                    </button>
                                    <button className="capture-btn" onClick={captureImage} disabled={isAnalyzing}>
                                        {isAnalyzing ? <Loader2 className="spin" size={32} /> : <Camera size={32} />}
                                    </button>
                                    <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
                                        <FolderOpen size={24} />
                                    </button>
                                </div>
                            </div>
                        ) : capturedImage ? (
                            <div className="analyzing-container">
                                <img src={capturedImage} alt="Soil sample" className="captured-image" />
                                {isAnalyzing && (
                                    <div className="analyzing-overlay">
                                        <Loader2 className="spin" size={48} />
                                        <p>{t('analyzingSoil')}</p>
                                        <div className="analyzing-steps">
                                            <span className="step active">🔬 {t('soilTexture')}</span>
                                            <span className="step">⚗️ {t('nutrients')}</span>
                                            <span className="step">🌱 {t('suitableCrops')}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="start-options">
                                <div className="soil-hero">
                                    <div className="hero-icon">🌍</div>
                                    <h2>{t('analyzeSoil')}</h2>
                                    <p>{language === 'hi' ? 'मिट्टी की संरचना, पोषक तत्वों और आदर्श फसलों के बारे में विस्तृत जानकारी प्राप्त करें' : language === 'te' ? 'మట్టి కూర్పు, పోషకాలు మరియు అనుకూల పంటల గురించి వివరమైన సమాచారం పొందండి' : 'Get detailed insights about soil composition, nutrients, and ideal crops'}</p>
                                </div>
                                <div className="option-buttons">
                                    <button className="option-btn camera" onClick={startCamera}>
                                        <Camera size={28} />
                                        <span>{t('takeSoilPhoto')}</span>
                                        <small>{language === 'hi' ? 'कैमरे से मिट्टी की तस्वीर लें' : language === 'te' ? 'కెమెరాతో మట్టి ఫోటో తీయండి' : 'Use camera to capture soil'}</small>
                                    </button>
                                    <button className="option-btn upload" onClick={() => fileInputRef.current?.click()}>
                                        <FolderOpen size={28} />
                                        <span>{t('uploadSoilPhoto')}</span>
                                        <small>{language === 'hi' ? 'गैलरी से चुनें' : language === 'te' ? 'గ్యాలరీ నుండి ఎంచుకోండి' : 'Select from gallery'}</small>
                                    </button>
                                </div>
                                <div className="tips-section">
                                    <h4>📸 {t('quickTips')}:</h4>
                                    <ul>
                                        <li>{language === 'hi' ? 'प्राकृतिक रोशनी में फोटो लें' : language === 'te' ? 'సహజ వెలుగులో ఫోటో తీయండి' : 'Take photo in natural daylight'}</li>
                                        <li>{language === 'hi' ? 'मुट्ठी भर मिट्टी शामिल करें' : language === 'te' ? 'పిడికిలి మట్టిని చేర్చండి' : 'Include a handful of soil'}</li>
                                        <li>{language === 'hi' ? 'सूखी और गीली मिट्टी दोनों दिखाएं' : language === 'te' ? 'పొడి మరియు తడి మట్టి రెండూ చూపించండి' : 'Show both dry and moist soil if possible'}</li>
                                        <li>{language === 'hi' ? 'नमूने पर छाया से बचें' : language === 'te' ? 'నమూనాపై నీడలు పడకుండా చూడండి' : 'Avoid shadows on the sample'}</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Results View */
                    <div className="results-section">
                        {/* Soil Overview Card */}
                        <div className="overview-card">
                            <div className="soil-image-preview">
                                <img src={capturedImage} alt="Analyzed soil" />
                            </div>
                            <div className="overview-info">
                                <div className="soil-type-badge">
                                    <Layers size={18} />
                                    <span>{analysisResult.soil_type || 'Loamy Soil'}</span>
                                </div>
                                <h2>{analysisResult.soil_classification || 'Agricultural Soil'}</h2>
                                <p className="texture-info">
                                    <strong>Texture:</strong> {analysisResult.texture_description || analysisResult.texture}
                                </p>
                            </div>
                            {/* Health Score Circle */}
                            <div className="health-score-ring">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" className="score-bg" />
                                    <circle 
                                        cx="50" cy="50" r="45" 
                                        className="score-fill"
                                        style={{
                                            strokeDasharray: `${(analysisResult.soil_health_score?.overall || 65) * 2.83} 283`,
                                            stroke: getScoreColor(analysisResult.soil_health_score?.overall || 65)
                                        }}
                                    />
                                </svg>
                                <div className="score-value">
                                    <span className="number">{analysisResult.soil_health_score?.overall || 65}</span>
                                    <span className="label">{t('soilHealthScore')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="quick-stats">
                            <div className="stat-item">
                                <Droplets size={20} />
                                <span className="stat-label">{t('soilMoisture')}</span>
                                <span className="stat-value">{analysisResult.moisture_level || 'Moist'}</span>
                            </div>
                            <div className="stat-item">
                                <Beaker size={20} />
                                <span className="stat-label">{t('soilPH')}</span>
                                <span className="stat-value">{analysisResult.ph_assessment?.ph_range || '6.5-7.0'}</span>
                            </div>
                            <div className="stat-item">
                                <Leaf size={20} />
                                <span className="stat-label">{t('organicMatter')}</span>
                                <span className="stat-value">{analysisResult.organic_matter?.level || 'Medium'}</span>
                            </div>
                            <div className="stat-item">
                                <Layers size={20} />
                                <span className="stat-label">{t('soilDrainage')}</span>
                                <span className="stat-value">{analysisResult.drainage_assessment?.quality || 'Good'}</span>
                            </div>
                        </div>

                        {/* Summary Card */}
                        <div className="summary-card">
                            <div className="summary-icon">💡</div>
                            <p>{analysisResult.summary}</p>
                            <div className="priority-action">
                                <Target size={16} />
                                <strong>Priority:</strong> {analysisResult.action_priority || 'Add organic compost'}
                            </div>
                        </div>

                        {/* Nutrient Analysis Section */}
                        <div className={`collapsible-section ${expandedSection === 'nutrients' ? 'expanded' : ''}`}>
                            <button className="section-header" onClick={() => toggleSection('nutrients')}>
                                <FlaskConical size={20} />
                                <span>{t('nutrientLevels')}</span>
                                {expandedSection === 'nutrients' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {expandedSection === 'nutrients' && analysisResult.nutrient_analysis && (
                                <div className="section-content">
                                    <div className="nutrient-grid">
                                        {/* NPK */}
                                        <div className="nutrient-card nitrogen">
                                            <div className="nutrient-header">
                                                <span className="nutrient-symbol">N</span>
                                                <span className="nutrient-name">{t('nitrogen')}</span>
                                                {getNutrientIcon(analysisResult.nutrient_analysis.nitrogen?.level)}
                                            </div>
                                            <div className="nutrient-level">{analysisResult.nutrient_analysis.nitrogen?.level || 'adequate'}</div>
                                            <p className="nutrient-remedy">{analysisResult.nutrient_analysis.nitrogen?.remedy}</p>
                                        </div>
                                        <div className="nutrient-card phosphorus">
                                            <div className="nutrient-header">
                                                <span className="nutrient-symbol">P</span>
                                                <span className="nutrient-name">{t('phosphorus')}</span>
                                                {getNutrientIcon(analysisResult.nutrient_analysis.phosphorus?.level)}
                                            </div>
                                            <div className="nutrient-level">{analysisResult.nutrient_analysis.phosphorus?.level || 'adequate'}</div>
                                            <p className="nutrient-remedy">{analysisResult.nutrient_analysis.phosphorus?.remedy}</p>
                                        </div>
                                        <div className="nutrient-card potassium">
                                            <div className="nutrient-header">
                                                <span className="nutrient-symbol">K</span>
                                                <span className="nutrient-name">{t('potassium')}</span>
                                                {getNutrientIcon(analysisResult.nutrient_analysis.potassium?.level)}
                                            </div>
                                            <div className="nutrient-level">{analysisResult.nutrient_analysis.potassium?.level || 'adequate'}</div>
                                            <p className="nutrient-remedy">{analysisResult.nutrient_analysis.potassium?.remedy}</p>
                                        </div>
                                        {/* Secondary Nutrients */}
                                        <div className="nutrient-card calcium">
                                            <div className="nutrient-header">
                                                <span className="nutrient-symbol">Ca</span>
                                                <span className="nutrient-name">{t('calcium')}</span>
                                                {getNutrientIcon(analysisResult.nutrient_analysis.calcium?.level)}
                                            </div>
                                            <div className="nutrient-level">{analysisResult.nutrient_analysis.calcium?.level || 'adequate'}</div>
                                        </div>
                                        <div className="nutrient-card magnesium">
                                            <div className="nutrient-header">
                                                <span className="nutrient-symbol">Mg</span>
                                                <span className="nutrient-name">{t('magnesium')}</span>
                                                {getNutrientIcon(analysisResult.nutrient_analysis.magnesium?.level)}
                                            </div>
                                            <div className="nutrient-level">{analysisResult.nutrient_analysis.magnesium?.level || 'adequate'}</div>
                                        </div>
                                    </div>
                                    {/* Micronutrients */}
                                    {analysisResult.nutrient_analysis.micronutrients && (
                                        <div className="micronutrients">
                                            <h4>Micronutrients</h4>
                                            <div className="micro-grid">
                                                {Object.entries(analysisResult.nutrient_analysis.micronutrients).map(([nutrient, level]) => (
                                                    <div key={nutrient} className={`micro-item ${level}`}>
                                                        <span className="micro-name">{nutrient}</span>
                                                        <span className={`micro-status ${level}`}>{level}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Ideal Crops Section */}
                        <div className={`collapsible-section ${expandedSection === 'crops' ? 'expanded' : ''}`}>
                            <button className="section-header" onClick={() => toggleSection('crops')}>
                                <Wheat size={20} />
                                <span>{t('suitableCrops')}</span>
                                {expandedSection === 'crops' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {expandedSection === 'crops' && (
                                <div className="section-content">
                                    <div className="crops-grid">
                                        {(analysisResult.ideal_crops || []).map((crop, idx) => (
                                            <div key={idx} className={`crop-card suitability-${crop.suitability}`}>
                                                <div className="crop-icon">
                                                    {crop.crop.toLowerCase().includes('wheat') ? '🌾' :
                                                     crop.crop.toLowerCase().includes('rice') ? '🍚' :
                                                     crop.crop.toLowerCase().includes('tomato') ? '🍅' :
                                                     crop.crop.toLowerCase().includes('potato') ? '🥔' :
                                                     crop.crop.toLowerCase().includes('corn') || crop.crop.toLowerCase().includes('maize') ? '🌽' :
                                                     crop.crop.toLowerCase().includes('cotton') ? '💮' :
                                                     crop.crop.toLowerCase().includes('sugarcane') ? '🎋' :
                                                     crop.crop.toLowerCase().includes('vegetable') ? '🥬' : '🌱'}
                                                </div>
                                                <div className="crop-info">
                                                    <h4>{crop.crop}</h4>
                                                    <span className={`suitability-badge ${crop.suitability}`}>
                                                        {crop.suitability === 'excellent' ? '⭐ Excellent' :
                                                         crop.suitability === 'good' ? '✅ Good' :
                                                         crop.suitability === 'moderate' ? '🔶 Moderate' : '⚠️ Poor'}
                                                    </span>
                                                    <p>{crop.reason}</p>
                                                    {crop.yield_potential && (
                                                        <span className="yield-badge">
                                                            📈 {crop.yield_potential} yield potential
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {analysisResult.crops_to_avoid && analysisResult.crops_to_avoid.length > 0 && (
                                        <div className="avoid-crops">
                                            <h4>⚠️ {t('unsuitableCrops')}</h4>
                                            <div className="avoid-list">
                                                {analysisResult.crops_to_avoid.map((crop, idx) => (
                                                    <div key={idx} className="avoid-item">
                                                        <span className="avoid-name">{crop.crop}</span>
                                                        <span className="avoid-reason">{crop.reason}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Amendments Section */}
                        <div className={`collapsible-section ${expandedSection === 'amendments' ? 'expanded' : ''}`}>
                            <button className="section-header" onClick={() => toggleSection('amendments')}>
                                <TestTube size={20} />
                                <span>{t('soilImprovements')}</span>
                                {expandedSection === 'amendments' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {expandedSection === 'amendments' && (
                                <div className="section-content">
                                    <div className="amendments-list">
                                        {(analysisResult.amendments_needed || []).map((amendment, idx) => (
                                            <div key={idx} className="amendment-card">
                                                <div className="amendment-header">
                                                    <span className="amendment-name">{amendment.amendment}</span>
                                                    <span className={`cost-badge ${amendment.cost_estimate?.toLowerCase()}`}>
                                                        💰 {amendment.cost_estimate || 'Low'}
                                                    </span>
                                                </div>
                                                <p className="amendment-purpose">{amendment.purpose}</p>
                                                <div className="amendment-details">
                                                    <div className="detail">
                                                        <strong>Rate:</strong> {amendment.application_rate}
                                                    </div>
                                                    <div className="detail">
                                                        <strong>Method:</strong> {amendment.application_method}
                                                    </div>
                                                    <div className="detail">
                                                        <strong>When:</strong> {amendment.timing}
                                                    </div>
                                                </div>
                                                {amendment.organic_option && (
                                                    <div className="organic-alt">
                                                        🌿 Organic: {amendment.organic_option}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Improvement Plan Section */}
                        <div className={`collapsible-section ${expandedSection === 'plan' ? 'expanded' : ''}`}>
                            <button className="section-header" onClick={() => toggleSection('plan')}>
                                <Clock size={20} />
                                <span>{t('treatmentPlan')}</span>
                                {expandedSection === 'plan' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {expandedSection === 'plan' && analysisResult.improvement_plan && (
                                <div className="section-content">
                                    <div className="timeline-plan">
                                        <div className="timeline-section immediate">
                                            <h4>⚡ {t('immediateActions')}</h4>
                                            <ul>
                                                {(analysisResult.improvement_plan.immediate || []).map((action, idx) => (
                                                    <li key={idx}>{action}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="timeline-section short-term">
                                            <h4>📅 {t('weeklyTreatment')}</h4>
                                            <ul>
                                                {(analysisResult.improvement_plan.short_term || []).map((action, idx) => (
                                                    <li key={idx}>{action}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="timeline-section long-term">
                                            <h4>🎯 {t('longTermCare')}</h4>
                                            <ul>
                                                {(analysisResult.improvement_plan.long_term || []).map((action, idx) => (
                                                    <li key={idx}>{action}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button className="action-btn primary" onClick={resetAnalysis}>
                                <Camera size={20} />
                                {t('scanAgain')}
                            </button>
                            <button className="action-btn secondary" onClick={() => router.push('/chat')}>
                                <Sparkles size={20} />
                                {t('askPlant')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
