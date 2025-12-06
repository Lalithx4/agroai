'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './landing.css';
import {
    Leaf, ArrowRight, Camera, MessageCircle, Cloud, Calendar, Sparkles,
    ChevronDown, Mountain, Shield, Zap, Star, Users, Award, CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);

    useEffect(() => {
        // Animation on load
        setTimeout(() => setIsLoaded(true), 100);
        
        // Auto-rotate features
        const interval = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % 4);
        }, 3000);
        
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: Camera,
            title: 'AI Plant Scanner',
            desc: 'Instantly diagnose plant diseases with AR technology',
            color: '#10b981'
        },
        {
            icon: Mountain,
            title: 'Soil Analysis',
            desc: 'Analyze soil nutrients, pH levels, and get crop recommendations',
            color: '#f59e0b'
        },
        {
            icon: MessageCircle,
            title: 'Plant Chatbot',
            desc: 'Ask questions about your plants and get expert AI advice',
            color: '#8b5cf6'
        },
        {
            icon: Cloud,
            title: 'Smart Weather',
            desc: 'Location-based weather with farming tips and crop suggestions',
            color: '#3b82f6'
        }
    ];

    const stats = [
        { value: '50+', label: 'Plant Diseases', icon: CheckCircle2 },
        { value: '8+', label: 'Crop Types', icon: Leaf },
        { value: '3', label: 'Languages', icon: Users },
        { value: '∞', label: 'AI Powered', icon: Sparkles }
    ];

    const handleGetStarted = () => {
        // Save that user has seen landing
        localStorage.setItem('cropmagix_seen_landing', 'true');
        router.push('/home');
    };

    return (
        <div className={`landing-page ${isLoaded ? 'loaded' : ''}`}>
            {/* Animated Background */}
            <div className="landing-bg">
                <div className="bg-gradient"></div>
                <div className="bg-particles">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 10}s`
                        }}></div>
                    ))}
                </div>
                <div className="bg-glow glow-1"></div>
                <div className="bg-glow glow-2"></div>
                <div className="bg-glow glow-3"></div>
            </div>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="hero-content">
                    {/* Logo */}
                    <div className="landing-logo">
                        <div className="logo-ring">
                            <div className="logo-inner">
                                <Leaf size={40} strokeWidth={1.5} />
                            </div>
                            <div className="logo-pulse"></div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="landing-title-wrap">
                        <h1 className="landing-title">
                            <span className="title-agro">Cropmagix</span>
                            <span className="title-ai">AI</span>
                        </h1>
                        <div className="title-badge">
                            <Sparkles size={12} />
                            <span>Powered by KrAIonyx AI</span>
                        </div>
                    </div>

                    {/* Tagline */}
                    <p className="landing-tagline">
                        Your AI-Powered Farming Companion
                    </p>
                    <p className="landing-desc">
                        Diagnose plant diseases, analyze soil health, get weather insights,
                        and chat with AI — all in one beautiful app.
                    </p>

                    {/* CTA Button */}
                    <button className="cta-button" onClick={handleGetStarted}>
                        <span>Get Started</span>
                        <ArrowRight size={20} />
                    </button>

                    {/* Scroll Indicator */}
                    <div className="scroll-indicator">
                        <ChevronDown size={24} />
                        <span>Explore Features</span>
                    </div>
                </div>
            </section>

            {/* Developer Credits Section */}
            <section className="landing-developers">
                <div className="developers-card">
                    <Award size={32} className="dev-icon" />
                    <h2 className="dev-title">Developed by Students</h2>
                    <div className="dev-info">
                        <div className="dev-name">
                            <span className="dev-label">Developer:</span>
                            <span className="dev-value">C Vaishnavi</span>
                        </div>
                        <div className="school-details">
                            <span className="school-name">TELANGANA MODEL SCHOOL HATHNOORA</span>
                            <span className="school-location">Gundlamachanoor Students</span>
                        </div>
                        <div className="guide-info">
                            <span className="guide-label">Guide Teacher:</span>
                            <span className="guide-name">M PADMAJA</span>
                        </div>
                    </div>
                    <p className="dev-desc">
                        Empowering farmers with AI technology for sustainable agriculture
                    </p>
                    <div className="dev-badges">
                        <span className="dev-badge">⚡ Made in India</span>
                        <span className="dev-badge">💚 For Farmers</span>
                        <span className="dev-badge">🎓 Student Project</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features">
                <h2 className="section-title">
                    <Star size={24} />
                    Powerful Features
                </h2>

                <div className="features-showcase">
                    {/* Feature Cards */}
                    <div className="feature-cards">
                        {features.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div 
                                    key={idx}
                                    className={`feature-card ${activeFeature === idx ? 'active' : ''}`}
                                    onClick={() => setActiveFeature(idx)}
                                    style={{ '--accent': feature.color }}
                                >
                                    <div className="feature-icon">
                                        <Icon size={28} />
                                    </div>
                                    <div className="feature-info">
                                        <h3>{feature.title}</h3>
                                        <p>{feature.desc}</p>
                                    </div>
                                    <div className="feature-arrow">
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Feature Preview */}
                    <div className="feature-preview">
                        <div className="preview-phone">
                            <div className="phone-notch"></div>
                            <div className="phone-screen">
                                {activeFeature === 0 && (
                                    <div className="preview-content scanner-preview">
                                        <div className="scan-frame">
                                            <div className="scan-corners"></div>
                                            <span className="scan-text">🌿 Point at Plant</span>
                                        </div>
                                        <div className="scan-result">
                                            <span className="result-badge healthy">✓ Healthy</span>
                                        </div>
                                    </div>
                                )}
                                {activeFeature === 1 && (
                                    <div className="preview-content soil-preview">
                                        <div className="soil-card">
                                            <span className="soil-emoji">🪨</span>
                                            <span className="soil-type">Clay Loam</span>
                                            <div className="soil-stats">
                                                <span>pH: 6.8</span>
                                                <span>N: High</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeFeature === 2 && (
                                    <div className="preview-content chat-preview">
                                        <div className="chat-bubble ai">How can I help your plants today?</div>
                                        <div className="chat-bubble user">My tomato leaves are yellowing</div>
                                        <div className="chat-bubble ai">That could be nitrogen deficiency...</div>
                                    </div>
                                )}
                                {activeFeature === 3 && (
                                    <div className="preview-content weather-preview">
                                        <div className="weather-card">
                                            <span className="weather-temp">28°C</span>
                                            <span className="weather-icon">☀️</span>
                                            <span className="weather-loc">📍 Your Location</span>
                                        </div>
                                        <div className="crop-tags">
                                            <span>🍚 Rice</span>
                                            <span>🌶️ Chili</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="landing-stats">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="stat-item">
                            <Icon size={24} />
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    );
                })}
            </section>

            {/* Tech Section */}
            <section className="landing-tech">
                <h2 className="section-title">
                    <Zap size={24} />
                    Built with Advanced AI
                </h2>
                <div className="tech-grid">
                    <div className="tech-card">
                        <span className="tech-icon">🧠</span>
                        <span className="tech-name">KrAIonyx AI</span>
                        <span className="tech-desc">Core AI intelligence engine</span>
                    </div>
                    <div className="tech-card">
                        <span className="tech-icon">✨</span>
                        <span className="tech-name">Advanced ML Models</span>
                        <span className="tech-desc">Vision AI for plant analysis</span>
                    </div>
                    <div className="tech-card">
                        <span className="tech-icon">🎤</span>
                        <span className="tech-name">Voice AI</span>
                        <span className="tech-desc">Natural voice recognition</span>
                    </div>
                    <div className="tech-card">
                        <span className="tech-icon">⚡</span>
                        <span className="tech-name">Real-time Processing</span>
                        <span className="tech-desc">Ultra-fast AI inference</span>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="landing-final">
                <h2>Ready to Transform Your Farming?</h2>
                <button className="cta-button large" onClick={handleGetStarted}>
                    <Leaf size={22} />
                    <span>Launch CropmagiX AI</span>
                    <ArrowRight size={22} />
                </button>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p className="disclaimer">
                    ⚠️ AI predictions are for guidance only. Always consult agricultural experts for critical decisions.
                </p>
                <p>© 2025 CropmagiX AI • Made with 💚 for Farmers</p>
            </footer>
        </div>
    );
}
