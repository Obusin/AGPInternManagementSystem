/**
 * AG&P Multi-Site Management System
 * Enterprise-level site management with location-based operations
 */

class MultiSiteSystem {
    constructor() {
        this.sites = this.initializeSites();
        this.schedules = this.initializeSchedules();
        this.timeTracking = this.initializeTimeTracking();
        this.transferRequests = [];
    }

    /**
     * Initialize company sites
     */
    initializeSites() {
        return {
            'BAUAN': {
                id: 'BAUAN',
                name: 'Bauan Site',
                location: 'Bauan, Batangas',
                coordinates: { lat: 13.7565, lng: 121.0583 },
                address: 'Bauan Industrial Complex, Batangas',
                timezone: 'Asia/Manila',
                operatingHours: {
                    monday: { start: '07:00', end: '17:00' },
                    tuesday: { start: '07:00', end: '17:00' },
                    wednesday: { start: '07:00', end: '17:00' },
                    thursday: { start: '07:00', end: '17:00' },
                    friday: { start: '07:00', end: '17:00' },
                    saturday: { start: '08:00', end: '12:00' },
                    sunday: { closed: true }
                },
                departments: ['IT_DEV', 'OPERATIONS', 'MAINTENANCE'],
                headOfSite: 'adminmark',
                isActive: true,
                capacity: 150,
                facilities: ['Office Building', 'Workshop', 'Parking'],
                contactInfo: {
                    phone: '+63-43-123-4567',
                    email: 'bauan@agp.com'
                }
            },
            'SAN_ROQUE': {
                id: 'SAN_ROQUE',
                name: 'San Roque Site',
                location: 'San Roque, Batangas',
                coordinates: { lat: 13.7234, lng: 121.0456 },
                address: 'San Roque Industrial Park, Batangas',
                timezone: 'Asia/Manila',
                operatingHours: {
                    monday: { start: '06:00', end: '18:00' },
                    tuesday: { start: '06:00', end: '18:00' },
                    wednesday: { start: '06:00', end: '18:00' },
                    thursday: { start: '06:00', end: '18:00' },
                    friday: { start: '06:00', end: '18:00' },
                    saturday: { start: '07:00', end: '15:00' },
                    sunday: { closed: true }
                },
                departments: ['OPERATIONS', 'MAINTENANCE', 'LOGISTICS'],
                headOfSite: null,
                isActive: true,
                capacity: 200,
                facilities: ['Production Floor', 'Warehouse', 'Admin Office'],
                contactInfo: {
                    phone: '+63-43-234-5678',
                    email: 'sanroque@agp.com'
                }
            },
            'ILIJAN': {
                id: 'ILIJAN',
                name: 'Ilijan Power Plant',
                location: 'Ilijan, Batangas',
                coordinates: { lat: 13.6789, lng: 121.0234 },
                address: 'Ilijan Power Complex, Batangas',
                timezone: 'Asia/Manila',
                operatingHours: {
                    monday: { start: '00:00', end: '23:59' },
                    tuesday: { start: '00:00', end: '23:59' },
                    wednesday: { start: '00:00', end: '23:59' },
                    thursday: { start: '00:00', end: '23:59' },
                    friday: { start: '00:00', end: '23:59' },
                    saturday: { start: '00:00', end: '23:59' },
                    sunday: { start: '00:00', end: '23:59' }
                },
                departments: ['OPERATIONS', 'MAINTENANCE', 'ENGINEERING'],
                headOfSite: null,
                isActive: true,
                capacity: 100,
                facilities: ['Control Room', 'Turbine Hall', 'Maintenance Shop'],
                contactInfo: {
                    phone: '+63-43-345-6789',
                    email: 'ilijan@agp.com'
                }
            },
            'BATANGAS': {
                id: 'BATANGAS',
                name: 'Batangas Main Office',
                location: 'Batangas City',
                coordinates: { lat: 13.7567, lng: 121.0584 },
                address: 'AG&P Corporate Center, Batangas City',
                timezone: 'Asia/Manila',
                operatingHours: {
                    monday: { start: '08:00', end: '17:00' },
                    tuesday: { start: '08:00', end: '17:00' },
                    wednesday: { start: '08:00', end: '17:00' },
                    thursday: { start: '08:00', end: '17:00' },
                    friday: { start: '08:00', end: '17:00' },
                    saturday: { closed: true },
                    sunday: { closed: true }
                },
                departments: ['IT_ADMIN', 'HR', 'FINANCE', 'MARKETING'],
                headOfSite: 'devmark',
                isActive: true,
                capacity: 80,
                facilities: ['Executive Offices', 'Conference Rooms', 'IT Center'],
                contactInfo: {
                    phone: '+63-43-456-7890',
                    email: 'batangas@agp.com'
                }
            },
            'ANTIPOLO': {
                id: 'ANTIPOLO',
                name: 'Antipolo Branch',
                location: 'Antipolo, Rizal',
                coordinates: { lat: 14.5995, lng: 121.1794 },
                address: 'Antipolo Business District, Rizal',
                timezone: 'Asia/Manila',
                operatingHours: {
                    monday: { start: '08:00', end: '17:00' },
                    tuesday: { start: '08:00', end: '17:00' },
                    wednesday: { start: '08:00', end: '17:00' },
                    thursday: { start: '08:00', end: '17:00' },
                    friday: { start: '08:00', end: '17:00' },
                    saturday: { start: '09:00', end: '13:00' },
                    sunday: { closed: true }
                },
                departments: ['IT_DEV', 'MARKETING', 'OPERATIONS'],
                headOfSite: null,
                isActive: true,
                capacity: 60,
                facilities: ['Office Space', 'Meeting Rooms', 'Cafeteria'],
                contactInfo: {
                    phone: '+63-2-567-8901',
                    email: 'antipolo@agp.com'
                }
            },
            'CEMEX': {
                id: 'CEMEX',
                name: 'CEMEX Partnership Site',
                location: 'CEMEX Facility, Batangas',
                coordinates: { lat: 13.7123, lng: 121.0345 },
                address: 'CEMEX Industrial Complex, Batangas',
                timezone: 'Asia/Manila',
                operatingHours: {
                    monday: { start: '05:00', end: '17:00' },
                    tuesday: { start: '05:00', end: '17:00' },
                    wednesday: { start: '05:00', end: '17:00' },
                    thursday: { start: '05:00', end: '17:00' },
                    friday: { start: '05:00', end: '17:00' },
                    saturday: { start: '06:00', end: '14:00' },
                    sunday: { closed: true }
                },
                departments: ['OPERATIONS', 'MAINTENANCE'],
                headOfSite: null,
                isActive: true,
                capacity: 40,
                facilities: ['Production Area', 'Quality Lab', 'Storage'],
                contactInfo: {
                    phone: '+63-43-678-9012',
                    email: 'cemex@agp.com'
                }
            }
        };
    }

