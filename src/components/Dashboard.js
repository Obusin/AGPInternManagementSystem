/**
 * Dashboard Component
 * Main dashboard functionality and UI management
 */

import { DateUtils } from '../utils/dateUtils.js';
import { Formatters } from '../utils/formatters.js';
import { storage } from '../services/StorageService.js';

export class Dashboard {
    constructor(app) {
        this.app = app;
        this.charts = {};
        this.updateInterval = null;
        this.attendanceRecords = [];
    }

    /**
     * Initialize dashboard
     */
    init() {
        this.loadData();
        this.render();
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }

    /**
     * Load dashboard data
     */
    loadData() {
        this.attendanceRecords = storage.getItem('attendanceRecords', []);
        this.userStats = this.calculateUserStats();
    }

    /**
     * Calculate user statistics
     */
    calculateUserStats() {
        const today = DateUtils.getCurrentDateISO();
        const { start: weekStart, end: weekEnd } = DateUtils.getWeekRange();
        const { start: monthStart, end: monthEnd } = DateUtils.getMonthRange();

        const todayRecords = this.attendanceRecords.filter(r => r.date === today);
        const weekRecords = this.attendanceRecords.filter(r => {
            const recordDate = new Date(r.date);
            return recordDate >= weekStart && recordDate <= weekEnd;
        });
        const monthRecords = this.attendanceRecords.filter(r => {
            const recordDate = new Date(r.date);
            return recordDate >= monthStart && recordDate <= monthEnd;
        });

        const todayHours = todayRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
        const weeklyHours = weekRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
        const monthlyHours = monthRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);

