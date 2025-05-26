/**
 * Date Utility Functions
 * Centralized date manipulation and formatting utilities
 */

export const DateUtils = {
    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @param {string} format - Format type ('short', 'long', 'time', 'datetime')
     * @returns {string} Formatted date string
     */
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

    /**
     * Format time for display
     * @param {Date|string} time - Time to format
     * @param {boolean} includeSeconds - Include seconds in output
     * @returns {string} Formatted time string
     */
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

    /**
     * Get relative time (e.g., "2 hours ago", "in 3 days")
     * @param {Date|string} date - Date to compare
     * @returns {string} Relative time string
     */
    getRelativeTime(date) {
        if (!date) return '';

        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

        return this.formatDate(dateObj, 'short');
    },

    /**
     * Check if date is today
     * @param {Date|string} date - Date to check
     * @returns {boolean} True if date is today
     */
    isToday(date) {
        if (!date) return false;

        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const today = new Date();

        return dateObj.toDateString() === today.toDateString();
    },

    /**
     * Check if date is this week
     * @param {Date|string} date - Date to check
     * @returns {boolean} True if date is this week
     */
    isThisWeek(date) {
        if (!date) return false;

        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

        return dateObj >= startOfWeek && dateObj <= endOfWeek;
    },

    /**
     * Get start and end of week for a given date
     * @param {Date|string} date - Reference date
     * @returns {Object} Object with start and end dates
     */
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

    /**
     * Get start and end of month for a given date
     * @param {Date|string} date - Reference date
     * @returns {Object} Object with start and end dates
     */
    getMonthRange(date = new Date()) {
        const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
        const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
        const end = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0, 23, 59, 59, 999);

        return { start, end };
    },

    /**
     * Calculate duration between two times
     * @param {Date|string} startTime - Start time
     * @param {Date|string} endTime - End time
     * @returns {Object} Duration object with hours, minutes, total hours
     */
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

    /**
     * Format duration as human readable string
     * @param {number} totalHours - Total hours as decimal
     * @returns {string} Formatted duration string
     */
    formatDuration(totalHours) {
        if (!totalHours || totalHours === 0) return '0h 0m';

        const hours = Math.floor(totalHours);
        const minutes = Math.round((totalHours - hours) * 60);

        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours}h`;

        return `${hours}h ${minutes}m`;
    },

    /**
     * Get current date in ISO format (YYYY-MM-DD)
     * @returns {string} Current date in ISO format
     */
    getCurrentDateISO() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Format date to ISO string (YYYY-MM-DD)
     * @param {Date|string} date - Date to format
     * @returns {string} ISO formatted date string
     */
    formatDateISO(date) {
        if (!date) return '';

        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) return '';

        return dateObj.toISOString().split('T')[0];
    },

    /**
     * Get current time in ISO format
     * @returns {string} Current time in ISO format
     */
    getCurrentTimeISO() {
        return new Date().toISOString();
    },

    /**
     * Parse time string (HH:MM) and create Date object for today
     * @param {string} timeString - Time in HH:MM format
     * @returns {Date} Date object with today's date and specified time
     */
    parseTimeString(timeString) {
        if (!timeString || !timeString.includes(':')) return null;

        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        return date;
    },

    /**
     * Check if a date is a weekend
     * @param {Date|string} date - Date to check
     * @returns {boolean} True if date is weekend (Saturday or Sunday)
     */
    isWeekend(date) {
        if (!date) return false;

        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const day = dateObj.getDay();

        return day === 0 || day === 6; // Sunday = 0, Saturday = 6
    },

    /**
     * Get business days between two dates
     * @param {Date|string} startDate - Start date
     * @param {Date|string} endDate - End date
     * @returns {number} Number of business days
     */
    getBusinessDays(startDate, endDate) {
        if (!startDate || !endDate) return 0;

        const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);
        const end = typeof endDate === 'string' ? new Date(endDate) : new Date(endDate);

        let count = 0;
        const current = new Date(start);

        while (current <= end) {
            if (!this.isWeekend(current)) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }

        return count;
    }
};

export default DateUtils;
