// CropMagix - Main Application

// State
let currentScreen = 'home';
let currentPlant = null;
let currentImage = null;
let analysisData = null;
let ttsEnabled = true;
let chatHistory = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    try {
        // Hide splash immediately
        const splash = document.getElementById('splash-screen');
        if (splash) splash.classList.add('hidden');
        
        // Load language preference
        const savedLang = localStorage.getItem('cropmagix-lang') || 'en';
        try {
            setLanguage(savedLang);
        } catch (e) {
            console.error('Error setting language:', e);
        }
        
        // Update stats
        try {
            updateStats();
        } catch (e) {
            console.error('Error updating stats:', e);
        }
        
        // Load history
        try {
            loadHistory();
        } catch (e) {
            console.error('Error loading history:', e);
        }
        
        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Init error:', error);
    }
}

function setupEventListeners() {
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // File input
    document.getElementById('file-input')?.addEventListener('change', handleFileSelect);
    document.getElementById('soil-input')?.addEventListener('change', handleSoilSelect);

    // Tab switching
    document.querySelectorAll('.result-tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;
            document.querySelectorAll('.result-tabs .tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${target}-panel`).classList.add('active');
        });
    });

    // Scenario buttons
    document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateFuturePrediction(btn.dataset.scenario);
        });
    });

    // Chat input
    document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    // Compare slider
    setupCompareSlider();
}

// Navigation
function navigateTo(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`${screen}-screen`)?.classList.add('active');
    currentScreen = screen;

    if (screen === 'scanner') {
        if (window.arScanner) arScanner.start();
    } else {
        if (window.arScanner) arScanner.stop();
    }

    if (screen === 'weather') {
        loadWeather();
    }

    if (screen === 'calendar') {
        initCalendarScreen();
    }

    if (screen === 'medicine') {
        initMedicineScreen();
    }

    if (screen === 'pest') {
        initPestScreen();
    }

    if (screen === 'chat' && currentPlant) {
        setupChat();
    }
}

// AR Controls
function toggleARMode() {
    if (window.arScanner) arScanner.toggleAR();
}

function toggleFlash() {
    if (window.arScanner) arScanner.toggleFlash();
}

async function captureImage() {
    showLoading('Capturing...');
    
    const blob = window.arScanner ? await arScanner.capture() : null;
    
    if (blob) {
        currentImage = blob;
        await analyzeImage(blob);
    } else {
        hideLoading();
    }
}

// File handling
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    currentImage = file;
    await analyzeImage(file);
    event.target.value = '';
}

// Image Analysis
async function analyzeImage(imageBlob) {
    showLoading(t('analyzing'));

    try {
        // Create preview URL
        const imageUrl = URL.createObjectURL(imageBlob);
        document.getElementById('result-image').src = imageUrl;
        document.getElementById('current-image').src = imageUrl;

        // Check cache
        const cacheKey = `analysis_${Date.now()}`;
        
        // Call API
        const result = await API.analyzeHealth(imageBlob);
        
        if (result) {
            analysisData = result;
            currentPlant = {
                name: result.plant_name || 'Unknown Plant',
                type: result.plant_type || 'plant',
                health: result.health_status || 'unknown',
                image: imageUrl
            };

            // Save to cache
            cache.addScanToHistory({
                id: cacheKey,
                ...result,
                image: imageUrl,
                timestamp: Date.now()
            });

            // Update UI
            displayAnalysisResult(result);
            updateStats();
            loadHistory();
        }
    } catch (error) {
        console.error('Analysis error:', error);
        showToast(t('analysisFailed'), 'error');
    } finally {
        hideLoading();
    }
}

