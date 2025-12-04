/**
 * CropMagix - Crop Calendar & Reminders
 * Personalized farming schedule with notifications
 */

class CropCalendar {
    constructor() {
        this.crops = [];
        this.reminders = [];
        this.STORAGE_KEY = 'cropmagix_calendar';
        this.REMINDERS_KEY = 'cropmagix_reminders';
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.checkReminders();
        
        // Check reminders every minute
        setInterval(() => this.checkReminders(), 60000);
    }
    
    loadData() {
        try {
            this.crops = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
            this.reminders = JSON.parse(localStorage.getItem(this.REMINDERS_KEY)) || [];
        } catch (e) {
            this.crops = [];
            this.reminders = [];
        }
    }
    
    saveData() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.crops));
        localStorage.setItem(this.REMINDERS_KEY, JSON.stringify(this.reminders));
    }
    
    /**
     * Crop growth stages and typical durations (in days)
     */
    getCropStages(cropType) {
        const stages = {
            tomato: [
                { name: 'Seedling', duration: 14, tasks: ['Water daily', 'Ensure sunlight'] },
                { name: 'Vegetative', duration: 30, tasks: ['Apply nitrogen fertilizer', 'Stake plants'] },
                { name: 'Flowering', duration: 20, tasks: ['Reduce nitrogen', 'Apply phosphorus', 'Check for pests'] },
                { name: 'Fruiting', duration: 30, tasks: ['Support heavy branches', 'Regular watering'] },
                { name: 'Harvest', duration: 30, tasks: ['Pick ripe fruits', 'Check daily'] }
            ],
            rice: [
                { name: 'Nursery', duration: 25, tasks: ['Prepare seedbed', 'Maintain water level'] },
                { name: 'Transplanting', duration: 7, tasks: ['Transplant seedlings', 'Maintain 2-3cm water'] },
                { name: 'Tillering', duration: 30, tasks: ['Apply urea', 'Weed control'] },
                { name: 'Panicle', duration: 35, tasks: ['Drain field', 'Apply potash'] },
                { name: 'Harvest', duration: 30, tasks: ['Drain completely', 'Harvest at 80% maturity'] }
            ],
            wheat: [
                { name: 'Germination', duration: 10, tasks: ['Light irrigation', 'Monitor emergence'] },
                { name: 'Tillering', duration: 35, tasks: ['First irrigation', 'Apply nitrogen'] },
                { name: 'Jointing', duration: 25, tasks: ['Second irrigation', 'Weed control'] },
                { name: 'Heading', duration: 20, tasks: ['Third irrigation', 'Watch for rust'] },
                { name: 'Harvest', duration: 20, tasks: ['Harvest at golden color', 'Moisture 12-14%'] }
            ],
            cotton: [
                { name: 'Seedling', duration: 20, tasks: ['Thin plants', 'Light irrigation'] },
                { name: 'Vegetative', duration: 40, tasks: ['Apply fertilizer', 'Pest monitoring'] },
                { name: 'Squaring', duration: 25, tasks: ['Reduce nitrogen', 'Check for bollworm'] },
                { name: 'Flowering', duration: 30, tasks: ['Regular irrigation', 'Pest control'] },
                { name: 'Boll Opening', duration: 40, tasks: ['Stop irrigation', 'Prepare for harvest'] }
            ],
            chili: [
                { name: 'Seedling', duration: 21, tasks: ['Harden seedlings', 'Prepare field'] },
                { name: 'Transplanting', duration: 14, tasks: ['Transplant carefully', 'Mulching'] },
                { name: 'Vegetative', duration: 30, tasks: ['Apply NPK', 'Stake if needed'] },
                { name: 'Flowering', duration: 25, tasks: ['Foliar spray', 'Check for aphids'] },
                { name: 'Fruiting', duration: 60, tasks: ['Regular picking', 'Continue care'] }
            ],
            default: [
                { name: 'Seedling', duration: 14, tasks: ['Regular watering', 'Sunlight exposure'] },
                { name: 'Growth', duration: 45, tasks: ['Fertilizer application', 'Pest monitoring'] },
                { name: 'Flowering', duration: 20, tasks: ['Reduce water stress', 'Pollination check'] },
                { name: 'Harvest', duration: 30, tasks: ['Monitor maturity', 'Timely harvest'] }
            ]
        };
        
        return stages[cropType.toLowerCase()] || stages.default;
    }
    
    /**
     * Add a new crop to calendar
     */
    addCrop(cropData) {
        const crop = {
            id: Date.now().toString(),
            name: cropData.name,
            type: cropData.type.toLowerCase(),
            plantedDate: cropData.plantedDate || new Date().toISOString(),
            location: cropData.location || 'Field 1',
            area: cropData.area || '1 acre',
            notes: cropData.notes || '',
            stages: this.getCropStages(cropData.type),
            createdAt: new Date().toISOString()
        };
        
        this.crops.push(crop);
        this.generateReminders(crop);
        this.saveData();
        
        return crop;
    }
    
    /**
     * Generate reminders for crop stages
     */
    generateReminders(crop) {
        const plantedDate = new Date(crop.plantedDate);
        let dayOffset = 0;
        
        crop.stages.forEach((stage, index) => {
            // Reminder at start of each stage
            const stageStartDate = new Date(plantedDate);
            stageStartDate.setDate(stageStartDate.getDate() + dayOffset);
            
            this.reminders.push({
                id: `${crop.id}_stage_${index}`,
                cropId: crop.id,
                cropName: crop.name,
                type: 'stage_start',
                title: `${crop.name}: ${stage.name} Stage`,
                message: `Your ${crop.name} is entering ${stage.name} stage. Tasks: ${stage.tasks.join(', ')}`,
                date: stageStartDate.toISOString(),
                tasks: stage.tasks,
                completed: false,
                notified: false
            });
            
            // Task reminders during stage
            stage.tasks.forEach((task, taskIndex) => {
                const taskDate = new Date(stageStartDate);
                taskDate.setDate(taskDate.getDate() + Math.floor(stage.duration / stage.tasks.length) * taskIndex);
                
                this.reminders.push({
                    id: `${crop.id}_task_${index}_${taskIndex}`,
                    cropId: crop.id,
                    cropName: crop.name,
                    type: 'task',
                    title: `${crop.name}: ${task}`,
                    message: `Time to: ${task}`,
                    date: taskDate.toISOString(),
                    completed: false,
                    notified: false
                });
            });
            
            dayOffset += stage.duration;
        });
        
        // Harvest reminder
        const harvestDate = new Date(plantedDate);
        harvestDate.setDate(harvestDate.getDate() + dayOffset - 7); // 1 week before final harvest
        
        this.reminders.push({
            id: `${crop.id}_harvest`,
            cropId: crop.id,
            cropName: crop.name,
            type: 'harvest',
            title: `🎉 ${crop.name}: Ready to Harvest!`,
            message: `Your ${crop.name} is ready for harvest. Plan your harvest activities.`,
            date: harvestDate.toISOString(),
            completed: false,
            notified: false
        });
        
        this.saveData();
    }
    
    /**
     * Check and trigger due reminders
     */
    checkReminders() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);
        
        this.reminders.forEach(reminder => {
            const reminderDate = new Date(reminder.date);
            
            if (!reminder.notified && !reminder.completed && 
                reminderDate >= todayStart && reminderDate < todayEnd) {
                this.sendNotification(reminder);
                reminder.notified = true;
            }
        });
        
        this.saveData();
    }
    
    /**
     * Send push notification
     */
    async sendNotification(reminder) {
        // Show in-app toast
        showToast(reminder.title, 'info');
        
        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(reminder.title, {
                body: reminder.message,
                icon: '🌱',
                tag: reminder.id,
                requireInteraction: true
            });
        }
    }
    
    /**
     * Get upcoming reminders (next 7 days)
     */
    getUpcomingReminders(days = 7) {
        const now = new Date();
        const futureDate = new Date(now);
        futureDate.setDate(futureDate.getDate() + days);
        
        return this.reminders
            .filter(r => {
                const date = new Date(r.date);
                return date >= now && date <= futureDate && !r.completed;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    /**
     * Get today's tasks
     */
    getTodaysTasks() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        return this.reminders.filter(r => {
            const reminderDate = new Date(r.date).toISOString().split('T')[0];
            return reminderDate === todayStr && !r.completed;
        });
    }
    
    /**
     * Mark reminder as completed
     */
    completeReminder(reminderId) {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (reminder) {
            reminder.completed = true;
            reminder.completedAt = new Date().toISOString();
            this.saveData();
        }
    }
    
    /**
     * Get crop by ID
     */
    getCrop(cropId) {
        return this.crops.find(c => c.id === cropId);
    }
    
    /**
     * Get all crops
     */
    getAllCrops() {
        return this.crops;
    }
    
    /**
     * Delete crop and its reminders
     */
    deleteCrop(cropId) {
        this.crops = this.crops.filter(c => c.id !== cropId);
        this.reminders = this.reminders.filter(r => r.cropId !== cropId);
        this.saveData();
    }
    
    /**
     * Get current stage for a crop
     */
    getCurrentStage(cropId) {
        const crop = this.getCrop(cropId);
        if (!crop) return null;
        
        const plantedDate = new Date(crop.plantedDate);
        const now = new Date();
        const daysSincePlanting = Math.floor((now - plantedDate) / (1000 * 60 * 60 * 24));
        
        let dayCount = 0;
        for (const stage of crop.stages) {
            dayCount += stage.duration;
            if (daysSincePlanting < dayCount) {
                return {
                    ...stage,
                    daysRemaining: dayCount - daysSincePlanting,
                    progress: ((stage.duration - (dayCount - daysSincePlanting)) / stage.duration) * 100
                };
            }
        }
        
        return { name: 'Harvest Complete', daysRemaining: 0, progress: 100 };
    }
    
    /**
     * Get weather-based recommendations
     */
    getWeatherBasedTasks(weatherData) {
        const tasks = [];
        
        if (weatherData.rain_probability > 60) {
            tasks.push({
                priority: 'high',
                task: 'Skip irrigation - Rain expected',
                icon: '🌧️'
            });
            tasks.push({
                priority: 'medium',
                task: 'Check drainage systems',
                icon: '💧'
            });
        }
        
        if (weatherData.temperature > 35) {
            tasks.push({
                priority: 'high',
                task: 'Water plants early morning or evening',
                icon: '🌡️'
            });
            tasks.push({
                priority: 'medium',
                task: 'Add mulch to retain moisture',
                icon: '🍂'
            });
        }
        
        if (weatherData.humidity > 80) {
            tasks.push({
                priority: 'high',
                task: 'Watch for fungal diseases',
                icon: '🍄'
            });
            tasks.push({
                priority: 'medium',
                task: 'Improve air circulation',
                icon: '💨'
            });
        }
        
        if (weatherData.wind_speed > 10) {
            tasks.push({
                priority: 'medium',
                task: 'Delay spraying operations',
                icon: '💨'
            });
            tasks.push({
                priority: 'medium',
                task: 'Stake tall plants',
                icon: '🌿'
            });
        }
        
        return tasks;
    }
}

// Create singleton
const cropCalendar = new CropCalendar();
window.cropCalendar = cropCalendar;
