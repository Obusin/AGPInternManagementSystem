/**
 * Supabase Configuration
 * Database and authentication setup for production
 */

// Supabase configuration
const SUPABASE_CONFIG = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key'
};

// Initialize Supabase client
let supabase = null;

/**
 * Initialize Supabase connection
 */
async function initSupabase() {
    try {
        // Check if we're in a browser environment and Supabase is available
        if (typeof window !== 'undefined' && window.supabase) {
            supabase = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
            console.log('✅ Supabase initialized successfully');
            return true;
        } else {
            console.log('📱 Running in local mode - using localStorage');
            return false;
        }
    } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
        return false;
    }
}

/**
 * Database service with Supabase integration
 */
export class DatabaseService {
    constructor() {
        this.isSupabaseEnabled = false;
        this.tableName = 'attendance_records';
        this.usersTable = 'users';
        this.activitiesTable = 'activities';
    }

    /**
     * Initialize database connection
     */
    async init() {
        this.isSupabaseEnabled = await initSupabase();
        
        if (this.isSupabaseEnabled) {
            await this.createTables();
        }
        
        return this.isSupabaseEnabled;
    }

    /**
     * Create necessary tables if they don't exist
     */
    async createTables() {
        try {
            // This would typically be done via Supabase dashboard or migrations
            console.log('📋 Tables should be created via Supabase dashboard');
        } catch (error) {
            console.error('Failed to create tables:', error);
        }
    }

    /**
     * Save attendance record
     */
    async saveAttendanceRecord(record) {
        if (this.isSupabaseEnabled && supabase) {
            try {
                const { data, error } = await supabase
                    .from(this.tableName)
                    .insert([{
                        user_id: record.userId,
                        date: record.date,
                        time_in: record.timeIn,
                        time_out: record.timeOut,
                        total_hours: record.totalHours,
                        notes: record.notes || null,
                        created_at: new Date().toISOString()
                    }]);

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Supabase save failed, falling back to localStorage:', error);
                return this.saveToLocalStorage('attendanceRecords', record);
            }
        } else {
            return this.saveToLocalStorage('attendanceRecords', record);
        }
    }

    /**
     * Get attendance records
     */
    async getAttendanceRecords(userId = null, dateRange = null) {
        if (this.isSupabaseEnabled && supabase) {
            try {
                let query = supabase.from(this.tableName).select('*');
                
                if (userId) {
                    query = query.eq('user_id', userId);
                }
                
                if (dateRange) {
                    query = query.gte('date', dateRange.start).lte('date', dateRange.end);
                }
                
                const { data, error } = await query.order('created_at', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Supabase fetch failed, falling back to localStorage:', error);
                return this.getFromLocalStorage('attendanceRecords');
            }
        } else {
            return this.getFromLocalStorage('attendanceRecords');
        }
    }

    /**
     * Save activity record
     */
    async saveActivity(activity) {
        if (this.isSupabaseEnabled && supabase) {
            try {
                const { data, error } = await supabase
                    .from(this.activitiesTable)
                    .insert([{
                        user_id: activity.userId,
                        title: activity.title,
                        description: activity.description,
                        date: activity.date,
                        duration: activity.duration,
                        tags: activity.tags,
                        created_at: new Date().toISOString()
                    }]);

                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Supabase activity save failed:', error);
                return this.saveToLocalStorage('activities', activity);
            }
        } else {
            return this.saveToLocalStorage('activities', activity);
        }
    }

    /**
     * Get activities
     */
    async getActivities(userId = null, dateRange = null) {
        if (this.isSupabaseEnabled && supabase) {
            try {
                let query = supabase.from(this.activitiesTable).select('*');
                
                if (userId) {
                    query = query.eq('user_id', userId);
                }
                
                if (dateRange) {
                    query = query.gte('date', dateRange.start).lte('date', dateRange.end);
                }
                
                const { data, error } = await query.order('created_at', { ascending: false });
                
                if (error) throw error;
                return { success: true, data };
            } catch (error) {
                console.error('Supabase activities fetch failed:', error);
                return this.getFromLocalStorage('activities');
            }
        } else {
            return this.getFromLocalStorage('activities');
        }
    }

    /**
     * Fallback to localStorage
     */
    saveToLocalStorage(key, record) {
        try {
            const existing = JSON.parse(localStorage.getItem(`agp_${key}`) || '[]');
            existing.push({ ...record, id: Date.now().toString() });
            localStorage.setItem(`agp_${key}`, JSON.stringify(existing));
            return { success: true, data: record };
        } catch (error) {
            console.error('localStorage save failed:', error);
            return { success: false, error };
        }
    }

    /**
     * Get from localStorage
     */
    getFromLocalStorage(key) {
        try {
            const data = JSON.parse(localStorage.getItem(`agp_${key}`) || '[]');
            return { success: true, data };
        } catch (error) {
            console.error('localStorage fetch failed:', error);
            return { success: false, data: [] };
        }
    }

    /**
     * Sync localStorage data to Supabase
     */
    async syncToSupabase() {
        if (!this.isSupabaseEnabled) return;

        try {
            // Sync attendance records
            const attendanceData = this.getFromLocalStorage('attendanceRecords');
            if (attendanceData.success && attendanceData.data.length > 0) {
                for (const record of attendanceData.data) {
                    await this.saveAttendanceRecord(record);
                }
            }

            // Sync activities
            const activitiesData = this.getFromLocalStorage('activities');
            if (activitiesData.success && activitiesData.data.length > 0) {
                for (const activity of activitiesData.data) {
                    await this.saveActivity(activity);
                }
            }

            console.log('✅ Data synced to Supabase successfully');
        } catch (error) {
            console.error('❌ Sync to Supabase failed:', error);
        }
    }
}

// Export singleton instance
export const database = new DatabaseService();
export default database;
