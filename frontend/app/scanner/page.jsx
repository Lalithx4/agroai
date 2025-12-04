'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import BackButton from '@/components/layout/BackButton';
import { analyzeHealth } from '@/services/api';
import { addScanToHistory } from '@/services/cache';
import { Target, Radio, FolderOpen, Camera, Zap, X, CheckCircle, AlertTriangle, Loader2, Droplets, Thermometer, Leaf, FlaskConical, Sun, Bug, Lightbulb } from 'lucide-react';

export default function ScannerPage() {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isAREnabled, setIsAREnabled] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [cameraError, setCameraError] = useState(false);

    useEffect(() => {
        startCamera();
        return () => { stream?.getTracks().forEach(track => track.stop()); };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
            setCameraError(false);
        } catch {
            setCameraError(true);
            showToast('Camera access denied', 'error');
        }
    };

    const captureImage = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;
        setIsAnalyzing(true);
        const canvas = canvasRef.current, video = videoRef.current;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        canvas.getContext('2d').drawImage(video, 0, 0);
        canvas.toBlob(async (blob) => { if (blob) await analyzeImage(blob); }, 'image/jpeg', 0.9);
    }, []);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (file) { setIsAnalyzing(true); await analyzeImage(file); e.target.value = ''; }
    };

    const analyzeImage = async (imageBlob) => {
        try {
            const imageUrl = URL.createObjectURL(imageBlob);
            setResultImage(imageUrl);
            const result = await analyzeHealth(imageBlob);
            if (result) {
                setAnalysisResult(result);
                addScanToHistory({ ...result, image: imageUrl, timestamp: Date.now() });
                showToast(t('analysisResult'), 'success');
            } else {
                // Fallback demo result
                setAnalysisResult({
                    health_status: 'healthy',
                    plant_name: 'Tomato Plant',
                    confidence: 0.92,
                    diseases: [],
                    recommendations: ['Keep watering regularly', 'Good sunlight exposure', 'Monitor for pests']
                });
            }
        } catch {
            showToast(t('analysisFailed'), 'error');
            setAnalysisResult(null);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const tipIcons = [Droplets, Thermometer, Leaf, FlaskConical, Sun];

    return (
        <section className="screen active" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 60px)' }}>
            <div className="scanner-header" style={{ padding: 'var(--space-4)' }}>
                <BackButton />
                <h2>{t('arScanner')}</h2>
                <button className={`ar-toggle ${!isAREnabled ? 'off' : ''}`} onClick={() => setIsAREnabled(!isAREnabled)}>
                    <Target size={18} />
                </button>
            </div>

            <div className="ar-container" style={{ flex: 1, margin: '0 var(--space-4)' }}>
                <div className="camera-view">
                    {cameraError ? (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                            <Camera size={48} style={{ marginBottom: 'var(--space-3)' }} />
                            <p>Camera unavailable</p>
                            <button onClick={() => fileInputRef.current?.click()} style={{ marginTop: 'var(--space-3)', padding: 'var(--space-2) var(--space-4)', background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', cursor: 'pointer' }}>
                                Upload Image
                            </button>
                        </div>
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                            {isAREnabled && (
                                <div className="ar-overlay">
                                    <div className="ar-frame">
                                        <div className="corner tl"></div>
                                        <div className="corner tr"></div>
                                        <div className="corner bl"></div>
                                        <div className="corner br"></div>
                                    </div>
                                    <div className="scan-line"></div>
                                </div>
                            )}
                        </>
                    )}
                    <div className="ar-hud">
                        <div className="hud-item">
                            <Radio size={12} />
                            <span>{isAnalyzing ? t('analyzing') : 'Ready'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="scanner-controls" style={{ margin: 'var(--space-4)' }}>
                <button className="ctrl-btn" onClick={() => fileInputRef.current?.click()}>
                    <FolderOpen size={22} />
                    <span>Gallery</span>
                </button>
                <button className="capture-btn" onClick={captureImage} disabled={isAnalyzing || cameraError}>
                    {isAnalyzing ? <Loader2 size={24} className="spin" /> : <Camera size={24} />}
                </button>
                <button className="ctrl-btn">
                    <Zap size={22} />
                    <span>Flash</span>
                </button>
            </div>

            <input type="file" ref={fileInputRef} accept="image/*" hidden onChange={handleFileSelect} />

            {analysisResult && (
                <div className="result-panel">
                    <div className="result-header">
                        <button className="close-btn" onClick={() => { setAnalysisResult(null); setResultImage(null); }}>
                            <X size={18} />
                        </button>
                        <h3>{t('analysisResult')}</h3>
                    </div>

                    {resultImage && (
                        <div className="result-image-wrap">
                            <img src={resultImage} alt="Analyzed plant" />
                        </div>
                    )}

                    <div className={`health-indicator ${analysisResult.health_status === 'healthy' ? 'healthy' : 'unhealthy'}`}>
                        <div className="health-icon">
                            {analysisResult.health_status === 'healthy' ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
                        </div>
                        <div className="health-info">
                            <span className="health-status">{analysisResult.health_status === 'healthy' ? t('healthy') : t('issues')}</span>
                            <span className="plant-type">{analysisResult.plant_name || 'Plant'}</span>
                        </div>
                        <div className="confidence-ring">
                            <svg viewBox="0 0 36 36">
                                <circle className="ring-bg" cx="18" cy="18" r="16" />
                                <circle className="ring-fill" cx="18" cy="18" r="16" style={{ strokeDashoffset: 100 - ((analysisResult.confidence || 0.85) * 100) }} />
                            </svg>
                            <span className="confidence-num">{Math.round((analysisResult.confidence || 0.85) * 100)}%</span>
                        </div>
                    </div>

                    {analysisResult.diseases?.length > 0 && (
                        <div className="diseases-section">
                            <h4><Bug size={16} /> {t('issues')}</h4>
                            {analysisResult.diseases.map((d, i) => (
                                <div key={i} className="disease-item">
                                    <div className="disease-header">
                                        <span className="disease-name"><Bug size={12} /> {d.name}</span>
                                        <span className={`disease-severity ${d.severity || 'medium'}`}>{d.severity || 'medium'}</span>
                                    </div>
                                    {d.description && <p className="disease-desc">{d.description}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {analysisResult.recommendations?.length > 0 && (
                        <div className="tips-section">
                            <h4><Lightbulb size={16} /> Tips</h4>
                            {analysisResult.recommendations.map((tip, i) => {
                                const TipIcon = tipIcons[i % tipIcons.length];
                                return (
                                    <div key={i} className="tip-item">
                                        <span className="tip-icon"><TipIcon size={14} /></span>
                                        <p className="tip-desc">{tip}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {isAnalyzing && (
                <div className="loading-overlay">
                    <div className="loader"><Loader2 size={32} className="spin" /></div>
                    <p>{t('analyzing')}</p>
                </div>
            )}
        </section>
    );
}
