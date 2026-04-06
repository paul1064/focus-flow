/**
 * Focus Flow - Meditative Productivity App
 * A beautiful, calming productivity application with:
 * - Pomodoro timer with customizable modes
 * - Ambient soundscapes (simulated with Web Audio API)
 * - Breathing exercises
 * - Progress tracking and achievements
 * - Task management
 */

// ============================================
// State Management
// ============================================

const AppState = {
    // Timer state
    timer: {
        isRunning: false,
        isPaused: false,
        timeRemaining: 25 * 60, // in seconds
        initialTime: 25 * 60,
        currentMode: 'focus',
        intervalId: null
    },
    
    // Tasks
    tasks: [],
    
    // Sound volumes (0-100)
    sounds: {
        rain: 0,
        forest: 0,
        waves: 0,
        cafe: 0,
        wind: 0,
        fire: 0,
        birds: 0,
        whiteNoise: 0
    },
    
    // Breathing exercise
    breathing: {
        isRunning: false,
        pattern: 'box',
        phase: 0,
        intervalId: null
    },
    
    // Statistics
    stats: {
        totalFocusTime: 0, // in minutes
        completedSessions: 0,
        currentStreak: 0,
        lastSessionDate: null,
        todaySessions: 0,
        weeklyData: {}
    },
    
    // Achievements
    achievements: {
        firstSession: false,
        fiveSessions: false,
        tenSessions: false,
        hourOfFocus: false,
        fiveHoursOfFocus: false,
        weekStreak: false,
        taskMaster: false
    }
};

// ============================================
// Local Storage Helpers
// ============================================

const Storage = {
    save() {
        localStorage.setItem('focusFlow_stats', JSON.stringify(AppState.stats));
        localStorage.setItem('focusFlow_achievements', JSON.stringify(AppState.achievements));
        localStorage.setItem('focusFlow_tasks', JSON.stringify(AppState.tasks));
    },
    
    load() {
        const stats = localStorage.getItem('focusFlow_stats');
        const achievements = localStorage.getItem('focusFlow_achievements');
        const tasks = localStorage.getItem('focusFlow_tasks');
        
        if (stats) AppState.stats = JSON.parse(stats);
        if (achievements) AppState.achievements = JSON.parse(achievements);
        if (tasks) AppState.tasks = JSON.parse(tasks);
        
        // Reset today's sessions if it's a new day
        this.checkNewDay();
    },
    
    checkNewDay() {
        const today = new Date().toDateString();
        if (AppState.stats.lastSessionDate !== today) {
            // Check if yesterday was the last session for streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (AppState.stats.lastSessionDate !== yesterday.toDateString()) {
                AppState.stats.currentStreak = 0;
            }
            
            AppState.stats.todaySessions = 0;
        }
    },
    
    clear() {
        localStorage.removeItem('focusFlow_stats');
        localStorage.removeItem('focusFlow_achievements');
        localStorage.removeItem('focusFlow_tasks');
    }
};

// ============================================
// Ambient Background Animation
// ============================================

const AmbientCanvas = {
    canvas: null,
    ctx: null,
    particles: [],
    animationId: null,
    
    init() {
        this.canvas = document.getElementById('ambient-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.createParticles();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    },
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    createParticles() {
        this.particles = [];
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                alpha: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 60 + 240 // Blue to purple range
            });
        }
    },
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.alpha})`;
            this.ctx.fill();
            
            // Draw glow
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.radius * 4
            );
            gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${particle.alpha * 0.3})`);
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius * 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Connect nearby particles
        this.particles.forEach((p1, i) => {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 100)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
};

// ============================================
// Timer Functionality
// ============================================