        return {
            today: {
                hours: todayHours,
                status: this.getWorkStatus(),
                records: todayRecords
            },
            week: {
                hours: weeklyHours,
                target: 40,
                progress: Math.min((weeklyHours / 40) * 100, 100),
                records: weekRecords
            },
            month: {
                hours: monthlyHours,
                records: monthRecords,
                daysWorked: new Set(monthRecords.map(r => r.date)).size
            }
        };
    }

    /**
     * Get current work status
     */
    getWorkStatus() {
        const currentTime = storage.getItem('currentTimeIn');
        const isTimedIn = storage.getItem('isTimedIn', false);

        if (isTimedIn && currentTime) {
            const duration = DateUtils.calculateDuration(currentTime, new Date());
            return {
                isWorking: true,
                timeIn: currentTime,
                currentDuration: duration.totalHours,
                status: 'Working'
            };
        }

        return {
            isWorking: false,
            status: 'Not started'
        };
    }

    /**
     * Render dashboard UI
     */
    render() {
        const container = document.getElementById('dashboard-section');
        if (!container) return;

        container.innerHTML = this.getTemplate();
        this.updateStats();
        this.renderCharts();
    }

    /**
     * Get dashboard HTML template
     */
    getTemplate() {
        const currentUser = window.userDatabase?.getCurrentUser();
        const userName = currentUser ? currentUser.name : 'User';
        const userRole = currentUser ? currentUser.role : 'user';
        const userPosition = currentUser ? currentUser.position : 'Team Member';

        return `
            <!-- Welcome Card - Improved Design -->
            <div class="welcome-card">
                <div class="welcome-content">
                    <div class="welcome-text">
                        <h2 id="welcome-message" class="welcome-title">Welcome back, ${userName}!</h2>
                        <p id="welcome-subtext" class="welcome-subtitle">
                            <span class="role-badge role-badge--${userRole}">
                                ${userRole.toUpperCase()}
                            </span>
                            <span class="position-text">${userPosition}</span>
                            <span class="separator">•</span>
                            <span class="description-text">Track your attendance and monitor your progress</span>
                        </p>
                    </div>
                    <div class="welcome-stats">
                        <div class="quick-stat">
                            <span class="quick-stat-value" id="today-hours">0.0</span>
                            <span class="quick-stat-label">Hours Today</span>
                        </div>
                        <div class="quick-stat">
                            <span class="quick-stat-value" id="week-progress">0%</span>
                            <span class="quick-stat-label">Week Progress</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section-header">
                <div class="header-left">
                    <h1 class="page-title">
                        <i class="fas fa-home page-title-icon"></i>
                        <span class="page-title-text">Dashboard</span>
                    </h1>
                </div>
                <div class="header-center">
                    <div class="live-time-display">
                        <div class="current-time" id="live-time">--:--</div>
                        <div class="current-date" id="live-date">Loading...</div>
                    </div>
                </div>
                <div class="header-actions">
                    <button class="action-btn action-btn--primary" id="barcode-scan-btn">
                        <i class="fas fa-barcode"></i>
                        <span>Barcode</span>
                    </button>
                    <button class="action-btn action-btn--secondary" id="quick-time-btn">
                        <i class="fas fa-clock"></i>
                        <span>Quick Time</span>
                    </button>
                </div>
            </div>



            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card stat-card--monthly">
                    <div class="stat-content">
                        <div class="stat-header">
                            <div class="stat-icon stat-icon--monthly">
                                <i class="fas fa-clock"></i>
                            </div>
                            <div class="stat-info">
                                <h3 class="stat-title">Total Hours</h3>
                                <div class="stat-subtitle">This month</div>
                            </div>
                        </div>
                        <div class="stat-footer">
                            <div class="stat-value" id="total-hours">0.0</div>
                            <div class="stat-trend stat-trend--positive" id="total-trend">
                                <i class="fas fa-arrow-up"></i>
                                <span>+2.5h</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="stat-card stat-card--weekly">
                    <div class="stat-content">
                        <div class="stat-header">
                            <div class="stat-icon stat-icon--weekly">
                                <i class="fas fa-calendar-week"></i>
                            </div>
                            <div class="stat-info">
                                <h3 class="stat-title">Weekly Hours</h3>
                                <div class="stat-subtitle">This week</div>
                            </div>
                        </div>
                        <div class="stat-footer">
                            <div class="stat-value" id="weekly-hours">0.0</div>
                            <div class="stat-trend stat-trend--positive" id="weekly-trend">
                                <i class="fas fa-arrow-up"></i>
                                <span>+5.0h</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="stat-card stat-card--daily">
                    <div class="stat-content">
                        <div class="stat-header">
                            <div class="stat-icon stat-icon--daily">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                            <div class="stat-info">
                                <h3 class="stat-title">Today's Hours</h3>
                                <div class="stat-subtitle" id="today-status">Ready to start</div>
                            </div>
                        </div>
                        <div class="stat-footer">
                            <div class="stat-value" id="daily-hours">0.0</div>
                            <div class="stat-trend stat-trend--neutral" id="daily-trend">
                                <i class="fas fa-clock"></i>
                                <span id="time-status">Not started</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="stat-card stat-card--progress">
                    <div class="stat-content">
                        <div class="progress-header">
                            <h3 class="stat-title">Weekly Progress</h3>
                            <div class="progress-percentage" id="progress-percentage">0%</div>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" id="weekly-progress-bar" style="width: 0%"></div>
                            </div>
                            <div class="progress-info">
                                <span class="progress-label" id="progress-label">0 / 40 hours</span>
                                <span class="progress-target">Target: 40h/week</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-section">
                <div class="chart-card">
                    <div class="chart-header">
                        <div class="chart-title">
                            <h3 class="section-title">Hours Trend</h3>
                            <p class="section-subtitle">Track your daily attendance patterns</p>
                        </div>
                        <div class="chart-controls">
                            <button class="chart-btn chart-btn--active" data-period="week">Week</button>
                            <button class="chart-btn" data-period="month">Month</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="weekly-chart"></canvas>
                    </div>
                </div>
            </div>

            <!-- QR Scanner Section -->
            <div class="qr-scanner-section">
                <div class="qr-scanner-header">
                    <div class="qr-scanner-title">
                        <h3 class="section-title">
                            <i class="fas fa-qrcode"></i>
                            QR Code Scanner
                        </h3>
                        <p class="section-subtitle">Scan your attendance QR code to track time</p>
                    </div>
                    <div class="qr-scanner-controls">
                        <button class="qr-control-btn qr-control-btn--primary" id="start-camera-btn">
                            <i class="fas fa-video"></i>
                            <span>Start Camera</span>
                        </button>
                        <button class="qr-control-btn qr-control-btn--secondary" id="stop-camera-btn" style="display: none;">
                            <i class="fas fa-stop"></i>
                            <span>Stop Camera</span>
                        </button>
                        <select id="cooldown-setting" class="qr-select">
                            <option value="8000">8 seconds (very safe)</option>
                            <option value="5000" selected>5 seconds (recommended)</option>
                            <option value="3000">3 seconds (fast)</option>
                            <option value="1000">1 second (testing)</option>
                        </select>
                    </div>
                </div>

                <div id="qr-status" class="qr-status">
                    <div class="status-message">📹 Ready! Click "Start Camera" to begin scanning.</div>
                </div>

                <div class="qr-video-container">
                    <video id="qr-video" autoplay muted playsinline style="display: none;">
                        <p>Your browser doesn't support video streaming</p>
                    </video>
                    <canvas id="qr-canvas" style="display: none;"></canvas>

                    <div class="qr-scanning-indicator" id="qr-scanning-indicator" style="display: none;">
                        🔍 SCANNING FOR QR CODES...
                    </div>

                    <div class="qr-placeholder" id="qr-placeholder">
                        <div class="placeholder-icon">
                            <i class="fas fa-qrcode"></i>
                        </div>
                        <div class="placeholder-content">
                            <h4 class="placeholder-title">QR Code Scanner Ready</h4>
                            <p class="placeholder-text">Click "Start Camera" to begin scanning your attendance QR code</p>
                        </div>
                    </div>
                </div>

                <div id="qr-scan-results" class="qr-scan-results"></div>
            </div>

            <!-- Recent Activity -->
            <div class="activity-section">
                <div class="activity-header">
                    <div class="activity-title">
                        <h3 class="section-title">Recent Activity</h3>
                        <p class="section-subtitle">Your latest attendance records</p>
                    </div>
                    <button class="view-all-btn" id="view-all-activity">
                        <span>View All</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                <div class="activity-list" id="recent-activity">
                    <div class="activity-placeholder">
                        <div class="placeholder-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="placeholder-content">
                            <h4 class="placeholder-title">No recent activity</h4>
                            <p class="placeholder-text">Start tracking your attendance to see your activity here!</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Update dashboard statistics
     */
    updateStats() {
        const stats = this.userStats;

        // Update quick stats
        document.getElementById('today-hours').textContent = Formatters.formatHours(stats.today.hours);
        document.getElementById('week-progress').textContent = Formatters.formatPercentage(stats.week.hours, stats.week.target);

        // Update main stats
        document.getElementById('total-hours').textContent = Formatters.formatHours(stats.month.hours);
        document.getElementById('weekly-hours').textContent = Formatters.formatHours(stats.week.hours);
        document.getElementById('daily-hours').textContent = Formatters.formatHours(stats.today.hours);

        // Update progress bar
        const progressBar = document.getElementById('weekly-progress-bar');
        const progressLabel = document.getElementById('progress-label');
        const progressPercentage = document.getElementById('progress-percentage');

        if (progressBar) {
            progressBar.style.width = `${stats.week.progress}%`;
        }
        if (progressLabel) {
            progressLabel.textContent = `${Formatters.formatHours(stats.week.hours)} / ${stats.week.target} hours`;
        }
        if (progressPercentage) {
            progressPercentage.textContent = `${Math.round(stats.week.progress)}%`;
        }

        // Update status
        this.updateWorkStatus();
    }

    /**
     * Update work status display
     */
    updateWorkStatus() {
        const status = this.getWorkStatus();
        const timeStatus = document.getElementById('time-status');
        const todayStatus = document.getElementById('today-status');

        if (status.isWorking) {
            if (timeStatus) timeStatus.textContent = DateUtils.formatDuration(status.currentDuration);
            if (todayStatus) todayStatus.textContent = 'In progress';
        } else {
            if (timeStatus) timeStatus.textContent = 'Not started';
            if (todayStatus) todayStatus.textContent = 'Ready to start';
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // QR scanner embedded controls
        this.setupEmbeddedQRScanner();

        // Barcode scanner button
        const barcodeScanBtn = document.getElementById('barcode-scan-btn');
        if (barcodeScanBtn) {
            barcodeScanBtn.addEventListener('click', () => {
                this.app.simulateBarcodeScanner();
            });
        }

        // Quick time button
        const quickTimeBtn = document.getElementById('quick-time-btn');
        if (quickTimeBtn) {
            quickTimeBtn.addEventListener('click', () => {
                if (this.app.state.isTimedIn) {
                    this.app.timeOut();
                } else {
                    this.app.timeIn();
                }
            });
        }

        // Chart period buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('chart-btn--active'));
                e.target.classList.add('chart-btn--active');
                this.renderCharts(e.target.dataset.period);
            });
        });

        // View all activity button
        const viewAllBtn = document.getElementById('view-all-activity');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.app.changeView('activity');
            });
        }
    }

    /**
     * Render charts
     */
    renderCharts(period = 'week') {
        const canvas = document.getElementById('weekly-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.charts.weekly) {
            this.charts.weekly.destroy();
        }

        const chartData = this.getChartData(period);

        this.charts.weekly = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0'
                        }
                    }
                }
            }
        });
    }

    /**
     * Get chart data for specified period
     */
    getChartData(period) {
        // Implementation for chart data generation
        const labels = [];
        const data = [];

        if (period === 'week') {
            // Generate last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(DateUtils.formatDate(date, 'short').split(',')[0]);

                const dayRecords = this.attendanceRecords.filter(r => r.date === DateUtils.formatDateISO(date));
                const dayHours = dayRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
                data.push(dayHours);
            }
        } else {
            // Generate last 30 days
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.getDate().toString());

                const dayRecords = this.attendanceRecords.filter(r => r.date === DateUtils.formatDateISO(date));
                const dayHours = dayRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
                data.push(dayHours);
            }
        }

        return {
            labels,
            datasets: [{
                label: 'Hours',
                data,
                borderColor: '#ff7a45',
                backgroundColor: 'rgba(255, 122, 69, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        };
    }

    /**
     * Update date and time display
     */
    updateDateTime() {
        const now = new Date();
        const timeElements = document.querySelectorAll('.live-time, #live-time');
        const dateElements = document.querySelectorAll('.live-date, #live-date');

        timeElements.forEach(el => {
            el.textContent = DateUtils.formatTime(now);
        });

        dateElements.forEach(el => {
            el.textContent = DateUtils.formatDate(now, 'long');
        });
    }

    /**
     * Start real-time updates
     */
    startRealTimeUpdates() {
        // Update every minute
        this.updateInterval = setInterval(() => {
            this.updateDateTime();
            this.updateWorkStatus();
        }, 60000);

        // Initial update
        this.updateDateTime();
    }



    /**
     * Setup Embedded QR Scanner
     */
    setupEmbeddedQRScanner() {
        // Load jsQR library
        this.loadJSQRLibrary();

        // Add embedded QR scanner styles
        this.addEmbeddedQRScannerStyles();

        // Setup event listeners for embedded scanner
        this.setupEmbeddedQREventListeners();

        // Initialize QR scanner variables
        this.qrScanning = false;
        this.qrStream = null;
        this.qrVideo = null;
        this.qrCanvas = null;
        this.qrCtx = null;
        this.qrLastScanned = null;
        this.qrLastScanTime = 0;
        this.qrScanCooldown = 5000;
        this.qrIsProcessing = false;
    }

    /**
     * Setup Embedded QR Event Listeners
     */
    setupEmbeddedQREventListeners() {
        // Start camera button
        const startBtn = document.getElementById('start-camera-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startQRCamera());
        }

        // Stop camera button
        const stopBtn = document.getElementById('stop-camera-btn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopQRCamera());
        }

        // Cooldown setting
        const cooldownSelect = document.getElementById('cooldown-setting');
        if (cooldownSelect) {
            cooldownSelect.addEventListener('change', () => this.updateQRCooldown());
        }
    }

    /**
     * Refresh dashboard data
     */
    refresh() {
        this.loadData();
        this.updateStats();
        this.renderCharts();
    }

    /**
     * Add Embedded QR Scanner Styles
     */
    addEmbeddedQRScannerStyles() {
        if (document.getElementById('dashboard-embedded-qr-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'dashboard-embedded-qr-styles';
        styles.textContent = `
            .qr-scanner-section {
                background: var(--card-bg, #2e3540);
                border-radius: 16px;
                padding: 24px;
                margin: 24px 0;
                border: 1px solid var(--border-color, #3a4553);
            }

            .qr-scanner-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
            }

            .qr-scanner-title {
                flex: 1;
                min-width: 250px;
            }

            .qr-scanner-title .section-title {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 0 0 5px 0;
                color: var(--text-color, #ffffff);
                font-size: 1.5rem;
            }

            .qr-scanner-title .section-subtitle {
                margin: 0;
                color: var(--text-secondary, #a0a0a0);
                font-size: 0.9rem;
            }

            .qr-scanner-controls {
                display: flex;
                gap: 12px;
                align-items: center;
                flex-wrap: wrap;
            }

            .qr-control-btn {
                padding: 10px 16px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                white-space: nowrap;
            }

            .qr-control-btn--primary {
                background: #ff7a45;
                color: white;
            }

            .qr-control-btn--primary:hover {
                background: #e05a25;
                transform: translateY(-1px);
            }

            .qr-control-btn--secondary {
                background: #666;
                color: white;
            }

            .qr-control-btn--secondary:hover {
                background: #555;
            }

            .qr-select {
                padding: 8px 12px;
                background: var(--input-bg, #3a4553);
                color: var(--text-color, white);
                border: 1px solid var(--border-color, #555);
                border-radius: 6px;
                font-size: 13px;
                min-width: 150px;
            }

            .qr-status {
                padding: 15px;
                background: rgba(255, 122, 69, 0.1);
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: center;
                border: 1px solid rgba(255, 122, 69, 0.2);
            }

            .qr-status .status-message {
                margin: 0;
                color: var(--text-color, #ffffff);
                font-weight: 500;
            }

            .qr-video-container {
                position: relative;
                width: 100%;
                min-height: 320px;
                background: #000;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid var(--border-color, #3a4553);
            }

            #qr-video {
                width: 100%;
                height: auto;
                max-height: 400px;
                border-radius: 8px;
            }

            .qr-scanning-indicator {
                color: #00ff00;
                font-weight: bold;
                animation: qr-blink 1s infinite;
                font-size: 18px;
                text-align: center;
            }

            @keyframes qr-blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.3; }
            }

            .qr-placeholder {
                text-align: center;
                color: var(--text-secondary, #a0a0a0);
                padding: 40px 20px;
            }

            .qr-placeholder .placeholder-icon {
                font-size: 3rem;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            .qr-placeholder .placeholder-title {
                margin: 0 0 8px 0;
                color: var(--text-color, #ffffff);
                font-size: 1.1rem;
            }

            .qr-placeholder .placeholder-text {
                margin: 0;
                font-size: 0.9rem;
                line-height: 1.4;
            }

            .qr-scan-results {
                background: rgba(255, 122, 69, 0.05);
                border: 1px solid rgba(255, 122, 69, 0.2);
                border-radius: 12px;
                padding: 20px;
                margin-top: 20px;
                display: none;
            }

            .qr-scan-results.show {
                display: block;
                animation: qr-slide-in 0.3s ease;
            }

            @keyframes qr-slide-in {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .qr-scan-results h3 {
                color: #00ff00;
                margin-top: 0;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            @media (max-width: 768px) {
                .qr-scanner-header {
                    flex-direction: column;
                    align-items: stretch;
                }

                .qr-scanner-controls {
                    flex-direction: column;
                    align-items: stretch;
                }

                .qr-control-btn {
                    justify-content: center;
                }

                .qr-select {
                    min-width: auto;
                }

                .qr-video-container {
                    min-height: 250px;
                }
            }
        `;

        document.head.appendChild(styles);
    }



    /**
     * Load jsQR Library
     */
    loadJSQRLibrary() {
        if (window.jsQR) return Promise.resolve();

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
            script.onload = () => {
                console.log('✅ jsQR library loaded');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Failed to load jsQR library');
                reject(new Error('Failed to load jsQR library'));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Start QR Camera
     */
    async startQRCamera() {
        const status = document.getElementById('qr-status');
        const video = document.getElementById('qr-video');
        const canvas = document.getElementById('qr-canvas');
        const scanningIndicator = document.getElementById('qr-scanning-indicator');
        const placeholder = document.getElementById('qr-placeholder');
        const startBtn = document.getElementById('start-camera-btn');
        const stopBtn = document.getElementById('stop-camera-btn');

        try {
            status.innerHTML = '<div class="status-message">🔄 Starting camera...</div>';

            // Initialize elements
            this.qrVideo = video;
            this.qrCanvas = canvas;
            this.qrCtx = canvas.getContext('2d');

            // Request camera access
            this.qrStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            video.srcObject = this.qrStream;

            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                status.innerHTML = '<div class="status-message">✅ Camera started! Hold QR code in front of camera</div>';
                video.style.display = 'block';
                scanningIndicator.style.display = 'block';
                if (placeholder) placeholder.style.display = 'none';
                startBtn.style.display = 'none';
                stopBtn.style.display = 'inline-flex';

                // Start scanning
                this.qrScanning = true;
                this.scanForQRCode();
            };

        } catch (error) {
            console.error('Camera error:', error);
            let errorMessage = '❌ Camera error: ';

            if (error.name === 'NotAllowedError') {
                errorMessage += 'Camera permission denied. Please allow camera access.';
            } else if (error.name === 'NotFoundError') {
                errorMessage += 'No camera found. Make sure your device has a camera.';
            } else {
                errorMessage += error.message;
            }

            status.innerHTML = `<div class="status-message">${errorMessage}</div>`;
        }
    }

    /**
     * Stop QR Camera
     */
    stopQRCamera() {
        this.qrScanning = false;
        this.qrIsProcessing = false;

        if (this.qrStream) {
            this.qrStream.getTracks().forEach(track => track.stop());
            this.qrStream = null;
        }

        const video = document.getElementById('qr-video');
        const scanningIndicator = document.getElementById('qr-scanning-indicator');
        const placeholder = document.getElementById('qr-placeholder');
        const startBtn = document.getElementById('start-camera-btn');
        const stopBtn = document.getElementById('stop-camera-btn');
        const status = document.getElementById('qr-status');
        const results = document.getElementById('qr-scan-results');

        if (video) video.style.display = 'none';
        if (scanningIndicator) scanningIndicator.style.display = 'none';
        if (placeholder) placeholder.style.display = 'block';
        if (startBtn) startBtn.style.display = 'inline-flex';
        if (stopBtn) stopBtn.style.display = 'none';
        if (status) status.innerHTML = '<div class="status-message">📹 Camera stopped</div>';
        if (results) results.classList.remove('show');
    }

    /**
     * Update QR Cooldown
     */
    updateQRCooldown() {
        const cooldownSelect = document.getElementById('cooldown-setting');
        this.qrScanCooldown = parseInt(cooldownSelect.value);
        console.log('QR Cooldown updated to:', this.qrScanCooldown, 'ms');
    }

    /**
     * Scan for QR Code
     */
    scanForQRCode() {
        if (!this.qrScanning || !this.qrVideo || this.qrVideo.readyState !== this.qrVideo.HAVE_ENOUGH_DATA) {
            if (this.qrScanning) {
                setTimeout(() => this.scanForQRCode(), 100);
            }
            return;
        }

        // Skip if already processing
        if (this.qrIsProcessing) {
            if (this.qrScanning) {
                setTimeout(() => this.scanForQRCode(), 100);
            }
            return;
        }

        // Draw video frame to canvas
        this.qrCtx.drawImage(this.qrVideo, 0, 0, this.qrCanvas.width, this.qrCanvas.height);
        const imageData = this.qrCtx.getImageData(0, 0, this.qrCanvas.width, this.qrCanvas.height);

        // Scan for QR code
        if (window.jsQR) {
            const code = window.jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                this.handleQRCodeFound(code);
            }
        }

        // Continue scanning
        if (this.qrScanning) {
            setTimeout(() => this.scanForQRCode(), 100);
        }
    }

    /**
     * Handle QR Code Found
     */
    handleQRCodeFound(code) {
        const now = Date.now();

        // Check for duplicate
        if (this.qrLastScanned === code.data && (now - this.qrLastScanTime) < this.qrScanCooldown) {
            const remaining = Math.ceil((this.qrScanCooldown - (now - this.qrLastScanTime)) / 1000);
            console.log(`🚫 Duplicate blocked - ${remaining}s remaining`);
            return;
        }

        // Process the QR code
        this.qrIsProcessing = true;
        this.qrLastScanned = code.data;
        this.qrLastScanTime = now;

        console.log('QR Code found:', code.data);

        try {
            // Try to parse as JSON
            const qrData = JSON.parse(code.data);

            if (qrData.type === 'AGP_ATTENDANCE') {
                this.displayAttendanceQR(qrData);
            } else {
                this.displayGenericQR(code.data, qrData);
            }

        } catch (error) {
            // Not JSON, display as plain text
            this.displayTextQR(code.data);
        }

        // Play success sound
        this.playQRSuccessSound();

        // Release processing lock after delay
        setTimeout(() => {
            this.qrIsProcessing = false;
            console.log('🔓 QR Processing unlocked');
        }, 2000);
    }

    /**
     * Display Attendance QR
     */
    displayAttendanceQR(qrData) {
        const resultsDiv = document.getElementById('qr-scan-results');
        const status = document.getElementById('qr-status');

        const now = new Date();
        const validUntil = new Date(qrData.valid_until || qrData.validUntil);
        const isValid = validUntil > now;

        // Determine current time tracking status
        const isCurrentlyTimedIn = this.app.state.isTimedIn;
        const currentAction = isCurrentlyTimedIn ? 'TIME OUT' : 'TIME IN';
        const actionIcon = isCurrentlyTimedIn ? '🔴' : '🟢';
        const actionColor = isCurrentlyTimedIn ? '#ff4444' : '#00ff00';

        status.innerHTML = '<div class="status-message">🎉 AG&P Attendance QR Detected!</div>';

        resultsDiv.innerHTML = `
            <h3>🎯 AG&P ATTENDANCE QR CODE</h3>
            <p><strong>👤 Name:</strong> ${qrData.name}</p>
            <p><strong>🆔 Employee ID:</strong> ${qrData.userId}</p>
            <p><strong>📧 Email:</strong> ${qrData.email}</p>
            <p><strong>🏢 Department:</strong> ${qrData.department}</p>
            <p><strong>💼 Position:</strong> ${qrData.position}</p>
            <p><strong>✅ QR Status:</strong> <span style="color: ${isValid ? '#00ff00' : '#ff4444'}">${isValid ? 'VALID' : 'EXPIRED'}</span></p>

            <div style="margin: 15px 0; padding: 10px; background: rgba(255, 122, 69, 0.1); border-radius: 5px;">
                <p><strong>⏰ Current Status:</strong> <span style="color: ${actionColor}">${isCurrentlyTimedIn ? 'TIMED IN' : 'TIMED OUT'}</span></p>
                <p><strong>🎯 Next Action:</strong> <span style="color: ${actionColor}">${currentAction}</span></p>
            </div>

            <div style="margin-top: 20px;">
                <button class="qr-control-btn qr-control-btn--primary" onclick="dashboard.recordQRAttendance('${qrData.userId}', '${qrData.name}')" style="background: ${actionColor};">
                    ${actionIcon} ${currentAction}
                </button>
            </div>
        `;

        resultsDiv.classList.add('show');
    }

    /**
     * Display Generic QR
     */
    displayGenericQR(rawData, parsedData) {
        const resultsDiv = document.getElementById('qr-scan-results');
        const status = document.getElementById('qr-status');

        status.innerHTML = '<div class="status-message">✅ QR Code Detected!</div>';

        resultsDiv.innerHTML = `
            <h3>📱 QR CODE DETECTED</h3>
            <p><strong>Type:</strong> JSON Data</p>
            <details style="margin-top: 15px;">
                <summary>📋 QR Data</summary>
                <pre style="background: #111; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 12px;">${JSON.stringify(parsedData, null, 2)}</pre>
            </details>
        `;

        resultsDiv.classList.add('show');
    }

    /**
     * Display Text QR
     */
    displayTextQR(data) {
        const resultsDiv = document.getElementById('qr-scan-results');
        const status = document.getElementById('qr-status');

        status.innerHTML = '<div class="status-message">✅ QR Code Detected!</div>';

        resultsDiv.innerHTML = `
            <h3>📱 QR CODE DETECTED</h3>
            <p><strong>Type:</strong> Text/URL</p>
            <p><strong>Content:</strong></p>
            <div style="background: #111; padding: 15px; border-radius: 5px; word-break: break-all;">
                ${data}
            </div>
        `;

        resultsDiv.classList.add('show');
    }

    /**
     * Record QR Attendance
     */
    recordQRAttendance(userId, userName) {
        const now = new Date();
        const timeString = now.toLocaleString();

        // Determine action based on current state
        const isCurrentlyTimedIn = this.app.state.isTimedIn;
        const action = isCurrentlyTimedIn ? 'TIME OUT' : 'TIME IN';

        // Record attendance using the app's time tracking
        if (isCurrentlyTimedIn) {
            this.app.timeOut();
        } else {
            this.app.timeIn();
        }

        // Show success message with action
        const message = `✅ ${action} SUCCESSFUL!\n\nUser: ${userName}\nID: ${userId}\nTime: ${timeString}\nAction: ${action}`;

        // Update the QR results to show success
        const resultsDiv = document.getElementById('qr-scan-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <h3>✅ ${action} RECORDED</h3>
                <p><strong>👤 User:</strong> ${userName}</p>
                <p><strong>🆔 ID:</strong> ${userId}</p>
                <p><strong>⏰ Time:</strong> ${timeString}</p>
                <p><strong>🎯 Action:</strong> <span style="color: #00ff00">${action}</span></p>
                <div style="margin-top: 15px; padding: 10px; background: rgba(0, 255, 0, 0.1); border-radius: 5px;">
                    <strong>✅ Attendance successfully recorded!</strong>
                </div>
            `;
        }

        console.log('QR Attendance recorded:', {
            userId: userId,
            userName: userName,
            timestamp: now.toISOString(),
            action: action,
            type: 'qr_scan'
        });

        // Play success sound
        this.playQRSuccessSound();

        // Refresh dashboard to show updated stats after delay
        setTimeout(() => {
            this.refresh();

            // Clear results after showing success
            setTimeout(() => {
                const resultsDiv = document.getElementById('qr-scan-results');
                if (resultsDiv) {
                    resultsDiv.classList.remove('show');
                }
            }, 2000);
        }, 1000);
    }

    /**
     * Play QR Success Sound
     */
    playQRSuccessSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);

            console.log('🔊 QR Success sound played');

        } catch (error) {
            console.log('Could not play QR sound:', error);
        }
    }

    /**
     * Cleanup dashboard
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
    }
}

export default Dashboard;
