/**
 * Storage Service
 * Centralized data persistence and retrieval
 */

export class StorageService {
    constructor() {
        this.prefix = 'agp_attendance_';
        this.version = '1.0';
        this.compressionThreshold = 1024; // Compress data larger than 1KB
    }

    /**
     * Set item in localStorage with optional compression
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @param {Object} options - Storage options
     */
    setItem(key, value, options = {}) {
        try {
            const fullKey = this.prefix + key;
            const data = {
                value,
                timestamp: Date.now(),
                version: this.version,
                compressed: false,
                ...options
            };

            let serialized = JSON.stringify(data);

            // Compress large data if needed
            if (serialized.length > this.compressionThreshold && options.compress !== false) {
                try {
                    serialized = this.compress(serialized);
                    data.compressed = true;
                } catch (error) {
                    console.warn('Compression failed, storing uncompressed:', error);
                }
            }

            localStorage.setItem(fullKey, serialized);
            
            // Trigger storage event for cross-tab communication
            this.triggerStorageEvent(key, value);
            
        } catch (error) {
            console.error('Failed to store data:', error);
            
            // Try to free up space and retry
            if (error.name === 'QuotaExceededError') {
                this.cleanup();
                try {
                    localStorage.setItem(this.prefix + key, JSON.stringify({ value, timestamp: Date.now() }));
                } catch (retryError) {
                    console.error('Storage failed even after cleanup:', retryError);
                    throw new Error('Storage quota exceeded');
                }
            }
        }
    }

    /**
     * Get item from localStorage with decompression
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key not found
     * @returns {any} Retrieved value or default
     */
    getItem(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const stored = localStorage.getItem(fullKey);
            
            if (!stored) return defaultValue;

            let data = JSON.parse(stored);

            // Handle legacy data format
            if (!data.hasOwnProperty('value')) {
                return data;
            }

            // Decompress if needed
            if (data.compressed) {
                try {
                    const decompressed = this.decompress(stored);
                    data = JSON.parse(decompressed);
                } catch (error) {
                    console.warn('Decompression failed:', error);
                    return defaultValue;
                }
            }

            // Check if data is expired
            if (data.expiresAt && Date.now() > data.expiresAt) {
                this.removeItem(key);
                return defaultValue;
            }

            return data.value;
            
        } catch (error) {
            console.error('Failed to retrieve data:', error);
            return defaultValue;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    removeItem(key) {
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            this.triggerStorageEvent(key, null);
        } catch (error) {
            console.error('Failed to remove data:', error);
        }
    }

    /**
     * Clear all app data from localStorage
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Failed to clear storage:', error);
        }
    }

    /**
     * Get all keys with the app prefix
     * @returns {Array} Array of keys
     */
    getAllKeys() {
        try {
            const keys = Object.keys(localStorage);
            return keys
                .filter(key => key.startsWith(this.prefix))
                .map(key => key.replace(this.prefix, ''));
        } catch (error) {
            console.error('Failed to get keys:', error);
            return [];
        }
    }

    /**
     * Get storage usage information
     * @returns {Object} Storage usage stats
     */
    getStorageInfo() {
        try {
            let totalSize = 0;
            let appSize = 0;
            const itemCount = { total: 0, app: 0 };

            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const size = localStorage[key].length;
                    totalSize += size;
                    itemCount.total++;

                    if (key.startsWith(this.prefix)) {
                        appSize += size;
                        itemCount.app++;
                    }
                }
            }

            return {
                totalSize,
                appSize,
                itemCount,
                available: this.getAvailableSpace(),
                percentage: totalSize > 0 ? (appSize / totalSize) * 100 : 0
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return { totalSize: 0, appSize: 0, itemCount: { total: 0, app: 0 }, available: 0, percentage: 0 };
        }
    }

    /**
     * Estimate available localStorage space
     * @returns {number} Estimated available bytes
     */
    getAvailableSpace() {
        try {
            const testKey = 'test_storage_limit';
            let testData = 'x';
            let totalSize = 0;

            // Double the test data until we hit the limit
            while (true) {
                try {
                    localStorage.setItem(testKey, testData);
                    totalSize = testData.length;
                    testData += testData; // Double the size
                } catch (error) {
                    localStorage.removeItem(testKey);
                    break;
                }
            }

            return totalSize;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Clean up old or expired data
     * @param {number} maxAge - Maximum age in milliseconds
     */
    cleanup(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days default
        try {
            const now = Date.now();
            const keys = this.getAllKeys();

            keys.forEach(key => {
                try {
                    const data = this.getItem(key);
                    if (data && data.timestamp && (now - data.timestamp) > maxAge) {
                        this.removeItem(key);
                    }
                } catch (error) {
                    // If we can't parse the data, remove it
                    this.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }

    /**
     * Export all app data
     * @returns {Object} All app data
     */
    exportData() {
        try {
            const data = {};
            const keys = this.getAllKeys();

            keys.forEach(key => {
                data[key] = this.getItem(key);
            });

            return {
                data,
                exportDate: new Date().toISOString(),
                version: this.version
            };
        } catch (error) {
            console.error('Export failed:', error);
            return null;
        }
    }

    /**
     * Import data from export
     * @param {Object} exportData - Data to import
     * @param {boolean} overwrite - Whether to overwrite existing data
     */
    importData(exportData, overwrite = false) {
        try {
            if (!exportData || !exportData.data) {
                throw new Error('Invalid export data format');
            }

            Object.entries(exportData.data).forEach(([key, value]) => {
                if (overwrite || !this.getItem(key)) {
                    this.setItem(key, value);
                }
            });

            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }

    /**
     * Simple compression using base64 encoding
     * @param {string} data - Data to compress
     * @returns {string} Compressed data
     */
    compress(data) {
        try {
            return btoa(unescape(encodeURIComponent(data)));
        } catch (error) {
            throw new Error('Compression failed');
        }
    }

    /**
     * Simple decompression from base64
     * @param {string} data - Data to decompress
     * @returns {string} Decompressed data
     */
    decompress(data) {
        try {
            return decodeURIComponent(escape(atob(data)));
        } catch (error) {
            throw new Error('Decompression failed');
        }
    }

    /**
     * Trigger custom storage event for cross-tab communication
     * @param {string} key - Storage key
     * @param {any} value - New value
     */
    triggerStorageEvent(key, value) {
        try {
            window.dispatchEvent(new CustomEvent('appStorageChange', {
                detail: { key, value, timestamp: Date.now() }
            }));
        } catch (error) {
            console.warn('Failed to trigger storage event:', error);
        }
    }

    /**
     * Listen for storage changes
     * @param {Function} callback - Callback function
     * @returns {Function} Cleanup function
     */
    onStorageChange(callback) {
        const handler = (event) => {
            if (event.detail) {
                callback(event.detail);
            }
        };

        window.addEventListener('appStorageChange', handler);
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith(this.prefix)) {
                callback({
                    key: event.key.replace(this.prefix, ''),
                    value: event.newValue ? JSON.parse(event.newValue) : null,
                    timestamp: Date.now()
                });
            }
        });

        // Return cleanup function
        return () => {
            window.removeEventListener('appStorageChange', handler);
        };
    }
}

// Create singleton instance
export const storage = new StorageService();
export default storage;