const Timer = {
    init() {
        this.bindEvents();
        this.updateDisplay();
        this.loadCurrentMode();
    },
    
    bindEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modeBtn = e.currentTarget;
                this.setMode(
                    modeBtn.dataset.mode,
                    parseInt(modeBtn.dataset.duration)
                );
            });
        });
    },
    
    loadCurrentMode() {
        const savedMode = localStorage.getItem('focusFlow_currentMode');
        if (savedMode) {
            const modeData = JSON.parse(savedMode);
            AppState.timer.currentMode = modeData.mode;
            AppState.timer.initialTime = modeData.duration * 60;
            AppState.timer.timeRemaining = modeData.duration * 60;
            
            // Update UI
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === modeData.mode);
            });
            
            this.updateModeIndicator();
            this.updateDisplay();
        }
    },
    
    setMode(mode, duration) {
        this.pause();
        AppState.timer.currentMode = mode;
        AppState.timer.initialTime = duration * 60;
        AppState.timer.timeRemaining = duration * 60;
        
        // Save mode preference
        localStorage.setItem('focusFlow_currentMode', JSON.stringify({ mode, duration }));
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        this.updateModeIndicator();
        this.updateDisplay();
        this.updateProgressRing();
    },
    
    updateModeIndicator() {
        const modeDot = document.querySelector('.mode-dot');
        const modeText = document.getElementById('current-mode');
        
        modeDot.className = 'mode-dot';
        
        switch (AppState.timer.currentMode) {
            case 'focus':
                modeDot.classList.add('focus');
                modeText.textContent = 'Deep Focus';
                break;
            case 'short':
                modeDot.classList.add('short-break');
                modeText.textContent = 'Short Break';
                break;
            case 'long':
                modeDot.classList.add('long-break');
                modeText.textContent = 'Long Break';
                break;
        }
    },
    
    start() {
        if (AppState.timer.isRunning && !AppState.timer.isPaused) return;
        
        AppState.timer.isRunning = true;
        AppState.timer.isPaused = false;
        
        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('pause-btn').style.display = 'flex';
        
        AppState.timer.intervalId = setInterval(() => {
            AppState.timer.timeRemaining--;
            this.updateDisplay();
            this.updateProgressRing();
            
            if (AppState.timer.timeRemaining <= 0) {
                this.complete();
            }
        }, 1000);
    },
    
    pause() {
        if (!AppState.timer.isRunning) return;
        
        AppState.timer.isPaused = true;
        clearInterval(AppState.timer.intervalId);
        
        document.getElementById('start-btn').style.display = 'flex';
        document.getElementById('pause-btn').style.display = 'none';
        document.querySelector('#start-btn .btn-icon').textContent = '▶';
        document.querySelector('#start-btn .btn-text').textContent = 'Resume';
    },
    
    reset() {
        this.pause();
        AppState.timer.timeRemaining = AppState.timer.initialTime;
        AppState.timer.isPaused = false;
        
        document.querySelector('#start-btn .btn-icon').textContent = '▶';
        document.querySelector('#start-btn .btn-text').textContent = 'Begin Flow';
        document.getElementById('start-btn').style.display = 'flex';
        document.getElementById('pause-btn').style.display = 'none';
        
        this.updateDisplay();
        this.updateProgressRing();
    },
    
    complete() {
        this.pause();
        AppState.timer.timeRemaining = AppState.timer.initialTime;
        
        // Update stats
        if (AppState.timer.currentMode === 'focus') {
            const minutes = Math.floor(AppState.timer.initialTime / 60);
            AppState.stats.totalFocusTime += minutes;
            AppState.stats.completedSessions++;
            AppState.stats.todaySessions++;
            
            // Update streak
            const today = new Date().toDateString();
            if (AppState.stats.lastSessionDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (AppState.stats.lastSessionDate === yesterday.toDateString()) {
                    AppState.stats.currentStreak++;
                } else if (AppState.stats.lastSessionDate !== today) {
                    AppState.stats.currentStreak = 1;
                }
                
                AppState.stats.lastSessionDate = today;
            }
            
            // Update weekly data
            const weekKey = this.getWeekKey();
            if (!AppState.stats.weeklyData[weekKey]) {
                AppState.stats.weeklyData[weekKey] = 0;
            }
            AppState.stats.weeklyData[weekKey] += minutes;
            
            // Check achievements
            this.checkAchievements();
            
            // Save stats
            Storage.save();
            Stats.update();
        }
        
        // Show completion modal
        Modal.show();
        
        // Play notification sound (using Web Audio API)
        this.playNotificationSound();
        
        // Reset button states
        document.querySelector('#start-btn .btn-icon').textContent = '▶';
        document.querySelector('#start-btn .btn-text').textContent = 'Begin Flow';
    },
    
    getWeekKey() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${weekNum}`;
    },
    
    checkAchievements() {
        const { stats, achievements } = AppState;
        let changed = false;
        
        if (!achievements.firstSession && stats.completedSessions >= 1) {
            achievements.firstSession = true;
            Toast.show('🏆 Achievement Unlocked: First Session!');
            changed = true;
        }
        
        if (!achievements.fiveSessions && stats.completedSessions >= 5) {
            achievements.fiveSessions = true;
            Toast.show('🏆 Achievement Unlocked: Five Sessions!');
            changed = true;
        }
        
        if (!achievements.tenSessions && stats.completedSessions >= 10) {
            achievements.tenSessions = true;
            Toast.show('🏆 Achievement Unlocked: Ten Sessions!');
            changed = true;
        }
        
        if (!achievements.hourOfFocus && stats.totalFocusTime >= 60) {
            achievements.hourOfFocus = true;
            Toast.show('🏆 Achievement Unlocked: Hour of Focus!');
            changed = true;
        }
        
        if (!achievements.fiveHoursOfFocus && stats.totalFocusTime >= 300) {
            achievements.fiveHoursOfFocus = true;
            Toast.show('🏆 Achievement Unlocked: Five Hours of Focus!');
            changed = true;
        }
        
        if (!achievements.weekStreak && stats.currentStreak >= 7) {
            achievements.weekStreak = true;
            Toast.show('🏆 Achievement Unlocked: Week Streak!');
            changed = true;
        }
        
        if (changed) {
            Storage.save();
            Stats.updateAchievements();
        }
    },
    
    playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 880;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            
            // Play second tone
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                
                osc2.frequency.value = 1100;
                osc2.type = 'sine';
                
                gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                osc2.start(audioContext.currentTime);
                osc2.stop(audioContext.currentTime + 0.5);
            }, 200);
        } catch (e) {
            console.log('Audio not supported');
        }
    },
    
    updateDisplay() {
        const minutes = Math.floor(AppState.timer.timeRemaining / 60);
        const seconds = AppState.timer.timeRemaining % 60;
        
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        
        // Update page title
        document.title = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} • Focus Flow`;
    },
    
    updateProgressRing() {
        const circle = document.getElementById('progress-circle');
        const circumference = 2 * Math.PI * 54; // r = 54
        const progress = AppState.timer.timeRemaining / AppState.timer.initialTime;
        const offset = circumference * (1 - progress);
        
        circle.style.strokeDashoffset = offset;
    }
};

