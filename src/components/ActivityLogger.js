/**
 * Activity Logger Component
 * Handles daily activity logging functionality
 */

import { DateUtils } from '../utils/dateUtils.js';
import { Formatters } from '../utils/formatters.js';
import { storage } from '../services/StorageService.js';

export class ActivityLogger {
    constructor(app) {
        this.app = app;
        this.activities = [];
        this.selectedTags = [];
        this.uploadedPhotos = [];
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.currentView = 'list'; // 'list' or 'calendar'
        this.currentDate = new Date();
        this.selectedDate = null;
    }

    /**
     * Initialize activity logger
     */
    init() {
        this.loadActivities();
        this.addSampleActivities(); // Add sample data for testing
        this.render();
        this.setupEventListeners();
    }

    /**
     * Load activities from storage
     */
    loadActivities() {
        this.activities = storage.getItem('activitiesData', []);
    }

    /**
     * Save activities to storage
     */
    saveActivities() {
        storage.setItem('activitiesData', this.activities);
    }

    /**
     * Render activity logger UI
     */
    render() {
        const container = document.getElementById('activity-section');
        if (!container) return;

        container.innerHTML = this.getTemplate();
        this.renderActivityFeed();
        this.updateActivityStats();
    }

    /**
     * Get activity logger HTML template
     */
    getTemplate() {
        return `
            <div class="section-header">
                <h1>
                    <i class="fas fa-tasks"></i>
                    Daily Activities
                </h1>
                <div class="actions">
                    <button class="action-btn secondary" id="calendar-view-btn">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Calendar View</span>
                    </button>
                    <button class="action-btn secondary" id="export-activities-btn">
                        <i class="fas fa-file-pdf"></i>
                        <span>Export PDF</span>
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
                        <div class="stat-value" id="total-activities">0</div>
                        <div class="stat-label">Total Activities</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" id="completed-activities">0</div>
                        <div class="stat-label">Completed</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" id="pending-activities">0</div>
                        <div class="stat-label">In Progress</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-camera"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value" id="total-photos">0</div>
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

            <!-- Calendar View -->
            <div class="calendar-container" id="calendar-container" style="display: none;">
                <div class="calendar-header">
                    <button class="calendar-nav-btn" id="prev-month-btn">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <h3 id="calendar-month-year"></h3>
                    <button class="calendar-nav-btn" id="next-month-btn">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                <div class="calendar-grid" id="calendar-grid">
                    <!-- Calendar will be rendered here -->
                </div>
                <div class="calendar-legend">
                    <div class="legend-item">
                        <div class="legend-color has-activities"></div>
                        <span>Has Activities</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color selected-date"></div>
                        <span>Selected Date</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color today"></div>
                        <span>Today</span>
                    </div>
                </div>
                <div class="selected-date-activities" id="selected-date-activities">
                    <h4>Activities for <span id="selected-date-display">Select a date</span></h4>
                    <div class="date-activities-list" id="date-activities-list">
                        <p>Click on a date to view activities</p>
                    </div>
                    <button class="action-btn primary" id="add-activity-for-date" style="display: none;">
                        <i class="fas fa-plus"></i>
                        <span>Add Activity for This Date</span>
                    </button>
                </div>
            </div>

            <!-- Activity Feed -->
            <div class="activity-feed" id="activity-feed">
                <div class="activity-placeholder">
                    <i class="fas fa-tasks"></i>
                    <h3>No Activities Yet</h3>
                    <p>Start logging your daily activities to track your progress and productivity.</p>
                    <button class="action-btn primary" onclick="document.getElementById('add-activity-btn').click()">
                        <i class="fas fa-plus"></i>
                        <span>Log Your First Activity</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Render activity feed
     */
    renderActivityFeed() {
        const container = document.getElementById('activity-feed');
        if (!container) return;

        const filteredActivities = this.getFilteredActivities();

        if (filteredActivities.length === 0) {
            container.innerHTML = `
                <div class="activity-placeholder">
                    <i class="fas fa-tasks"></i>
                    <h3>No Activities Found</h3>
                    <p>Try adjusting your filters or log a new activity.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredActivities.map(activity => this.getActivityCardHTML(activity)).join('');
    }