function displayAnalysisResult(data) {
    // Health indicator
    const healthIcon = document.getElementById('health-icon');
    const healthText = document.getElementById('health-text');
    const plantType = document.getElementById('plant-type');
    const indicator = document.getElementById('health-indicator');

    const isHealthy = data.health_status === 'healthy';
    
    healthIcon.textContent = isHealthy ? '✅' : '⚠️';
    healthText.textContent = isHealthy ? t('healthy') : t('issues');
    plantType.textContent = data.plant_name || 'Plant';
    indicator.className = `health-indicator ${isHealthy ? 'healthy' : 'unhealthy'}`;

    // Confidence ring
    const confidence = data.confidence || 0.85;
    const ring = document.getElementById('confidence-ring');
    const circumference = 100;
    ring.style.strokeDashoffset = circumference - (confidence * circumference);
    document.getElementById('confidence-num').textContent = `${Math.round(confidence * 100)}%`;

    // Diseases
    const diseasesList = document.getElementById('diseases-list');
    diseasesList.innerHTML = '';

    if (data.diseases && data.diseases.length > 0) {
        data.diseases.forEach(disease => {
            const severity = disease.severity || 'medium';
            diseasesList.innerHTML += `
                <div class="disease-item">
                    <div class="disease-header">
                        <span class="disease-name">🦠 ${disease.name}</span>
                        <span class="disease-severity ${severity}">${severity}</span>
                    </div>
                    <p class="disease-desc">${disease.description || ''}</p>
                </div>
            `;
        });
    } else {
        diseasesList.innerHTML = `
            <div class="tip-item">
                <span class="tip-icon">✅</span>
                <div class="tip-content">
                    <div class="tip-title">${t('noIssues')}</div>
                    <p class="tip-desc">${t('plantHealthy')}</p>
                </div>
            </div>
        `;
    }

    // Recommendations
    const tipsList = document.getElementById('recommendations');
    tipsList.innerHTML = '';

    const tips = data.recommendations || data.treatment_suggestions || [];
    tips.forEach((tip, idx) => {
        const icons = ['💧', '🌡️', '🌿', '🧪', '☀️'];
        tipsList.innerHTML += `
            <div class="tip-item">
                <span class="tip-icon">${icons[idx % icons.length]}</span>
                <div class="tip-content">
                    <p class="tip-desc">${tip}</p>
                </div>
            </div>
        `;
    });

    // Show result panel
    document.getElementById('analysis-result').classList.remove('hidden');
}

function hideAnalysisResult() {
    document.getElementById('analysis-result').classList.add('hidden');
}

// Time Travel
function showTimeTravelSlider() {
    document.getElementById('time-travel-modal').classList.remove('hidden');
    generateFuturePrediction();
}

function hideTimeTravelSlider() {
    document.getElementById('time-travel-modal').classList.add('hidden');
}

async function generateFuturePrediction() {
    if (!currentImage || !analysisData) return;

    showLoading(t('generating'));

    try {
        const result = await API.generateFuture(
            currentImage,
            analysisData.diseases?.[0]?.name || 'healthy',
            7,
            'untreated'
        );

        if (result && result.future_image_url) {
            document.getElementById('future-image').src = result.future_image_url;
        }

        document.getElementById('future-description').textContent = 
            result?.description || 'Prediction generated based on current conditions.';
    } catch (error) {
        console.error('Future prediction error:', error);
        document.getElementById('future-description').textContent = 
            'Unable to generate prediction. Please try again.';
    } finally {
        hideLoading();
    }
}

function updateFuturePrediction(scenario) {
    const desc = document.getElementById('future-description');
    
    if (scenario === 'untreated') {
        desc.textContent = analysisData?.diseases?.length > 0
            ? 'Without treatment, the disease may spread to other leaves and reduce yield by up to 40%.'
            : 'Plant will continue healthy growth with proper care.';
    } else {
        desc.textContent = analysisData?.diseases?.length > 0
            ? 'With proper treatment, plant recovery expected within 7-10 days. Apply recommended fungicide and ensure proper drainage.'
            : 'Continued care will maintain optimal plant health and maximize yield.';
    }
}

// Compare Slider
function setupCompareSlider() {
    const slider = document.getElementById('compare-slider');
    const futureImg = document.getElementById('future-image');
    
    if (!slider || !futureImg) return;

    let isDragging = false;

    const updateSlider = (x, container) => {
        const rect = container.getBoundingClientRect();
        let pos = ((x - rect.left) / rect.width) * 100;
        pos = Math.max(0, Math.min(100, pos));
        
        slider.style.left = `${pos}%`;
        futureImg.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
    };

    slider.addEventListener('mousedown', () => isDragging = true);
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const container = slider.parentElement;
            updateSlider(e.clientX, container);
        }
    });

    // Touch support
    slider.addEventListener('touchstart', () => isDragging = true);
    document.addEventListener('touchend', () => isDragging = false);
    document.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches[0]) {
            const container = slider.parentElement;
            updateSlider(e.touches[0].clientX, container);
        }
    });
}