// ============================================
// Task Management
// ============================================

const Tasks = {
    init() {
        this.bindEvents();
        this.render();
    },
    
    bindEvents() {
        const input = document.getElementById('task-input');
        const addBtn = document.getElementById('add-task-btn');
        
        addBtn.addEventListener('click', () => this.add(input.value));
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.add(input.value);
                input.value = '';
            }
        });
    },
    
    add(text) {
        if (!text.trim()) return;
        
        const task = {
            id: Date.now(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        AppState.tasks.unshift(task);
        Storage.save();
        this.render();
        Toast.show('Task added!');
    },
    
    toggle(id) {
        const task = AppState.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            Storage.save();
            this.render();
            
            if (task.completed) {
                // Check task master achievement
                const completedCount = AppState.tasks.filter(t => t.completed).length;
                if (completedCount >= 10 && !AppState.achievements.taskMaster) {
                    AppState.achievements.taskMaster = true;
                    Toast.show('🏆 Achievement Unlocked: Task Master!');
                    Storage.save();
                    Stats.updateAchievements();
                }
            }
        }
    },
    
    delete(id) {
        AppState.tasks = AppState.tasks.filter(t => t.id !== id);
        Storage.save();
        this.render();
    },
    
    render() {
        const list = document.getElementById('task-list');
        
        if (AppState.tasks.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--color-text-muted); padding: var(--spacing-md);">No tasks yet. Add one above!</p>';
            return;
        }
        
        list.innerHTML = AppState.tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="Tasks.toggle(${task.id})"></div>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <button class="delete-task" onclick="Tasks.delete(${task.id})">✕</button>
            </div>
        `).join('');
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ============================================
// Soundscapes (Simulated with Web Audio API)
// ============================================

const Soundscapes = {
    audioContext: null,
    nodes: {},
    
    init() {
        this.bindEvents();
    },
    
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    bindEvents() {
        document.querySelectorAll('.volume-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const sound = e.target.dataset.sound;
                const value = parseInt(e.target.value);
                
                AppState.sounds[sound] = value;
                document.querySelector(`.volume-value[data-sound="${sound}"]`).textContent = `${value}%`;
                
                // Update card active state
                const card = document.querySelector(`.sound-card[data-sound="${sound}"]`);
                card.classList.toggle('active', value > 0);
                
                // Initialize audio on first interaction
                this.initAudio();
                
                // For demo purposes, we'll just store the volume
                // In a real app, you would load actual audio files
            });
        });
        
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                this.applyPreset(preset);
            });
        });
    },
    
    applyPreset(preset) {
        const presets = {
            'deep-work': { rain: 30, whiteNoise: 20, forest: 10 },
            'relaxation': { waves: 40, wind: 20, birds: 15 },
            'nature': { rain: 50, forest: 40, birds: 30 },
            'coffee-shop': { cafe: 60, whiteNoise: 15 }
        };
        
        // Reset all volumes
        Object.keys(AppState.sounds).forEach(sound => {
            AppState.sounds[sound] = 0;
            const slider = document.querySelector(`.volume-slider[data-sound="${sound}"]`);
            const value = document.querySelector(`.volume-value[data-sound="${sound}"]`);
            const card = document.querySelector(`.sound-card[data-sound="${sound}"]`);
            
            if (slider) slider.value = 0;
            if (value) value.textContent = '0%';
            if (card) card.classList.remove('active');
        });
        
        // Apply preset
        const presetSounds = presets[preset];
        if (presetSounds) {
            Object.entries(presetSounds).forEach(([sound, volume]) => {
                AppState.sounds[sound] = volume;
                const slider = document.querySelector(`.volume-slider[data-sound="${sound}"]`);
                const value = document.querySelector(`.volume-value[data-sound="${sound}"]`);
                const card = document.querySelector(`.sound-card[data-sound="${sound}"]`);
                
                if (slider) slider.value = volume;
                if (value) value.textContent = `${volume}%`;
                if (card) card.classList.add('active');
            });
            
            Toast.show(`Applied ${preset.replace('-', ' ')} preset`);
            this.initAudio();
        }
    }
};

// ============================================
// Breathing Exercise
// ============================================

const Breathing = {
    patterns: {
        box: { inhale: 4, hold: 4, exhale: 4, holdOut: 4 },
        relax: { inhale: 4, hold: 7, exhale: 8, holdOut: 0 },
        energy: { inhale: 4, hold: 4, exhale: 4, holdOut: 4 },
        calm: { inhale: 5, hold: 5, exhale: 5, holdOut: 5 }
    },
    
    init() {
        this.bindEvents();
    },
    
    bindEvents() {
        document.getElementById('breathe-start-btn').addEventListener('click', () => this.toggle());
        document.getElementById('breathing-pattern').addEventListener('change', (e) => {
            AppState.breathing.pattern = e.target.value;
        });
    },
    
    toggle() {
        if (AppState.breathing.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    },
    
    start() {
        AppState.breathing.isRunning = true;
        document.getElementById('breathe-start-btn').innerHTML = `
            <span class="btn-icon">⏸</span>
            <span class="btn-text">Stop</span>
        `;
        
        this.runCycle();
    },
    
    stop() {
        AppState.breathing.isRunning = false;
        if (AppState.breathing.intervalId) {
            clearTimeout(AppState.breathing.intervalId);
        }
        
        document.getElementById('breathe-start-btn').innerHTML = `
            <span class="btn-icon">🫁</span>
            <span class="btn-text">Start Exercise</span>
        `;
        
        document.getElementById('breathing-text').textContent = 'Ready';
        document.getElementById('breathing-circle').className = 'breathing-circle';
    },
    
    runCycle() {
        if (!AppState.breathing.isRunning) return;
        
        const pattern = this.patterns[AppState.breathing.pattern];
        const circle = document.getElementById('breathing-circle');
        const text = document.getElementById('breathing-text');
        
        // Inhale
        circle.classList.add('expand');
        circle.classList.remove('contract');
        text.textContent = 'Breathe In';
        
        AppState.breathing.intervalId = setTimeout(() => {
            if (!AppState.breathing.isRunning) return;
            
            // Hold
            if (pattern.hold > 0) {
                text.textContent = 'Hold';
                
                AppState.breathing.intervalId = setTimeout(() => {
                    if (!AppState.breathing.isRunning) return;
                    
                    // Exhale
                    circle.classList.remove('expand');
                    circle.classList.add('contract');
                    text.textContent = 'Breathe Out';
                    
                    AppState.breathing.intervalId = setTimeout(() => {
                        if (!AppState.breathing.isRunning) return;
                        
                        // Hold out
                        if (pattern.holdOut > 0) {
                            text.textContent = 'Hold';
                            
                            setTimeout(() => {
                                if (AppState.breathing.isRunning) {
                                    this.runCycle();
                                }
                            }, pattern.holdOut * 1000);
                        } else {
                            if (AppState.breathing.isRunning) {
                                this.runCycle();
                            }
                        }
                    }, pattern.exhale * 1000);
                }, pattern.hold * 1000);
            } else {
                // No hold, go straight to exhale
                circle.classList.remove('expand');
                circle.classList.add('contract');
                text.textContent = 'Breathe Out';
                
                AppState.breathing.intervalId = setTimeout(() => {
                    if (AppState.breathing.isRunning) {
                        this.runCycle();
                    }
                }, pattern.exhale * 1000);
            }
        }, pattern.inhale * 1000);
    }
};

// ============================================
// Statistics & Achievements
// ============================================

const Stats = {
    init() {
        this.update();
        this.updateWeeklyChart();
        this.updateAchievements();
    },
    
    update() {
        const { stats } = AppState;
        
        // Total focus time
        const hours = Math.floor(stats.totalFocusTime / 60);
        const minutes = stats.totalFocusTime % 60;
        document.getElementById('total-focus-time').textContent = `${hours}h ${minutes}m`;
        
        // Completed sessions
        document.getElementById('completed-sessions').textContent = stats.completedSessions;
        
        // Current streak
        document.getElementById('current-streak').textContent = stats.currentStreak;
        
        // Today's sessions
        document.getElementById('today-sessions').textContent = stats.todaySessions;
    },
    
    updateWeeklyChart() {
        const container = document.getElementById('weekly-chart');
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        
        // Get the last 7 days
        let chartData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay()];
            const weekKey = this.getWeekKeyForDate(date);
            const minutes = AppState.stats.weeklyData[weekKey] || 0;
            
            chartData.push({ day: dayName, minutes });
        }
        
        // Find max for scaling
        const maxMinutes = Math.max(...chartData.map(d => d.minutes), 60);
        
        container.innerHTML = chartData.map(data => `
            <div class="chart-bar">
                <div class="chart-bar-fill" style="height: ${(data.minutes / maxMinutes) * 150}px;"></div>
                <span class="chart-bar-label">${data.day}</span>
            </div>
        `).join('');
    },
    
    getWeekKeyForDate(date) {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${date.getFullYear()}-W${weekNum}`;
    },
    
    updateAchievements() {
        const container = document.getElementById('achievements-list');
        const achievements = [
            { id: 'firstSession', icon: '🌟', name: 'First Session', desc: 'Complete your first focus session' },
            { id: 'fiveSessions', icon: '⭐', name: 'Five Sessions', desc: 'Complete 5 focus sessions' },
            { id: 'tenSessions', icon: '🌟', name: 'Ten Sessions', desc: 'Complete 10 focus sessions' },
            { id: 'hourOfFocus', icon: '⏱️', name: 'Hour of Focus', desc: 'Accumulate 1 hour of focus time' },
            { id: 'fiveHoursOfFocus', icon: '⏰', name: 'Five Hours', desc: 'Accumulate 5 hours of focus time' },
            { id: 'weekStreak', icon: '🔥', name: 'Week Streak', desc: 'Maintain a 7-day streak' },
            { id: 'taskMaster', icon: '✅', name: 'Task Master', desc: 'Complete 10 tasks' }
        ];
        
        container.innerHTML = achievements.map(ach => `
            <div class="achievement-item ${AppState.achievements[ach.id] ? 'unlocked' : ''}">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-name">${ach.name}</div>
                <div class="achievement-desc">${ach.desc}</div>
            </div>
        `).join('');
    }
};

