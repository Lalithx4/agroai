'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import BackButton from '@/components/layout/BackButton';
import { getSoilWeather } from '@/services/api';
import {
    Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog, CloudSun,
    Droplets, Wind, Thermometer, MapPin, RefreshCw, Lightbulb, Wheat, Calendar, Loader2
} from 'lucide-react';

const weatherIcons = {
    clear: Sun, sunny: Sun, clouds: Cloud, cloudy: Cloud,
    rain: CloudRain, drizzle: CloudRain, thunderstorm: CloudLightning,
    snow: CloudSnow, mist: CloudFog, fog: CloudFog, default: CloudSun
};

export default function WeatherPage() {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [farmScore, setFarmScore] = useState(75);
    const [forecast, setForecast] = useState([
        { day: 'Mon', condition: 'sunny', temp: 28 },
        { day: 'Tue', condition: 'cloudy', temp: 26 },
        { day: 'Wed', condition: 'rain', temp: 24 },
        { day: 'Thu', condition: 'sunny', temp: 27 },
        { day: 'Fri', condition: 'cloudy', temp: 25 }
    ]);
    const [advice, setAdvice] = useState([
        'Water plants early morning for best absorption',
        'Good conditions for fertilizer application',
        'Monitor for pest activity in warm weather'
    ]);

    useEffect(() => { loadWeather(); }, []);

    const loadWeather = async () => {
        setLoading(true);
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            }).catch(() => ({ coords: { latitude: 17.385, longitude: 78.4867 } }));

            const { latitude, longitude } = position.coords;
            const data = await getSoilWeather(latitude, longitude);

            if (data) {
                setWeather(data.weather || { temperature: 28, humidity: 65, wind_speed: 12, condition: 'Sunny', feels_like: 30, location: 'Your Location' });
                setFarmScore(data.farming_score || 75);
                if (data.forecast?.length) setForecast(data.forecast);
                if (data.farming_advice?.length) setAdvice(data.farming_advice);
            } else {
                setWeather({ temperature: 28, humidity: 65, wind_speed: 12, condition: 'Sunny', feels_like: 30, location: 'Your Location' });
            }
        } catch {
            setWeather({ temperature: 28, humidity: 65, wind_speed: 12, condition: 'Sunny', feels_like: 30, location: 'Your Location' });
        } finally { setLoading(false); }
    };

    const getWeatherIcon = (condition, size = 48) => {
        const Icon = weatherIcons[condition?.toLowerCase()] || weatherIcons.default;
        return <Icon size={size} strokeWidth={1.5} />;
    };

    if (loading) {
        return (
            <section className="screen active">
                <div className="weather-header">
                    <BackButton />
                    <h2>{t('weatherForecast')}</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 'var(--space-3)' }}>
                    <Loader2 size={40} className="spin" style={{ color: 'var(--primary)' }} />
                    <p>{t('loadingWeather')}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="screen active">
            <div className="weather-header">
                <BackButton />
                <h2>{t('weatherForecast')}</h2>
                <button className="refresh-btn" onClick={loadWeather}><RefreshCw size={18} /></button>
            </div>

            <div className="weather-content">
                <div className="weather-hero">
                    <div className="weather-icon-big">{getWeatherIcon(weather?.condition)}</div>
                    <div className="weather-temp">{Math.round(weather?.temperature || 25)}°C</div>
                    <div className="weather-desc">{weather?.condition || 'Clear'}</div>
                    <div className="weather-location">
                        <MapPin size={14} />
                        <span>{weather?.location || 'Your Location'}</span>
                    </div>
                    <div className="weather-details">
                        <div className="detail">
                            <span className="detail-icon"><Droplets size={18} /></span>
                            <span className="detail-value">{weather?.humidity || 60}%</span>
                            <span className="detail-label">Humidity</span>
                        </div>
                        <div className="detail">
                            <span className="detail-icon"><Wind size={18} /></span>
                            <span className="detail-value">{weather?.wind_speed || 10} km/h</span>
                            <span className="detail-label">Wind</span>
                        </div>
                        <div className="detail">
                            <span className="detail-icon"><Thermometer size={18} /></span>
                            <span className="detail-value">{Math.round(weather?.feels_like || 25)}°C</span>
                            <span className="detail-label">Feels</span>
                        </div>
                    </div>
                </div>

                <div className="farm-score-card">
                    <h4><Wheat size={18} /> Farming Score</h4>
                    <div className="score-display">
                        <div className="score-circle">
                            <svg viewBox="0 0 100 100">
                                <circle className="bg" cx="50" cy="50" r="45" />
                                <circle className="fill" cx="50" cy="50" r="45" style={{ strokeDashoffset: 283 - (farmScore / 100) * 283 }} />
                            </svg>
                            <span className="score-num">{farmScore}</span>
                        </div>
                        <span className="score-label">{farmScore >= 80 ? 'Excellent' : farmScore >= 60 ? 'Good' : 'Fair'}</span>
                    </div>
                </div>

                <div className="forecast-section">
                    <h4><Calendar size={18} /> 5-Day Forecast</h4>
                    <div className="forecast-list">
                        {forecast.slice(0, 5).map((day, idx) => (
                            <div key={idx} className="forecast-item">
                                <div className="forecast-day">{day.day}</div>
                                <div className="forecast-icon">{getWeatherIcon(day.condition, 24)}</div>
                                <div className="forecast-temp">{day.temp}°</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="advice-card">
                    <h4><Lightbulb size={18} /> Farming Tips</h4>
                    {advice.map((tip, idx) => (
                        <div key={idx} className="advice-item">
                            <Lightbulb size={16} />
                            <span>{tip}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
