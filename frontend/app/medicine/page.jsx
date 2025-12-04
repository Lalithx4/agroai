'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import BackButton from '@/components/layout/BackButton';
import { Search, Leaf, ArrowLeft, ArrowRight, Pill, Lightbulb, Layers, Bug, Dna, FlaskConical, CloudFog, Snowflake, Skull, Grid2X2, Circle } from 'lucide-react';

const DISEASES = [
    { id: 'early_blight', name: 'Early Blight', icon: Layers, category: 'fungal' },
    { id: 'late_blight', name: 'Late Blight', icon: CloudFog, category: 'fungal' },
    { id: 'powdery_mildew', name: 'Powdery Mildew', icon: Snowflake, category: 'fungal' },
    { id: 'bacterial_wilt', name: 'Bacterial Wilt', icon: Skull, category: 'bacterial' },
    { id: 'mosaic_virus', name: 'Mosaic Virus', icon: Grid2X2, category: 'viral' },
    { id: 'spider_mites', name: 'Spider Mites', icon: Bug, category: 'pest' }
];

const TREATMENTS = {
    early_blight: { chemical: ['Mancozeb 75% WP (2g/L)', 'Chlorothalonil 75% WP'], organic: ['Neem oil spray', 'Copper hydroxide'], tips: ['Remove infected leaves', 'Improve air circulation'] },
    late_blight: { chemical: ['Metalaxyl + Mancozeb', 'Cymoxanil + Mancozeb'], organic: ['Bordeaux mixture', 'Copper sulfate spray'], tips: ['Destroy infected plants', 'Use resistant varieties'] },
    powdery_mildew: { chemical: ['Sulfur dust', 'Myclobutanil'], organic: ['Baking soda spray', 'Milk spray (1:9)'], tips: ['Increase plant spacing', 'Avoid wetting foliage'] },
    bacterial_wilt: { chemical: ['Streptocycline (100ppm)'], organic: ['Bio-agents (Pseudomonas)'], tips: ['Remove wilted plants', 'Sterilize tools'] },
    mosaic_virus: { chemical: ['No chemical cure'], organic: ['Remove infected plants'], tips: ['Use virus-free seeds', 'Control insect vectors'] },
    spider_mites: { chemical: ['Dicofol', 'Abamectin'], organic: ['Neem oil spray', 'Soap water spray'], tips: ['Increase humidity', 'Remove heavily infested leaves'] }
};

export default function MedicinePage() {
    const { t } = useLanguage();
    const [category, setCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDisease, setSelectedDisease] = useState(null);
    const [preferOrganic, setPreferOrganic] = useState(false);

    const filteredDiseases = DISEASES.filter(d => (category === 'all' || d.category === category) && d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const categories = [{ id: 'all', label: 'All', icon: Circle }, { id: 'fungal', label: 'Fungal', icon: FlaskConical }, { id: 'bacterial', label: 'Bacterial', icon: Bug }, { id: 'viral', label: 'Viral', icon: Dna }, { id: 'pest', label: 'Pest', icon: Bug }];

    return (
        <section className="screen active">
            <div className="medicine-header">
                <BackButton />
                <h2>{t('medicine')}</h2>
                <button className={`organic-toggle ${preferOrganic ? 'active' : ''}`} onClick={() => setPreferOrganic(!preferOrganic)} style={{ background: preferOrganic ? 'var(--primary)' : 'var(--bg-elevated)', border: 'none', borderRadius: 'var(--radius-md)', padding: '10px', cursor: 'pointer', color: preferOrganic ? 'white' : 'var(--text-secondary)' }}><Leaf size={18} /></button>
            </div>

            <div className="medicine-content">
                {!selectedDisease ? (
                    <>
                        <div className="medicine-search"><input type="text" placeholder="Search disease..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /><button><Search size={18} /></button></div>
                        <div className="disease-categories">{categories.map(cat => <button key={cat.id} className={`cat-btn ${category === cat.id ? 'active' : ''}`} onClick={() => setCategory(cat.id)}><cat.icon size={14} /><span>{cat.label}</span></button>)}</div>
                        <div className="disease-list">{filteredDiseases.map(disease => <div key={disease.id} className="disease-card" onClick={() => setSelectedDisease(disease.id)}><span className="disease-icon"><disease.icon size={20} /></span><span className="disease-name">{disease.name}</span><span className="disease-arrow"><ArrowRight size={16} /></span></div>)}</div>
                    </>
                ) : (
                    <div className="treatment-panel">
                        <button className="back-treatment" onClick={() => setSelectedDisease(null)}><ArrowLeft size={16} /> Back</button>
                        <div className="treatment-content">
                            <h3>{(() => { const d = DISEASES.find(x => x.id === selectedDisease); return <><d.icon size={22} /> {d?.name}</>; })()}</h3>
                            {!preferOrganic && <div className="treatment-section"><h4><Pill size={18} /> Chemical Treatment</h4><ul>{TREATMENTS[selectedDisease]?.chemical.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
                            <div className="treatment-section"><h4><Leaf size={18} /> Organic Treatment</h4><ul>{TREATMENTS[selectedDisease]?.organic.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                            <div className="treatment-section"><h4><Lightbulb size={18} /> Prevention Tips</h4><ul>{TREATMENTS[selectedDisease]?.tips.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
