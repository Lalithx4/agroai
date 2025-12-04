'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { getStats } from '@/services/cache';
import {
  Camera, MessageCircle, Cloud, Calendar, Pill, Bug, BarChart3,
  User, WifiOff, RotateCcw, Sparkles, Shield, Zap
} from 'lucide-react';

export default function HomePage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ total: 0, healthy: 0, issues: 0 });
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setStats(getStats());
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const features = [
    { icon: Camera, title: t('scanPlant'), desc: t('scanPlantDesc'), href: '/scanner', badge: 'AR', isAR: true },
    { icon: MessageCircle, title: t('talkToPlant'), desc: 'AI Chat', href: '/chat' },
    { icon: Cloud, title: t('weather'), desc: 'Forecast', href: '/weather' },
    { icon: Calendar, title: t('cropCalendar'), desc: 'Planning', href: '/calendar', badge: 'NEW' },
    { icon: Pill, title: t('medicine'), desc: 'Remedies', href: '/medicine' },
    { icon: Bug, title: t('pestTracker'), desc: 'Alerts', href: '/pest' },
    { icon: BarChart3, title: t('history'), desc: 'Records', href: '/history' },
  ];

  return (
    <section className="screen active">
      {!isOnline && (
        <div className="offline-banner">
          <WifiOff size={16} />
          <span>{t('offlineMode')}</span>
        </div>
      )}

      <div className="hero-card">
        <div className="hero-avatar">
          <User size={40} strokeWidth={1.5} />
        </div>
        <h1>{t('welcome')}</h1>
        <p>{t('welcomeDesc')}</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{stats.total}</span>
          <span className="stat-label">{t('totalScans')}</span>
        </div>
        <div className="stat-card success">
          <span className="stat-num">{stats.healthy}</span>
          <span className="stat-label">{t('healthyPlants')}</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-num">{stats.issues}</span>
          <span className="stat-label">{t('issuesFound')}</span>
        </div>
      </div>

      <div className="feature-grid">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Link key={index} href={feature.href} className={`feature-card ${feature.isAR ? 'ar-feature' : ''}`}>
              {feature.badge && (
                <div className={`feature-badge ${feature.badge === 'NEW' ? 'new' : ''}`}>
                  {feature.badge}
                </div>
              )}
              <div className="feature-icon">
                <IconComponent size={28} strokeWidth={1.5} />
              </div>
              <span className="feature-title">{feature.title}</span>
              <span className="feature-desc">{feature.desc}</span>
            </Link>
          );
        })}
      </div>

      <button className="reset-btn" onClick={() => {
        if (confirm(t('confirmReset'))) {
          import('@/services/cache').then(cache => {
            cache.clearAll();
            setStats({ total: 0, healthy: 0, issues: 0 });
          });
        }
      }}>
        <RotateCcw size={16} />
        <span>{t('resetData')}</span>
      </button>
    </section>
  );
}
