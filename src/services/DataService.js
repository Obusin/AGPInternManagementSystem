/**
 * Data Service
 * Centralized data management and business logic
 */

import { storage } from './StorageService.js';
import { DateUtils } from '../utils/dateUtils.js';

export class DataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get attendance records with optional filtering
     * @param {Object} filters - Filter options
     * @returns {Array} Filtered attendance records
     */
    getAttendanceRecords(filters = {}) {
        const cacheKey = 'attendance_' + JSON.stringify(filters);
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        let records = storage.getItem('attendanceRecords', []);

        // Apply filters
        if (filters.userId) {
            records = records.filter(r => r.userId === filters.userId);
        }

        if (filters.startDate) {
            records = records.filter(r => new Date(r.date) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            records = records.filter(r => new Date(r.date) <= new Date(filters.endDate));
        }

        if (filters.status) {
            records = records.filter(r => r.status === filters.status);
        }

        // Sort by date (newest first)
        records.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Cache the result
        this.cache.set(cacheKey, {
            data: records,
            timestamp: Date.now()
        });

        return records;
    }

    /**
     * Save attendance record
     * @param {Object} recordData - Attendance record data
     * @returns {Object} Saved record
     */
    saveAttendanceRecord(recordData) {
        const records = storage.getItem('attendanceRecords', []);
        
        const record = {
            id: recordData.id || Date.now().toString(),
            date: recordData.date || DateUtils.getCurrentDateISO(),
            timeIn: recordData.timeIn,
            timeOut: recordData.timeOut,
            totalHours: recordData.totalHours || 0,
            userId: recordData.userId,
            userName: recordData.userName,
            status: recordData.status || 'completed',
            timestamp: new Date().toISOString(),
            ...recordData
        };

        // Check if record already exists (update scenario)
        const existingIndex = records.findIndex(r => r.id === record.id);
        if (existingIndex !== -1) {
            records[existingIndex] = record;
        } else {
            records.unshift(record);
        }

        storage.setItem('attendanceRecords', records);
        this.clearCache('attendance');

        return record;
    }

    /**
     * Delete attendance record
     * @param {string} recordId - Record ID to delete
     * @returns {boolean} Success status
     */
    deleteAttendanceRecord(recordId) {
        const records = storage.getItem('attendanceRecords', []);
        const filteredRecords = records.filter(r => r.id !== recordId);
        
        if (filteredRecords.length !== records.length) {
            storage.setItem('attendanceRecords', filteredRecords);
            this.clearCache('attendance');
            return true;
        }
        
        return false;
    }

    /**
     * Get activities with optional filtering
     * @param {Object} filters - Filter options
     * @returns {Array} Filtered activities
     */
    getActivities(filters = {}) {
        const cacheKey = 'activities_' + JSON.stringify(filters);
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        let activities = storage.getItem('activitiesData', []);

        // Apply filters
        if (filters.userId) {
            activities = activities.filter(a => a.userId === filters.userId);
        }

        if (filters.status) {
            activities = activities.filter(a => a.status === filters.status);
        }

        if (filters.startDate) {
            activities = activities.filter(a => new Date(a.date) >= new Date(filters.startDate));
        }

        if (filters.endDate) {
            activities = activities.filter(a => new Date(a.date) <= new Date(filters.endDate));
        }

        if (filters.tags && filters.tags.length > 0) {
            activities = activities.filter(a => 
                a.tags && a.tags.some(tag => filters.tags.includes(tag))
            );
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            activities = activities.filter(a => 
                a.title.toLowerCase().includes(searchTerm) ||
                a.description.toLowerCase().includes(searchTerm) ||
                (a.tags && a.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
        }

        // Sort by timestamp (newest first)
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Cache the result
        this.cache.set(cacheKey, {
            data: activities,
            timestamp: Date.now()
        });

        return activities;
    }

    /**
     * Save activity
     * @param {Object} activityData - Activity data
     * @returns {Object} Saved activity
     */
    saveActivity(activityData) {
        const activities = storage.getItem('activitiesData', []);
        
        const activity = {
            id: activityData.id || Date.now().toString(),
            title: activityData.title,
            description: activityData.description,
            date: activityData.date || DateUtils.getCurrentDateISO(),
            status: activityData.status || 'in-progress',
            tags: activityData.tags || [],
            photos: activityData.photos || [],
            userId: activityData.userId,
            userName: activityData.userName,
            assignedBy: activityData.assignedBy,
            timestamp: activityData.timestamp || new Date().toISOString(),
            ...activityData
        };

        // Check if activity already exists (update scenario)
        const existingIndex = activities.findIndex(a => a.id === activity.id);
        if (existingIndex !== -1) {
            activities[existingIndex] = activity;
        } else {
            activities.unshift(activity);
        }

        storage.setItem('activitiesData', activities);
        this.clearCache('activities');

        return activity;
    }

    /**
     * Delete activity
     * @param {string} activityId - Activity ID to delete
     * @returns {boolean} Success status
     */
    deleteActivity(activityId) {
        const activities = storage.getItem('activitiesData', []);
        const filteredActivities = activities.filter(a => a.id !== activityId);
        
        if (filteredActivities.length !== activities.length) {
            storage.setItem('activitiesData', filteredActivities);
            this.clearCache('activities');
            return true;
        }
        
        return false;
    }

    /**
     * Get user statistics
     * @param {string} userId - User ID
     * @param {Object} options - Options for calculation
     * @returns {Object} User statistics
     */
    getUserStats(userId, options = {}) {
        const { period = 'month' } = options;
        
        let startDate, endDate;
        const now = new Date();

        switch (period) {
            case 'week':
                ({ start: startDate, end: endDate } = DateUtils.getWeekRange(now));
                break;
            case 'month':
                ({ start: startDate, end: endDate } = DateUtils.getMonthRange(now));
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
                break;
            default:
                startDate = options.startDate ? new Date(options.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = options.endDate ? new Date(options.endDate) : now;
        }

        const attendanceRecords = this.getAttendanceRecords({
            userId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

        const activities = this.getActivities({
            userId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });

        const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0);
        const daysWorked = new Set(attendanceRecords.map(record => record.date)).size;
        const averageHours = daysWorked > 0 ? totalHours / daysWorked : 0;

        const completedActivities = activities.filter(a => a.status === 'completed').length;
        const totalActivities = activities.length;
        const activityCompletionRate = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;

        return {
            period,
            startDate,
            endDate,
            attendance: {
                totalHours,
                daysWorked,
                averageHours,
                records: attendanceRecords.length
            },
            activities: {
                total: totalActivities,
                completed: completedActivities,
                inProgress: activities.filter(a => a.status === 'in-progress').length,
                completionRate: activityCompletionRate
            },
            productivity: {
                hoursPerDay: averageHours,
                activitiesPerDay: daysWorked > 0 ? totalActivities / daysWorked : 0,
                efficiency: this.calculateEfficiencyScore(attendanceRecords, activities)
            }
        };
    }

    /**
     * Calculate efficiency score based on attendance and activities
     * @param {Array} attendanceRecords - Attendance records
     * @param {Array} activities - Activities
     * @returns {number} Efficiency score (0-100)
     */
    calculateEfficiencyScore(attendanceRecords, activities) {
        if (attendanceRecords.length === 0) return 0;

        const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0);
        const completedActivities = activities.filter(a => a.status === 'completed').length;
        
        // Simple efficiency calculation: completed activities per hour worked
        const activitiesPerHour = totalHours > 0 ? completedActivities / totalHours : 0;
        
        // Normalize to 0-100 scale (assuming 1 activity per 2 hours is 100% efficient)
        const maxEfficiency = 0.5; // 1 activity per 2 hours
        const efficiency = Math.min((activitiesPerHour / maxEfficiency) * 100, 100);
        
        return Math.round(efficiency);
    }

    /**
     * Get dashboard data for a user
     * @param {string} userId - User ID
     * @returns {Object} Dashboard data
     */
    getDashboardData(userId) {
        const today = DateUtils.getCurrentDateISO();
        const { start: weekStart, end: weekEnd } = DateUtils.getWeekRange();
        const { start: monthStart, end: monthEnd } = DateUtils.getMonthRange();

        // Get today's records
        const todayRecords = this.getAttendanceRecords({
            userId,
            startDate: today,
            endDate: today
        });

        // Get week's records
        const weekRecords = this.getAttendanceRecords({
            userId,
            startDate: weekStart.toISOString(),
            endDate: weekEnd.toISOString()
        });

        // Get month's records
        const monthRecords = this.getAttendanceRecords({
            userId,
            startDate: monthStart.toISOString(),
            endDate: monthEnd.toISOString()
        });

        // Get recent activities
        const recentActivities = this.getActivities({
            userId
        }).slice(0, 5);

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
            },
            recentActivities,
            stats: this.getUserStats(userId, { period: 'month' })
        };
    }

    /**
     * Clear cache entries matching pattern
     * @param {string} pattern - Pattern to match cache keys
     */
    clearCache(pattern = '') {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    /**
     * Export all data
     * @returns {Object} Exported data
     */
    exportAllData() {
        return {
            attendanceRecords: storage.getItem('attendanceRecords', []),
            activities: storage.getItem('activitiesData', []),
            userData: storage.getItem('userData', {}),
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };
    }

    /**
     * Import data
     * @param {Object} data - Data to import
     * @param {boolean} merge - Whether to merge with existing data
     * @returns {boolean} Success status
     */
    importData(data, merge = false) {
        try {
            if (!merge) {
                // Clear existing data
                storage.removeItem('attendanceRecords');
                storage.removeItem('activitiesData');
            }

            if (data.attendanceRecords) {
                const existing = merge ? storage.getItem('attendanceRecords', []) : [];
                storage.setItem('attendanceRecords', [...existing, ...data.attendanceRecords]);
            }

            if (data.activities) {
                const existing = merge ? storage.getItem('activitiesData', []) : [];
                storage.setItem('activitiesData', [...existing, ...data.activities]);
            }

            if (data.userData && !merge) {
                storage.setItem('userData', data.userData);
            }

            this.clearCache();
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }
}

// Create singleton instance
export const dataService = new DataService();
export default dataService;
