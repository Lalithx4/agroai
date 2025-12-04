'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import BackButton from '@/components/layout/BackButton';
import { MapPin, AlertTriangle, Wheat, Calendar, Eye, Bug, Worm, CircleDot } from 'lucide-react';

const PESTS = {
    fall_armyworm: { name: 'Fall Armyworm', icon: Worm, crops: ['maize', 'rice'], season: ['kharif'] },
    whitefly: { name: 'Whitefly', icon: Bug, crops: ['cotton', 'tomato'], season: ['kharif', 'rabi'] },
    brown_planthopper: { name: 'Brown Planthopper', icon: Bug, crops: ['rice'], season: ['kharif'] },
    pink_bollworm: { name: 'Pink Bollworm', icon: Worm, crops: ['cotton'], season: ['kharif'] },
    aphids: { name: 'Aphids', icon: CircleDot, crops: ['wheat', 'mustard'], season: ['rabi'] },
    thrips: { name: 'Thrips', icon: Bug, crops: ['chili', 'onion'], season: ['summer', 'kharif'] }
};

const CROPS = ['rice', 'cotton', 'tomato', 'chili', 'maize'];

export default function PestPage() {
    const { t } = useLanguage();
    const [selectedCrop, setSelectedCrop] = useState('');
    const [season, setSeason] = useState('kharif');
    const [showReportModal, setShowReportModal] = useState(false);

    const getPestsForCrop = (crop) => Object.entries(PESTS).filter(([_, pest]) => pest.crops.includes(crop)).map(([id, pest]) => ({ id, ...pest }));
    const getPestsForSeason = (s) => Object.entries(PESTS).filter(([_, pest]) => pest.season.includes(s)).map(([id, pest]) => ({ id, ...pest }));

    return (
        <section className="screen active">
            <div className="pest-header">
                <BackButton />
                <h2>{t('pestTracker')}</h2>
                <button className="report-btn" onClick={() => setShowReportModal(true)}><MapPin size={18} /></button>
            </div>

            <div className="pest-content">
                <div className="pest-alert-banner"><div className="alert-icon"><AlertTriangle size={20} /></div><div className="alert-info"><span className="alert-title">Regional Alert</span><span className="alert-text">Monitor for Fall Armyworm in your area</span></div></div>

                <div className="crop-pest-section">
                    <h4><Wheat size={18} /> Pests for Your Crops</h4>
                    <div className="crop-selector"><select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}><option value="">Select a crop</option>{CROPS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></div>
                    {selectedCrop && <div className="pest-list">{getPestsForCrop(selectedCrop).map(pest => <div key={pest.id} className="pest-card"><pest.icon size={24} /><div><strong>{pest.name}</strong><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Season: {pest.season.join(', ')}</div></div></div>)}</div>}
                </div>

                <div className="pest-calendar-section">
                    <h4><Calendar size={18} /> Seasonal Pest Calendar</h4>
                    <div className="season-tabs">{['kharif', 'rabi', 'summer'].map(s => <button key={s} className={`season-tab ${season === s ? 'active' : ''}`} onClick={() => setSeason(s)}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}</div>
                    <div className="seasonal-pests">{getPestsForSeason(season).map(pest => <div key={pest.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: '20px', margin: '4px', fontSize: '13px' }}><pest.icon size={14} /> {pest.name}</div>)}</div>
                </div>

                <div className="sightings-section"><h4><Eye size={18} /> Recent Sightings</h4><p className="no-sightings">No recent sightings in your area</p></div>
            </div>

            {showReportModal && (
                <div className="modal"><div className="modal-overlay" onClick={() => setShowReportModal(false)}></div>
                    <div className="modal-box">
                        <button className="modal-close" onClick={() => setShowReportModal(false)}>×</button>
                        <h3><MapPin size={20} /> Report Pest Sighting</h3>
                        <div className="form-group"><label>Pest Type</label><select>{Object.entries(PESTS).map(([id, pest]) => <option key={id} value={id}>{pest.name}</option>)}</select></div>
                        <div className="form-group"><label>Location</label><input type="text" placeholder="Village/District name" /></div>
                        <div className="form-group"><label>Notes</label><textarea placeholder="Describe what you observed"></textarea></div>
                        <button className="submit-btn" onClick={() => setShowReportModal(false)}><MapPin size={16} /> Submit Report</button>
                    </div>
                </div>
            )}
        </section>
    );
}
