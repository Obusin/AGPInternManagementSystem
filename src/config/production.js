/**
 * Production Configuration
 * Handles deployment-specific settings for Vercel and Supabase
 */

// Environment detection
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const isVercel = window.location.hostname.includes('vercel.app');

// Configuration object
export const ProductionConfig = {
    // Environment
    environment: isProduction ? 'production' : 'development',
    isProduction,
    isVercel,
    
    // App settings
    app: {
        name: 'AG&P Attendance System',
        version: '2.0.0',
        description: 'Professional attendance tracking system'
    },
    
    // Database settings
    database: {
        enableSupabase: isProduction,
        enableOfflineMode: true,
        autoSync: isProduction,
        syncInterval: 5 * 60 * 1000 // 5 minutes
    },
    
    // Security settings
    security: {
        sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
        maxLoginAttempts: 5,
        enableEncryption: isProduction
    },
    
    // Feature flags
    features: {
        enableBiometric: false,
        enableBarcode: true,
        enableManualEntry: true,
        enableReports: true,
        enablePWA: true,
        enableNotifications: true
    },
    
    // UI settings
    ui: {
        theme: 'dark',
        companyName: 'AG&P',
        companyLogo: '/assets/images/AGP-Logo.png',
        enableAnimations: true,
        enableSounds: false
    },
    
    // API endpoints (for future backend integration)
    api: {
        baseUrl: isProduction ? 'https://api.agp-attendance.com' : 'http://localhost:3001',
        timeout: 10000,
        retries: 3
    }
};

/**
 * Initialize production configuration
 */
export function initProductionConfig() {
    console.log(`🚀 Initializing ${ProductionConfig.environment} environment`);
    
    // Set global configuration
    window.AGP_CONFIG = ProductionConfig;
    
    // Initialize service worker for PWA
    if (ProductionConfig.features.enablePWA && 'serviceWorker' in navigator) {
        initServiceWorker();
    }
    
    // Initialize error tracking for production
    if (ProductionConfig.isProduction) {
        initErrorTracking();
    }
    
    // Initialize performance monitoring
    initPerformanceMonitoring();
    
    return ProductionConfig;
}

/**
 * Initialize service worker
 */
async function initServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/config/sw.js');
        console.log('✅ Service Worker registered:', registration);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    showUpdateNotification();
                }
            });
        });
    } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
    }
}

/**
 * Initialize error tracking
 */
function initErrorTracking() {
    window.addEventListener('error', (event) => {
        console.error('Global error:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });
        
        // In production, you might want to send this to an error tracking service
        // like Sentry, LogRocket, or a custom endpoint
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
    });
}

/**
 * Initialize performance monitoring
 */
function initPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('📊 Page Load Performance:', {
                loadTime: perfData.loadEventEnd - perfData.loadEventStart,
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                totalTime: perfData.loadEventEnd - perfData.fetchStart
            });
        }, 0);
    });
}

/**
 * Show update notification
 */
function showUpdateNotification() {
    // Create update notification
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <i class="fas fa-download"></i>
            <span>New version available!</span>
            <button onclick="window.location.reload()" class="update-btn">Update</button>
            <button onclick="this.parentElement.parentElement.remove()" class="dismiss-btn">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff7a45, #ff6b35);
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

/**
 * Get environment-specific configuration
 */
export function getConfig(key = null) {
    const config = window.AGP_CONFIG || ProductionConfig;
    
    if (key) {
        return key.split('.').reduce((obj, k) => obj?.[k], config);
    }
    
    return config;
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature) {
    return getConfig(`features.${feature}`) === true;
}

/**
 * Get API endpoint
 */
export function getApiEndpoint(endpoint = '') {
    const baseUrl = getConfig('api.baseUrl');
    return `${baseUrl}${endpoint}`;
}

/**
 * Log with environment context
 */
export function log(level, message, data = null) {
    const config = getConfig();
    const timestamp = new Date().toISOString();
    
    const logData = {
        timestamp,
        level,
        message,
        environment: config.environment,
        data
    };
    
    if (config.isProduction) {
        // In production, you might want to send logs to a service
        console[level](message, data);
    } else {
        console[level](`[${timestamp}] ${message}`, data);
    }
}

// Auto-initialize when module is loaded
if (typeof window !== 'undefined') {
    initProductionConfig();
}

export default ProductionConfig;