// ============================================
// Navigation
// ============================================

const Navigation = {
    init() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    },
    
    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        document.getElementById(`${tabName}-section`).classList.add('active');
        
        // Update stats when switching to stats tab
        if (tabName === 'stats') {
            Stats.update();
            Stats.updateWeeklyChart();
            Stats.updateAchievements();
        }
    }
};

// ============================================
// Modal
// ============================================

const Modal = {
    init() {
        document.getElementById('continue-btn').addEventListener('click', () => this.hide());
    },
    
    show() {
        document.getElementById('completion-modal').classList.add('show');
    },
    
    hide() {
        document.getElementById('completion-modal').classList.remove('show');
        Timer.reset();
    }
};

// ============================================
// Toast Notifications
// ============================================

const Toast = {
    timeoutId: null,
    
    show(message) {
        const toast = document.getElementById('toast');
        toast.querySelector('.toast-message').textContent = message;
        toast.classList.add('show');
        
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        
        this.timeoutId = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
};

// ============================================
// Clear Data
// ============================================

const ClearData = {
    init() {
        document.getElementById('clear-data-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all your data? This cannot be undone.')) {
                Storage.clear();
                location.reload();
            }
        });
    }
};

// ============================================
// Initialize App
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Load saved data
    Storage.load();
    
    // Initialize all modules
    AmbientCanvas.init();
    Timer.init();
    Tasks.init();
    Soundscapes.init();
    Breathing.init();
    Stats.init();
    Navigation.init();
    Modal.init();
    ClearData.init();
    
    // Welcome message
    console.log('%c✨ Focus Flow - Meditative Productivity', 'font-size: 20px; font-weight: bold; color: #6366f1;');
    console.log('%cStart your focus journey today!', 'font-size: 14px; color: #a0aec0;');
});
