'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Leaf, Sun, Moon } from 'lucide-react';

export default function Header() {
    const { language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="app-header">
            <Link href="/" className="logo">
                <Leaf className="logo-icon" size={28} strokeWidth={2.5} />
                <span className="logo-text">CropMagix</span>
            </Link>
            <div className="header-right">
                <div className="language-selector">
                    <button
                        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                        onClick={() => setLanguage('en')}
                    >
                        EN
                    </button>
                    <button
                        className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
                        onClick={() => setLanguage('hi')}
                    >
                        हि
                    </button>
                    <button
                        className={`lang-btn ${language === 'te' ? 'active' : ''}`}
                        onClick={() => setLanguage('te')}
                    >
                        తె
                    </button>
                </div>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </header>
    );
}
