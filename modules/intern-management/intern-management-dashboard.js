/**
 * AG&P Intern Management Dashboard
 * Comprehensive intern attendance and management system for developers
 */

class InternManagementDashboard {
    constructor() {
        this.currentUser = null;
        this.selectedDepartment = 'ALL';
        this.selectedStatus = 'ALL';
        this.interns = [];
        this.attendanceData = [];
        this.activityData = [];
    }

    /**
     * Initialize intern management dashboard
     */
    init(user) {
        this.currentUser = user;
        this.loadData();
        this.render();
        this.attachEventListeners();
        this.refreshData();
    }

    /**
     * Load data from storage and generate sample data
     */
    loadData() {
        // Load existing data
        this.attendanceData = JSON.parse(localStorage.getItem('agp_attendance_attendanceRecords') || '[]');
        this.activityData = JSON.parse(localStorage.getItem('agp_attendance_activitiesData') || '[]');

        // Generate sample intern data if none exists
        this.interns = this.generateSampleInterns();
    }

    /**
     * Generate sample intern data for demonstration
     */
    generateSampleInterns() {
        return [
            {
                id: 'intern_001',
                name: 'John Mark Santos',
                email: 'johnmark@agp.com',
                department: 'IT Department',
                position: 'Software Development Intern',
                startDate: '2024-01-15',
                status: 'active',
                supervisor: 'Jane Smith',
                totalHours: 486,
                completedActivities: 12,
                pendingActivities: 3,
                avatar: 'imgs/default-avatar.png',
                lastActivity: '2024-01-20'
            },
            {
                id: 'intern_002',
                name: 'Maria Elena Cruz',
                email: 'maria@agp.com',
                department: 'HR Department',
                position: 'Human Resources Intern',
                startDate: '2024-01-10',
                status: 'active',
                supervisor: 'Robert Johnson',
                totalHours: 520,
                completedActivities: 15,
                pendingActivities: 2,
                avatar: 'imgs/default-avatar.png',
                lastActivity: '2024-01-20'
            },
            {
                id: 'intern_003',
                name: 'Carlos Miguel Reyes',
                email: 'carlos@agp.com',
                department: 'Engineering Department',
                position: 'Mechanical Engineering Intern',
                startDate: '2024-01-08',
                status: 'active',
                supervisor: 'Michael Brown',
                totalHours: 545,
                completedActivities: 18,
                pendingActivities: 1,
                avatar: 'imgs/default-avatar.png',
                lastActivity: '2024-01-19'
            },
            {
                id: 'intern_004',
                name: 'Ana Sofia Mendoza',
                email: 'ana@agp.com',
                department: 'Finance Department',
                position: 'Finance Intern',
                startDate: '2024-01-12',
                status: 'active',
                supervisor: 'Sarah Wilson',
                totalHours: 465,
                completedActivities: 10,
                pendingActivities: 4,
                avatar: 'imgs/default-avatar.png',
                lastActivity: '2024-01-20'
            },
            {
                id: 'intern_005',
                name: 'David James Torres',
                email: 'david@agp.com',
                department: 'IT Department',
                position: 'Network Administration Intern',
                startDate: '2024-01-20',
                status: 'pending',
                supervisor: 'Mark Anderson',
                totalHours: 0,
                completedActivities: 0,
                pendingActivities: 0,
                avatar: 'imgs/default-avatar.png',
                lastActivity: null
            }
        ];
    }

