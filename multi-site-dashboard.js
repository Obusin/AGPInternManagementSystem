/**
 * AG&P Multi-Site Dashboard Component
 * Centralized dashboard with site filtering and location-based management
 */

class MultiSiteDashboard {
    constructor() {
        this.currentUser = null;
        this.selectedSite = 'ALL';
        this.dashboardData = {};
    }

    /**
     * Initialize multi-site dashboard
     */
    init(user) {
        this.currentUser = user;
        this.render();
        this.attachEventListeners();
        this.loadDashboardData();
    }

    /**
     * Render the multi-site dashboard
     */
    render() {
        const container = document.getElementById('dashboard-section');
        if (!container) return;

        const accessibleSites = window.multiSiteSystem.getUserAccessibleSites(this.currentUser);

        const dashboardHTML = `
            <div class="multi-site-dashboard">
                <!-- Welcome Card - Top of Multi-Site Dashboard -->
                <div class="welcome-card">
                    <div class="welcome-content">
                        <div class="welcome-text">
                            <h2 id="welcome-message">Welcome back, ${this.currentUser.name}!</h2>
                            <p id="welcome-subtext">
                                <span class="role-badge" style="background-color: var(--primary-color); color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-right: 8px;">
                                    ${this.currentUser.role ? this.currentUser.role.toUpperCase() : 'USER'}
                                </span>
                                ${this.currentUser.position || 'Team Member'} • Manage multi-site operations and monitor performance.
                            </p>
                        </div>
                        <div class="welcome-stats">
                            <div class="quick-stat">
                                <span class="quick-stat-value" id="accessible-sites">${accessibleSites.length}</span>
                                <span class="quick-stat-label">Accessible Sites</span>
                            </div>
                            <div class="quick-stat">
                                <span class="quick-stat-value" id="managed-departments">${this.currentUser.managedDepartments ? this.currentUser.managedDepartments.length : 0}</span>
                                <span class="quick-stat-label">Managed Departments</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="dashboard-header">
                    <div class="header-content">
                        <h1>
                            <i class="fas fa-map-marked-alt"></i>
                            Multi-Site Dashboard
                        </h1>
                        <div class="site-selector">
                            <label for="site-filter">View Site:</label>
                            <select id="site-filter" class="site-filter-select">
                                <option value="ALL">All Sites</option>
                                ${accessibleSites.map(site => `
                                    <option value="${site.id}">${site.name}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="dashboard-actions">
                        <button class="action-btn secondary" id="refresh-dashboard">
                            <i class="fas fa-sync-alt"></i>
                            <span>Refresh</span>
                        </button>
                        <button class="action-btn primary" id="site-transfer-btn">
                            <i class="fas fa-exchange-alt"></i>
                            <span>Request Transfer</span>
                        </button>
                    </div>
                </div>

                <!-- Site Overview Cards -->
                <div class="site-overview" id="site-overview">
                    ${this.renderSiteOverview(accessibleSites)}
                </div>

                <!-- Dashboard Metrics -->
                <div class="dashboard-metrics">
                    <div class="metrics-grid" id="metrics-grid">
                        ${this.renderMetricsGrid()}
                    </div>
                </div>

                <!-- Site-Specific Content -->
                <div class="site-content" id="site-content">
                    <div class="content-tabs">
                        <button class="tab-btn active" data-tab="attendance">Attendance</button>
                        <button class="tab-btn" data-tab="schedules">Schedules</button>
                        <button class="tab-btn" data-tab="transfers">Transfers</button>
                        <button class="tab-btn" data-tab="analytics">Analytics</button>
                    </div>

                    <div class="tab-content active" id="attendance-tab">
                        <div class="attendance-overview" id="attendance-overview">
                            ${this.renderAttendanceOverview()}
                        </div>
                    </div>

                    <div class="tab-content" id="schedules-tab">
                        <div class="schedules-overview" id="schedules-overview">
                            ${this.renderSchedulesOverview()}
                        </div>
                    </div>

                    <div class="tab-content" id="transfers-tab">
                        <div class="transfers-overview" id="transfers-overview">
                            ${this.renderTransfersOverview()}
                        </div>
                    </div>

                    <div class="tab-content" id="analytics-tab">
                        <div class="analytics-overview" id="analytics-overview">
                            ${this.renderAnalyticsOverview()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = dashboardHTML;
    }

    /**
     * Render site overview cards
     */
    renderSiteOverview(sites) {
        if (this.selectedSite !== 'ALL') {
            const site = sites.find(s => s.id === this.selectedSite);
            return site ? this.renderSiteCard(site, true) : '';
        }

        return sites.map(site => this.renderSiteCard(site, false)).join('');
    }

    /**
     * Render individual site card
     */
    renderSiteCard(site, detailed = false) {
        const isOnline = this.isSiteOnline(site);
        const employeeCount = this.getSiteEmployeeCount(site.id);
        const currentShift = this.getCurrentShift(site.id);

        return `
            <div class="site-card ${detailed ? 'detailed' : ''} ${isOnline ? 'online' : 'offline'}" data-site-id="${site.id}">
                <div class="site-header">
                    <div class="site-info">
                        <h3>${site.name}</h3>
                        <p class="site-location">${site.location}</p>
                    </div>
                    <div class="site-status">
                        <div class="status-indicator ${isOnline ? 'online' : 'offline'}">
                            <i class="fas fa-${isOnline ? 'check-circle' : 'times-circle'}"></i>
                            ${isOnline ? 'Online' : 'Offline'}
                        </div>
                    </div>
                </div>

                <div class="site-metrics">
                    <div class="metric">
                        <span class="metric-value">${employeeCount}</span>
                        <span class="metric-label">Employees</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${site.capacity}</span>
                        <span class="metric-label">Capacity</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${currentShift}</span>
                        <span class="metric-label">Current Shift</span>
                    </div>
                </div>

                ${detailed ? `
                    <div class="site-details">
                        <div class="detail-section">
                            <h4>Operating Hours</h4>
                            <div class="operating-hours">
                                ${this.renderOperatingHours(site.operatingHours)}
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Departments</h4>
                            <div class="departments-list">
                                ${site.departments.map(dept => `
                                    <span class="department-tag">${dept.replace('_', ' ')}</span>
                                `).join('')}
                            </div>
                        </div>

                        <div class="detail-section">
                            <h4>Facilities</h4>
                            <div class="facilities-list">
                                ${site.facilities.map(facility => `
                                    <span class="facility-tag">${facility}</span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="site-actions">
                    <button class="action-btn small secondary" onclick="multiSiteDashboard.viewSiteDetails('${site.id}')">
                        <i class="fas fa-eye"></i>
                        View Details
                    </button>
                    ${this.canManageSite(site.id) ? `
                        <button class="action-btn small primary" onclick="multiSiteDashboard.manageSite('${site.id}')">
                            <i class="fas fa-cog"></i>
                            Manage
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render metrics grid
     */
    renderMetricsGrid() {
        const metrics = this.calculateMetrics();

        return `
            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="metric-content">
                    <h3>${metrics.totalEmployees}</h3>
                    <p>Total Employees</p>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="metric-content">
                    <h3>${metrics.activeShifts}</h3>
                    <p>Active Shifts</p>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="metric-content">
                    <h3>${metrics.activeSites}</h3>
                    <p>Active Sites</p>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <div class="metric-content">
                    <h3>${metrics.pendingTransfers}</h3>
                    <p>Pending Transfers</p>
                </div>
            </div>
        `;
    }

    /**
     * Render attendance overview
     */
    renderAttendanceOverview() {
        return `
            <div class="attendance-summary">
                <h3>Today's Attendance</h3>
                <div class="attendance-stats">
                    <div class="stat-item">
                        <span class="stat-value">85%</span>
                        <span class="stat-label">Present</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">12</span>
                        <span class="stat-label">Late</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">3</span>
                        <span class="stat-label">Absent</span>
                    </div>
                </div>
            </div>

            <div class="recent-checkins">
                <h4>Recent Check-ins</h4>
                <div class="checkins-list">
                    <p>Real-time check-in data will be displayed here</p>
                </div>
            </div>
        `;
    }

    /**
     * Render schedules overview
     */
    renderSchedulesOverview() {
        return `
            <div class="schedules-summary">
                <h3>Site Schedules</h3>
                <div class="schedule-grid">
                    <p>Site-specific scheduling interface will be implemented here</p>
                </div>
            </div>
        `;
    }

    /**
     * Render transfers overview
     */
    renderTransfersOverview() {
        const transfers = window.multiSiteSystem.getTransferRequests();

        return `
            <div class="transfers-summary">
                <h3>Transfer Requests</h3>
                <div class="transfers-list">
                    ${transfers.length > 0 ? transfers.map(transfer => `
                        <div class="transfer-item">
                            <div class="transfer-info">
                                <strong>${transfer.fromSite} → ${transfer.toSite}</strong>
                                <p>${transfer.reason}</p>
                            </div>
                            <div class="transfer-status">
                                <span class="status-badge ${transfer.status}">${transfer.status}</span>
                            </div>
                        </div>
                    `).join('') : '<p>No transfer requests</p>'}
                </div>
            </div>
        `;
    }

    /**
     * Render analytics overview
     */
    renderAnalyticsOverview() {
        return `
            <div class="analytics-summary">
                <h3>Performance Analytics</h3>
                <div class="analytics-grid">
                    <p>Site-specific performance analytics will be displayed here</p>
                </div>
            </div>
        `;
    }

    /**
     * Helper methods
     */
    isSiteOnline(site) {
        // Simulate site online status
        return Math.random() > 0.1; // 90% uptime
    }

    getSiteEmployeeCount(siteId) {
        // Simulate employee count
        const counts = { 'BAUAN': 45, 'SAN_ROQUE': 67, 'ILIJAN': 23, 'BATANGAS': 34, 'ANTIPOLO': 28, 'CEMEX': 15 };
        return counts[siteId] || 0;
    }

    getCurrentShift(siteId) {
        const site = window.multiSiteSystem.getSiteById(siteId);
        if (!site) return 'N/A';

        const schedules = window.multiSiteSystem.schedules[siteId];
        if (!schedules) return 'N/A';

        // Return first shift as current (simplified)
        const firstShift = Object.values(schedules.shifts)[0];
        return firstShift ? firstShift.name : 'N/A';
    }

    canManageSite(siteId) {
        if (this.currentUser.role === 'developer') return true;

        const site = window.multiSiteSystem.getSiteById(siteId);
        return site && site.headOfSite === this.currentUser.username;
    }

    calculateMetrics() {
        const sites = window.multiSiteSystem.getActiveSites();
        const transfers = window.multiSiteSystem.getTransferRequests({ status: 'pending' });

        return {
            totalEmployees: sites.reduce((sum, site) => sum + this.getSiteEmployeeCount(site.id), 0),
            activeShifts: sites.length * 2, // Simplified calculation
            activeSites: sites.length,
            pendingTransfers: transfers.length
        };
    }

    renderOperatingHours(hours) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        return days.map(day => {
            const dayHours = hours[day];
            if (dayHours.closed) {
                return `<div class="hours-item"><span>${day}:</span> <span>Closed</span></div>`;
            }
            return `<div class="hours-item"><span>${day}:</span> <span>${dayHours.start} - ${dayHours.end}</span></div>`;
        }).join('');
    }

    /**
     * Load dashboard data
     */
    loadDashboardData() {
        // Simulate loading dashboard data
        console.log('Loading multi-site dashboard data...');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Site filter change
        document.getElementById('site-filter')?.addEventListener('change', (e) => {
            this.selectedSite = e.target.value;
            this.refreshDashboard();
        });

        // Refresh button
        document.getElementById('refresh-dashboard')?.addEventListener('click', () => {
            this.refreshDashboard();
        });

        // Tab switching
        document.querySelectorAll('.content-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    /**
     * Refresh dashboard
     */
    refreshDashboard() {
        this.loadDashboardData();
        this.render();
        this.attachEventListeners();
    }

    /**
     * Switch tabs
     */
    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.content-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    /**
     * View site details
     */
    viewSiteDetails(siteId) {
        this.selectedSite = siteId;
        this.refreshDashboard();
    }

    /**
     * Manage site
     */
    manageSite(siteId) {
        console.log('Managing site:', siteId);
        // Implementation for site management
    }
}

// Create global instance
window.multiSiteDashboard = new MultiSiteDashboard();
