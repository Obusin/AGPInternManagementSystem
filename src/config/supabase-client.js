/**
 * Supabase Client Configuration for Browser
 * Handles Supabase initialization and connection management
 */

// Global Supabase client instance
let supabaseClient = null;
let isInitialized = false;

/**
 * Initialize Supabase client
 */
async function initializeSupabase() {
    try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
            console.log('⚠️ Supabase: Not in browser environment');
            return false;
        }

        // Check if Supabase library is loaded
        if (!window.supabase) {
            console.log('⚠️ Supabase: Library not loaded, loading from CDN...');
            await loadSupabaseLibrary();
        }

        // Get environment variables
        const supabaseUrl = getEnvironmentVariable('NEXT_PUBLIC_SUPABASE_URL');
        const supabaseKey = getEnvironmentVariable('NEXT_PUBLIC_SUPABASE_ANON_KEY');

        if (!supabaseUrl || !supabaseKey) {
            console.log('⚠️ Supabase: Environment variables not found, running in local mode');
            return false;
        }

        // Create Supabase client
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            },
            realtime: {
                params: {
                    eventsPerSecond: 10
                }
            }
        });

        isInitialized = true;
        console.log('✅ Supabase: Client initialized successfully');
        
        // Test connection
        const { data, error } = await supabaseClient.from('users').select('count').limit(1);
        if (error) {
            console.warn('⚠️ Supabase: Connection test failed:', error.message);
        } else {
            console.log('✅ Supabase: Connection test successful');
        }

        return true;

    } catch (error) {
        console.error('❌ Supabase: Initialization failed:', error);
        isInitialized = false;
        return false;
    }
}

/**
 * Load Supabase library from CDN
 */
async function loadSupabaseLibrary() {
    return new Promise((resolve, reject) => {
        if (window.supabase) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/dist/umd/supabase.min.js';
        script.onload = () => {
            console.log('✅ Supabase: Library loaded from CDN');
            resolve();
        };
        script.onerror = () => {
            console.error('❌ Supabase: Failed to load library from CDN');
            reject(new Error('Failed to load Supabase library'));
        };
        document.head.appendChild(script);
    });
}

/**
 * Get environment variable with fallbacks
 */
function getEnvironmentVariable(name) {
    // Try process.env first (if available)
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
        return process.env[name];
    }

    // Try window environment variables
    if (window[name]) {
        return window[name];
    }

    // Try meta tags
    const metaTag = document.querySelector(`meta[name="${name}"]`);
    if (metaTag) {
        return metaTag.getAttribute('content');
    }

    return null;
}

/**
 * Get Supabase client instance
 */
function getSupabaseClient() {
    if (!isInitialized || !supabaseClient) {
        console.warn('⚠️ Supabase: Client not initialized, call initializeSupabase() first');
        return null;
    }
    return supabaseClient;
}

/**
 * Check if Supabase is available and initialized
 */
function isSupabaseAvailable() {
    return isInitialized && supabaseClient !== null;
}

/**
 * Supabase Database Service
 */
class SupabaseService {
    constructor() {
        this.client = null;
        this.isReady = false;
    }

    async init() {
        const success = await initializeSupabase();
        if (success) {
            this.client = getSupabaseClient();
            this.isReady = true;
        }
        return success;
    }

    /**
     * Save QR code to database
     */
    async saveQRCode(userId, qrData, qrImage) {
        if (!this.isReady) {
            throw new Error('Supabase not initialized');
        }

        const { data, error } = await this.client
            .from('user_qr_codes')
            .upsert([{
                user_id: userId,
                qr_data: qrData,
                qr_image: qrImage,
                generated_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
                is_active: true
            }], {
                onConflict: 'user_id',
                returning: 'minimal'
            });

        if (error) throw error;
        return data;
    }

    /**
     * Get QR code from database
     */
    async getQRCode(userId) {
        if (!this.isReady) {
            throw new Error('Supabase not initialized');
        }

        const { data, error } = await this.client
            .from('user_qr_codes')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error;
        }

        return data;
    }

    /**
     * Log QR code scan
     */
    async logQRScan(userId, qrCodeId, result, location = null) {
        if (!this.isReady) {
            return; // Don't throw error for logging
        }

        try {
            await this.client
                .from('qr_scan_logs')
                .insert([{
                    user_id: userId,
                    qr_code_id: qrCodeId,
                    scan_result: result,
                    scan_location: location,
                    user_agent: navigator.userAgent,
                    scan_timestamp: new Date().toISOString()
                }]);
        } catch (error) {
            console.error('Failed to log QR scan:', error);
        }
    }

    /**
     * Save attendance record
     */
    async saveAttendance(record) {
        if (!this.isReady) {
            throw new Error('Supabase not initialized');
        }

        const { data, error } = await this.client
            .from('attendance_records')
            .insert([{
                user_id: record.userId,
                date: record.date,
                time_in: record.timeIn,
                time_out: record.timeOut,
                total_hours: record.totalHours,
                notes: record.notes,
                scan_method: record.scanMethod || 'qr_code',
                location: record.location
            }]);

        if (error) throw error;
        return data;
    }

    /**
     * Get attendance records
     */
    async getAttendance(userId, dateRange = null) {
        if (!this.isReady) {
            throw new Error('Supabase not initialized');
        }

        let query = this.client
            .from('attendance_records')
            .select('*')
            .eq('user_id', userId);

        if (dateRange) {
            query = query.gte('date', dateRange.start).lte('date', dateRange.end);
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error) throw error;
        return data;
    }
}

// Create global instance
const supabaseService = new SupabaseService();

// Export functions and service
window.initializeSupabase = initializeSupabase;
window.getSupabaseClient = getSupabaseClient;
window.isSupabaseAvailable = isSupabaseAvailable;
window.supabaseService = supabaseService;

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🔄 Supabase: Auto-initializing...');
    await supabaseService.init();
});

console.log('✅ Supabase client configuration loaded');
