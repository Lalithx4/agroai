'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import BackButton from '@/components/layout/BackButton';
import { Plus, Trash2, ChevronLeft, ChevronRight, Sprout, Apple, Wheat, Leaf, Flame } from 'lucide-react';

const CROP_TYPES = [
    { value: 'tomato', label: 'Tomato', icon: Apple },
    { value: 'rice', label: 'Rice', icon: Wheat },
    { value: 'wheat', label: 'Wheat', icon: Wheat },
    { value: 'cotton', label: 'Cotton', icon: Leaf },
    { value: 'chili', label: 'Chili', icon: Flame }
];

export default function CalendarPage() {
    const { t } = useLanguage();
    const [crops, setCrops] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [formData, setFormData] = useState({ type: 'tomato', date: '', field: '' });

    useEffect(() => { const saved = localStorage.getItem('cropmagix_crops'); if (saved) setCrops(JSON.parse(saved)); }, []);

    const saveCrops = (newCrops) => { setCrops(newCrops); localStorage.setItem('cropmagix_crops', JSON.stringify(newCrops)); };
    const addCrop = () => { if (!formData.date || !formData.field) return; saveCrops([...crops, { id: Date.now(), type: formData.type, plantingDate: formData.date, fieldName: formData.field }]); setShowModal(false); setFormData({ type: 'tomato', date: '', field: '' }); };
    const deleteCrop = (id) => saveCrops(crops.filter(c => c.id !== id));

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (m, y) => new Date(y, m, 1).getDay();
    const getCropIcon = (type) => { const crop = CROP_TYPES.find(c => c.value === type); return crop?.icon ? <crop.icon size={18} /> : <Sprout size={18} />; };

    return (
        <section className="screen active">
            <div className="calendar-header">
                <BackButton />
                <h2>{t('cropCalendar')}</h2>
                <button className="add-btn" onClick={() => setShowModal(true)}><Plus size={20} /></button>
            </div>

            <div className="calendar-content">
                <div className="crops-section">
                    <h4><Sprout size={18} /> My Crops</h4>
                    <div className="crops-list">
                        {crops.length === 0 ? (
                            <div className="empty-crops"><span>No crops added yet</span><button onClick={() => setShowModal(true)}><Plus size={16} /> Add Crop</button></div>
                        ) : crops.map(crop => (
                            <div key={crop.id} className="crop-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {getCropIcon(crop.type)}
                                    <div><strong>{CROP_TYPES.find(c => c.value === crop.type)?.label}</strong><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{crop.fieldName} • {crop.plantingDate}</div></div>
                                </div>
                                <button onClick={() => deleteCrop(crop.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mini-calendar">
                    <div className="calendar-nav">
                        <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); }}><ChevronLeft size={18} /></button>
                        <span>{monthNames[currentMonth]} {currentYear}</span>
                        <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); }}><ChevronRight size={18} /></button>
                    </div>
                    <div className="calendar-grid">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{d}</div>)}
                        {Array(getFirstDayOfMonth(currentMonth, currentYear)).fill(null).map((_, i) => <div key={`e${i}`}></div>)}
                        {Array(getDaysInMonth(currentMonth, currentYear)).fill(null).map((_, i) => (
                            <div key={i} style={{ background: new Date().getDate() === i + 1 && new Date().getMonth() === currentMonth ? 'var(--primary)' : 'transparent', color: new Date().getDate() === i + 1 && new Date().getMonth() === currentMonth ? 'white' : 'inherit' }}>{i + 1}</div>
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
                    <div className="modal-box">
                        <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        <h3><Sprout size={20} /> Add New Crop</h3>
                        <div className="form-group"><label>Crop Type</label><select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>{CROP_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                        <div className="form-group"><label>Planting Date</label><input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
                        <div className="form-group"><label>Field Name</label><input type="text" placeholder="e.g., North Field" value={formData.field} onChange={e => setFormData({ ...formData, field: e.target.value })} /></div>
                        <button className="submit-btn" onClick={addCrop}><Plus size={16} /> Add Crop</button>
                    </div>
                </div>
            )}
        </section>
    );
}
