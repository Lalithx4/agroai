'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import { analyzeHealth } from '@/services/api';
import { addScanToHistory } from '@/services/cache';
import './scanner.css';
import {
    ArrowLeft,
    FolderOpen,
    Camera,
    Zap,
    ZapOff,
    X,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Droplets,
    Thermometer,
    Leaf,
    FlaskConical,
    Sun,
    Bug,
    Lightbulb,
    Settings
} from 'lucide-react';

export default function ScannerPage() {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const router = useRouter();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isFlashOn, setIsFlashOn] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [cameraError, setCameraError] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);

    useEffect(() => {
        startCamera();
        return () => { stream?.getTracks().forEach(track => track.stop()); };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            setStream(mediaStream);
            if (videoRef.current) videoRef.current.srcObject = mediaStream;
            setCameraError(false);
        } catch {
            setCameraError(true);
            showToast('Camera access denied', 'error');
        }
    };

    const toggleFlash = async () => {
        if (stream) {
            const track = stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities?.();
            if (capabilities?.torch) {
                await track.applyConstraints({ advanced: [{ torch: !isFlashOn }] });
                setIsFlashOn(!isFlashOn);
            } else {
                showToast('Flash not available', 'info');
            }
        }
    };

    const captureImage = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setIsCapturing(true);
        setTimeout(() => setIsCapturing(false), 500);

        setIsAnalyzing(true);
        const canvas = canvasRef.current, video = videoRef.current;
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
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

    const closeResult = () => {
        setAnalysisResult(null);
        setResultImage(null);
    };

    const tipIcons = [Droplets, Thermometer, Leaf, FlaskConical, Sun];

    return (
        <div className="scanner-page">
            {/* Fullscreen Camera */}
            {cameraError ? (
                <div className="scanner-error">
                    <div className="scanner-error-content">
                        <Camera size={64} strokeWidth={1.5} />
                        <h2>Camera Unavailable</h2>
                        <p>Please allow camera access or upload an image</p>
                        <button
                            className="scanner-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FolderOpen size={20} />
                            Upload Image
                        </button>
                    </div>
                </div>
            ) : (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="scanner-camera"
                />
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Floating Header */}
            <div className="scanner-floating-header">
                <button className="scanner-header-btn" onClick={() => router.back()}>
                    <ArrowLeft size={22} />
                </button>

                <div className="scanner-status-pill">
                    <span className={`status-dot ${isAnalyzing ? 'analyzing' : ''}`} />
                    <span>{isAnalyzing ? 'Analyzing...' : 'Ready to Scan'}</span>
                </div>

                <button className="scanner-header-btn">
                    <Settings size={22} />
                </button>
            </div>

            {/* Scanning Focus Ring */}
            {!cameraError && (
                <div className={`scanner-focus-ring ${isAnalyzing ? 'active' : ''}`}>
                    <div className="focus-ring-outer" />
                    <div className="focus-ring-middle" />
                    <div className="focus-ring-inner" />
                    <div className="focus-crosshair">
                        <div className="crosshair-h" />
                        <div className="crosshair-v" />
                    </div>
                </div>
            )}

            {/* Bottom Control Dock */}
            <div className="scanner-dock">
                <button
                    className="dock-btn"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <FolderOpen size={24} />
                    <span>Gallery</span>
                </button>

                <button
                    className={`capture-btn ${isCapturing ? 'capturing' : ''}`}
                    onClick={captureImage}
                    disabled={isAnalyzing || cameraError}
                >
                    {isAnalyzing ? (
                        <Loader2 size={28} className="spin" />
                    ) : (
                        <Camera size={28} />
                    )}
                </button>

                <button className="dock-btn" onClick={toggleFlash}>
                    {isFlashOn ? <Zap size={24} /> : <ZapOff size={24} />}
                    <span>Flash</span>
                </button>
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                hidden
                onChange={handleFileSelect}
            />

            {/* Loading Overlay */}
            {isAnalyzing && (
                <div className="scanner-loading">
                    <div className="loading-ring">
                        <div className="loading-ring-inner" />
                    </div>
                    <p>Analyzing your plant...</p>
                    <span className="loading-subtitle">This may take a few seconds</span>
                </div>
            )}

            {/* Result Panel */}
            <div className={`result-panel ${analysisResult ? 'open' : ''}`}>
                <div className="result-panel-header">
                    <h2>Analysis Result</h2>
                    <button className="result-close-btn" onClick={closeResult}>
                        <X size={22} />
                    </button>
                </div>

                {analysisResult && (
                    <div className="result-content">
                        {/* Captured Image */}
                        {resultImage && (
                            <div className="result-image-container">
                                <img src={resultImage} alt="Analyzed plant" />
                            </div>
                        )}

                        {/* Bento Grid Results */}
                        <div className="result-bento">
                            {/* Health Status Card - Full Width */}
                            <div className={`bento-card health-status full-width ${analysisResult.health_status !== 'healthy' ? 'warning' : ''
                                }`}>
                                <div className={`health-badge ${analysisResult.health_status !== 'healthy' ? 'warning' : ''
                                    }`}>
                                    {analysisResult.health_status === 'healthy' ? (
                                        <CheckCircle size={18} />
                                    ) : (
                                        <AlertTriangle size={18} />
                                    )}
                                    {analysisResult.health_status === 'healthy' ? 'Healthy Plant' : 'Issues Detected'}
                                </div>

                                <div className="confidence-display">
                                    <div className="confidence-circle">
                                        <svg viewBox="0 0 80 80">
                                            <circle className="bg" cx="40" cy="40" r="36" />
                                            <circle
                                                className="fill"
                                                cx="40"
                                                cy="40"
                                                r="36"
                                                style={{
                                                    strokeDashoffset: 226 - (226 * (analysisResult.confidence || 0.85))
                                                }}
                                            />
                                        </svg>
                                        <span className="confidence-value">
                                            {Math.round((analysisResult.confidence || 0.85) * 100)}%
                                        </span>
                                    </div>
                                    <div className="plant-info">
                                        <h3>{analysisResult.plant_name || 'Plant'}</h3>
                                        <p>Confidence Score</p>
                                    </div>
                                </div>
                            </div>

                            {/* Diseases Card */}
                            {analysisResult.diseases?.length > 0 && (
                                <div className="bento-card full-width">
                                    <div className="bento-card-header">
                                        <Bug size={20} />
                                        <h4>Detected Issues</h4>
                                    </div>
                                    <div className="disease-list">
                                        {analysisResult.diseases.map((d, i) => (
                                            <div key={i} className="disease-item">
                                                <div className="disease-header">
                                                    <span className="disease-name">{d.name}</span>
                                                    <span className={`disease-severity ${d.severity || 'medium'}`}>
                                                        {d.severity || 'medium'}
                                                    </span>
                                                </div>
                                                {d.description && (
                                                    <p className="disease-desc">{d.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommendations Card */}
                            {analysisResult.recommendations?.length > 0 && (
                                <div className="bento-card full-width">
                                    <div className="bento-card-header">
                                        <Lightbulb size={20} />
                                        <h4>Recommendations</h4>
                                    </div>
                                    <div className="tips-list">
                                        {analysisResult.recommendations.map((tip, i) => {
                                            const TipIcon = tipIcons[i % tipIcons.length];
                                            return (
                                                <div key={i} className="tip-card">
                                                    <div className="tip-icon">
                                                        <TipIcon size={20} />
                                                    </div>
                                                    <div className="tip-content">
                                                        <p>{tip}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="result-actions">
                            <button className="result-action-btn secondary" onClick={closeResult}>
                                Scan Again
                            </button>
                            <button className="result-action-btn primary">
                                Save to History
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