    /**
     * Get filtered and sorted activities
     */
    getFilteredActivities() {
        let filtered = [...this.activities];

        // Apply status filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(activity => activity.status === this.currentFilter);
        }

        // Apply search filter
        const searchTerm = document.getElementById('activity-search')?.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(activity =>
                activity.title.toLowerCase().includes(searchTerm) ||
                activity.description.toLowerCase().includes(searchTerm) ||
                (activity.tags && activity.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'oldest':
                    return new Date(a.timestamp) - new Date(b.timestamp);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'status':
                    return a.status.localeCompare(b.status);
                case 'newest':
                default:
                    return new Date(b.timestamp) - new Date(a.timestamp);
            }
        });

        return filtered;
    }

    /**
     * Get activity card HTML
     */
    getActivityCardHTML(activity) {
        const statusInfo = Formatters.formatStatus(activity.status);
        const relativeTime = DateUtils.getRelativeTime(activity.timestamp);
        const formattedDate = DateUtils.formatDate(activity.date, 'short');

        return `
            <div class="activity-card" data-activity-id="${activity.id}">
                <div class="activity-header">
                    <div class="activity-status ${activity.status}">
                        <i class="fas fa-${activity.status === 'completed' ? 'check-circle' : 'clock'}"></i>
                        <span>${statusInfo.text}</span>
                    </div>
                    <div class="activity-time">${relativeTime}</div>
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

                    <div class="activity-meta">
                        <i class="fas fa-calendar"></i>
                        <span>Activity Date: ${formattedDate}</span>
                    </div>

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
                            <div class="photos-grid">
                                ${activity.photos.slice(0, 3).map(photo => `
                                    <div class="photo-thumbnail" onclick="this.parentElement.parentElement.querySelector('.photos-modal').style.display='flex'">
                                        <img src="${photo.data}" alt="Activity photo" loading="lazy">
                                    </div>
                                `).join('')}
                                ${activity.photos.length > 3 ? `
                                    <div class="photo-more">+${activity.photos.length - 3} more</div>
                                ` : ''}
                            </div>
                            <div class="photos-modal" onclick="if(event.target === this) this.style.display='none'">
                                <div class="photos-modal-content">
                                    <button class="close-btn" onclick="this.closest('.photos-modal').style.display='none'">&times;</button>
                                    <div class="photos-carousel">
                                        ${activity.photos.map(photo => `
                                            <img src="${photo.data}" alt="Activity photo">
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="activity-actions">
                    <button class="action-btn small secondary" onclick="activityLogger.editActivity('${activity.id}')">
                        <i class="fas fa-edit"></i>
                        <span>Edit</span>
                    </button>
                    <button class="action-btn small danger" onclick="activityLogger.deleteActivity('${activity.id}')">
                        <i class="fas fa-trash"></i>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Update activity statistics
     */
    updateActivityStats() {
        const totalActivities = this.activities.length;
        const completedActivities = this.activities.filter(a => a.status === 'completed').length;
        const pendingActivities = this.activities.filter(a => a.status === 'in-progress').length;
        const totalPhotos = this.activities.reduce((sum, a) => sum + (a.photos ? a.photos.length : 0), 0);

        document.getElementById('total-activities').textContent = totalActivities;
        document.getElementById('completed-activities').textContent = completedActivities;
        document.getElementById('pending-activities').textContent = pendingActivities;
        document.getElementById('total-photos').textContent = totalPhotos;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Calendar view button
        const calendarViewBtn = document.getElementById('calendar-view-btn');
        if (calendarViewBtn) {
            calendarViewBtn.addEventListener('click', () => {
                this.toggleView();
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-activities-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.showExportOptionsModal();
            });
        }

        // Filter and sort controls
        const filterSelect = document.getElementById('activity-filter');
        const sortSelect = document.getElementById('activity-sort');
        const searchInput = document.getElementById('activity-search');

        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderActivityFeed();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.renderActivityFeed();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderActivityFeed();
            });
        }
    }

    /**
     * Add new activity
     */
    addActivity(activityData) {
        const activity = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            userId: this.app.user.id,
            userName: this.app.user.name,
            ...activityData
        };

        this.activities.unshift(activity);
        this.saveActivities();
        this.renderActivityFeed();
        this.updateActivityStats();

        return activity;
    }

    /**
     * Edit existing activity
     */
    editActivity(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) return;

        // Open activity modal with existing data
        this.app.openActivityModal(activityId);
    }

    /**
     * Delete activity
     */
    deleteActivity(activityId) {
        if (!confirm('Are you sure you want to delete this activity?')) return;

        this.activities = this.activities.filter(a => a.id !== activityId);
        this.saveActivities();
        this.renderActivityFeed();
        this.updateActivityStats();

        this.app.showNotification('Activity deleted successfully', 'success');
    }

    /**
     * Get activities for date range
     */
    getActivitiesForDateRange(startDate, endDate) {
        return this.activities.filter(activity => {
            const activityDate = new Date(activity.date);
            return activityDate >= startDate && activityDate <= endDate;
        });
    }

    /**
     * Get activities by status
     */
    getActivitiesByStatus(status) {
        return this.activities.filter(activity => activity.status === status);
    }

    /**
     * Get activities by tag
     */
    getActivitiesByTag(tag) {
        return this.activities.filter(activity =>
            activity.tags && activity.tags.includes(tag)
        );
    }

    /**
     * Get all unique tags
     */
    getAllTags() {
        const allTags = this.activities.flatMap(activity => activity.tags || []);
        return [...new Set(allTags)].sort();
    }

    /**
     * Toggle between list and calendar view
     */
    toggleView() {
        this.currentView = this.currentView === 'list' ? 'calendar' : 'list';

        const calendarContainer = document.getElementById('calendar-container');
        const activityFeed = document.getElementById('activity-feed');
        const calendarBtn = document.getElementById('calendar-view-btn');

        if (this.currentView === 'calendar') {
            calendarContainer.style.display = 'block';
            activityFeed.style.display = 'none';
            calendarBtn.innerHTML = '<i class="fas fa-list"></i><span>List View</span>';
            this.renderCalendar();
            this.setupCalendarEventListeners();
        } else {
            calendarContainer.style.display = 'none';
            activityFeed.style.display = 'block';
            calendarBtn.innerHTML = '<i class="fas fa-calendar-alt"></i><span>Calendar View</span>';
        }
    }

    /**
     * Render calendar
     */
    renderCalendar() {
        const monthYearElement = document.getElementById('calendar-month-year');
        const calendarGrid = document.getElementById('calendar-grid');

        if (!monthYearElement || !calendarGrid) return;

        // Set month/year header
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        monthYearElement.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        // Generate calendar grid
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

        let calendarHTML = `
            <div class="calendar-weekdays">
                <div class="weekday">Sun</div>
                <div class="weekday">Mon</div>
                <div class="weekday">Tue</div>
                <div class="weekday">Wed</div>
                <div class="weekday">Thu</div>
                <div class="weekday">Fri</div>
                <div class="weekday">Sat</div>
            </div>
            <div class="calendar-days">
        `;

        const today = new Date();
        const currentDate = new Date(startDate);

        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const dateStr = DateUtils.formatDate(currentDate, 'iso');
                const activitiesForDate = this.getActivitiesForDate(dateStr);
                const isToday = DateUtils.isSameDay(currentDate, today);
                const isCurrentMonth = currentDate.getMonth() === this.currentDate.getMonth();
                const isSelected = this.selectedDate && DateUtils.isSameDay(currentDate, new Date(this.selectedDate));

                let dayClasses = ['calendar-day'];
                if (!isCurrentMonth) dayClasses.push('other-month');
                if (isToday) dayClasses.push('today');
                if (isSelected) dayClasses.push('selected');
                if (activitiesForDate.length > 0) dayClasses.push('has-activities');

                calendarHTML += `
                    <div class="${dayClasses.join(' ')}" data-date="${dateStr}">
                        <span class="day-number">${currentDate.getDate()}</span>
                        ${activitiesForDate.length > 0 ? `<span class="activity-count">${activitiesForDate.length}</span>` : ''}
                    </div>
                `;

                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        calendarHTML += '</div>';
        calendarGrid.innerHTML = calendarHTML;
    }

    /**
     * Setup calendar event listeners
     */
    setupCalendarEventListeners() {
        // Month navigation
        const prevBtn = document.getElementById('prev-month-btn');
        const nextBtn = document.getElementById('next-month-btn');

        if (prevBtn) {
            prevBtn.onclick = () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
                this.setupCalendarEventListeners();
            };
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
                this.setupCalendarEventListeners();
            };
        }

        // Day selection
        const dayElements = document.querySelectorAll('.calendar-day');
        dayElements.forEach(dayElement => {
            dayElement.addEventListener('click', () => {
                const dateStr = dayElement.getAttribute('data-date');
                this.selectDate(dateStr);
            });
        });

        // Add activity for selected date
        const addActivityBtn = document.getElementById('add-activity-for-date');
        if (addActivityBtn) {
            addActivityBtn.onclick = () => {
                if (this.selectedDate) {
                    this.app.openActivityModal(null, this.selectedDate);
                }
            };
        }
    }

    /**
     * Select a date on the calendar
     */
    selectDate(dateStr) {
        this.selectedDate = dateStr;

        // Update calendar display
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        document.querySelector(`[data-date="${dateStr}"]`)?.classList.add('selected');

        // Update selected date activities
        this.renderSelectedDateActivities(dateStr);
    }

    /**
     * Render activities for selected date
     */
    renderSelectedDateActivities(dateStr) {
        const selectedDateDisplay = document.getElementById('selected-date-display');
        const dateActivitiesList = document.getElementById('date-activities-list');
        const addActivityBtn = document.getElementById('add-activity-for-date');

        if (!selectedDateDisplay || !dateActivitiesList || !addActivityBtn) return;

        const formattedDate = DateUtils.formatDate(dateStr, 'full');
        selectedDateDisplay.textContent = formattedDate;

        const activitiesForDate = this.getActivitiesForDate(dateStr);

        if (activitiesForDate.length === 0) {
            dateActivitiesList.innerHTML = '<p>No activities logged for this date</p>';
        } else {
            dateActivitiesList.innerHTML = activitiesForDate.map(activity => `
                <div class="date-activity-item">
                    <div class="activity-status-indicator ${activity.status}"></div>
                    <div class="activity-info">
                        <h5>${Formatters.escapeHtml(activity.title)}</h5>
                        <p>${Formatters.escapeHtml(activity.description)}</p>
                        ${activity.assignedBy ? `<small>Assigned by: ${Formatters.escapeHtml(activity.assignedBy)}</small>` : ''}
                    </div>
                    <div class="activity-actions-mini">
                        <button class="btn-mini" onclick="activityLogger.editActivity('${activity.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-mini danger" onclick="activityLogger.deleteActivity('${activity.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        addActivityBtn.style.display = 'block';
    }

    /**
     * Get activities for a specific date
     */
    getActivitiesForDate(dateStr) {
        return this.activities.filter(activity => activity.date === dateStr);
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
                            <i class="fas fa-file-pdf"></i>
                            Export Activities as PDF
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
                                    <option value="pdf">PDF Document</option>
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
                                <i class="fas fa-file-pdf"></i>
                                <span>Generate PDF</span>
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
        try {
            const dateRange = document.getElementById('export-date-range').value;
            const statusFilter = document.getElementById('export-status-filter').value;
            const format = document.getElementById('export-format').value;
            const includeSummary = document.getElementById('include-summary').checked;
            const includeTags = document.getElementById('include-tags').checked;

            // Get filtered activities
            const filteredActivities = this.getFilteredActivitiesForExport(dateRange, statusFilter);

            if (filteredActivities.length === 0) {
                this.app.showNotification('No activities found for the selected criteria', 'warning');
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
                this.app.showNotification('HTML document generated successfully!', 'success');
            } else {
                // Generate PDF document
                this.generatePDFDocument(filteredActivities, {
                    dateRange,
                    statusFilter,
                    includeSummary,
                    includeTags
                });
                this.app.showNotification('PDF export window opened! Use the print dialog to save as PDF.', 'success');
            }
        } catch (error) {
            console.error('Document generation error:', error);
            this.app.showNotification('Error generating document. Please try again.', 'error');
        }
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

        // Get current user information
        const currentUser = window.userDatabase?.getCurrentUser() || { name: 'Unknown User', department: 'IT Department' };

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Internship Activity Report - ${currentUser.name}</title>
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
            <span class="info-value">${currentUser.name}</span>
            <span class="info-label" style="margin-left: 40px;">Course:</span>
            <span class="info-value">BSIT</span>
        </div>
        <div class="info-row">
            <span class="info-label">Company:</span>
            <span class="info-value">Atlantic, Gulf and Pacific Company</span>
            <span class="info-label" style="margin-left: 40px;">Dept:</span>
            <span class="info-value">${currentUser.department || 'IT Department'}</span>
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
        link.download = `Activity_Report_${currentUser.name.replace(/\s+/g, '_')}_${DateUtils.getCurrentDateISO()}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Generate PDF document using browser's print functionality
     */
    generatePDFDocument(activities, options) {
        const { dateRange, statusFilter, includeSummary, includeTags } = options;

        // Get current user information
        const currentUser = window.userDatabase?.getCurrentUser() || { name: 'Unknown User', department: 'IT Department' };

        // Create a new window with the document content
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            this.app.showNotification('Please allow popups to generate PDF documents', 'warning');
            return;
        }

        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Internship Activity Report - ${currentUser.name}</title>
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

            .no-print {
                display: none !important;
            }
        }

        .print-instructions {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
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
    </style>
</head>
<body>
    <div class="print-instructions no-print">
        <h3>📄 PDF Export Instructions</h3>
        <p>Click the "Print as PDF" button below or use Ctrl+P to save this document as a PDF.</p>
        <button class="print-button" onclick="window.print()">🖨️ Print as PDF</button>
        <button class="print-button" onclick="window.close()">❌ Close</button>
    </div>

    <div class="document-header">
        <div class="logo"></div>
        <div class="company-name">Atlantic, Gulf and Pacific Company</div>
        <div class="document-title">INTERNSHIP ACTIVITY REPORT</div>
    </div>

    <div class="student-info">
        <div class="info-row">
            <span class="info-label">Student Name:</span>
            <span class="info-value">${currentUser.name}</span>
            <span class="info-label" style="margin-left: 40px;">Course:</span>
            <span class="info-value">BSIT</span>
        </div>
        <div class="info-row">
            <span class="info-label">Company:</span>
            <span class="info-value">Atlantic, Gulf and Pacific Company</span>
            <span class="info-label" style="margin-left: 40px;">Dept:</span>
            <span class="info-value">${currentUser.department || 'IT Department'}</span>
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

        // Write content to the new window
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Focus the new window
        printWindow.focus();

        // Auto-trigger print dialog after a short delay
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }

    /**
     * Calculate total practicum hours
     */
    calculateTotalHours() {
        // This would typically come from attendance records
        // For now, return a default value
        return 486;
    }

    /**
     * Add sample activities for testing (development only)
     */
    addSampleActivities() {
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

        // Add sample activities if none exist
        if (this.activities.length === 0) {
            this.activities = sampleActivities;
            this.saveActivities();
            this.renderActivityFeed();
            this.updateActivityStats();
            console.log('Sample activities added for testing');
        }
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

    /**
     * Refresh activity logger
     */
    refresh() {
        this.loadActivities();
        this.renderActivityFeed();
        this.updateActivityStats();
    }
}

export default ActivityLogger;