// Chat
function setupChat() {
    const avatar = document.getElementById('chat-avatar');
    const name = document.getElementById('chat-plant-name');
    const status = document.getElementById('chat-plant-status');
    
    if (currentPlant) {
        avatar.textContent = getPlantEmoji(currentPlant.type);
        name.textContent = currentPlant.name;
        status.textContent = 'Ready to chat!';
    }

    // Add welcome message
    if (chatHistory.length === 0) {
        addChatMessage('plant', t('chatWelcome'));
    }
}

function navigateToChat() {
    hideAnalysisResult();
    navigateTo('chat');
}

function getPlantEmoji(type) {
    const emojis = {
        'tomato': '🍅',
        'potato': '🥔',
        'corn': '🌽',
        'rice': '🌾',
        'wheat': '🌾',
        'flower': '🌸',
        'tree': '🌳',
        'default': '🌱'
    };
    return emojis[type?.toLowerCase()] || emojis.default;
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    input.value = '';
    addChatMessage('user', message);
    
    // Show typing
    document.getElementById('typing-indicator').classList.remove('hidden');
    
    try {
        const response = await API.chatWithPlant(
            message,
            currentPlant?.type || 'plant',
            analysisData?.health_status || 'unknown'
        );
        
        document.getElementById('typing-indicator').classList.add('hidden');
        
        if (response && response.reply) {
            addChatMessage('plant', response.reply);
            
            if (ttsEnabled) {
                TTS.speak(response.reply);
            }
        }
    } catch (error) {
        document.getElementById('typing-indicator').classList.add('hidden');
        addChatMessage('plant', t('chatError'));
    }
}

function sendQuickReply(message) {
    document.getElementById('chat-input').value = message;
    sendChatMessage();
}

function addChatMessage(sender, text) {
    const container = document.getElementById('chat-messages');
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.innerHTML = `
        <div class="message-bubble">${text}</div>
        <div class="message-time">${time}</div>
    `;
    
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    
    chatHistory.push({ sender, text, time });
}

function toggleTTS() {
    ttsEnabled = !ttsEnabled;
    const btn = document.getElementById('tts-btn');
    btn.classList.toggle('active', ttsEnabled);
    btn.textContent = ttsEnabled ? '🔊' : '🔇';
}

function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showToast('Voice input not supported', 'error');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = localStorage.getItem('cropmagix-lang') === 'te' ? 'te-IN' : 
                       localStorage.getItem('cropmagix-lang') === 'hi' ? 'hi-IN' : 'en-US';
    
    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        document.getElementById('chat-input').value = text;
    };
    
    recognition.start();
    showToast('Listening...', 'success');
}

// Weather
async function loadWeather() {
    showLoading(t('loadingWeather'));

    try {
        // Get location
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });

        const { latitude, longitude } = position.coords;
        
        const data = await API.getSoilWeather(latitude, longitude);
        
        if (data) {
            displayWeather(data);
        }
    } catch (error) {
        console.error('Weather error:', error);
        // Use default location
        const data = await API.getSoilWeather(17.385, 78.4867); // Hyderabad
        if (data) displayWeather(data);
    } finally {
        hideLoading();
    }
}