    /**
     * Initialize site-specific schedules
     */
    initializeSchedules() {
        return {
            'BAUAN': {
                shifts: {
                    'DAY_SHIFT': { start: '07:00', end: '15:00', name: 'Day Shift' },
                    'AFTERNOON_SHIFT': { start: '15:00', end: '23:00', name: 'Afternoon Shift' },
                    'ADMIN_HOURS': { start: '08:00', end: '17:00', name: 'Administrative Hours' }
                },
                scheduleTemplates: ['5_DAY_WEEK', 'ROTATING_SHIFTS']
            },
            'SAN_ROQUE': {
                shifts: {
                    'EARLY_SHIFT': { start: '06:00', end: '14:00', name: 'Early Shift' },
                    'DAY_SHIFT': { start: '14:00', end: '22:00', name: 'Day Shift' },
                    'NIGHT_SHIFT': { start: '22:00', end: '06:00', name: 'Night Shift' }
                },
                scheduleTemplates: ['CONTINUOUS_OPERATION', '3_SHIFT_ROTATION']
            },
            'ILIJAN': {
                shifts: {
                    'SHIFT_A': { start: '06:00', end: '18:00', name: 'Shift A (12h)' },
                    'SHIFT_B': { start: '18:00', end: '06:00', name: 'Shift B (12h)' },
                    'MAINTENANCE': { start: '08:00', end: '16:00', name: 'Maintenance Window' }
                },
                scheduleTemplates: ['24_7_OPERATION', 'MAINTENANCE_SCHEDULE']
            },
            'BATANGAS': {
                shifts: {
                    'OFFICE_HOURS': { start: '08:00', end: '17:00', name: 'Office Hours' },
                    'FLEXIBLE': { start: '07:00', end: '18:00', name: 'Flexible Hours' }
                },
                scheduleTemplates: ['STANDARD_OFFICE', 'FLEXIBLE_WORK']
            },
            'ANTIPOLO': {
                shifts: {
                    'OFFICE_HOURS': { start: '08:00', end: '17:00', name: 'Office Hours' },
                    'EXTENDED': { start: '08:00', end: '19:00', name: 'Extended Hours' }
                },
                scheduleTemplates: ['STANDARD_OFFICE', 'PROJECT_BASED']
            },
            'CEMEX': {
                shifts: {
                    'PRODUCTION_A': { start: '05:00', end: '13:00', name: 'Production A' },
                    'PRODUCTION_B': { start: '13:00', end: '21:00', name: 'Production B' },
                    'MAINTENANCE': { start: '21:00', end: '05:00', name: 'Maintenance Shift' }
                },
                scheduleTemplates: ['PRODUCTION_SCHEDULE', 'MAINTENANCE_ROTATION']
            }
        };
    }

