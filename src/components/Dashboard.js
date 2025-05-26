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
            <!-- Welcome Card - Moved to Top -->
            <div class="welcome-card">
                <div class="welcome-content">
                    <div class="welcome-text">
                        <h2 id="welcome-message">Welcome back, ${userName}!</h2>
                        <p id="welcome-subtext">
                            <span class="role-badge" style="background-color: var(--primary-color); color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-right: 8px;">
                                ${userRole.toUpperCase()}
                            </span>
                            ${userPosition} • Track your attendance and monitor your progress.
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
                    <h1>
                        <i class="fas fa-home"></i>
                        Dashboard
                    </h1>
                </div>
                <div class="header-center">
                    <div class="live-time-display">
                        <div class="current-time" id="live-time">--:--</div>
                        <div class="current-date" id="live-date">Loading...</div>
                    </div>
                </div>
                <div class="actions">
                    <button class="action-btn primary" id="barcode-scan-btn">
                        <i class="fas fa-barcode"></i>
                        <span>Scan Attendance</span>
                    </button>
                    <button class="action-btn secondary" id="quick-time-btn">
                        <i class="fas fa-clock"></i>
                        <span>Quick Time</span>
                    </button>
                </div>
            </div>



            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-left">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Total Hours</h3>
                            <div class="stat-subtitle">This month</div>
                        </div>
                    </div>
                    <div class="stat-right">
                        <div class="stat-trend" id="total-trend">
                            <i class="fas fa-arrow-up"></i>
                            <span>+2.5h</span>
                        </div>
                        <div class="stat-value" id="total-hours">0.0</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-left">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-week"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Weekly Hours</h3>
                            <div class="stat-subtitle">This week</div>
                        </div>
                    </div>
                    <div class="stat-right">
                        <div class="stat-trend" id="weekly-trend">
                            <i class="fas fa-arrow-up"></i>
                            <span>+5.0h</span>
                        </div>
                        <div class="stat-value" id="weekly-hours">0.0</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-left">
                        <div class="stat-icon">
                            <i class="fas fa-calendar-day"></i>
                        </div>
                        <div class="stat-info">
                            <h3>Today's Hours</h3>
                            <div class="stat-subtitle" id="today-status">Ready to start</div>
                        </div>
                    </div>
                    <div class="stat-right">
                        <div class="stat-trend" id="daily-trend">
                            <i class="fas fa-clock"></i>
                            <span id="time-status">Not started</span>
                        </div>
                        <div class="stat-value" id="daily-hours">0.0</div>
                    </div>
                </div>

                <div class="stat-card wide">
                    <div class="stat-content">
                        <h3>Weekly Progress</h3>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" id="weekly-progress-bar" style="width: 0%"></div>
                            </div>
                            <div class="progress-info">
                                <span class="progress-label" id="progress-label">0 / 40 hours</span>
                                <span class="progress-percentage" id="progress-percentage">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="charts-section">
                <div class="chart-card">
                    <div class="chart-header">
                        <h3>Weekly Hours Trend</h3>
                        <div class="chart-controls">
                            <button class="chart-btn active" data-period="week">Week</button>
                            <button class="chart-btn" data-period="month">Month</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="weekly-chart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="activity-section">
                <div class="activity-header">
                    <h3>Recent Activity</h3>
                    <button class="view-all-btn" id="view-all-activity">
                        <span>View All</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                <div class="activity-list" id="recent-activity">
                    <div class="activity-placeholder">
                        <i class="fas fa-clock"></i>
                        <p>No recent activity. Start tracking your attendance!</p>
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
                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
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
     * Refresh dashboard data
     */
    refresh() {
        this.loadData();
        this.updateStats();
        this.renderCharts();
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