    /**
     * Render the intern management dashboard
     */
    render() {
        const container = document.getElementById('dashboard-section');
        if (!container) return;

        const dashboardHTML = `
            <div class="intern-management-dashboard">
                <!-- Welcome Card -->
                <div class="welcome-card">
                    <div class="welcome-content">
                        <div class="welcome-text">
                            <h2 class="welcome-title">Intern Management Dashboard</h2>
                            <p class="welcome-subtitle">
                                <span class="role-badge role-badge--developer">DEVELOPER</span>
                                <span class="position-text">${this.currentUser.position || 'System Administrator'}</span>
                                <span class="separator">•</span>
                                <span class="description-text">Monitor and manage intern attendance, activities, and performance</span>
                            </p>
                        </div>
                        <div class="welcome-stats">
                            <div class="quick-stat">
                                <span class="quick-stat-value">${this.getActiveInternsCount()}</span>
                                <span class="quick-stat-label">Active Interns</span>
                            </div>
                            <div class="quick-stat">
                                <span class="quick-stat-value">${this.getTodayAttendanceCount()}</span>
                                <span class="quick-stat-label">Present Today</span>
                            </div>
                            <div class="quick-stat">
                                <span class="quick-stat-value">${this.getPendingActivitiesCount()}</span>
                                <span class="quick-stat-label">Pending Tasks</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Management Controls -->
                <div class="management-controls">
                    <div class="control-filters">
                        <div class="filter-group">
                            <label for="department-filter">Department:</label>
                            <select id="department-filter">
                                <option value="ALL">All Departments</option>
                                <option value="IT Department">IT Department</option>
                                <option value="HR Department">HR Department</option>
                                <option value="Engineering Department">Engineering Department</option>
                                <option value="Finance Department">Finance Department</option>
                            </select>
                        </div>
                        <div class="filter-group">
                            <label for="status-filter">Status:</label>
                            <select id="status-filter">
                                <option value="ALL">All Status</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div class="control-actions">
                        <button class="action-btn secondary" id="export-intern-data">
                            <i class="fas fa-download"></i>
                            Export Data
                        </button>
                        <button class="action-btn primary" id="add-intern-btn">
                            <i class="fas fa-user-plus"></i>
                            Add Intern
                        </button>
                    </div>
                </div>

                <!-- Statistics Overview -->
                <div class="stats-grid">
                    ${this.renderStatCards()}
                </div>

                <!-- Intern Management Tabs -->
                <div class="management-tabs">
                    <div class="tab-navigation">
                        <button class="tab-btn active" data-tab="overview">Overview</button>
                        <button class="tab-btn" data-tab="attendance">Attendance</button>
                        <button class="tab-btn" data-tab="activities">Activities</button>
                        <button class="tab-btn" data-tab="performance">Performance</button>
                    </div>

                    <div class="tab-content active" id="overview-tab">
                        ${this.renderOverviewTab()}
                    </div>

                    <div class="tab-content" id="attendance-tab">
                        ${this.renderAttendanceTab()}
                    </div>

                    <div class="tab-content" id="activities-tab">
                        ${this.renderActivitiesTab()}
                    </div>

                    <div class="tab-content" id="performance-tab">
                        ${this.renderPerformanceTab()}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = dashboardHTML;
    }

    /**
     * Render statistics cards
     */
    renderStatCards() {
        const totalInterns = this.interns.length;
        const activeInterns = this.interns.filter(i => i.status === 'active').length;
        const totalHours = this.interns.reduce((sum, intern) => sum + intern.totalHours, 0);
        const avgHoursPerIntern = totalInterns > 0 ? (totalHours / activeInterns) : 0;

        return `
            <div class="stat-card stat-card--monthly">
                <div class="stat-content">
                    <div class="stat-header">
                        <div class="stat-icon stat-icon--monthly">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <h3 class="stat-title">Total Interns</h3>
                            <p class="stat-subtitle">All registered interns</p>
                        </div>
                    </div>
                    <div class="stat-footer">
                        <div class="stat-value">${totalInterns}</div>
                        <div class="stat-trend stat-trend--positive">
                            <i class="fas fa-arrow-up"></i>
                            +2 this month
                        </div>
                    </div>
                </div>
            </div>

            <div class="stat-card stat-card--weekly">
                <div class="stat-content">
                    <div class="stat-header">
                        <div class="stat-icon stat-icon--weekly">
                            <i class="fas fa-user-check"></i>
                        </div>
                        <div class="stat-info">
                            <h3 class="stat-title">Active Interns</h3>
                            <p class="stat-subtitle">Currently active</p>
                        </div>
                    </div>
                    <div class="stat-footer">
                        <div class="stat-value">${activeInterns}</div>
                        <div class="stat-trend stat-trend--positive">
                            <i class="fas fa-arrow-up"></i>
                            ${((activeInterns/totalInterns)*100).toFixed(0)}% active
                        </div>
                    </div>
                </div>
            </div>

            <div class="stat-card stat-card--daily">
                <div class="stat-content">
                    <div class="stat-header">
                        <div class="stat-icon stat-icon--daily">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <h3 class="stat-title">Total Hours</h3>
                            <p class="stat-subtitle">All intern hours</p>
                        </div>
                    </div>
                    <div class="stat-footer">
                        <div class="stat-value">${totalHours.toFixed(0)}</div>
                        <div class="stat-trend stat-trend--neutral">
                            <i class="fas fa-minus"></i>
                            ${avgHoursPerIntern.toFixed(0)} avg/intern
                        </div>
                    </div>
                </div>
            </div>

            <div class="stat-card stat-card--progress">
                <div class="stat-content">
                    <div class="progress-header">
                        <div class="stat-info">
                            <h3 class="stat-title">Department Distribution</h3>
                            <p class="stat-subtitle">Interns across departments</p>
                        </div>
                    </div>
                    <div class="progress-container">
                        ${this.renderDepartmentProgress()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render department progress bars
     */
    renderDepartmentProgress() {
        const departments = {};
        this.interns.forEach(intern => {
            departments[intern.department] = (departments[intern.department] || 0) + 1;
        });

        const total = this.interns.length;
        return Object.entries(departments).map(([dept, count]) => {
            const percentage = total > 0 ? (count / total * 100) : 0;
            return `
                <div class="progress-info">
                    <div class="progress-label">${dept}</div>
                    <div class="progress-percentage">${count}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            `;
        }).join('');
    }

    /**
     * Render overview tab content
     */
    renderOverviewTab() {
        const filteredInterns = this.getFilteredInterns();

        return `
            <div class="overview-content">
                <div class="section-header">
                    <h3 class="section-title">Intern Overview</h3>
                    <p class="section-subtitle">Comprehensive view of all interns and their current status</p>
                </div>

                <div class="intern-grid">
                    ${filteredInterns.map(intern => this.renderInternCard(intern)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render individual intern card
     */
    renderInternCard(intern) {
        const statusClass = intern.status === 'active' ? 'status-success' :
                           intern.status === 'pending' ? 'status-warning' : 'status-error';

        return `
            <div class="intern-card" data-intern-id="${intern.id}">
                <div class="intern-header">
                    <div class="intern-avatar">
                        <img src="${intern.avatar}" alt="${intern.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <div class="avatar-fallback" style="display: none;">
                            ${intern.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                    </div>
                    <div class="intern-info">
                        <h4 class="intern-name">${intern.name}</h4>
                        <p class="intern-position">${intern.position}</p>
                        <span class="status-badge ${statusClass}">${intern.status.toUpperCase()}</span>
                    </div>
                </div>

                <div class="intern-stats">
                    <div class="stat-item">
                        <span class="stat-label">Department</span>
                        <span class="stat-value">${intern.department}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Hours</span>
                        <span class="stat-value">${intern.totalHours}h</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Completed Tasks</span>
                        <span class="stat-value">${intern.completedActivities}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Supervisor</span>
                        <span class="stat-value">${intern.supervisor}</span>
                    </div>
                </div>

                <div class="intern-actions">
                    <button class="action-btn small secondary" onclick="internManagementDashboard.viewInternDetails('${intern.id}')">
                        <i class="fas fa-eye"></i>
                        View Details
                    </button>
                    <button class="action-btn small primary" onclick="internManagementDashboard.manageIntern('${intern.id}')">
                        <i class="fas fa-cog"></i>
                        Manage
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render attendance tab content
     */
    renderAttendanceTab() {
        return `
            <div class="attendance-content">
                <div class="section-header">
                    <h3 class="section-title">Attendance Management</h3>
                    <p class="section-subtitle">Monitor daily attendance and time tracking for all interns</p>
                </div>

                <div class="attendance-controls">
                    <div class="date-selector">
                        <label for="attendance-date">Date:</label>
                        <input type="date" id="attendance-date" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <button class="action-btn secondary" id="refresh-attendance">
                        <i class="fas fa-sync-alt"></i>
                        Refresh
                    </button>
                </div>

                <div class="attendance-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Intern</th>
                                <th>Department</th>
                                <th>Time In</th>
                                <th>Time Out</th>
                                <th>Hours</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderAttendanceRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Render attendance table rows
     */
    renderAttendanceRows() {
        return this.interns.filter(intern => intern.status === 'active').map(intern => {
            const todayAttendance = this.getTodayAttendanceForIntern(intern.id);

            return `
                <tr>
                    <td>
                        <div class="intern-cell">
                            <div class="intern-avatar-small">
                                ${intern.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <span>${intern.name}</span>
                        </div>
                    </td>
                    <td>${intern.department}</td>
                    <td>${todayAttendance.timeIn || '-'}</td>
                    <td>${todayAttendance.timeOut || '-'}</td>
                    <td>${todayAttendance.hours || '0.0'}h</td>
                    <td>
                        <span class="status-badge ${todayAttendance.status === 'Present' ? 'status-success' : 'status-error'}">
                            ${todayAttendance.status || 'Absent'}
                        </span>
                    </td>
                    <td>
                        <button class="action-btn small secondary" onclick="internManagementDashboard.editAttendance('${intern.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Render activities tab content
     */
    renderActivitiesTab() {
        return `
            <div class="activities-content">
                <div class="section-header">
                    <h3 class="section-title">Activity Management</h3>
                    <p class="section-subtitle">Track and manage intern activities and task assignments</p>
                </div>

                <div class="activities-controls">
                    <div class="filter-group">
                        <label for="activity-status">Status:</label>
                        <select id="activity-status">
                            <option value="ALL">All Activities</option>
                            <option value="completed">Completed</option>
                            <option value="in-progress">In Progress</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                    <button class="action-btn primary" id="assign-activity">
                        <i class="fas fa-plus"></i>
                        Assign Activity
                    </button>
                </div>

                <div class="activities-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Activity</th>
                                <th>Assigned To</th>
                                <th>Department</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderActivityRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Render activity table rows
     */
    renderActivityRows() {
        return this.activityData.slice(0, 10).map(activity => {
            const intern = this.interns.find(i => i.id === activity.userId) || { name: 'Unknown', department: 'Unknown' };

            return `
                <tr>
                    <td>
                        <div class="activity-cell">
                            <strong>${activity.title}</strong>
                            <small>${activity.description ? activity.description.substring(0, 50) + '...' : ''}</small>
                        </div>
                    </td>
                    <td>${intern.name}</td>
                    <td>${intern.department}</td>
                    <td>${new Date(activity.date).toLocaleDateString()}</td>
                    <td>
                        <span class="status-badge ${activity.status === 'completed' ? 'status-success' : 'status-warning'}">
                            ${activity.status}
                        </span>
                    </td>
                    <td>
                        <button class="action-btn small secondary" onclick="internManagementDashboard.editActivity('${activity.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Render performance tab content
     */
    renderPerformanceTab() {
        return `
            <div class="performance-content">
                <div class="section-header">
                    <h3 class="section-title">Performance Analytics</h3>
                    <p class="section-subtitle">Analyze intern performance and productivity metrics</p>
                </div>

                <div class="performance-grid">
                    <div class="performance-card">
                        <h4>Top Performers</h4>
                        <div class="performer-list">
                            ${this.renderTopPerformers()}
                        </div>
                    </div>

                    <div class="performance-card">
                        <h4>Department Performance</h4>
                        <div class="department-performance">
                            ${this.renderDepartmentPerformance()}
                        </div>
                    </div>

                    <div class="performance-card">
                        <h4>Recent Activities</h4>
                        <div class="recent-activities">
                            ${this.renderRecentActivities()}
                        </div>
                    </div>

                    <div class="performance-card">
                        <h4>Attendance Summary</h4>
                        <div class="attendance-summary">
                            ${this.renderAttendanceSummary()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Helper methods for data calculation
     */
    getActiveInternsCount() {
        return this.interns.filter(intern => intern.status === 'active').length;
    }

    getTodayAttendanceCount() {
        // Simulate present count (in real app, would check actual attendance)
        return Math.floor(this.getActiveInternsCount() * 0.85);
    }

    getPendingActivitiesCount() {
        return this.interns.reduce((sum, intern) => sum + intern.pendingActivities, 0);
    }

    getFilteredInterns() {
        let filtered = this.interns;

        if (this.selectedDepartment !== 'ALL') {
            filtered = filtered.filter(intern => intern.department === this.selectedDepartment);
        }

        if (this.selectedStatus !== 'ALL') {
            filtered = filtered.filter(intern => intern.status === this.selectedStatus);
        }

        return filtered;
    }

    getTodayAttendanceForIntern(internId) {
        // Simulate attendance data (in real app, would fetch from database)
        const isPresent = Math.random() > 0.2; // 80% chance of being present

        if (isPresent) {
            const timeIn = `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
            const timeOut = Math.random() > 0.3 ? `${17 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : null;
            const hours = timeOut ? (Math.random() * 2 + 7).toFixed(1) : (new Date().getHours() - 8).toFixed(1);

            return {
                timeIn,
                timeOut,
                hours,
                status: 'Present'
            };
        }

        return {
            timeIn: null,
            timeOut: null,
            hours: '0.0',
            status: 'Absent'
        };
    }

    renderTopPerformers() {
        const sortedInterns = [...this.interns]
            .filter(intern => intern.status === 'active')
            .sort((a, b) => (b.completedActivities + b.totalHours/10) - (a.completedActivities + a.totalHours/10))
            .slice(0, 5);

        return sortedInterns.map((intern, index) => `
            <div class="performer-item">
                <div class="performer-rank">#${index + 1}</div>
                <div class="performer-info">
                    <strong>${intern.name}</strong>
                    <small>${intern.department}</small>
                </div>
                <div class="performer-score">${intern.completedActivities} tasks</div>
            </div>
        `).join('');
    }

    renderDepartmentPerformance() {
        const departments = {};
        this.interns.forEach(intern => {
            if (!departments[intern.department]) {
                departments[intern.department] = { count: 0, totalHours: 0, totalActivities: 0 };
            }
            departments[intern.department].count++;
            departments[intern.department].totalHours += intern.totalHours;
            departments[intern.department].totalActivities += intern.completedActivities;
        });

        return Object.entries(departments).map(([dept, data]) => `
            <div class="dept-performance-item">
                <div class="dept-name">${dept}</div>
                <div class="dept-stats">
                    <span>${data.count} interns</span>
                    <span>${data.totalHours}h total</span>
                    <span>${data.totalActivities} tasks</span>
                </div>
            </div>
        `).join('');
    }

    renderRecentActivities() {
        return this.activityData.slice(0, 5).map(activity => {
            const intern = this.interns.find(i => i.id === activity.userId) || { name: 'Unknown' };
            return `
                <div class="recent-activity-item">
                    <div class="activity-info">
                        <strong>${activity.title}</strong>
                        <small>by ${intern.name}</small>
                    </div>
                    <div class="activity-status">
                        <span class="status-badge ${activity.status === 'completed' ? 'status-success' : 'status-warning'}">
                            ${activity.status}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderAttendanceSummary() {
        const activeInterns = this.getActiveInternsCount();
        const presentToday = this.getTodayAttendanceCount();
        const attendanceRate = activeInterns > 0 ? (presentToday / activeInterns * 100).toFixed(1) : 0;

        return `
            <div class="attendance-summary-stats">
                <div class="summary-stat">
                    <span class="summary-label">Present Today</span>
                    <span class="summary-value">${presentToday}/${activeInterns}</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-label">Attendance Rate</span>
                    <span class="summary-value">${attendanceRate}%</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-label">On Time</span>
                    <span class="summary-value">${Math.floor(presentToday * 0.9)}</span>
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Filter change handlers
        const departmentFilter = document.getElementById('department-filter');
        const statusFilter = document.getElementById('status-filter');

        if (departmentFilter) {
            departmentFilter.addEventListener('change', (e) => {
                this.selectedDepartment = e.target.value;
                this.refreshOverview();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.selectedStatus = e.target.value;
                this.refreshOverview();
            });
        }

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Action buttons
        const addInternBtn = document.getElementById('add-intern-btn');
        if (addInternBtn) {
            addInternBtn.addEventListener('click', () => this.addIntern());
        }

        const exportBtn = document.getElementById('export-intern-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
    }

    /**
     * Switch between tabs
     */
    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    /**
     * Refresh data and update display
     */
    refreshData() {
        this.loadData();
        // Update stats in real-time
        setTimeout(() => this.refreshData(), 30000); // Refresh every 30 seconds
    }

    refreshOverview() {
        const overviewTab = document.getElementById('overview-tab');
        if (overviewTab) {
            overviewTab.innerHTML = this.renderOverviewTab();
        }
    }

    /**
     * Action methods (placeholders for future implementation)
     */
    viewInternDetails(internId) {
        console.log('Viewing details for intern:', internId);
        alert(`Viewing details for intern: ${internId}\n\nThis feature will be implemented in the next phase.`);
    }

    manageIntern(internId) {
        console.log('Managing intern:', internId);
        alert(`Managing intern: ${internId}\n\nThis feature will be implemented in the next phase.`);
    }

    editAttendance(internId) {
        console.log('Editing attendance for intern:', internId);
        alert(`Editing attendance for intern: ${internId}\n\nThis feature will be implemented in the next phase.`);
    }

    editActivity(activityId) {
        console.log('Editing activity:', activityId);
        alert(`Editing activity: ${activityId}\n\nThis feature will be implemented in the next phase.`);
    }

    addIntern() {
        console.log('Adding new intern');
        alert('Add Intern feature will be implemented in the next phase.');
    }

    exportData() {
        console.log('Exporting intern data');
        alert('Export Data feature will be implemented in the next phase.');
    }
}

// Create global instance
window.internManagementDashboard = new InternManagementDashboard();

// Debug log to confirm script loaded
console.log('Intern Management Dashboard script loaded successfully');
console.log('internManagementDashboard instance created:', window.internManagementDashboard);