function displayWeather(data) {
    const weather = data.weather || {};
    
    document.getElementById('weather-icon').textContent = getWeatherEmoji(weather.condition);
    document.getElementById('weather-temp').textContent = `${Math.round(weather.temperature || 25)}°C`;
    document.getElementById('weather-desc').textContent = weather.condition || 'Clear';
    document.getElementById('location-name').textContent = weather.location || 'Your Location';
    document.getElementById('humidity-val').textContent = `${weather.humidity || 60}%`;
    document.getElementById('wind-val').textContent = `${weather.wind_speed || 10} km/h`;
    document.getElementById('feels-val').textContent = `${Math.round(weather.feels_like || 25)}°C`;

    // Farm score
    const score = data.farming_score || 75;
    const scoreFill = document.getElementById('score-fill');
    const circumference = 283;
    scoreFill.style.strokeDashoffset = circumference - (score / 100) * circumference;
    document.getElementById('farm-score').textContent = score;
    document.getElementById('score-label').textContent = 
        score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor';

    // Forecast
    const forecastList = document.getElementById('forecast-list');
    forecastList.innerHTML = '';
    
    (data.forecast || []).slice(0, 5).forEach(day => {
        forecastList.innerHTML += `
            <div class="forecast-item">
                <div class="forecast-day">${day.day}</div>
                <div class="forecast-icon">${getWeatherEmoji(day.condition)}</div>
                <div class="forecast-temp">${day.temp}°</div>
            </div>
        `;
    });

    // Alerts
    const alertsList = document.getElementById('alerts-list');
    const alertsCard = document.getElementById('alerts-card');
    
    if (data.alerts && data.alerts.length > 0) {
        alertsCard.style.display = 'block';
        alertsList.innerHTML = data.alerts.map(a => `
            <div class="alert-item">
                <span>⚠️</span>
                <span>${a}</span>
            </div>
        `).join('');
    } else {
        alertsCard.style.display = 'none';
    }

    // Advice
    const adviceList = document.getElementById('advice-list');
    adviceList.innerHTML = '';
    
    (data.farming_advice || data.recommendations || []).forEach(tip => {
        adviceList.innerHTML += `
            <div class="advice-item">
                <span>💡</span>
                <span>${tip}</span>
            </div>
        `;
    });
}

function getWeatherEmoji(condition) {
    const conditions = {
        'clear': '☀️',
        'sunny': '☀️',
        'clouds': '☁️',
        'cloudy': '☁️',
        'rain': '🌧️',
        'drizzle': '🌦️',
        'thunderstorm': '⛈️',
        'snow': '❄️',
        'mist': '🌫️',
        'fog': '🌫️',
        'default': '🌤️'
    };
    return conditions[condition?.toLowerCase()] || conditions.default;
}

function refreshWeather() {
    loadWeather();
}

// Soil Analysis
async function handleSoilSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    showLoading('Analyzing soil...');

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        }).catch(() => ({ coords: { latitude: 17.385, longitude: 78.4867 } }));

        const result = await API.analyzeSoil(
            file, 
            position.coords.latitude, 
            position.coords.longitude
        );

        if (result) {
            displaySoilResult(result);
        }
    } catch (error) {
        console.error('Soil analysis error:', error);
        showToast('Soil analysis failed', 'error');
    } finally {
        hideLoading();
        event.target.value = '';
    }
}

function displaySoilResult(data) {
    const resultDiv = document.getElementById('soil-result');
    resultDiv.classList.remove('hidden');
    
    resultDiv.innerHTML = `
        <h5>Soil Analysis Results</h5>
        <p><strong>Type:</strong> ${data.soil_type || 'Unknown'}</p>
        <p><strong>pH:</strong> ${data.ph || 'N/A'}</p>
        <p><strong>Quality:</strong> ${data.quality || 'Good'}</p>
        <h5 style="margin-top: 12px">Recommendations:</h5>
        ${(data.recommendations || []).map(r => `<p>• ${r}</p>`).join('')}
    `;
}

