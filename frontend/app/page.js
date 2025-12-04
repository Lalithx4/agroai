'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState, useRef } from 'react';
import { getStats } from '@/services/cache';
import {
  Camera, MessageCircle, Cloud, Calendar, Pill, Bug, BarChart3,
  User, WifiOff, RotateCcw, Sparkles, ArrowRight, Leaf, TrendingUp,
  Shield, Zap, Star
} from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ total: 0, healthy: 0, issues: 0 });
  const [isOnline, setIsOnline] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [animatedStats, setAnimatedStats] = useState({ total: 0, healthy: 0, issues: 0 });
  const statsRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const loadedStats = getStats();
    setStats(loadedStats);
    setIsOnline(navigator.onLine);

    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Animated counter effect
  useEffect(() => {
    if (!hasAnimated && stats.total > 0) {
      setHasAnimated(true);
      const duration = 1500;
      const steps = 60;
      const interval = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setAnimatedStats({
          total: Math.floor(stats.total * easeOut),
          healthy: Math.floor(stats.healthy * easeOut),
          issues: Math.floor(stats.issues * easeOut)
        });

        if (step >= steps) {
          clearInterval(timer);
          setAnimatedStats(stats);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [stats, hasAnimated]);

  const features = [
    {
      icon: Camera,
      title: t('scanPlant'),
      desc: t('scanPlantDesc'),
      href: '/scanner',
      badge: 'AR',
      isAR: true,
      size: 'large',
      gradient: 'emerald'
    },
    {
      icon: MessageCircle,
      title: t('talkToPlant'),
      desc: 'AI-powered plant assistant',
      href: '/chat',
      size: 'medium',
      gradient: 'purple'
    },
    {
      icon: Cloud,
      title: t('weather'),
      desc: 'Live forecast & alerts',
      href: '/weather',
      size: 'small',
      gradient: 'sky'
    },
    {
      icon: Calendar,
      title: t('cropCalendar'),
      desc: 'Seasonal planning',
      href: '/calendar',
      badge: 'NEW',
      size: 'small',
      gradient: 'amber'
    },
    {
      icon: Pill,
      title: t('medicine'),
      desc: 'Treatment guides',
      href: '/medicine',
      size: 'small',
      gradient: 'rose'
    },
    {
      icon: Bug,
      title: t('pestTracker'),
      desc: 'Pest monitoring',
      href: '/pest',
      size: 'small',
      gradient: 'orange'
    },
    {
      icon: BarChart3,
      title: t('history'),
      desc: 'Scan analytics',
      href: '/history',
      size: 'medium',
      gradient: 'indigo'
    },
  ];

  return (
    <section className="dashboard-canvas">
      {/* Ambient Background Elements */}
      <div className="ambient-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        <div className="grid-pattern"></div>
      </div>

      {/* Content Container */}
      <div className="dashboard-content">
        {!isOnline && (
          <div className="offline-banner glass-card">
            <WifiOff size={18} />
            <span>{t('offlineMode')}</span>
          </div>
        )}

        {/* Premium Hero Card */}
        <div className="hero-section">
          <div className="hero-glass">
            <div className="hero-glow"></div>
            <div className="hero-inner">
              <div className="hero-avatar-ring">
                <div className="hero-avatar">
                  <Leaf size={32} strokeWidth={1.5} />
                </div>
                <div className="avatar-pulse"></div>
              </div>
              <div className="hero-text">
                <span className="hero-greeting">{greeting}</span>
                <h1 className="hero-title">{t('welcome')}</h1>
                <p className="hero-subtitle">{t('welcomeDesc')}</p>
              </div>
              <div className="hero-badges">
                <span className="hero-badge">
                  <Sparkles size={14} />
                  AI Powered
                </span>
                <span className="hero-badge">
                  <Shield size={14} />
                  Secure
                </span>
              </div>
            </div>
            <div className="hero-accent"></div>
          </div>
        </div>

        {/* Glassmorphic Stats Panel */}
        <div className="stats-panel" ref={statsRef}>
          <div className="stat-glass">
            <div className="stat-icon">
              <Camera size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{animatedStats.total}</span>
              <span className="stat-label">{t('totalScans')}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-glass success">
            <div className="stat-icon">
              <TrendingUp size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{animatedStats.healthy}</span>
              <span className="stat-label">{t('healthyPlants')}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-glass warning">
            <div className="stat-icon">
              <Zap size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{animatedStats.issues}</span>
              <span className="stat-label">{t('issuesFound')}</span>
            </div>
          </div>
        </div>

        {/* Bento Grid Features */}
        <div className="bento-grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Link
                key={index}
                href={feature.href}
                className={`bento-card bento-${feature.size} gradient-${feature.gradient}`}
                style={{ '--delay': `${index * 0.1}s` }}
              >
                <div className="card-glow"></div>
                <div className="card-content">
                  {feature.badge && (
                    <div className={`card-badge ${feature.badge === 'NEW' ? 'badge-new' : 'badge-ar'}`}>
                      {feature.badge === 'AR' && <Star size={10} />}
                      {feature.badge}
                    </div>
                  )}
                  <div className="card-icon-wrap">
                    <IconComponent size={feature.size === 'large' ? 36 : 28} strokeWidth={1.5} />
                  </div>
                  <div className="card-text">
                    <span className="card-title">{feature.title}</span>
                    <span className="card-desc">{feature.desc}</span>
                  </div>
                  <div className="card-arrow">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Reset Button */}
        <button className="reset-button glass-card" onClick={() => {
          if (confirm(t('confirmReset'))) {
            import('@/services/cache').then(cache => {
              cache.clearAll();
              setStats({ total: 0, healthy: 0, issues: 0 });
              setAnimatedStats({ total: 0, healthy: 0, issues: 0 });
            });
          }
        }}>
          <RotateCcw size={18} />
          <span>{t('resetData')}</span>
        </button>
      </div>
    </section>
  );
}
