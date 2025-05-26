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
    }

    /**
     * Initialize activity logger
     */
    init() {
        this.loadActivities();
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
                    <button class="action-btn primary" id="add-activity-btn">
                        <i class="fas fa-plus"></i>
                        <span>Log Activity</span>
                    </button>
                    <button class="action-btn secondary" id="view-calendar-btn">
                        <i class="fas fa-calendar"></i>
                        <span>Calendar View</span>
                    </button>
                    <button class="action-btn secondary" id="generate-activity-report-btn">
                        <i class="fas fa-file-pdf"></i>
                        <span>Generate Report</span>
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
     * Export activities data
     */
    exportActivities() {
        const data = {
            activities: this.activities,
            exportDate: new Date().toISOString(),
            totalCount: this.activities.length
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activities_export_${DateUtils.getCurrentDateISO()}.json`;
        a.click();
        URL.revokeObjectURL(url);
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