    /**
     * Initialize time tracking system
     */
    initializeTimeTracking() {
        return {
            geoFencing: {
                enabled: true,
                radius: 100, // meters
                strictMode: true
            },
            checkInMethods: ['GPS', 'QR_CODE', 'BIOMETRIC'],
            allowedDeviation: 15, // minutes
            breakTimes: {
                morning: { duration: 15, flexible: true },
                lunch: { duration: 60, flexible: false },
                afternoon: { duration: 15, flexible: true }
            }
        };
    }

    /**
     * Get all sites
     */
    getAllSites() {
        return Object.values(this.sites);
    }

    /**
     * Get site by ID
     */
    getSiteById(siteId) {
        return this.sites[siteId] || null;
    }

    /**
     * Get sites by department
     */
    getSitesByDepartment(departmentId) {
        return Object.values(this.sites).filter(site => 
            site.departments.includes(departmentId)
        );
    }

    /**
     * Get active sites
     */
    getActiveSites() {
        return Object.values(this.sites).filter(site => site.isActive);
    }

    /**
     * Check if user can access site
     */
    canUserAccessSite(user, siteId) {
        const site = this.getSiteById(siteId);
        if (!site) return false;

        // Developers can access all sites
        if (user.role === 'developer') return true;

        // Site heads can access their sites
        if (site.headOfSite === user.username) return true;

        // Check if user's department operates at this site
        if (site.departments.includes(user.department)) return true;

        // Check if user manages departments at this site
        if (user.managedDepartments) {
            return user.managedDepartments.some(dept => 
                site.departments.includes(dept)
            );
        }

        return false;
    }

    /**
     * Get user's accessible sites
     */
    getUserAccessibleSites(user) {
        return this.getActiveSites().filter(site => 
            this.canUserAccessSite(user, site.id)
        );
    }

    /**
     * Create site transfer request
     */
    createTransferRequest(fromUserId, fromSite, toSite, reason, requestedDate) {
        const transferId = `transfer_${Date.now()}`;
        
        const request = {
            id: transferId,
            userId: fromUserId,
            fromSite: fromSite,
            toSite: toSite,
            reason: reason,
            requestedDate: requestedDate,
            status: 'pending',
            createdAt: new Date().toISOString(),
            approvedBy: null,
            approvedAt: null,
            comments: []
        };

        this.transferRequests.push(request);
        return request;
    }

    /**
     * Get transfer requests
     */
    getTransferRequests(filters = {}) {
        let requests = [...this.transferRequests];

        if (filters.userId) {
            requests = requests.filter(req => req.userId === filters.userId);
        }

        if (filters.siteId) {
            requests = requests.filter(req => 
                req.fromSite === filters.siteId || req.toSite === filters.siteId
            );
        }

        if (filters.status) {
            requests = requests.filter(req => req.status === filters.status);
        }

        return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Approve/Reject transfer request
     */
    processTransferRequest(transferId, action, approvedBy, comments = '') {
        const request = this.transferRequests.find(req => req.id === transferId);
        if (!request) return false;

        request.status = action; // 'approved' or 'rejected'
        request.approvedBy = approvedBy;
        request.approvedAt = new Date().toISOString();
        
        if (comments) {
            request.comments.push({
                text: comments,
                author: approvedBy,
                timestamp: new Date().toISOString()
            });
        }

        return true;
    }
}

// Create global instance
window.multiSiteSystem = new MultiSiteSystem();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiSiteSystem;
}
