/**
 * Main Application Entry Point
 * Modular Attendance Tracking System
 */

import { Dashboard } from './components/Dashboard.js';
import { ActivityLogger } from './components/ActivityLogger.js';
import { DateUtils } from './utils/dateUtils.js';
import { Formatters } from './utils/formatters.js';
import { storage } from './services/StorageService.js';

class AttendanceApp {
    constructor() {
        this.version = '2.0.0';
        this.initialized = false;
        this.eventListenersSetup = false;

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
                isAdmin: false,
                avatar: null
            }
        };

        // Component instances
        this.components = {
            dashboard: null,
            activityLogger: null,
            calendar: null,
            profile: null,
            adminPanel: null,
            reports: null
        };

        // Intervals for cleanup
        this.intervals = {
            time: null,
            save: null
        };
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) {
            console.log('App already initialized, skipping...');
            return;
        }

        console.log(`Initializing Attendance App v${this.version}...`);

        try {
            // Load user data and state
            await this.loadApplicationState();

            // Initialize components
            this.initializeComponents();

            // Setup event listeners
            this.setupEventListeners();

            // Setup intervals
            this.setupIntervals();

            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();

            // Initialize admin mode UI
            this.initializeAdminMode();

            // Set initial view
            this.changeView('dashboard');

            // Mark as initialized
            this.initialized = true;

            console.log('Application initialization complete');

            // Show welcome notification
            this.showNotification('Welcome to AG&P Attendance System!', 'success');

            // Add sample data for demo (only if no existing data)
            this.addSampleDataIfNeeded();

        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    }

    /**
     * Load application state from storage
     */
    async loadApplicationState() {
        try {
            // Load user data
            const userData = storage.getItem('userData');
            if (userData) {
                this.state.user = { ...this.state.user, ...userData };
            }

            // Load admin state
            const adminState = storage.getItem('adminState');
            if (adminState !== null) {
                this.state.user.isAdmin = adminState;
            }

            // Load time tracking state
            this.state.isTimedIn = storage.getItem('isTimedIn', false);
            this.state.currentTimeIn = storage.getItem('currentTimeIn');

            // Load current view
            this.state.currentView = storage.getItem('currentView', 'dashboard');

            console.log('Application state loaded:', {
                user: this.state.user.name,
                isAdmin: this.state.user.isAdmin,
                currentView: this.state.currentView
            });

        } catch (error) {
            console.error('Failed to load application state:', error);
        }
    }

    /**
     * Save application state to storage
     */
    saveApplicationState() {
        try {
            // Save user data (without sensitive info)
            const userDataToSave = { ...this.state.user };
            delete userDataToSave.isAdmin; // Save admin state separately
            storage.setItem('userData', userDataToSave);

            // Save admin state separately for security
            storage.setItem('adminState', this.state.user.isAdmin);

            // Save time tracking state
            storage.setItem('isTimedIn', this.state.isTimedIn);
            storage.setItem('currentTimeIn', this.state.currentTimeIn);

            // Save current view
            storage.setItem('currentView', this.state.currentView);

        } catch (error) {
            console.error('Failed to save application state:', error);
        }
    }

    /**
     * Initialize all components
     */
    initializeComponents() {
        // Initialize Dashboard
        this.components.dashboard = new Dashboard(this);
        this.components.dashboard.init();

        // Initialize Activity Logger
        this.components.activityLogger = new ActivityLogger(this);
        this.components.activityLogger.init();

        // TODO: Initialize other components as they are created
        // this.components.calendar = new Calendar(this);
        // this.components.profile = new Profile(this);
        // this.components.adminPanel = new AdminPanel(this);
        // this.components.reports = new Reports(this);
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        if (this.eventListenersSetup) {
            console.log('Event listeners already setup, skipping...');
            return;
        }

        // Navigation
        document.getElementById('nav-dashboard')?.addEventListener('click', () => this.changeView('dashboard'));
        document.getElementById('nav-activity')?.addEventListener('click', () => this.changeView('activity'));
        document.getElementById('nav-profile')?.addEventListener('click', () => this.changeView('profile'));
        document.getElementById('nav-admin')?.addEventListener('click', () => this.changeView('admin'));
        document.getElementById('nav-reports')?.addEventListener('click', () => this.changeView('reports'));

        // Admin mode toggle
        const adminToggleBtn = document.getElementById('admin-mode-toggle');
        if (adminToggleBtn && !adminToggleBtn.hasAttribute('data-listener-attached')) {
            adminToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleAdminMode();
            });
            adminToggleBtn.setAttribute('data-listener-attached', 'true');
        }

        // Time tracking buttons
        document.getElementById('time-in-btn')?.addEventListener('click', () => this.timeIn());
        document.getElementById('time-out-btn')?.addEventListener('click', () => this.timeOut());

        // Barcode scanner
        document.getElementById('barcode-scan-btn')?.addEventListener('click', () => this.simulateBarcodeScanner());

        // Activity logger button
        document.getElementById('add-activity-btn')?.addEventListener('click', () => this.openActivityModal());

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.style.display = 'none';
            }
        });

        // Storage change listener for cross-tab sync
        storage.onStorageChange((change) => {
            this.handleStorageChange(change);
        });

        this.eventListenersSetup = true;
        console.log('Event listeners setup complete');
    }

    /**
     * Setup application intervals
     */
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

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when not typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.key) {
                case '1':
                    this.changeView('dashboard');
                    break;
                case '2':
                    this.changeView('activity');
                    break;
                case '3':
                    this.changeView('profile');
                    break;
                case '4':
                    this.changeView('reports');
                    break;
                case 'a':
                case 'A':
                    this.toggleAdminMode();
                    break;
                case 'b':
                case 'B':
                    this.simulateBarcodeScanner();
                    break;
                case 'Escape':
                    this.closeAllModals();
                    break;
            }

            // Ctrl+S to save
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveApplicationState();
                this.showNotification('Data saved successfully', 'success');
            }
        });
    }

    /**
     * Initialize admin mode UI
     */
    initializeAdminMode() {
        const adminModeToggle = document.getElementById('admin-mode-toggle');
        const adminNavItem = document.getElementById('nav-admin');

        // Set initial button text
        if (adminModeToggle) {
            adminModeToggle.innerHTML = this.state.user.isAdmin ?
                '<i class="fas fa-user"></i><span>Switch to Intern Mode</span>' :
                '<i class="fas fa-user-shield"></i><span>Switch to Admin Mode</span>';
        }

        // Set initial admin nav visibility
        if (adminNavItem) {
            adminNavItem.style.display = this.state.user.isAdmin ? 'flex' : 'none';
        }

        console.log(`Admin mode initialized: ${this.state.user.isAdmin}`);
    }

    /**
     * Change application view
     */
    changeView(view) {
        // Check admin access
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

        // Refresh component data when switching views
        this.refreshCurrentComponent();

        console.log(`Switched to ${view} view (Admin: ${this.state.user.isAdmin})`);
    }

    /**
     * Refresh current component
     */
    refreshCurrentComponent() {
        const component = this.components[this.state.currentView];
        if (component && typeof component.refresh === 'function') {
            component.refresh();
        }
    }

    /**
     * Toggle admin mode
     */
    toggleAdminMode() {
        // Prevent rapid toggling
        if (this.adminToggleTimeout) {
            clearTimeout(this.adminToggleTimeout);
        }

        this.adminToggleTimeout = setTimeout(() => {
            this.performAdminToggle();
        }, 100);
    }

    /**
     * Perform admin mode toggle
     */
    performAdminToggle() {
        console.log(`Toggling admin mode. Current state: ${this.state.user.isAdmin}`);

        this.state.user.isAdmin = !this.state.user.isAdmin;

        // Update UI
        this.initializeAdminMode();

        // Handle view switching
        if (!this.state.user.isAdmin && this.state.currentView === 'admin') {
            this.changeView('dashboard');
        }

        // Save state
        this.saveApplicationState();

        // Show notification
        this.showNotification(
            `Switched to ${this.state.user.isAdmin ? 'Admin' : 'Intern'} Mode`,
            'info'
        );

        console.log(`Admin mode toggled to: ${this.state.user.isAdmin}`);
    }

    /**
     * Handle storage changes from other tabs
     */
    handleStorageChange(change) {
        console.log('Storage change detected:', change);

        // Refresh current component if relevant data changed
        if (change.key === 'activitiesData' || change.key === 'attendanceRecords') {
            this.refreshCurrentComponent();
        }
    }

    /**
     * Show notification to user
     */
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

    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
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
     * Update work status
     */
    updateWorkStatus() {
        // This will be handled by individual components
        if (this.components.dashboard) {
            this.components.dashboard.updateWorkStatus();
        }
    }

    /**
     * Close all open modals
     */
    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    /**
     * Time in functionality
     */
    timeIn() {
        if (this.state.isTimedIn) {
            this.showNotification('You are already timed in!', 'warning');
            return;
        }

        this.state.isTimedIn = true;
        this.state.currentTimeIn = new Date().toISOString();
        this.saveApplicationState();

        this.showNotification('Successfully timed in!', 'success');
        this.updateWorkStatus();
    }

    /**
     * Time out functionality
     */
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

        this.showNotification(`Successfully timed out! Worked ${DateUtils.formatDuration(duration.totalHours)}`, 'success');
        this.updateWorkStatus();
    }

    /**
     * Save attendance record
     */
    saveAttendanceRecord(timeIn, timeOut, totalHours) {
        const records = storage.getItem('attendanceRecords', []);
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

        records.unshift(record);
        storage.setItem('attendanceRecords', records);
    }

    /**
     * Simulate barcode scanner
     */
    simulateBarcodeScanner() {
        // Create barcode scanner modal
        this.showBarcodeScanner();
    }

    /**
     * Show barcode scanner modal
     */
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

    /**
     * Process barcode input
     */
    processBarcodeInput(barcode) {
        if (!barcode || barcode.trim() === '') {
            this.showNotification('Please scan a valid barcode', 'error');
            return;
        }

        console.log('Barcode scanned:', barcode);

        // For demo purposes, accept any barcode and toggle time in/out
        if (this.state.isTimedIn) {
            this.timeOut();
        } else {
            this.timeIn();
        }
    }

    /**
     * Open activity modal
     */
    openActivityModal(activityId = null, selectedDate = null) {
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

        // Set the date if provided
        if (selectedDate) {
            const dateInput = modal.querySelector('#activity-date');
            if (dateInput) {
                dateInput.value = selectedDate;
            }
        }

        // Show modal
        modal.style.display = 'flex';

        // Focus on title input
        setTimeout(() => {
            modal.querySelector('#activity-title').focus();
        }, 100);
    }

    /**
     * Save activity from modal
     */
    saveActivity() {
        const title = document.getElementById('activity-title').value.trim();
        const description = document.getElementById('activity-description').value.trim();
        const date = document.getElementById('activity-date').value;
        const status = document.getElementById('activity-status').value;
        const tagsInput = document.getElementById('activity-tags').value.trim();

        if (!title || !description) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

        const activityData = {
            title,
            description,
            date,
            status,
            tags,
            userId: this.state.user.id,
            userName: this.state.user.name
        };

        // Save through activity logger component
        if (this.components.activityLogger) {
            this.components.activityLogger.addActivity(activityData);
        }

        // Close modal
        document.getElementById('activity-modal').style.display = 'none';

        // Clear form
        document.getElementById('activity-form').reset();
        document.getElementById('activity-date').value = DateUtils.getCurrentDateISO();

        this.showNotification('Activity logged successfully!', 'success');
    }

    /**
     * Add sample data for demonstration
     */
    addSampleDataIfNeeded() {
        // Only add sample data if no existing data
        const existingRecords = storage.getItem('attendanceRecords', []);
        const existingActivities = storage.getItem('activitiesData', []);

        if (existingRecords.length === 0) {
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
            storage.setItem('attendanceRecords', sampleRecords);
        }

        if (existingActivities.length === 0) {
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
            storage.setItem('activitiesData', sampleActivities);
        }
    }

    /**
     * Cleanup application
     */
    destroy() {
        // Clear intervals
        Object.values(this.intervals).forEach(interval => {
            if (interval) clearInterval(interval);
        });

        // Destroy components
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });

        // Save final state
        this.saveApplicationState();

        console.log('Application destroyed');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.attendanceApp = new AttendanceApp();
    window.attendanceApp.init();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.attendanceApp) {
        window.attendanceApp.destroy();
    }
});

export default AttendanceApp;
