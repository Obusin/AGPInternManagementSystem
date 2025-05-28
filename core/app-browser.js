/**
 * AG&P Attendance System - Browser Compatible Version
 * All functionality in a single file for direct browser execution
 */

// Date Utilities
const DateUtils = {
    formatDate(date, format = 'short') {
        if (!date) return '';

        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) return 'Invalid Date';

        const options = {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
            time: { hour: '2-digit', minute: '2-digit', hour12: true },
            datetime: {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }
        };

        return dateObj.toLocaleDateString('en-US', options[format] || options.short);
    },

    formatTime(time, includeSeconds = false) {
        if (!time) return '';

        const timeObj = typeof time === 'string' ? new Date(time) : time;

        if (isNaN(timeObj.getTime())) return 'Invalid Time';

        const options = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        if (includeSeconds) {
            options.second = '2-digit';
        }

        return timeObj.toLocaleTimeString('en-US', options);
    },

    getCurrentDateISO() {
        return new Date().toISOString().split('T')[0];
    },

    formatDateISO(date) {
        if (!date) return '';

        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) return '';

        return dateObj.toISOString().split('T')[0];
    },

    getWeekRange(date = new Date()) {
        const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
        const day = dateObj.getDay();
        const start = new Date(dateObj);
        start.setDate(dateObj.getDate() - day);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        return { start, end };
    },

    getMonthRange(date = new Date()) {
        const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
        const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
        const end = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0, 23, 59, 59, 999);

        return { start, end };
    },

    calculateDuration(startTime, endTime) {
        if (!startTime || !endTime) return { hours: 0, minutes: 0, totalHours: 0 };

        const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
        const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

        const diffMs = end.getTime() - start.getTime();
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const totalHours = parseFloat((totalMinutes / 60).toFixed(2));

        return { hours, minutes, totalHours };
    },

    formatDuration(totalHours) {
        if (!totalHours || totalHours === 0) return '0h 0m';

        const hours = Math.floor(totalHours);
        const minutes = Math.round((totalHours - hours) * 60);

        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours}h`;

        return `${hours}h ${minutes}m`;
    }
};

// Formatters
const Formatters = {
    formatNumber(value, decimals = 1) {
        if (value === null || value === undefined || isNaN(value)) return '0.0';
        return parseFloat(value).toFixed(decimals);
    },

    formatHours(hours) {
        return this.formatNumber(hours, 1);
    },

    formatPercentage(value, total = 100) {
        if (!value || !total) return '0%';
        const percentage = (value / total) * 100;
        return `${Math.round(percentage)}%`;
    },

    escapeHtml(text) {
        if (!text) return '';

        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    formatStatus(status) {
        const statusMap = {
            'active': { class: 'status-success', text: 'Active' },
            'inactive': { class: 'status-muted', text: 'Inactive' },
            'pending': { class: 'status-warning', text: 'Pending' },
            'completed': { class: 'status-success', text: 'Completed' },
            'in-progress': { class: 'status-warning', text: 'In Progress' },
            'cancelled': { class: 'status-error', text: 'Cancelled' }
        };

        return statusMap[status?.toLowerCase()] || { class: 'status-muted', text: status || 'Unknown' };
    }
};

// Storage Service
const StorageService = {
    prefix: 'agp_attendance_',

    setItem(key, value) {
        try {
            const fullKey = this.prefix + key;
            const data = {
                value,
                timestamp: Date.now()
            };
            localStorage.setItem(fullKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to store data:', error);
        }
    },

    getItem(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const stored = localStorage.getItem(fullKey);

            if (!stored) return defaultValue;

            const data = JSON.parse(stored);
            return data.value !== undefined ? data.value : data;
        } catch (error) {
            console.error('Failed to retrieve data:', error);
            return defaultValue;
        }
    },

    removeItem(key) {
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
        } catch (error) {
            console.error('Failed to remove data:', error);
        }
    }
};

// Main Application Class
class AttendanceApp {
    constructor() {
        this.version = '2.0.0';
        this.initialized = false;

        // Application state
        this.state = {
            currentView: 'dashboard',
            isTimedIn: false,
            currentTimeIn: null,
            user: {
                id: 'user_001',
                name: 'John Doe',
                position: 'Software Development Intern',
                department: 'IT Department',
                email: 'john.doe@agp.com',
                role: 'user', // user or developer
                permissions: {}, // Will be set in init()
                isAdmin: false // Legacy support
            }
        };

        // Role definitions (simplified to developer and user)
        this.roles = {
            developer: {
                name: 'Developer',
                level: 2,
                color: '#9b59b6',
                icon: 'fas fa-code',
                description: 'Full system access with development tools'
            },
            user: {
                name: 'User',
                level: 1,
                color: '#3498db',
                icon: 'fas fa-user',
                description: 'Attendance tracking and activity logging'
            }
        };

        // Data
        this.attendanceRecords = [];
        this.activities = [];
        this.charts = {};

        // Intervals
        this.intervals = {
            time: null,
            save: null
        };
    }

    /**
     * Get default permissions for a role
     */
    getDefaultPermissions(role) {
        const permissions = {
            // Dashboard permissions
            viewDashboard: false,
            viewOwnStats: false,
            viewAllStats: false,

            // Time tracking permissions
            timeTracking: false,
            editOwnTime: false,
            editAllTime: false,
            deleteTimeRecords: false,

            // Activity permissions
            createActivity: false,
            editOwnActivity: false,
            editAllActivity: false,
            deleteOwnActivity: false,
            deleteAllActivity: false,
            viewOwnActivity: false,
            viewAllActivity: false,

            // User management permissions
            viewUsers: false,
            createUsers: false,
            editUsers: false,
            deleteUsers: false,
            changeUserRoles: false,

            // System permissions
            viewSystemLogs: false,
            editSystemSettings: false,
            exportData: false,
            importData: false,

            // Developer permissions
            viewDebugInfo: false,
            accessDevTools: false,
            viewSourceCode: false,
            modifySystem: false,

            // Reports permissions
            viewReports: false,
            createReports: false,
            exportReports: false,
            scheduleReports: false
        };

        switch (role) {
            case 'developer':
                // Developers get all permissions
                Object.keys(permissions).forEach(key => permissions[key] = true);
                break;

            case 'user':
                permissions.viewDashboard = true;
                permissions.viewOwnStats = true;
                permissions.timeTracking = true;
                permissions.editOwnTime = true;
                permissions.createActivity = true;
                permissions.editOwnActivity = true;
                permissions.deleteOwnActivity = true;
                permissions.viewOwnActivity = true;
                break;
        }

        return permissions;
    }

    /**
     * Check if user has permission
     */
    hasPermission(permission) {
        return this.state.user.permissions && this.state.user.permissions[permission] === true;
    }

    /**
     * Check if user has role level or higher
     */
    hasRoleLevel(requiredLevel) {
        const userRole = this.roles[this.state.user.role];
        return userRole && userRole.level >= requiredLevel;
    }

    async init() {
        if (this.initialized) {
            console.log('Application already initialized');
            return Promise.resolve();
        }

        console.log(`Initializing Attendance App v${this.version}...`);

        try {
            // Initialize user permissions first
            if (!this.state.user.permissions || Object.keys(this.state.user.permissions).length === 0) {
                this.state.user.permissions = this.getDefaultPermissions(this.state.user.role);
            }

            // Load application state
            this.loadApplicationState();

            // Load data
            this.loadData();

            // Setup event listeners
            this.setupEventListeners();

            // Setup intervals
            this.setupIntervals();

            // Initialize UI
            this.initializeUI();

            // Set initial view
            this.changeView('dashboard');

            // Mark as initialized
            this.initialized = true;

            console.log('Application initialization complete');

            // Show welcome notification
            this.showNotification('Welcome to AG&P Attendance System!', 'success');

            // Add sample data if needed
            this.addSampleDataIfNeeded();

            return Promise.resolve();

        } catch (error) {
            console.error('Application initialization failed:', error);
            // Only show error notification if initialization actually failed
            if (!this.initialized) {
                this.showNotification('Failed to initialize application', 'error');
            }
            return Promise.reject(error);
        }
    }

    loadApplicationState() {
        try {
            // Load user data
            const userData = StorageService.getItem('userData');
            if (userData) {
                this.state.user = { ...this.state.user, ...userData };
            }

            // Load admin state
            const adminState = StorageService.getItem('adminState');
            if (adminState !== null) {
                this.state.user.isAdmin = adminState;
            }

            // Load time tracking state
            this.state.isTimedIn = StorageService.getItem('isTimedIn', false);
            this.state.currentTimeIn = StorageService.getItem('currentTimeIn');

            // Load current view
            this.state.currentView = StorageService.getItem('currentView', 'dashboard');

        } catch (error) {
            console.error('Failed to load application state:', error);
        }
    }

    saveApplicationState() {
        try {
            // Save user data
            const userDataToSave = { ...this.state.user };
            delete userDataToSave.isAdmin;
            StorageService.setItem('userData', userDataToSave);

            // Save admin state separately
            StorageService.setItem('adminState', this.state.user.isAdmin);

            // Save time tracking state
            StorageService.setItem('isTimedIn', this.state.isTimedIn);
            StorageService.setItem('currentTimeIn', this.state.currentTimeIn);

            // Save current view
            StorageService.setItem('currentView', this.state.currentView);

        } catch (error) {
            console.error('Failed to save application state:', error);
        }
    }

    loadData() {
        this.attendanceRecords = StorageService.getItem('attendanceRecords', []);
        this.activities = StorageService.getItem('activitiesData', []);
    }

    saveData() {
        StorageService.setItem('attendanceRecords', this.attendanceRecords);
        StorageService.setItem('activitiesData', this.activities);
    }

    /**
     * Add sample data for testing if none exists
     */
    addSampleDataIfNeeded() {
        // Add sample attendance records if none exist
        if (this.attendanceRecords.length === 0) {
            const sampleAttendance = [];
            const today = new Date();

            // Generate last 14 days of attendance
            for (let i = 13; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);

                // Skip weekends
                if (date.getDay() === 0 || date.getDay() === 6) continue;

                const dateStr = date.toISOString().split('T')[0];
                const timeIn = `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
                const timeOut = `${17 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;

                // Calculate hours
                const inTime = new Date(`${dateStr}T${timeIn}:00`);
                const outTime = new Date(`${dateStr}T${timeOut}:00`);
                const totalHours = (outTime - inTime) / (1000 * 60 * 60);

                sampleAttendance.push({
                    id: `att_${Date.now()}_${i}`,
                    date: dateStr,
                    timeIn: timeIn,
                    timeOut: timeOut,
                    totalHours: totalHours,
                    status: 'Present',
                    userId: 'current-user',
                    timestamp: date.toISOString()
                });
            }

            this.attendanceRecords = sampleAttendance;
            this.saveData();
            console.log('Sample attendance records added for testing');
        }

        // Add sample activities if none exist
        if (this.activities.length === 0) {
            const sampleActivities = [
                {
                    id: 'sample-1',
                    title: 'Database Design and Implementation',
                    description: 'Designed and implemented a new database schema for the attendance tracking system. Created tables for users, attendance records, and activity logs.',
                    date: DateUtils.getCurrentDateISO(),
                    status: 'completed',
                    assignedBy: 'John Smith',
                    tags: ['database', 'mysql', 'design'],
                    timestamp: new Date().toISOString(),
                    userId: 'current-user',
                    userName: 'Test User'
                },
                {
                    id: 'sample-2',
                    title: 'Frontend Development',
                    description: 'Developed responsive user interface components using HTML, CSS, and JavaScript. Implemented dark theme and mobile-friendly design.',
                    date: DateUtils.getCurrentDateISO(),
                    status: 'in-progress',
                    assignedBy: 'Jane Doe',
                    tags: ['frontend', 'html', 'css', 'javascript'],
                    timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                    userId: 'current-user',
                    userName: 'Test User'
                },
                {
                    id: 'sample-3',
                    title: 'API Integration',
                    description: 'Integrated third-party APIs for barcode scanning and document generation. Implemented error handling and data validation.',
                    date: DateUtils.getCurrentDateISO(),
                    status: 'completed',
                    assignedBy: 'Mike Johnson',
                    tags: ['api', 'integration', 'barcode'],
                    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                    userId: 'current-user',
                    userName: 'Test User'
                }
            ];

            this.activities = sampleActivities;
            this.saveData();
            console.log('Sample activities added for testing');
        }
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('nav-dashboard')?.addEventListener('click', () => this.changeView('dashboard'));
        document.getElementById('nav-activity')?.addEventListener('click', () => this.changeView('activity'));
        document.getElementById('nav-profile')?.addEventListener('click', () => this.changeView('profile'));
        document.getElementById('nav-admin')?.addEventListener('click', () => this.changeView('admin'));
        document.getElementById('nav-reports')?.addEventListener('click', () => this.changeView('reports'));

        // Admin mode toggle
        const adminToggleBtn = document.getElementById('admin-mode-toggle');
        if (adminToggleBtn) {
            adminToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAdminMode();
            });
        }

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.style.display = 'none';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case '1': this.changeView('dashboard'); break;
                case '2': this.changeView('activity'); break;
                case '3': this.changeView('profile'); break;
                case '4': this.changeView('reports'); break;
                case 'a': case 'A': this.toggleAdminMode(); break;
                case 'b': case 'B': this.simulateBarcodeScanner(); break;
                case 'Escape': this.closeAllModals(); break;
            }

            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveApplicationState();
                this.showNotification('Data saved successfully', 'success');
            }
        });
    }

    setupIntervals() {
        // Update time every minute
        if (!this.intervals.time) {
            this.intervals.time = setInterval(() => {
                this.updateDateTime();
                this.updateWorkStatus();
            }, 60000);
        }

        // Auto-save every 30 seconds
        if (!this.intervals.save) {
            this.intervals.save = setInterval(() => {
                this.saveApplicationState();
            }, 30000);
        }

        // Initial updates
        this.updateDateTime();
        this.updateWorkStatus();
    }

    initializeUI() {
        try {
            this.initializeAdminMode();
            this.renderDashboard();
            this.renderActivitySection();
        } catch (error) {
            console.error('Error during UI initialization:', error);
            // Don't throw error, just log it - UI can be initialized later
        }
    }

    initializeAdminMode() {
        this.initializeRoleSystem();
    }

    /**
     * Initialize role-based system
     */
    initializeRoleSystem() {
        const roleToggle = document.getElementById('admin-mode-toggle');
        const adminNavItem = document.getElementById('nav-admin');

        // Update role toggle button
        if (roleToggle) {
            const currentRole = this.roles[this.state.user.role];
            roleToggle.innerHTML = `
                <i class="${currentRole.icon}"></i>
                <span>Role: ${currentRole.name}</span>
                <i class="fas fa-chevron-down"></i>
            `;

            // Add click handler for role menu
            roleToggle.onclick = (e) => {
                e.preventDefault();
                this.showRoleMenu();
            };
        }

        // Update navigation visibility based on permissions
        this.updateNavigationVisibility();

        // Update legacy admin state for compatibility
        this.state.user.isAdmin = this.state.user.role === 'developer';
    }

    /**
     * Show role selection menu
     */
    showRoleMenu() {
        // Create role menu if it doesn't exist
        let roleMenu = document.getElementById('role-menu');
        if (!roleMenu) {
            roleMenu = document.createElement('div');
            roleMenu.id = 'role-menu';
            roleMenu.className = 'role-menu';
            roleMenu.innerHTML = `
                <div class="role-menu-content">
                    <div class="role-menu-header">
                        <h3>Switch Role</h3>
                        <button class="role-menu-close">&times;</button>
                    </div>
                    <div class="role-menu-body">
                        ${Object.entries(this.roles).map(([key, role]) => `
                            <div class="role-option ${this.state.user.role === key ? 'active' : ''}" data-role="${key}">
                                <div class="role-icon" style="color: ${role.color}">
                                    <i class="${role.icon}"></i>
                                </div>
                                <div class="role-info">
                                    <h4>${role.name}</h4>
                                    <p>${role.description}</p>
                                </div>
                                ${this.state.user.role === key ? '<i class="fas fa-check role-check"></i>' : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            document.body.appendChild(roleMenu);

            // Add event listeners
            roleMenu.querySelector('.role-menu-close').addEventListener('click', () => {
                roleMenu.style.display = 'none';
            });

            roleMenu.addEventListener('click', (e) => {
                if (e.target === roleMenu) {
                    roleMenu.style.display = 'none';
                }
            });

            // Add role option click handlers
            roleMenu.querySelectorAll('.role-option').forEach(option => {
                option.addEventListener('click', () => {
                    const newRole = option.dataset.role;
                    if (newRole !== this.state.user.role) {
                        this.switchRole(newRole);
                    }
                    roleMenu.style.display = 'none';
                });
            });
        }

        // Show menu
        roleMenu.style.display = 'flex';
    }

    /**
     * Switch user role
     */
    switchRole(newRole) {
        if (!this.roles[newRole]) {
            this.showNotification('Invalid role selected', 'error');
            return;
        }

        const oldRole = this.state.user.role;
        this.state.user.role = newRole;
        this.state.user.permissions = this.getDefaultPermissions(newRole);

        // Update UI
        this.initializeRoleSystem();

        // Handle view switching if needed
        if (!this.hasPermission('viewDashboard') && this.state.currentView === 'dashboard') {
            this.changeView('profile');
        } else if (this.state.currentView === 'admin' && this.state.user.role !== 'developer') {
            this.changeView('dashboard');
        }

        // Save state
        this.saveApplicationState();

        // Show notification
        const roleInfo = this.roles[newRole];
        this.showNotification(
            `Switched to ${roleInfo.name} role`,
            'success'
        );

        console.log(`Role switched from ${oldRole} to ${newRole}`);
    }

    /**
     * Update navigation visibility based on permissions
     */
    updateNavigationVisibility() {
        // Dashboard
        const dashboardNav = document.getElementById('nav-dashboard');
        if (dashboardNav) {
            dashboardNav.style.display = this.hasPermission('viewDashboard') ? 'flex' : 'none';
        }

        // Activity
        const activityNav = document.getElementById('nav-activity');
        if (activityNav) {
            activityNav.style.display = this.hasPermission('viewOwnActivity') ? 'flex' : 'none';
        }

        // Reports
        const reportsNav = document.getElementById('nav-reports');
        if (reportsNav) {
            reportsNav.style.display = this.hasPermission('viewReports') ? 'flex' : 'none';
        }

        // Admin
        const adminNav = document.getElementById('nav-admin');
        if (adminNav) {
            adminNav.style.display = this.state.user.role === 'developer' ? 'flex' : 'none';
        }

        // Profile (always visible)
        const profileNav = document.getElementById('nav-profile');
        if (profileNav) {
            profileNav.style.display = 'flex';
        }
    }

    changeView(view) {
        if (view === 'admin' && !this.state.user.isAdmin) {
            this.showNotification('Admin access required. Please switch to Admin Mode first.', 'error');
            return;
        }

        this.state.currentView = view;

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const navItem = document.getElementById(`nav-${view}`);
        if (navItem) {
            navItem.classList.add('active');
        }

        // Update visible content
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(`${view}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
        }

        // Refresh data when switching views
        if (view === 'dashboard') {
            this.renderDashboard();
        } else if (view === 'activity') {
            this.renderActivitySection();
        }

        console.log(`Switched to ${view} view`);
    }

    toggleAdminMode() {
        this.state.user.isAdmin = !this.state.user.isAdmin;
        this.initializeAdminMode();

        if (!this.state.user.isAdmin && this.state.currentView === 'admin') {
            this.changeView('dashboard');
        }

        this.saveApplicationState();
        this.showNotification(
            `Switched to ${this.state.user.isAdmin ? 'Admin' : 'Intern'} Mode`,
            'info'
        );
    }

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

    updateWorkStatus() {
        const status = this.getWorkStatus();

        // Update stats grid elements
        const timeStatus = document.getElementById('time-status');
        const todayStatus = document.getElementById('today-status');

        // Update primary status elements
        const primaryStatusTitle = document.getElementById('primary-status-title');
        const primaryStatusMessage = document.getElementById('primary-status-message');
        const timeInBtn = document.getElementById('time-in-btn');
        const timeOutBtn = document.getElementById('time-out-btn');

        if (status.isWorking) {
            // Stats grid elements
            if (timeStatus) timeStatus.textContent = DateUtils.formatDuration(status.currentDuration);
            if (todayStatus) todayStatus.textContent = 'In progress';

            // Primary status elements
            if (primaryStatusTitle) primaryStatusTitle.textContent = 'Currently Working';
            if (primaryStatusMessage) {
                const duration = DateUtils.formatDuration(status.currentDuration);
                primaryStatusMessage.textContent = `Started at ${DateUtils.formatTime(status.timeIn)} • ${duration} elapsed`;
            }

            // Update button states
            if (timeInBtn) {
                timeInBtn.disabled = true;
                timeInBtn.className = 'time-btn time-in disabled';
            }
            if (timeOutBtn) {
                timeOutBtn.disabled = false;
                timeOutBtn.className = 'time-btn time-out active';
            }
        } else {
            // Stats grid elements
            if (timeStatus) timeStatus.textContent = 'Not started';
            if (todayStatus) todayStatus.textContent = 'Ready to start';

            // Primary status elements
            if (primaryStatusTitle) primaryStatusTitle.textContent = 'Ready to Start';
            if (primaryStatusMessage) primaryStatusMessage.textContent = 'Click "Time In" to start tracking your work day';

            // Update button states
            if (timeInBtn) {
                timeInBtn.disabled = false;
                timeInBtn.className = 'time-btn time-in active';
            }
            if (timeOutBtn) {
                timeOutBtn.disabled = true;
                timeOutBtn.className = 'time-btn time-out disabled';
            }
        }

        // Update status indicator class
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${status.isWorking ? 'working' : 'ready'}`;
        }
    }

    getWorkStatus() {
        const currentTime = this.state.currentTimeIn;
        const isTimedIn = this.state.isTimedIn;

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

    renderDashboard() {
        try {
            const container = document.getElementById('dashboard-section');
            if (!container) {
                console.warn('Dashboard container not found, skipping render');
                return;
            }

            const stats = this.calculateUserStats();

        container.innerHTML = `
            <!-- Welcome Card - Moved to Top -->
            <div class="welcome-card">
                <div class="welcome-content">
                    <div class="welcome-text">
                        <h2 id="welcome-message">Welcome back, ${this.state.user.name}!</h2>
                        <p id="welcome-subtext">
                            <span class="role-badge" style="background-color: var(--primary-color); color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-right: 8px;">
                                ${this.state.user.role ? this.state.user.role.toUpperCase() : 'USER'}
                            </span>
                            ${this.state.user.position || 'Team Member'} • Track your attendance and monitor your progress.
                        </p>
                    </div>
                    <div class="welcome-stats">
                        <div class="quick-stat">
                            <span class="quick-stat-value" id="today-hours">${Formatters.formatHours(stats.today.hours)}</span>
                            <span class="quick-stat-label">Hours Today</span>
                        </div>
                        <div class="quick-stat">
                            <span class="quick-stat-value" id="week-progress">${Formatters.formatPercentage(stats.week.hours, stats.week.target)}</span>
                            <span class="quick-stat-label">Week Progress</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section-header">
                <h1>
                    <i class="fas fa-home"></i>
                    Dashboard
                </h1>
                <div class="actions">
                    ${this.hasPermission('timeTracking') ? `
                        <button class="action-btn secondary" id="barcode-scan-btn">
                            <i class="fas fa-barcode"></i>
                            <span>Scan Barcode</span>
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Primary Time Tracking Controls -->
            ${this.hasPermission('timeTracking') ? `
            <div class="primary-time-controls">
                <div class="time-control-card">
                    <div class="time-status-display">
                        <div class="status-indicator ${this.state.isTimedIn ? 'working' : 'ready'}">
                            <i class="fas fa-${this.state.isTimedIn ? 'play' : 'clock'}-circle"></i>
                            <div class="status-text">
                                <h3 id="primary-status-title">${this.state.isTimedIn ? 'Currently Working' : 'Ready to Start'}</h3>
                                <p id="primary-status-message">${this.state.isTimedIn ? 'Click Time Out when finished' : 'Click Time In to start tracking'}</p>
                            </div>
                        </div>
                        <div class="current-time-display">
                            <div class="time-value" id="live-time">--:--</div>
                            <div class="date-value" id="live-date">Loading...</div>
                        </div>
                    </div>
                    <div class="time-action-buttons">
                        <button class="time-btn time-in ${this.state.isTimedIn ? 'disabled' : 'active'}" id="time-in-btn" ${this.state.isTimedIn ? 'disabled' : ''}>
                            <div class="btn-icon">
                                <i class="fas fa-play"></i>
                            </div>
                            <div class="btn-content">
                                <span class="btn-title">Time In</span>
                                <span class="btn-subtitle">Start your work day</span>
                            </div>
                        </button>
                        <button class="time-btn time-out ${this.state.isTimedIn ? 'active' : 'disabled'}" id="time-out-btn" ${!this.state.isTimedIn ? 'disabled' : ''}>
                            <div class="btn-icon">
                                <i class="fas fa-stop"></i>
                            </div>
                            <div class="btn-content">
                                <span class="btn-title">Time Out</span>
                                <span class="btn-subtitle">End your work day</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
            ` : ''}



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
                        <div class="stat-value" id="total-hours">${Formatters.formatHours(stats.month.hours)}</div>
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
                        <div class="stat-value" id="weekly-hours">${Formatters.formatHours(stats.week.hours)}</div>
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
                        <div class="stat-value" id="daily-hours">${Formatters.formatHours(stats.today.hours)}</div>
                    </div>
                </div>

                <div class="stat-card wide">
                    <div class="stat-content">
                        <h3>Weekly Progress</h3>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" id="weekly-progress-bar" style="width: ${stats.week.progress}%"></div>
                            </div>
                            <div class="progress-info">
                                <span class="progress-label" id="progress-label">${Formatters.formatHours(stats.week.hours)} / ${stats.week.target} hours</span>
                                <span class="progress-percentage" id="progress-percentage">${Math.round(stats.week.progress)}%</span>
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
                    ${this.getRecentActivityHTML()}
                </div>
            </div>
        `;

        // Setup dashboard event listeners
        this.setupDashboardEventListeners();

        // Render chart
        this.renderChart('week');

        // Update status
        this.updateWorkStatus();
        this.updateDateTime();

        } catch (error) {
            console.error('Error rendering dashboard:', error);
            // Show a simple fallback dashboard
            const container = document.getElementById('dashboard-section');
            if (container) {
                container.innerHTML = `
                    <div class="dashboard-error">
                        <h2>Dashboard Loading...</h2>
                        <p>Please wait while we load your dashboard.</p>
                    </div>
                `;
            }
        }
    }

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

    getRecentActivityHTML() {
        const recentActivities = this.activities.slice(0, 3);

        if (recentActivities.length === 0) {
            return `
                <div class="activity-placeholder">
                    <i class="fas fa-clock"></i>
                    <p>No recent activity. Start tracking your attendance!</p>
                </div>
            `;
        }

        return recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-${activity.status === 'completed' ? 'check-circle' : 'clock'}"></i>
                </div>
                <div class="activity-content">
                    <h4>${Formatters.escapeHtml(activity.title)}</h4>
                    <p>${Formatters.escapeHtml(activity.description.substring(0, 100))}...</p>
                    <div class="activity-meta">
                        <span class="activity-status ${activity.status}">${Formatters.formatStatus(activity.status).text}</span>
                        <span class="activity-date">${DateUtils.formatDate(activity.date, 'short')}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupDashboardEventListeners() {
        // Barcode scanner button
        const barcodeScanBtn = document.getElementById('barcode-scan-btn');
        if (barcodeScanBtn) {
            barcodeScanBtn.addEventListener('click', () => {
                this.simulateBarcodeScanner();
            });
        }

        // Quick time button
        const quickTimeBtn = document.getElementById('quick-time-btn');
        if (quickTimeBtn) {
            quickTimeBtn.addEventListener('click', () => {
                if (this.state.isTimedIn) {
                    this.timeOut();
                } else {
                    this.timeIn();
                }
            });
        }

        // Time in button
        const timeInBtn = document.getElementById('time-in-btn');
        if (timeInBtn) {
            timeInBtn.addEventListener('click', () => {
                this.timeIn();
            });
        }

        // Time out button
        const timeOutBtn = document.getElementById('time-out-btn');
        if (timeOutBtn) {
            timeOutBtn.addEventListener('click', () => {
                this.timeOut();
            });
        }

        // Chart period buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderChart(e.target.dataset.period);
            });
        });

        // Initialize chart after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.renderChart('week');
        }, 500);

        // View all activity button
        const viewAllBtn = document.getElementById('view-all-activity');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                this.changeView('activity');
            });
        }
    }

    renderChart(period = 'week') {
        // Wait for Chart.js to be available
        if (typeof Chart === 'undefined') {
            setTimeout(() => this.renderChart(period), 100);
            return;
        }

        const canvas = document.getElementById('weekly-chart');
        if (!canvas) {
            // Try again after a short delay if canvas not found
            setTimeout(() => this.renderChart(period), 100);
            return;
        }

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        const chartData = this.getChartData(period);

        this.chart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#ff7a45',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a0',
                            callback: function(value) {
                                return value + 'h';
                            }
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
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        console.log('Chart rendered successfully for period:', period);
    }

    getChartData(period) {
        const labels = [];
        const data = [];

        if (period === 'week') {
            // Generate last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = DateUtils.formatDateISO(date);

                // Format label for display
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = date.getDate();
                labels.push(`${dayName} ${dayNum}`);

                // Get actual attendance records for this date
                const dayRecords = this.attendanceRecords.filter(r => r.date === dateStr);
                const dayHours = dayRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);

                // Add some sample data if no real data exists
                if (dayHours === 0 && i < 5) {
                    // Add realistic sample hours for recent days
                    const sampleHours = [7.5, 8.2, 6.8, 8.0, 7.8][i] || 0;
                    data.push(sampleHours);
                } else {
                    data.push(dayHours);
                }
            }
        } else {
            // Generate last 30 days
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = DateUtils.formatDateISO(date);

                labels.push(date.getDate().toString());

                const dayRecords = this.attendanceRecords.filter(r => r.date === dateStr);
                const dayHours = dayRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);

                // Add some sample data for demonstration
                if (dayHours === 0 && i < 20) {
                    const sampleHours = Math.random() * 3 + 6; // 6-9 hours
                    data.push(Math.round(sampleHours * 10) / 10);
                } else {
                    data.push(dayHours);
                }
            }
        }

        return {
            labels,
            datasets: [{
                label: 'Hours Worked',
                data,
                borderColor: '#ff7a45',
                backgroundColor: 'rgba(255, 122, 69, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ff7a45',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        };
    }

    // Time tracking functionality
    timeIn() {
        if (this.state.isTimedIn) {
            this.showNotification('You are already timed in!', 'warning');
            return;
        }

        this.state.isTimedIn = true;
        this.state.currentTimeIn = new Date().toISOString();
        this.saveApplicationState();

        this.showNotification('Successfully timed in! Have a productive day!', 'success');
        this.updateWorkStatus();

        // Refresh dashboard to show updated state
        if (this.state.currentView === 'dashboard') {
            this.renderDashboard();
        }
    }

    timeOut() {
        if (!this.state.isTimedIn) {
            this.showNotification('You are not currently timed in!', 'warning');
            return;
        }

        const timeOut = new Date().toISOString();
        const duration = DateUtils.calculateDuration(this.state.currentTimeIn, timeOut);

        // Save attendance record
        this.saveAttendanceRecord(this.state.currentTimeIn, timeOut, duration.totalHours);

        this.state.isTimedIn = false;
        this.state.currentTimeIn = null;
        this.saveApplicationState();

        this.showNotification(`Successfully timed out! You worked ${DateUtils.formatDuration(duration.totalHours)} today. Great job!`, 'success');

        // Refresh dashboard to show new data and updated state
        if (this.state.currentView === 'dashboard') {
            this.renderDashboard();
        }
    }

    saveAttendanceRecord(timeIn, timeOut, totalHours) {
        const record = {
            id: Date.now().toString(),
            date: DateUtils.getCurrentDateISO(),
            timeIn,
            timeOut,
            totalHours,
            userId: this.state.user.id,
            userName: this.state.user.name,
            timestamp: new Date().toISOString()
        };

        this.attendanceRecords.unshift(record);
        this.saveData();
    }

    simulateBarcodeScanner() {
        // Use new barcode scanner if available
        if (window.barcodeScanner && window.idCardManager) {
            window.idCardManager.openBarcodeScanner();
        } else {
            // Fallback to old scanner
            this.showBarcodeScanner();
        }
    }

    showBarcodeScanner() {
        // Create modal if it doesn't exist
        let modal = document.getElementById('barcode-scanner-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'barcode-scanner-modal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content barcode-scanner">
                    <div class="modal-header">
                        <h3>
                            <i class="fas fa-barcode"></i>
                            Barcode Scanner
                        </h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').style.display='none'">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="scanner-area">
                            <div class="scanner-frame">
                                <div class="scan-line"></div>
                                <i class="fas fa-barcode scanner-icon"></i>
                            </div>
                            <p class="scanner-instruction">Position your barcode within the frame</p>
                            <div class="scanner-actions">
                                <button class="action-btn secondary" onclick="this.closest('.modal-overlay').style.display='none'">
                                    <i class="fas fa-times"></i>
                                    <span>Cancel</span>
                                </button>
                                <button class="action-btn primary" id="simulate-scan-btn">
                                    <i class="fas fa-qrcode"></i>
                                    <span>Simulate Scan</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add simulate scan functionality
            const simulateBtn = modal.querySelector('#simulate-scan-btn');
            simulateBtn.addEventListener('click', () => {
                this.processBarcodeInput('INTERN_001_BARCODE');
                modal.style.display = 'none';
            });
        }

        // Show modal
        modal.style.display = 'flex';

        // Auto-simulate scan after 3 seconds
        setTimeout(() => {
            if (modal.style.display === 'flex') {
                this.processBarcodeInput('INTERN_001_BARCODE');
                modal.style.display = 'none';
            }
        }, 3000);
    }

    processBarcodeInput(barcode) {
        if (!barcode || barcode.trim() === '') {
            this.showNotification('Please scan a valid barcode', 'error');
            return;
        }

        console.log('Barcode scanned:', barcode);

        // Validate AG&P barcode format
        if (this.validateAGPBarcode(barcode)) {
            // Get user info from barcode
            const userInfo = this.getUserFromBarcode(barcode);

            if (userInfo) {
                this.showAttendanceConfirmation(userInfo, barcode);
            } else {
                this.showNotification('User not found for this barcode', 'warning');
            }
        } else {
            // Fallback: Toggle time in/out for current user
            if (this.state.isTimedIn) {
                this.timeOut();
            } else {
                this.timeIn();
            }
        }
    }

    /**
     * Validate AG&P barcode format
     */
    validateAGPBarcode(barcode) {
        // Check if barcode starts with AGP and has correct format
        const agpPattern = /^AGP[A-Z]{2}\d{6}$/;
        return agpPattern.test(barcode);
    }

    /**
     * Get user from barcode
     */
    getUserFromBarcode(barcode) {
        try {
            // Get applicants data to find user by barcode
            const applicants = JSON.parse(localStorage.getItem('applicantsData') || '[]');
            const applicant = applicants.find(a => a.barcodeText === barcode);

            if (applicant) {
                return {
                    id: applicant.id,
                    name: applicant.name,
                    department: applicant.department,
                    position: applicant.position,
                    email: applicant.email,
                    barcode: barcode
                };
            }

            // Also check regular users
            const users = window.userDatabase ? window.userDatabase.getAllUsers() : [];
            const user = users.find(u => u.barcodeText === barcode);

            return user ? {
                id: user.id,
                name: user.name,
                department: user.department,
                position: user.position,
                email: user.email,
                barcode: barcode
            } : null;

        } catch (error) {
            console.error('Error getting user from barcode:', error);
            return null;
        }
    }

    /**
     * Show attendance confirmation for scanned user
     */
    showAttendanceConfirmation(userInfo, barcode) {
        // Create confirmation modal
        const modal = document.createElement('div');
        modal.className = 'attendance-confirmation-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-check"></i> Attendance Confirmation</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="user-info">
                            <div class="user-avatar">
                                <i class="fas fa-user-circle"></i>
                            </div>
                            <div class="user-details">
                                <h4>${userInfo.name}</h4>
                                <p>${userInfo.position || 'Intern'}</p>
                                <p>${userInfo.department || 'N/A'}</p>
                                <p class="barcode-scanned">Barcode: ${barcode}</p>
                            </div>
                        </div>
                        <div class="attendance-actions">
                            <button id="confirm-time-in" class="btn btn-success">
                                <i class="fas fa-sign-in-alt"></i> Time In
                            </button>
                            <button id="confirm-time-out" class="btn btn-warning">
                                <i class="fas fa-sign-out-alt"></i> Time Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .attendance-confirmation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            .attendance-confirmation-modal .modal-content {
                background: var(--card-bg, #2a2a2a);
                border-radius: 12px;
                max-width: 400px;
                width: 90%;
            }
            .attendance-confirmation-modal .modal-header {
                background: var(--primary-color, #ff7a45);
                color: white;
                padding: 1rem;
                border-radius: 12px 12px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .attendance-confirmation-modal .close-modal {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
            }
            .attendance-confirmation-modal .modal-body {
                padding: 1.5rem;
            }
            .attendance-confirmation-modal .user-info {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
                align-items: center;
            }
            .attendance-confirmation-modal .user-avatar i {
                font-size: 3rem;
                color: var(--primary-color, #ff7a45);
            }
            .attendance-confirmation-modal .user-details h4 {
                margin: 0 0 0.5rem 0;
                color: var(--primary-color, #ff7a45);
            }
            .attendance-confirmation-modal .user-details p {
                margin: 0.25rem 0;
                color: var(--text-secondary, #ccc);
            }
            .attendance-confirmation-modal .barcode-scanned {
                font-family: monospace;
                background: var(--input-bg, #333);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.9rem;
            }
            .attendance-confirmation-modal .attendance-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
            .attendance-confirmation-modal .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 1rem;
                transition: background 0.3s;
            }
            .attendance-confirmation-modal .btn-success {
                background: #28a745;
                color: white;
            }
            .attendance-confirmation-modal .btn-warning {
                background: #ffc107;
                color: black;
            }
            .attendance-confirmation-modal .btn:hover {
                opacity: 0.9;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        // Event handlers
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });

        modal.querySelector('#confirm-time-in').addEventListener('click', () => {
            this.recordAttendanceForUser(userInfo, 'time-in');
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });

        modal.querySelector('#confirm-time-out').addEventListener('click', () => {
            this.recordAttendanceForUser(userInfo, 'time-out');
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });

        // Close on overlay click
        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }

    /**
     * Record attendance for specific user
     */
    recordAttendanceForUser(userInfo, action) {
        const timestamp = new Date().toISOString();
        const time = new Date().toLocaleTimeString();

        // Create attendance record
        const record = {
            id: Date.now().toString(),
            userId: userInfo.id,
            userName: userInfo.name,
            department: userInfo.department,
            action: action,
            timestamp: timestamp,
            time: time,
            date: new Date().toLocaleDateString(),
            barcode: userInfo.barcode
        };

        // Store attendance record
        const attendanceRecords = JSON.parse(localStorage.getItem('barcodeAttendanceRecords') || '[]');
        attendanceRecords.unshift(record);
        localStorage.setItem('barcodeAttendanceRecords', JSON.stringify(attendanceRecords));

        // Show success notification
        this.showNotification(
            `${userInfo.name} - ${action.replace('-', ' ')} recorded at ${time}`,
            'success'
        );

        console.log('Attendance recorded:', record);
    }

    renderActivitySection() {
        const container = document.getElementById('activity-section');
        if (!container) return;

        container.innerHTML = `
            <div class="section-header">
                <h1>
                    <i class="fas fa-tasks"></i>
                    Daily Activities
                </h1>
                <div class="actions">
                    <button class="action-btn secondary" id="export-activities-btn">
                        <i class="fas fa-file-export"></i>
                        <span>Export Document</span>
                    </button>
                    <button class="action-btn primary" id="add-activity-btn">
                        <i class="fas fa-plus"></i>
                        <span>Log Activity</span>
                    </button>
                </div>
            </div>

            <!-- Activity Stats -->
            <div class="activity-stats">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${this.activities.length}</div>
                        <div class="stat-label">Total Activities</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${this.activities.filter(a => a.status === 'completed').length}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${this.activities.filter(a => a.status === 'in-progress').length}</div>
                        <div class="stat-label">In Progress</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-camera"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">${this.activities.reduce((sum, a) => sum + (a.photos ? a.photos.length : 0), 0)}</div>
                        <div class="stat-label">Photos</div>
                    </div>
                </div>
            </div>

            <!-- Activity Filters -->
            <div class="activity-filters">
                <div class="filter-group">
                    <label>Filter by Status:</label>
                    <select id="activity-filter">
                        <option value="all">All Activities</option>
                        <option value="completed">Completed</option>
                        <option value="in-progress">In Progress</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Sort by:</label>
                    <select id="activity-sort">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="title">Title A-Z</option>
                        <option value="status">Status</option>
                    </select>
                </div>
                <div class="filter-group">
                    <input type="text" id="activity-search" placeholder="Search activities...">
                </div>
            </div>

            <!-- Activity List -->
            <div class="activity-feed" id="activity-feed">
                ${this.getActivityListHTML()}
            </div>
        `;

        // Setup activity event listeners
        this.setupActivityEventListeners();
    }

    getActivityListHTML() {
        let filteredActivities = [...this.activities];

        // Apply filters
        const filterValue = document.getElementById('activity-filter')?.value || 'all';
        const sortValue = document.getElementById('activity-sort')?.value || 'newest';
        const searchValue = document.getElementById('activity-search')?.value?.toLowerCase() || '';

        // Filter by status
        if (filterValue !== 'all') {
            filteredActivities = filteredActivities.filter(a => a.status === filterValue);
        }

        // Filter by search
        if (searchValue) {
            filteredActivities = filteredActivities.filter(a =>
                a.title.toLowerCase().includes(searchValue) ||
                a.description.toLowerCase().includes(searchValue) ||
                (a.tags && a.tags.some(tag => tag.toLowerCase().includes(searchValue)))
            );
        }

        // Sort activities
        filteredActivities.sort((a, b) => {
            switch (sortValue) {
                case 'oldest':
                    return new Date(a.date) - new Date(b.date);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'newest':
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });

        if (filteredActivities.length === 0) {
            if (this.activities.length === 0) {
                return `
                    <div class="activity-placeholder">
                        <i class="fas fa-tasks"></i>
                        <h3>No Activities Yet</h3>
                        <p>Start logging your daily activities to track your progress and productivity.</p>
                        <button class="action-btn primary" onclick="attendanceApp.openActivityModal()">
                            <i class="fas fa-plus"></i>
                            <span>Log Your First Activity</span>
                        </button>
                    </div>
                `;
            } else {
                return `
                    <div class="activity-placeholder">
                        <i class="fas fa-search"></i>
                        <h3>No Activities Found</h3>
                        <p>No activities match your current filters. Try adjusting your search criteria.</p>
                    </div>
                `;
            }
        }

        return filteredActivities.map(activity => {
            const statusInfo = Formatters.formatStatus(activity.status);
            return `
                <div class="activity-card" data-activity-id="${activity.id}">
                    <div class="activity-header">
                        <div class="activity-status ${activity.status}">
                            <i class="fas fa-${activity.status === 'completed' ? 'check-circle' : 'clock'}"></i>
                            <span>${statusInfo.text}</span>
                        </div>
                        <div class="activity-time">${DateUtils.formatDate(activity.date, 'short')}</div>
                    </div>
                    <div class="activity-content">
                        <h4 class="activity-title">${Formatters.escapeHtml(activity.title)}</h4>
                        <p class="activity-description">${Formatters.escapeHtml(activity.description)}</p>

                        ${activity.assignedBy ? `
                            <div class="activity-meta">
                                <i class="fas fa-user-tie"></i>
                                <span>Assigned by: ${Formatters.escapeHtml(activity.assignedBy)}</span>
                            </div>
                        ` : ''}

                        ${activity.tags && activity.tags.length > 0 ? `
                            <div class="activity-tags">
                                ${activity.tags.map(tag => `<span class="activity-tag">${Formatters.escapeHtml(tag)}</span>`).join('')}
                            </div>
                        ` : ''}

                        ${activity.photos && activity.photos.length > 0 ? `
                            <div class="activity-photos">
                                <div class="photos-header">
                                    <i class="fas fa-camera"></i>
                                    <span>${activity.photos.length} photo${activity.photos.length !== 1 ? 's' : ''} attached</span>
                                </div>
                                <div class="photos-grid" style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                                    ${activity.photos.slice(0, 3).map(photo => `
                                        <div class="photo-thumbnail" style="cursor: pointer;" onclick="this.parentElement.parentElement.querySelector('.photos-modal').style.display='flex'">
                                            <img src="${photo.data}" alt="Activity photo" loading="lazy"
                                                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px solid #ff7a45;">
                                        </div>
                                    `).join('')}
                                    ${activity.photos.length > 3 ? `
                                        <div class="photo-more" style="width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; background: rgba(255, 122, 69, 0.1); border: 2px dashed #ff7a45; border-radius: 8px; color: #ff7a45; font-size: 12px; font-weight: bold;">
                                            +${activity.photos.length - 3}
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="photos-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 1000; align-items: center; justify-content: center;" onclick="if(event.target === this) this.style.display='none'">
                                    <div class="photos-modal-content" style="max-width: 90%; max-height: 90%; position: relative;">
                                        <button class="close-btn" style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; width: 40px; height: 40px; border-radius: 50%; cursor: pointer;" onclick="this.closest('.photos-modal').style.display='none'">&times;</button>
                                        <div class="photos-carousel" style="display: flex; gap: 10px; overflow-x: auto; padding: 20px;">
                                            ${activity.photos.map(photo => `
                                                <img src="${photo.data}" alt="Activity photo" style="max-height: 70vh; max-width: 80vw; object-fit: contain; border-radius: 8px;">
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="activity-actions">
                        <button class="action-btn small secondary" onclick="attendanceApp.editActivity('${activity.id}')">
                            <i class="fas fa-edit"></i>
                            <span>Edit</span>
                        </button>
                        <button class="action-btn small danger" onclick="attendanceApp.deleteActivity('${activity.id}')">
                            <i class="fas fa-trash"></i>
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupActivityEventListeners() {
        const addActivityBtn = document.getElementById('add-activity-btn');
        if (addActivityBtn) {
            addActivityBtn.addEventListener('click', () => {
                this.openActivityModal();
            });
        }

        const exportActivitiesBtn = document.getElementById('export-activities-btn');
        if (exportActivitiesBtn) {
            exportActivitiesBtn.addEventListener('click', () => {
                this.exportActivitiesDocument();
            });
        }

        // Filter and sort controls
        const filterSelect = document.getElementById('activity-filter');
        const sortSelect = document.getElementById('activity-sort');
        const searchInput = document.getElementById('activity-search');

        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                this.renderActivitySection();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.renderActivitySection();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderActivitySection();
            });
        }
    }

    openActivityModal(activityId = null) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('activity-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'activity-modal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content activity-modal">
                    <div class="modal-header">
                        <h3>
                            <i class="fas fa-tasks"></i>
                            <span id="activity-modal-title">Log Activity</span>
                        </h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').style.display='none'">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="activity-form">
                            <div class="form-group">
                                <label for="activity-title">Activity Title *</label>
                                <input type="text" id="activity-title" required placeholder="Enter activity title">
                            </div>
                            <div class="form-group">
                                <label for="activity-description">Description *</label>
                                <textarea id="activity-description" required placeholder="Describe what you did..." rows="4"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="activity-date">Date</label>
                                <input type="date" id="activity-date" value="${DateUtils.getCurrentDateISO()}">
                            </div>
                            <div class="form-group">
                                <label for="activity-status">Status</label>
                                <select id="activity-status">
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="activity-tags">Tags (comma separated)</label>
                                <input type="text" id="activity-tags" placeholder="e.g., development, testing, meeting">
                            </div>
                            <div class="form-group">
                                <label for="activity-assigned-by">Assigned By (optional)</label>
                                <input type="text" id="activity-assigned-by" placeholder="e.g., John Smith, Manager">
                            </div>
                            <div class="form-actions">
                                <button type="button" class="action-btn secondary" onclick="this.closest('.modal-overlay').style.display='none'">
                                    <i class="fas fa-times"></i>
                                    <span>Cancel</span>
                                </button>
                                <button type="submit" class="action-btn primary">
                                    <i class="fas fa-save"></i>
                                    <span>Save Activity</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add form submit handler
            const form = modal.querySelector('#activity-form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveActivity();
            });


        }

        // Show modal
        modal.style.display = 'flex';

        // Focus on title input
        setTimeout(() => {
            modal.querySelector('#activity-title').focus();
        }, 100);
    }

    async saveActivity() {
        const title = document.getElementById('activity-title').value.trim();
        const description = document.getElementById('activity-description').value.trim();
        const date = document.getElementById('activity-date').value;
        const status = document.getElementById('activity-status').value;
        const tagsInput = document.getElementById('activity-tags').value.trim();
        const assignedBy = document.getElementById('activity-assigned-by').value.trim();

        if (!title || !description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        const activityData = {
            id: Date.now().toString(),
            title,
            description,
            date,
            status,
            tags,
            assignedBy: assignedBy || null,
            userId: this.state.user.id,
            userName: this.state.user.name,
            timestamp: new Date().toISOString()
        };

        this.activities.unshift(activityData);
        this.saveData();

        // Close modal
        document.getElementById('activity-modal').style.display = 'none';

        // Clear form
        document.getElementById('activity-form').reset();
        document.getElementById('activity-date').value = DateUtils.getCurrentDateISO();

        this.showNotification('Activity logged successfully!', 'success');

        // Refresh activity view if currently active
        if (this.state.currentView === 'activity') {
            this.renderActivitySection();
        }
    }

    editActivity(activityId) {
        this.showNotification('Edit functionality will be implemented soon', 'info');
    }

    deleteActivity(activityId) {
        if (!confirm('Are you sure you want to delete this activity?')) return;

        this.activities = this.activities.filter(a => a.id !== activityId);
        this.saveData();

        this.showNotification('Activity deleted successfully', 'success');

        // Refresh activity view if currently active
        if (this.state.currentView === 'activity') {
            this.renderActivitySection();
        }
    }

    /**
     * Export activities as a professional document
     */
    exportActivitiesDocument() {
        // Show export options modal
        this.showExportOptionsModal();
    }

    /**
     * Show export options modal
     */
    showExportOptionsModal() {
        // Create modal if it doesn't exist
        let modal = document.getElementById('export-options-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'export-options-modal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content export-options">
                    <div class="modal-header">
                        <h3>
                            <i class="fas fa-file-export"></i>
                            Export Activities Document
                        </h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').style.display='none'">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="export-options-form">
                            <div class="form-group">
                                <label for="export-date-range">Date Range</label>
                                <select id="export-date-range">
                                    <option value="all">All Activities</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>
                            <div class="form-group" id="custom-date-range" style="display: none;">
                                <div style="display: flex; gap: 10px;">
                                    <div style="flex: 1;">
                                        <label for="export-start-date">Start Date</label>
                                        <input type="date" id="export-start-date">
                                    </div>
                                    <div style="flex: 1;">
                                        <label for="export-end-date">End Date</label>
                                        <input type="date" id="export-end-date" value="${DateUtils.getCurrentDateISO()}">
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="export-status-filter">Status Filter</label>
                                <select id="export-status-filter">
                                    <option value="all">All Statuses</option>
                                    <option value="completed">Completed Only</option>
                                    <option value="in-progress">In Progress Only</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="export-format">Export Format</label>
                                <select id="export-format">
                                    <option value="html">Professional HTML Document</option>
                                    <option value="pdf">PDF Document (Print-Ready)</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="include-summary" checked>
                                    Include Activity Summary
                                </label>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="include-tags" checked>
                                    Include Tags
                                </label>
                            </div>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="action-btn secondary" onclick="this.closest('.modal-overlay').style.display='none'">
                                <i class="fas fa-times"></i>
                                <span>Cancel</span>
                            </button>
                            <button type="button" class="action-btn primary" id="generate-export-btn">
                                <i class="fas fa-download"></i>
                                <span>Generate Document</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add event listeners
            const dateRangeSelect = modal.querySelector('#export-date-range');
            const customDateRange = modal.querySelector('#custom-date-range');
            const generateBtn = modal.querySelector('#generate-export-btn');

            dateRangeSelect.addEventListener('change', () => {
                if (dateRangeSelect.value === 'custom') {
                    customDateRange.style.display = 'block';
                } else {
                    customDateRange.style.display = 'none';
                }
            });

            generateBtn.addEventListener('click', () => {
                this.generateActivityDocument();
                modal.style.display = 'none';
            });
        }

        // Show modal
        modal.style.display = 'flex';
    }

    /**
     * Generate activity document based on selected options
     */
    generateActivityDocument() {
        const dateRange = document.getElementById('export-date-range').value;
        const statusFilter = document.getElementById('export-status-filter').value;
        const format = document.getElementById('export-format').value;
        const includeSummary = document.getElementById('include-summary').checked;
        const includeTags = document.getElementById('include-tags').checked;

        // Get filtered activities
        const filteredActivities = this.getFilteredActivitiesForExport(dateRange, statusFilter);

        if (filteredActivities.length === 0) {
            this.showNotification('No activities found for the selected criteria', 'warning');
            return;
        }

        // Generate document based on format
        if (format === 'html') {
            this.generateHTMLDocument(filteredActivities, {
                dateRange,
                statusFilter,
                includeSummary,
                includeTags
            });
        } else if (format === 'pdf') {
            this.generatePDFDocument(filteredActivities, {
                dateRange,
                statusFilter,
                includeSummary,
                includeTags
            });
        }

        this.showNotification('Document generated successfully!', 'success');
    }

    /**
     * Get filtered activities for export
     */
    getFilteredActivitiesForExport(dateRange, statusFilter) {
        let filtered = [...this.activities];

        // Apply date filter
        if (dateRange !== 'all') {
            let startDate, endDate;

            if (dateRange === 'week') {
                const { start, end } = DateUtils.getWeekRange();
                startDate = start;
                endDate = end;
            } else if (dateRange === 'month') {
                const { start, end } = DateUtils.getMonthRange();
                startDate = start;
                endDate = end;
            } else if (dateRange === 'custom') {
                startDate = document.getElementById('export-start-date').value;
                endDate = document.getElementById('export-end-date').value;
            }

            if (startDate && endDate) {
                filtered = filtered.filter(activity => {
                    const activityDate = activity.date;
                    return activityDate >= startDate && activityDate <= endDate;
                });
            }
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(activity => activity.status === statusFilter);
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        return filtered;
    }

    /**
     * Generate professional HTML document
     */
    generateHTMLDocument(activities, options) {
        const { dateRange, statusFilter, includeSummary, includeTags } = options;

        // Calculate summary statistics
        const summary = this.calculateActivitySummary(activities);

        // Generate document title
        const titleSuffix = this.getDocumentTitleSuffix(dateRange, statusFilter);

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Internship Activity Report - ${this.state.user.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.4;
            color: #000;
            background: #fff;
            padding: 30px;
            max-width: 210mm;
            margin: 0 auto;
            font-size: 12pt;
        }

        .document-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
        }

        .logo {
            width: 60px;
            height: 60px;
            background: url('imgs/AGP-Logo.png') no-repeat center;
            background-size: contain;
            margin: 0 auto 10px;
        }

        .company-name {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .document-title {
            font-size: 16pt;
            font-weight: bold;
            margin: 15px 0;
            text-decoration: underline;
        }

        .student-info {
            margin: 25px 0;
            border: 2px solid #000;
            padding: 15px;
        }

        .info-row {
            display: flex;
            margin-bottom: 8px;
            align-items: baseline;
        }

        .info-label {
            font-weight: bold;
            min-width: 140px;
            margin-right: 10px;
        }

        .info-value {
            border-bottom: 1px solid #000;
            flex: 1;
            padding-bottom: 2px;
        }

        .activities-section {
            margin-top: 30px;
        }

        .section-title {
            font-weight: bold;
            margin: 20px 0 15px 0;
            font-size: 14pt;
        }

        .activities-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            margin-top: 15px;
        }

        .activities-table th,
        .activities-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }

        .activities-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
            font-size: 11pt;
        }

        .activities-table td {
            font-size: 10pt;
            min-height: 25px;
        }

        .date-col {
            width: 12%;
            text-align: center;
        }

        .activity-col {
            width: 35%;
        }

        .assignment-col {
            width: 20%;
            text-align: center;
        }

        .remarks-col {
            width: 33%;
        }

        .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9pt;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status-completed {
            background-color: #d4edda;
            color: #155724;
        }

        .status-in-progress {
            background-color: #fff3cd;
            color: #856404;
        }

        .tags-display {
            font-size: 9pt;
            color: #666;
            font-style: italic;
        }

        .document-footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #000;
            text-align: center;
            font-size: 10pt;
        }

        @media print {
            body {
                padding: 15mm;
                font-size: 11pt;
            }

            .activities-table {
                page-break-inside: avoid;
            }

            .activities-table tr {
                page-break-inside: avoid;
            }

            .document-header {
                page-break-after: avoid;
            }

            .student-info {
                page-break-after: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="document-header">
        <div class="logo"></div>
        <div class="company-name">Atlantic, Gulf and Pacific Company</div>
        <div class="document-title">INTERNSHIP ACTIVITY REPORT</div>
    </div>

    <div class="student-info">
        <div class="info-row">
            <span class="info-label">Student Name:</span>
            <span class="info-value">${this.state.user.name}</span>
            <span class="info-label" style="margin-left: 40px;">Course:</span>
            <span class="info-value">BSIT</span>
        </div>
        <div class="info-row">
            <span class="info-label">Company:</span>
            <span class="info-value">Atlantic, Gulf and Pacific Company</span>
            <span class="info-label" style="margin-left: 40px;">Dept:</span>
            <span class="info-value">${this.state.user.department}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Practicum Hours:</span>
            <span class="info-value">${this.calculateTotalHours()} hours</span>
        </div>
    </div>

    <div class="activities-section">
        <div class="section-title">A. Accomplished Activities</div>

        <table class="activities-table">
            <thead>
                <tr>
                    <th class="date-col">Date</th>
                    <th class="activity-col">Nature of Activity</th>
                    <th class="assignment-col">Task/Assignment<br>Received From</th>
                    <th class="remarks-col">Remarks</th>
                </tr>
            </thead>
            <tbody>
                ${activities.map(activity => `
                    <tr>
                        <td class="date-col">${DateUtils.formatDate(activity.date, 'short')}</td>
                        <td class="activity-col">
                            <strong>${Formatters.escapeHtml(activity.title)}</strong>
                            <br>
                            ${Formatters.escapeHtml(activity.description)}
                            ${includeTags && activity.tags && activity.tags.length > 0 ? `
                                <br><span class="tags-display">Tags: ${activity.tags.join(', ')}</span>
                            ` : ''}
                        </td>
                        <td class="assignment-col">
                            ${activity.assignedBy ? Formatters.escapeHtml(activity.assignedBy) : '-'}
                        </td>
                        <td class="remarks-col">
                            <span class="status-badge status-${activity.status}">
                                ${activity.status.replace('-', ' ')}
                            </span>
                        </td>
                    </tr>
                `).join('')}
                ${this.generateEmptyRows(Math.max(0, 10 - activities.length))}
            </tbody>
        </table>
    </div>

    <div class="document-footer">
        <p>This document was automatically generated by the AG&P Attendance Tracking System</p>
        <p>Generated on ${new Date().toLocaleString()} | Document ID: ${Date.now()}</p>
    </div>
</body>
</html>`;

        // Create and download the HTML file
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Activity_Report_${this.state.user.name.replace(/\s+/g, '_')}_${DateUtils.getCurrentDateISO()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Generate PDF document (print-ready HTML)
     */
    generatePDFDocument(activities, options) {
        // For now, generate HTML optimized for printing
        // In the future, this could use a PDF library like jsPDF
        this.generateHTMLDocument(activities, options);

        // Show instructions for PDF generation
        setTimeout(() => {
            this.showNotification('HTML document generated. Use your browser\'s Print function (Ctrl+P) and select "Save as PDF" for PDF output.', 'info', 8000);
        }, 1000);
    }

    /**
     * Calculate activity summary statistics
     */
    calculateActivitySummary(activities) {
        const totalActivities = activities.length;
        const completedActivities = activities.filter(a => a.status === 'completed').length;
        const inProgressActivities = activities.filter(a => a.status === 'in-progress').length;

        // Get unique tags
        const allTags = activities.flatMap(a => a.tags || []);
        const uniqueTags = [...new Set(allTags)].length;

        return {
            totalActivities,
            completedActivities,
            inProgressActivities,
            uniqueTags
        };
    }

    /**
     * Get document title suffix based on filters
     */
    getDocumentTitleSuffix(dateRange, statusFilter) {
        let suffix = '';

        if (dateRange !== 'all') {
            suffix += this.getDateRangeLabel(dateRange);
        } else {
            suffix += 'All Time';
        }

        if (statusFilter !== 'all') {
            suffix += ` - ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`;
        }

        return suffix;
    }

    /**
     * Get human-readable date range label
     */
    getDateRangeLabel(dateRange) {
        switch (dateRange) {
            case 'week':
                return 'This Week';
            case 'month':
                return 'This Month';
            case 'custom':
                const startDate = document.getElementById('export-start-date')?.value;
                const endDate = document.getElementById('export-end-date')?.value;
                if (startDate && endDate) {
                    return `${DateUtils.formatDate(startDate, 'short')} - ${DateUtils.formatDate(endDate, 'short')}`;
                }
                return 'Custom Range';
            default:
                return 'All Activities';
        }
    }

    /**
     * Calculate total practicum hours (placeholder)
     */
    calculateTotalHours() {
        // Calculate based on attendance records
        const totalMinutes = this.attendanceRecords.reduce((total, record) => {
            if (record.totalHours) {
                const [hours, minutes] = record.totalHours.split(':').map(Number);
                return total + (hours * 60) + (minutes || 0);
            }
            return total;
        }, 0);

        const totalHours = Math.floor(totalMinutes / 60);
        return totalHours || 486; // Default to 486 hours if no records
    }

    /**
     * Generate empty table rows for consistent formatting
     */
    generateEmptyRows(count) {
        if (count <= 0) return '';

        let rows = '';
        for (let i = 0; i < count; i++) {
            rows += `
                <tr>
                    <td class="date-col">&nbsp;</td>
                    <td class="activity-col">&nbsp;</td>
                    <td class="assignment-col">&nbsp;</td>
                    <td class="remarks-col">&nbsp;</td>
                </tr>
            `;
        }
        return rows;
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        // Add to container
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    addSampleDataIfNeeded() {
        // Only add sample data if no existing data
        if (this.attendanceRecords.length === 0) {
            // Add sample attendance records
            const sampleRecords = [
                {
                    id: '1',
                    date: DateUtils.getCurrentDateISO(),
                    timeIn: '2024-12-20T08:00:00.000Z',
                    timeOut: '2024-12-20T17:00:00.000Z',
                    totalHours: 8.0,
                    userId: this.state.user.id,
                    userName: this.state.user.name,
                    timestamp: new Date().toISOString()
                },
                {
                    id: '2',
                    date: '2024-12-19',
                    timeIn: '2024-12-19T08:30:00.000Z',
                    timeOut: '2024-12-19T17:30:00.000Z',
                    totalHours: 8.5,
                    userId: this.state.user.id,
                    userName: this.state.user.name,
                    timestamp: new Date().toISOString()
                }
            ];
            this.attendanceRecords = sampleRecords;
            StorageService.setItem('attendanceRecords', sampleRecords);
        }

        if (this.activities.length === 0) {
            // Add sample activities
            const sampleActivities = [
                {
                    id: '1',
                    title: 'Code Review Session',
                    description: 'Reviewed pull requests for the new user authentication module. Provided feedback on code structure and security implementations.',
                    date: DateUtils.getCurrentDateISO(),
                    status: 'completed',
                    tags: ['development', 'code-review', 'security'],
                    userId: this.state.user.id,
                    userName: this.state.user.name,
                    timestamp: new Date().toISOString()
                },
                {
                    id: '2',
                    title: 'Team Meeting - Sprint Planning',
                    description: 'Participated in sprint planning meeting. Discussed upcoming features and estimated story points for user stories.',
                    date: DateUtils.getCurrentDateISO(),
                    status: 'completed',
                    tags: ['meeting', 'planning', 'agile'],
                    userId: this.state.user.id,
                    userName: this.state.user.name,
                    timestamp: new Date().toISOString()
                },
                {
                    id: '3',
                    title: 'Database Optimization',
                    description: 'Working on optimizing database queries for the reporting module. Currently analyzing slow queries and implementing indexes.',
                    date: DateUtils.getCurrentDateISO(),
                    status: 'in-progress',
                    tags: ['database', 'optimization', 'performance'],
                    userId: this.state.user.id,
                    userName: this.state.user.name,
                    timestamp: new Date().toISOString()
                }
            ];
            this.activities = sampleActivities;
            StorageService.setItem('activitiesData', sampleActivities);
        }
    }

    /**
     * Initialize reports charts
     */
    initializeReportsCharts() {
        // Wait for Chart.js to be available
        if (typeof Chart === 'undefined') {
            setTimeout(() => this.initializeReportsCharts(), 100);
            return;
        }

        this.renderAttendanceChart();
        this.renderActivityChart();
        this.setupReportsEventListeners();
    }

    /**
     * Render attendance overview chart
     */
    renderAttendanceChart() {
        const canvas = document.getElementById('attendance-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.attendanceChart) {
            this.attendanceChart.destroy();
        }

        // Generate attendance data for the last 7 days
        const labels = [];
        const presentData = [];
        const absentData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            labels.push(dayName);

            // Sample data - in real app, this would come from actual attendance records
            const totalEmployees = 50;
            const presentCount = Math.floor(Math.random() * 10) + 40; // 40-50 present
            const absentCount = totalEmployees - presentCount;

            presentData.push(presentCount);
            absentData.push(absentCount);
        }

        this.attendanceChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Present',
                        data: presentData,
                        backgroundColor: 'rgba(255, 122, 69, 0.8)',
                        borderColor: '#ff7a45',
                        borderWidth: 1
                    },
                    {
                        label: 'Absent',
                        data: absentData,
                        backgroundColor: 'rgba(231, 76, 60, 0.8)',
                        borderColor: '#e74c3c',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#a0a0a0'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#ff7a45',
                        borderWidth: 1
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
     * Render activity breakdown chart
     */
    renderActivityChart() {
        const canvas = document.getElementById('activity-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart
        if (this.activityChart) {
            this.activityChart.destroy();
        }

        // Calculate activity status breakdown
        const completed = this.activities.filter(a => a.status === 'completed').length;
        const inProgress = this.activities.filter(a => a.status === 'in-progress').length;
        const pending = this.activities.filter(a => a.status === 'pending').length;

        // Add some sample data if no activities exist
        const totalActivities = completed + inProgress + pending;
        const data = totalActivities > 0 ? [completed, inProgress, pending] : [15, 8, 3];
        const labels = ['Completed', 'In Progress', 'Pending'];

        this.activityChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: [
                        'rgba(46, 204, 113, 0.8)',  // Green for completed
                        'rgba(255, 122, 69, 0.8)',  // Orange for in-progress
                        'rgba(52, 152, 219, 0.8)'   // Blue for pending
                    ],
                    borderColor: [
                        '#2ecc71',
                        '#ff7a45',
                        '#3498db'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#a0a0a0',
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#ff7a45',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Setup reports event listeners
     */
    setupReportsEventListeners() {
        // Report period change
        const reportPeriod = document.getElementById('report-period');
        if (reportPeriod) {
            reportPeriod.addEventListener('change', () => {
                this.renderAttendanceChart();
                this.renderActivityChart();
            });
        }

        // Report type change
        const reportType = document.getElementById('report-type');
        if (reportType) {
            reportType.addEventListener('change', () => {
                this.renderAttendanceChart();
                this.renderActivityChart();
            });
        }

        // Export data button
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReportData());
        }

        // Generate report button
        const generateBtn = document.getElementById('generate-report-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generatePDFReport());
        }
    }

    /**
     * Export report data as JSON
     */
    exportReportData() {
        const reportData = {
            attendanceRecords: this.attendanceRecords,
            activities: this.activities,
            userStats: this.calculateUserStats(),
            exportDate: new Date().toISOString(),
            reportPeriod: document.getElementById('report-period')?.value || 'week',
            reportType: document.getElementById('report-type')?.value || 'attendance'
        };

        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Report data exported successfully!', 'success');
    }

    /**
     * Generate comprehensive PDF report
     */
    generatePDFReport() {
        try {
            const reportPeriod = document.getElementById('report-period')?.value || 'week';
            const reportType = document.getElementById('report-type')?.value || 'attendance';

            // Get current user information
            const currentUser = window.userDatabase?.getCurrentUser() || { name: 'Unknown User', department: 'IT Department' };

            // Get filtered data based on period
            const reportData = this.getReportData(reportPeriod, reportType);

            if (!reportData.hasData) {
                this.showNotification('No data available for the selected period', 'warning');
                return;
            }

            // Generate report based on type
            this.generateReportDocument(reportData, reportType, currentUser);

        } catch (error) {
            console.error('Report generation error:', error);
            this.showNotification('Error generating report. Please try again.', 'error');
        }
    }

    /**
     * Get report data based on period and type
     */
    getReportData(period, type) {
        const now = new Date();
        let startDate, endDate;

        // Calculate date range based on period
        switch (period) {
            case 'week':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                endDate = now;
        }

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        // Filter attendance records
        const attendanceRecords = this.attendanceRecords.filter(record =>
            record.date >= startDateStr && record.date <= endDateStr
        );

        // Filter activities
        const activities = this.activities.filter(activity =>
            activity.date >= startDateStr && activity.date <= endDateStr
        );

        // Calculate statistics
        const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0);
        const totalDays = new Set(attendanceRecords.map(r => r.date)).size;
        const completedActivities = activities.filter(a => a.status === 'completed').length;
        const pendingActivities = activities.filter(a => a.status === 'in-progress').length;

        return {
            hasData: attendanceRecords.length > 0 || activities.length > 0,
            period: period,
            startDate: startDateStr,
            endDate: endDateStr,
            attendanceRecords,
            activities,
            statistics: {
                totalHours,
                totalDays,
                averageHoursPerDay: totalDays > 0 ? (totalHours / totalDays) : 0,
                totalActivities: activities.length,
                completedActivities,
                pendingActivities,
                completionRate: activities.length > 0 ? (completedActivities / activities.length * 100) : 0
            }
        };
    }

    /**
     * Generate report document
     */
    generateReportDocument(reportData, reportType, currentUser) {
        // Create a new window with the report content
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            this.showNotification('Please allow popups to generate reports', 'warning');
            return;
        }

        const htmlContent = this.generateReportHTML(reportData, reportType, currentUser);

        // Write content to the new window
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Focus the new window
        printWindow.focus();

        // Auto-trigger print dialog after a short delay
        setTimeout(() => {
            printWindow.print();
        }, 500);

        this.showNotification('Report generated! Use the print dialog to save as PDF.', 'success');
    }

    /**
     * Generate report HTML content
     */
    generateReportHTML(reportData, reportType, currentUser) {
        const { statistics, attendanceRecords, activities, period, startDate, endDate } = reportData;

        const periodTitle = this.getPeriodTitle(period, startDate, endDate);
        const reportTitle = this.getReportTitle(reportType);

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${reportTitle} - ${currentUser.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.4;
            color: #000;
            background: #fff;
            padding: 20mm;
            font-size: 12pt;
        }

        .document-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
        }

        .logo {
            width: 60px;
            height: 60px;
            background: url('imgs/AGP-Logo.png') no-repeat center;
            background-size: contain;
            margin: 0 auto 10px;
        }

        .company-name {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .document-title {
            font-size: 16pt;
            font-weight: bold;
            margin: 15px 0;
            text-decoration: underline;
        }

        .report-info {
            margin: 25px 0;
            border: 2px solid #000;
            padding: 15px;
        }

        .info-row {
            display: flex;
            margin-bottom: 8px;
            align-items: baseline;
        }

        .info-label {
            font-weight: bold;
            min-width: 140px;
            margin-right: 10px;
        }

        .info-value {
            border-bottom: 1px solid #000;
            flex: 1;
            padding-bottom: 2px;
        }

        .statistics-section {
            margin: 30px 0;
        }

        .section-title {
            font-weight: bold;
            margin: 20px 0 15px 0;
            font-size: 14pt;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }

        .stat-item {
            padding: 10px;
            border: 1px solid #000;
            text-align: center;
        }

        .stat-value {
            font-size: 18pt;
            font-weight: bold;
            color: #000;
        }

        .stat-label {
            font-size: 10pt;
            margin-top: 5px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #000;
            margin-top: 15px;
        }

        .data-table th,
        .data-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
            vertical-align: top;
        }

        .data-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
            font-size: 11pt;
        }

        .data-table td {
            font-size: 10pt;
        }

        .document-footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #000;
            text-align: center;
            font-size: 10pt;
        }

        .print-instructions {
            background: #e3f2fd;
            border: 2px solid #2196f3;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            text-align: center;
        }

        .print-button {
            background: #2196f3;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin: 10px;
        }

        .print-button:hover {
            background: #1976d2;
        }

        @media print {
            .print-instructions {
                display: none;
            }

            body {
                padding: 15mm;
                font-size: 11pt;
            }
        }
    </style>
</head>
<body>
    <div class="print-instructions">
        <h3>📊 Report Generated Successfully</h3>
        <p>Click the "Print as PDF" button below or use Ctrl+P to save this report as a PDF.</p>
        <button class="print-button" onclick="window.print()">🖨️ Print as PDF</button>
        <button class="print-button" onclick="window.close()">❌ Close</button>
    </div>

    <div class="document-header">
        <div class="logo"></div>
        <div class="company-name">Atlantic, Gulf and Pacific Company</div>
        <div class="document-title">${reportTitle}</div>
    </div>

    <div class="report-info">
        <div class="info-row">
            <span class="info-label">Employee Name:</span>
            <span class="info-value">${currentUser.name}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Department:</span>
            <span class="info-value">${currentUser.department || 'IT Department'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Report Period:</span>
            <span class="info-value">${periodTitle}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Report Type:</span>
            <span class="info-value">${reportTitle}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Generated On:</span>
            <span class="info-value">${new Date().toLocaleString()}</span>
        </div>
    </div>

    ${this.generateReportContent(reportData, reportType)}

    <div class="document-footer">
        <p>This report was automatically generated by the AG&P Attendance Tracking System</p>
        <p>Generated on ${new Date().toLocaleString()} | Report ID: ${Date.now()}</p>
    </div>
</body>
</html>`;
    }

    /**
     * Generate report content based on type
     */
    generateReportContent(reportData, reportType) {
        const { statistics, attendanceRecords, activities } = reportData;

        let content = `
            <div class="statistics-section">
                <div class="section-title">Summary Statistics</div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${statistics.totalHours.toFixed(1)}</div>
                        <div class="stat-label">Total Hours</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${statistics.totalDays}</div>
                        <div class="stat-label">Days Worked</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${statistics.averageHoursPerDay.toFixed(1)}</div>
                        <div class="stat-label">Avg Hours/Day</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${statistics.totalActivities}</div>
                        <div class="stat-label">Total Activities</div>
                    </div>
                </div>
            </div>
        `;

        switch (reportType) {
            case 'attendance':
                content += this.generateAttendanceReport(attendanceRecords);
                break;
            case 'activities':
                content += this.generateActivitiesReport(activities);
                break;
            case 'productivity':
                content += this.generateProductivityReport(reportData);
                break;
            case 'detailed':
                content += this.generateAttendanceReport(attendanceRecords);
                content += this.generateActivitiesReport(activities);
                break;
            default:
                content += this.generateAttendanceReport(attendanceRecords);
        }

        return content;
    }

    /**
     * Generate attendance report section
     */
    generateAttendanceReport(attendanceRecords) {
        if (attendanceRecords.length === 0) {
            return `
                <div class="statistics-section">
                    <div class="section-title">Attendance Records</div>
                    <p>No attendance records found for the selected period.</p>
                </div>
            `;
        }

        const tableRows = attendanceRecords.map(record => `
            <tr>
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td>${record.timeIn || '-'}</td>
                <td>${record.timeOut || '-'}</td>
                <td>${(record.totalHours || 0).toFixed(1)}</td>
                <td>${record.status || 'Present'}</td>
            </tr>
        `).join('');

        return `
            <div class="statistics-section">
                <div class="section-title">Attendance Records</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time In</th>
                            <th>Time Out</th>
                            <th>Hours</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Generate activities report section
     */
    generateActivitiesReport(activities) {
        if (activities.length === 0) {
            return `
                <div class="statistics-section">
                    <div class="section-title">Activity Records</div>
                    <p>No activities found for the selected period.</p>
                </div>
            `;
        }

        const tableRows = activities.map(activity => `
            <tr>
                <td>${new Date(activity.date).toLocaleDateString()}</td>
                <td><strong>${activity.title}</strong></td>
                <td>${activity.assignedBy || '-'}</td>
                <td><span style="padding: 2px 6px; background: ${activity.status === 'completed' ? '#d4edda' : '#fff3cd'}; border-radius: 3px;">${activity.status}</span></td>
            </tr>
        `).join('');

        return `
            <div class="statistics-section">
                <div class="section-title">Activity Records</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Activity</th>
                            <th>Assigned By</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Generate productivity report section
     */
    generateProductivityReport(reportData) {
        const { statistics, attendanceRecords, activities } = reportData;

        return `
            <div class="statistics-section">
                <div class="section-title">Productivity Analysis</div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${statistics.completionRate.toFixed(1)}%</div>
                        <div class="stat-label">Task Completion Rate</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${statistics.completedActivities}</div>
                        <div class="stat-label">Completed Tasks</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${statistics.pendingActivities}</div>
                        <div class="stat-label">Pending Tasks</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${(statistics.totalActivities / Math.max(statistics.totalDays, 1)).toFixed(1)}</div>
                        <div class="stat-label">Tasks per Day</div>
                    </div>
                </div>
                <p style="margin-top: 20px; font-style: italic;">
                    This analysis shows your productivity metrics for the selected period.
                    A completion rate above 80% indicates excellent performance.
                </p>
            </div>
        `;
    }

    /**
     * Get period title for display
     */
    getPeriodTitle(period, startDate, endDate) {
        const start = new Date(startDate).toLocaleDateString();
        const end = new Date(endDate).toLocaleDateString();

        switch (period) {
            case 'week':
                return `This Week (${start} - ${end})`;
            case 'month':
                return `This Month (${start} - ${end})`;
            case 'quarter':
                return `This Quarter (${start} - ${end})`;
            case 'year':
                return `This Year (${start} - ${end})`;
            default:
                return `${start} - ${end}`;
        }
    }

    /**
     * Get report title based on type
     */
    getReportTitle(reportType) {
        switch (reportType) {
            case 'attendance':
                return 'ATTENDANCE SUMMARY REPORT';
            case 'activities':
                return 'ACTIVITY REPORT';
            case 'productivity':
                return 'PRODUCTIVITY ANALYSIS REPORT';
            case 'detailed':
                return 'DETAILED INTERNSHIP REPORT';
            default:
                return 'INTERNSHIP REPORT';
        }
    }
}

// Make AttendanceApp available globally
window.AttendanceApp = AttendanceApp;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.attendanceApp) {
        // Clear intervals
        Object.values(window.attendanceApp.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });

        // Save final state
        window.attendanceApp.saveApplicationState();
    }
});