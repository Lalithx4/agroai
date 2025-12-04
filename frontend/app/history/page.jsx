'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import BackButton from '@/components/layout/BackButton';
import Link from 'next/link';
import { getScanHistory, clearAll } from '@/services/cache';
import { Trash2, ClipboardList, Camera, CheckCircle, AlertTriangle, Sprout } from 'lucide-react';

export default function HistoryPage() {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [history, setHistory] = useState([]);

    useEffect(() => { setHistory(getScanHistory()); }, []);

    const clearHistory = () => { if (confirm(t('confirmClear'))) { clearAll(); setHistory([]); showToast(t('resetData'), 'success'); } };

    return (
        <section className="screen active">
            <div className="history-header">
                <BackButton />
                <h2>{t('scanHistory')}</h2>
                <button className="clear-btn" onClick={clearHistory}><Trash2 size={18} /></button>
            </div>

            <div className="history-list">
                {history.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon"><ClipboardList size={64} strokeWidth={1} /></span>
                        <p>{t('noHistory')}</p>
                        <Link href="/scanner" className="start-btn"><Camera size={18} /> {t('scanPlant')}</Link>
                    </div>
                ) : history.slice(0, 20).map(item => (
                    <div key={item.id} className="history-item">
                        {item.image ? <img src={item.image} alt="" className="history-img" /> : <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sprout size={24} /></div>}
                        <div className="history-info">
                            <span className="history-plant">{item.plant_name || 'Unknown Plant'}</span>
                            <span className={`history-status ${item.health_status === 'healthy' ? 'healthy' : 'unhealthy'}`}>
                                {item.health_status === 'healthy' ? <><CheckCircle size={14} /> {t('healthy')}</> : <><AlertTriangle size={14} /> {t('issues')}</>}
                            </span>
                            <span className="history-date">{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