// History
function loadHistory() {
    const analyses = cache.getScanHistory();
    const container = document.getElementById('history-container');
    const emptyState = document.getElementById('empty-history');

    if (analyses.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    
    // Clear and rebuild
    container.innerHTML = '';
    
    analyses.slice(0, 20).forEach(item => {
        const isHealthy = item.health_status === 'healthy';
        const date = new Date(item.timestamp).toLocaleDateString();
        
        const el = document.createElement('div');
        el.className = 'history-item';
        el.innerHTML = `
            <img class="history-img" src="${item.image || 'data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><rect fill=\"%23333\" width=\"100\" height=\"100\"/><text x=\"50\" y=\"55\" text-anchor=\"middle\" fill=\"%23888\" font-size=\"30\">🌱</text></svg>'}" alt="">
            <div class="history-info">
                <span class="history-plant">${item.plant_name || 'Unknown Plant'}</span>
                <span class="history-status ${isHealthy ? 'healthy' : 'unhealthy'}">
                    ${isHealthy ? '✅ Healthy' : '⚠️ Issues Found'}
                </span>
                <span class="history-date">${date}</span>
            </div>
        `;
        
        el.onclick = () => viewHistoryItem(item);
        container.appendChild(el);
    });
}

function viewHistoryItem(item) {
    analysisData = item;
    currentPlant = {
        name: item.plant_name,
        type: item.plant_type,
        health: item.health_status,
        image: item.image
    };
    
    document.getElementById('result-image').src = item.image;
    document.getElementById('current-image').src = item.image;
    
    displayAnalysisResult(item);
    navigateTo('scanner');
}

async function clearHistory() {
    if (confirm(t('confirmClear'))) {
        cache.clearAll();
        loadHistory();
        updateStats();
        showToast('History cleared', 'success');
    }
}

// Stats
function updateStats() {
    const analyses = cache.getScanHistory();
    
    const total = analyses.length;
    const healthy = analyses.filter(a => a.health_status === 'healthy').length;
    const issues = total - healthy;
    
    document.getElementById('total-scans').textContent = total;
    document.getElementById('healthy-count').textContent = healthy;
    document.getElementById('issues-count').textContent = issues;
}

// Reset
async function resetAllData() {
    if (confirm(t('confirmReset'))) {
        cache.clearAll();
        chatHistory = [];
        analysisData = null;
        currentPlant = null;
        loadHistory();
        updateStats();
        document.getElementById('chat-messages').innerHTML = '';
        showToast('All data reset', 'success');
    }
}

// Utilities
function showLoading(text = 'Loading...') {
    document.getElementById('loading-text').textContent = text;
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function setLanguage(lang) {
    localStorage.setItem('cropmagix-lang', lang);
    
    // Update UI elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        el.textContent = t(key);
    });

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

// ========== CALENDAR SCREEN ==========
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

function initCalendarScreen() {
    if (window.cropCalendar) {
        renderCrops();
        renderTodayTasks();
        renderUpcomingReminders();
        renderMiniCalendar();
    }
}

function renderCrops() {
    const container = document.getElementById('active-crops');
    const crops = cropCalendar.crops;
    
    if (crops.length === 0) {
        container.innerHTML = `
            <div class="empty-crops">
                <span>No crops added yet</span>
                <button onclick="showAddCropModal()">➕ Add Crop</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = crops.map(crop => {
        const progress = cropCalendar.getCropProgress(crop.id);
        const stage = cropCalendar.getCurrentStage(crop.id);
        const icons = { tomato: '🍅', rice: '🌾', wheat: '🌾', cotton: '🌿', chili: '🌶️' };
        
        return `
            <div class="crop-item">
                <span class="crop-icon">${icons[crop.cropType] || '🌱'}</span>
                <div class="crop-info">
                    <span class="crop-name">${crop.fieldName || crop.cropType}</span>
                    <span class="crop-stage">${stage?.name || 'Growing'}</span>
                    <div class="crop-progress">
                        <div class="crop-progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderTodayTasks() {
    const container = document.getElementById('today-tasks');
    const allReminders = [];
    
    cropCalendar.crops.forEach(crop => {
        const reminders = cropCalendar.generateReminders(crop.id);
        allReminders.push(...reminders.filter(r => {
            const today = new Date();
            const reminderDate = new Date(r.date);
            return reminderDate.toDateString() === today.toDateString();
        }));
    });
    
    if (allReminders.length === 0) {
        container.innerHTML = '<p class="no-tasks">No tasks for today</p>';
        return;
    }
    
    container.innerHTML = allReminders.map(task => `
        <div class="task-item">
            <div class="task-checkbox" onclick="this.classList.toggle('completed'); this.nextElementSibling.classList.toggle('completed')"></div>
            <span class="task-text">${task.message}</span>
        </div>
    `).join('');
}

function renderUpcomingReminders() {
    const container = document.getElementById('upcoming-reminders');
    const allReminders = [];
    
    cropCalendar.crops.forEach(crop => {
        const reminders = cropCalendar.generateReminders(crop.id);
        allReminders.push(...reminders);
    });
    
    const upcoming = allReminders
        .filter(r => new Date(r.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);
    
    if (upcoming.length === 0) {
        container.innerHTML = '<p class="no-reminders">No upcoming reminders</p>';
        return;
    }
    
    container.innerHTML = upcoming.map(r => {
        const date = new Date(r.date);
        return `
            <div class="reminder-item">
                <span class="reminder-icon">🔔</span>
                <div class="reminder-info">
                    <span class="reminder-title">${r.message}</span>
                    <span class="reminder-date">${date.toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderMiniCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    document.getElementById('calendar-month').textContent = `${monthNames[calendarMonth]} ${calendarYear}`;
    
    const grid = document.getElementById('calendar-grid');
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const today = new Date();
    
    let html = days.map(d => `<div class="calendar-day header">${d}</div>`).join('');
    
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day"></div>';
    }
    
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = d === today.getDate() && 
                        calendarMonth === today.getMonth() && 
                        calendarYear === today.getFullYear();
        html += `<div class="calendar-day${isToday ? ' today' : ''}">${d}</div>`;
    }
    
    grid.innerHTML = html;
}

function prevMonth() {
    calendarMonth--;
    if (calendarMonth < 0) {
        calendarMonth = 11;
        calendarYear--;
    }
    renderMiniCalendar();
}

function nextMonth() {
    calendarMonth++;
    if (calendarMonth > 11) {
        calendarMonth = 0;
        calendarYear++;
    }
    renderMiniCalendar();
}

function showAddCropModal() {
    document.getElementById('add-crop-modal').classList.remove('hidden');
    document.getElementById('planting-date').valueAsDate = new Date();
}

function hideAddCropModal() {
    document.getElementById('add-crop-modal').classList.add('hidden');
}

async function addNewCrop() {
    const cropType = document.getElementById('crop-type').value;
    const plantingDate = document.getElementById('planting-date').value;
    const fieldName = document.getElementById('field-name').value;
    
    if (!plantingDate) {
        showToast('Please select planting date', 'error');
        return;
    }
    
    await cropCalendar.addCrop({
        cropType,
        plantingDate: new Date(plantingDate),
        fieldName
    });
    
    hideAddCropModal();
    initCalendarScreen();
    showToast('Crop added successfully!', 'success');
}

// ========== MEDICINE SCREEN ==========
let preferOrganic = false;

function initMedicineScreen() {
    // Setup category buttons
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterDiseases(btn.dataset.category);
        });
    });
}

function toggleOrganicPreference() {
    preferOrganic = !preferOrganic;
    const toggle = document.getElementById('organic-toggle');
    toggle.classList.toggle('active', preferOrganic);
    showToast(preferOrganic ? 'Showing organic treatments first' : 'Showing chemical treatments first', 'info');
}

function searchDisease() {
    const query = document.getElementById('disease-search').value.trim();
    if (query) {
        showTreatment(query);
    }
}

function filterDiseases(category) {
    const cards = document.querySelectorAll('.disease-card');
    // For now, show all - in production, filter by category
    cards.forEach(card => card.style.display = 'flex');
}

function showTreatment(diseaseName) {
    if (!window.medicineRecommender) return;
    
    const rec = medicineRecommender.getRecommendations(diseaseName, preferOrganic);
    const panel = document.getElementById('treatment-panel');
    const content = document.getElementById('treatment-content');
    
    const primaryLabel = preferOrganic ? '🌿 Organic Treatment' : '💊 Chemical Treatment';
    const altLabel = preferOrganic ? '💊 Chemical Alternative' : '🌿 Organic Alternative';
    
    content.innerHTML = `
        <h3 class="treatment-title">${rec.disease}</h3>
        <span class="treatment-category">${rec.category}</span>
        
        <div class="treatment-section">
            <h4>${primaryLabel}</h4>
            ${rec.recommended.map(t => `
                <div class="treatment-item ${preferOrganic ? 'organic' : ''}">
                    <div class="treatment-name">${t.name}</div>
                    <div class="treatment-detail">📏 Dosage: ${t.dosage}</div>
                    <div class="treatment-detail">🔄 Frequency: ${t.frequency}</div>
                    ${t.brand ? `<div class="treatment-detail">🏷️ Brand: ${t.brand}</div>` : ''}
                    ${t.preparation ? `<div class="treatment-detail">📝 Prep: ${t.preparation}</div>` : ''}
                </div>
            `).join('')}
        </div>
        
        <div class="treatment-section">
            <h4>${altLabel}</h4>
            ${rec.alternative.map(t => `
                <div class="treatment-item ${!preferOrganic ? 'organic' : ''}">
                    <div class="treatment-name">${t.name}</div>
                    <div class="treatment-detail">📏 Dosage: ${t.dosage}</div>
                    <div class="treatment-detail">🔄 Frequency: ${t.frequency}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="treatment-section">
            <h4>🛡️ Prevention Tips</h4>
            <ul class="prevention-list">
                ${rec.prevention.map(p => `<li>${p}</li>`).join('')}
            </ul>
        </div>
    `;
    
    panel.classList.remove('hidden');
    document.querySelector('.disease-list').style.display = 'none';
}

function hideTreatmentPanel() {
    document.getElementById('treatment-panel').classList.add('hidden');
    document.querySelector('.disease-list').style.display = 'flex';
}

// ========== PEST SCREEN ==========
function initPestScreen() {
    if (!window.pestTracker) return;
    
    loadRegionalAlerts();
    loadWeatherRisks();
    loadSeasonalPests('kharif');
    loadRecentSightings();
    
    // Season tab handlers
    document.querySelectorAll('.season-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadSeasonalPests(tab.dataset.season);
        });
    });
}

function loadRegionalAlerts() {
    // Get region from geolocation or default
    const region = localStorage.getItem('user-region') || 'telangana';
    const alerts = pestTracker.getRegionalAlerts(region);
    
    const banner = document.getElementById('pest-alert-banner');
    const alertText = document.getElementById('alert-text');
    
    banner.className = `pest-alert-banner ${alerts.alertLevel}`;
    
    if (alerts.alerts.length > 0 && alerts.alerts[0].type === 'outbreak') {
        alertText.textContent = alerts.alerts[0].message;
    } else {
        alertText.textContent = `Alert level: ${alerts.alertLevel.toUpperCase()} in ${alerts.region}`;
    }
}

async function loadWeatherRisks() {
    const container = document.getElementById('weather-risk-list');
    
    try {
        // Get current weather
        const weatherData = cache.getWeatherData();
        if (weatherData && weatherData.current) {
            const risks = pestTracker.getPestRiskFromWeather(weatherData.current);
            
            if (risks.length === 0) {
                container.innerHTML = '<p class="no-tasks">Low pest risk based on current weather</p>';
                return;
            }
            
            container.innerHTML = risks.slice(0, 4).map(risk => `
                <div class="risk-item ${risk.riskLevel}" onclick="showPestDetail('${risk.pestId}')">
                    <span>${risk.name.en}</span>
                    <span class="risk-badge ${risk.riskLevel}">${risk.riskLevel.toUpperCase()}</span>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="no-tasks">Load weather data to see pest risks</p>';
        }
    } catch (e) {
        container.innerHTML = '<p class="no-tasks">Unable to load pest risks</p>';
    }
}

function loadPestsForCrop() {
    const crop = document.getElementById('pest-crop-select').value;
    const container = document.getElementById('crop-pest-list');
    
    if (!crop) {
        container.innerHTML = '';
        return;
    }
    
    const pests = pestTracker.getPestsForCrop(crop);
    
    if (pests.length === 0) {
        container.innerHTML = '<p class="no-tasks">No common pests found for this crop</p>';
        return;
    }
    
    container.innerHTML = pests.map(pest => `
        <div class="pest-item" onclick="showPestDetail('${pest.pestId}')">
            <div class="pest-name">${pest.name.en}</div>
            <div class="pest-crops">Affects: ${pest.crops.join(', ')}</div>
            <span class="pest-severity ${pest.severity}">${pest.severity}</span>
        </div>
    `).join('');
}

function loadSeasonalPests(season) {
    const container = document.getElementById('seasonal-pests');
    const calendar = pestTracker.generatePestCalendar();
    
    const months = Object.entries(calendar)
        .filter(([_, data]) => data.season === season)
        .flatMap(([_, data]) => data.pests);
    
    const uniquePests = [...new Map(months.map(p => [p.pestId, p])).values()];
    
    container.innerHTML = uniquePests.map(pest => `
        <span class="seasonal-pest-tag" onclick="showPestDetail('${pest.pestId}')">${pest.name.en}</span>
    `).join('');
}

async function loadRecentSightings() {
    const container = document.getElementById('sightings-list');
    const sightings = await pestTracker.getRecentSightings(7);
    
    if (sightings.length === 0) {
        container.innerHTML = '<p class="no-sightings">No recent sightings in your area</p>';
        return;
    }
    
    container.innerHTML = sightings.map(s => {
        const pest = pestTracker.getPestDetails(s.pestId);
        const time = new Date(s.timestamp).toLocaleDateString();
        return `
            <div class="sighting-item">
                <div class="sighting-info">
                    <span class="sighting-pest">${pest?.name.en || s.pestId}</span>
                    <span class="sighting-location">📍 ${s.location}</span>
                    <span class="sighting-time">${time}</span>
                </div>
            </div>
        `;
    }).join('');
}

function showPestDetail(pestId) {
    const pest = pestTracker.getPestDetails(pestId);
    if (!pest) return;
    
    const modal = document.getElementById('pest-detail-modal');
    const content = document.getElementById('pest-detail-content');
    
    content.innerHTML = `
        <div class="pest-detail-header">
            <span class="pest-detail-icon">🐛</span>
            <div>
                <div class="pest-detail-name">${pest.name.en}</div>
                <span class="pest-severity ${pest.severity}">${pest.severity} severity</span>
            </div>
        </div>
        
        <div class="pest-detail-section">
            <h4>🌾 Affected Crops</h4>
            <p>${pest.crops.join(', ')}</p>
        </div>
        
        <div class="pest-detail-section">
            <h4>🔍 Symptoms</h4>
            <ul>
                ${pest.symptoms.map(s => `<li>${s}</li>`).join('')}
            </ul>
        </div>
        
        <div class="pest-detail-section">
            <h4>⚔️ Control Methods</h4>
            <div class="control-method">
                <div class="control-label">Chemical</div>
                <p>${pest.control.chemical}</p>
            </div>
            <div class="control-method">
                <div class="control-label">Organic</div>
                <p>${pest.control.organic}</p>
            </div>
            <div class="control-method">
                <div class="control-label">Cultural</div>
                <p>${pest.control.cultural}</p>
            </div>
        </div>
        
        <div class="pest-detail-section">
            <h4>📅 Active Seasons</h4>
            <p>${pest.season.join(', ')}</p>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function hidePestDetail() {
    document.getElementById('pest-detail-modal').classList.add('hidden');
}

function showReportSighting() {
    document.getElementById('report-sighting-modal').classList.remove('hidden');
}

function hideReportSighting() {
    document.getElementById('report-sighting-modal').classList.add('hidden');
}

async function submitSighting() {
    const pestId = document.getElementById('sighting-pest').value;
    const location = document.getElementById('sighting-location').value;
    const notes = document.getElementById('sighting-notes').value;
    
    if (!location) {
        showToast('Please enter a location', 'error');
        return;
    }
    
    await pestTracker.reportSighting(pestId, location, notes);
    hideReportSighting();
    loadRecentSightings();
    showToast('Sighting reported! Thank you.', 'success');
}

// Add flash animation style
const style = document.createElement('style');
style.textContent = `
@keyframes flashFade {
    from { opacity: 0.8; }
    to { opacity: 0; }
}
`;
document.head.appendChild(style);

