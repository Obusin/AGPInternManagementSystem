/**
 * Formatting Utility Functions
 * Centralized data formatting and display utilities
 */

export const Formatters = {
    /**
     * Format numbers with proper decimal places
     * @param {number} value - Number to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number string
     */
    formatNumber(value, decimals = 1) {
        if (value === null || value === undefined || isNaN(value)) return '0.0';
        return parseFloat(value).toFixed(decimals);
    },

    /**
     * Format hours with proper decimal handling
     * @param {number} hours - Hours to format
     * @returns {string} Formatted hours string
     */
    formatHours(hours) {
        return this.formatNumber(hours, 1);
    },

    /**
     * Format percentage values
     * @param {number} value - Value to format as percentage
     * @param {number} total - Total value for percentage calculation
     * @returns {string} Formatted percentage string
     */
    formatPercentage(value, total = 100) {
        if (!value || !total) return '0%';
        const percentage = (value / total) * 100;
        return `${Math.round(percentage)}%`;
    },

    /**
     * Format file sizes in human readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size string
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Format currency values
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code (default: USD)
     * @returns {string} Formatted currency string
     */
    formatCurrency(amount, currency = 'USD') {
        if (amount === null || amount === undefined || isNaN(amount)) return '$0.00';
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    /**
     * Format phone numbers
     * @param {string} phone - Phone number to format
     * @returns {string} Formatted phone number
     */
    formatPhone(phone) {
        if (!phone) return '';
        
        // Remove all non-numeric characters
        const cleaned = phone.replace(/\D/g, '');
        
        // Format as (XXX) XXX-XXXX
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        
        return phone; // Return original if not 10 digits
    },

    /**
     * Capitalize first letter of each word
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalizeWords(str) {
        if (!str) return '';
        
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    },

    /**
     * Truncate text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length before truncation
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength = 50) {
        if (!text) return '';
        
        if (text.length <= maxLength) return text;
        
        return text.substring(0, maxLength - 3) + '...';
    },

    /**
     * Format status badges with appropriate styling
     * @param {string} status - Status value
     * @returns {Object} Object with class and display text
     */
    formatStatus(status) {
        const statusMap = {
            'active': { class: 'status-success', text: 'Active' },
            'inactive': { class: 'status-muted', text: 'Inactive' },
            'pending': { class: 'status-warning', text: 'Pending' },
            'completed': { class: 'status-success', text: 'Completed' },
            'in-progress': { class: 'status-warning', text: 'In Progress' },
            'cancelled': { class: 'status-error', text: 'Cancelled' },
            'approved': { class: 'status-success', text: 'Approved' },
            'rejected': { class: 'status-error', text: 'Rejected' },
            'draft': { class: 'status-muted', text: 'Draft' }
        };
        
        return statusMap[status?.toLowerCase()] || { class: 'status-muted', text: status || 'Unknown' };
    },

    /**
     * Format user names consistently
     * @param {Object} user - User object with name properties
     * @returns {string} Formatted full name
     */
    formatUserName(user) {
        if (!user) return 'Unknown User';
        
        if (user.name) return user.name;
        
        const firstName = user.firstName || user.first_name || '';
        const lastName = user.lastName || user.last_name || '';
        
        return `${firstName} ${lastName}`.trim() || 'Unknown User';
    },

    /**
     * Format initials from name
     * @param {string} name - Full name
     * @returns {string} Initials (max 2 characters)
     */
    getInitials(name) {
        if (!name) return 'UN';
        
        const words = name.trim().split(' ');
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }
        
        return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    },

    /**
     * Format arrays as comma-separated lists
     * @param {Array} array - Array to format
     * @param {string} conjunction - Word to use before last item (default: 'and')
     * @returns {string} Formatted list string
     */
    formatList(array, conjunction = 'and') {
        if (!Array.isArray(array) || array.length === 0) return '';
        
        if (array.length === 1) return array[0];
        if (array.length === 2) return `${array[0]} ${conjunction} ${array[1]}`;
        
        const lastItem = array[array.length - 1];
        const otherItems = array.slice(0, -1);
        
        return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
    },

    /**
     * Format tags for display
     * @param {Array} tags - Array of tag strings
     * @returns {string} HTML string for tag display
     */
    formatTags(tags) {
        if (!Array.isArray(tags) || tags.length === 0) return '';
        
        return tags.map(tag => 
            `<span class="tag">${this.escapeHtml(tag)}</span>`
        ).join('');
    },

    /**
     * Escape HTML characters to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Format URLs to be more readable
     * @param {string} url - URL to format
     * @returns {string} Formatted URL
     */
    formatUrl(url) {
        if (!url) return '';
        
        try {
            const urlObj = new URL(url);
            return urlObj.hostname + urlObj.pathname;
        } catch {
            return url;
        }
    },

    /**
     * Format email addresses for display
     * @param {string} email - Email to format
     * @returns {string} Formatted email
     */
    formatEmail(email) {
        if (!email) return '';
        
        // Basic email validation and formatting
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (emailRegex.test(email)) {
            return email.toLowerCase();
        }
        
        return email; // Return as-is if not valid email format
    },

    /**
     * Format ID numbers with consistent padding
     * @param {string|number} id - ID to format
     * @param {string} prefix - Prefix for ID (e.g., 'INT-')
     * @param {number} padding - Number of digits to pad to
     * @returns {string} Formatted ID
     */
    formatId(id, prefix = '', padding = 3) {
        if (!id) return '';
        
        const numericId = String(id).replace(/\D/g, '');
        const paddedId = numericId.padStart(padding, '0');
        
        return prefix + paddedId;
    },

    /**
     * Format boolean values for display
     * @param {boolean} value - Boolean value
     * @param {Object} options - Display options
     * @returns {string} Formatted boolean string
     */
    formatBoolean(value, options = {}) {
        const defaults = {
            trueText: 'Yes',
            falseText: 'No',
            nullText: 'N/A'
        };
        
        const opts = { ...defaults, ...options };
        
        if (value === null || value === undefined) return opts.nullText;
        
        return value ? opts.trueText : opts.falseText;
    }
};

export default Formatters;
