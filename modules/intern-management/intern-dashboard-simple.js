/**
 * Simple Intern Management Dashboard
 * Simplified version to ensure it loads properly
 */

class SimpleInternDashboard {
    constructor() {
        this.currentUser = null;
        this.currentView = 'dashboard'; // dashboard, department, intern
        this.selectedDepartment = null;
        this.selectedIntern = null;
        this.interns = [
            {
                id: 'intern_001',
                name: 'John Mark Santos',
                email: 'johnmark@agp.com',
                department: 'IT Department',
                position: 'Software Development Intern',
                status: 'active',
                totalHours: 486,
                completedActivities: 12
            },
            {
                id: 'intern_002',
                name: 'Maria Elena Cruz',
                email: 'maria@agp.com',
                department: 'HR Department',
                position: 'Human Resources Intern',
                status: 'active',
                totalHours: 520,
                completedActivities: 15
            },
            {
                id: 'intern_003',
                name: 'Carlos Miguel Reyes',
                email: 'carlos@agp.com',
                department: 'Engineering Department',
                position: 'Mechanical Engineering Intern',
                status: 'active',
                totalHours: 545,
                completedActivities: 18
            }
        ];
    }

    init(user) {
        console.log('🚀 Simple Intern Dashboard initializing...');
        this.currentUser = user;
        this.render();
        console.log('✅ Simple Intern Dashboard initialized successfully!');
    }

    render() {
        const container = document.getElementById('dashboard-section');
        if (!container) {
            console.error('❌ Dashboard container not found');
            return;
        }

        // Render different views based on current state
        switch (this.currentView) {
            case 'department':
                this.renderDepartmentView();
                break;
            case 'intern':
                this.renderInternDetailView();
                break;
            default:
                this.renderDashboardView();
                break;
        }
    }

    renderDashboardView() {
        const container = document.getElementById('dashboard-section');
        const activeInterns = this.interns.filter(i => i.status === 'active').length;
        const totalHours = this.interns.reduce((sum, intern) => sum + intern.totalHours, 0);

        container.innerHTML = `
            <div class="intern-management-dashboard">
                <!-- Welcome Header -->
                <div class="welcome-card">
                    <div class="welcome-content">
                        <div class="welcome-text">
                            <h2 class="welcome-title">
                                <i class="fas fa-building"></i>
                                Intern Management Dashboard
                            </h2>
                            <p class="welcome-subtitle">
                                <span class="role-badge role-badge--developer">DEVELOPER</span>
                                <span class="position-text">${this.currentUser.position || 'System Administrator'}</span>
                                <span class="separator">•</span>
                                <span class="description-text">Monitor and manage intern attendance, activities, and departments</span>
                            </p>
                        </div>
                        <div class="welcome-stats">
                            <div class="quick-stat">
                                <span class="quick-stat-value">${this.interns.length}</span>
                                <span class="quick-stat-label">Total Interns</span>
                            </div>
                            <div class="quick-stat">
                                <span class="quick-stat-value">${activeInterns}</span>
                                <span class="quick-stat-label">Active</span>
                            </div>
                            <div class="quick-stat">
                                <span class="quick-stat-value">${totalHours}h</span>
                                <span class="quick-stat-label">Total Hours</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Statistics Grid -->
                <div class="stats-grid">
                    <div class="stat-card stat-card--primary">
                        <div class="stat-content">
                            <div class="stat-header">
                                <div class="stat-icon stat-icon--primary">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 class="stat-title">Total Interns</h3>
                                    <p class="stat-subtitle">All registered interns</p>
                                </div>
                            </div>
                            <div class="stat-footer">
                                <div class="stat-value">${this.interns.length}</div>
                                <div class="stat-trend stat-trend--positive">
                                    <i class="fas fa-arrow-up"></i>
                                    +2 this month
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card stat-card--success">
                        <div class="stat-content">
                            <div class="stat-header">
                                <div class="stat-icon stat-icon--success">
                                    <i class="fas fa-user-check"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 class="stat-title">Active Interns</h3>
                                    <p class="stat-subtitle">Currently active</p>
                                </div>
                            </div>
                            <div class="stat-footer">
                                <div class="stat-value">${activeInterns}</div>
                                <div class="stat-trend stat-trend--positive">
                                    <i class="fas fa-arrow-up"></i>
                                    ${((activeInterns/this.interns.length)*100).toFixed(0)}% active
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card stat-card--info">
                        <div class="stat-content">
                            <div class="stat-header">
                                <div class="stat-icon stat-icon--info">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 class="stat-title">Total Hours</h3>
                                    <p class="stat-subtitle">All intern hours</p>
                                </div>
                            </div>
                            <div class="stat-footer">
                                <div class="stat-value">${totalHours}</div>
                                <div class="stat-trend stat-trend--neutral">
                                    <i class="fas fa-minus"></i>
                                    ${(totalHours/activeInterns).toFixed(0)} avg/intern
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                <!-- Department Management Section -->
                <div class="management-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <i class="fas fa-building"></i>
                            Department Management
                        </h2>
                        <div class="actions">
                            <button class="action-btn secondary" onclick="window.simpleInternDashboard.refreshDepartments()">
                                <i class="fas fa-sync-alt"></i>
                                <span>Refresh</span>
                            </button>
                            <button class="action-btn primary" onclick="window.simpleInternDashboard.createDepartment()">
                                <i class="fas fa-plus"></i>
                                <span>Add Department</span>
                            </button>
                        </div>
                    </div>

                    <div id="departments-grid" class="departments-grid">
                        ${this.renderDepartments()}
                    </div>
                </div>

                <!-- Quick Actions Section -->
                <div class="management-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <i class="fas fa-tools"></i>
                            Quick Actions
                        </h2>
                    </div>

                    <div class="quick-actions-grid">
                        <button class="quick-action-card" onclick="alert('Export Data feature coming soon!')">
                            <div class="quick-action-icon">
                                <i class="fas fa-download"></i>
                            </div>
                            <div class="quick-action-content">
                                <h4>Export Data</h4>
                                <p>Download intern and attendance data</p>
                            </div>
                        </button>

                        <button class="quick-action-card" onclick="alert('Attendance Reports feature coming soon!')">
                            <div class="quick-action-icon">
                                <i class="fas fa-chart-bar"></i>
                            </div>
                            <div class="quick-action-content">
                                <h4>Attendance Reports</h4>
                                <p>Generate detailed attendance reports</p>
                            </div>
                        </button>

                        <button class="quick-action-card" onclick="alert('System Settings feature coming soon!')">
                            <div class="quick-action-icon">
                                <i class="fas fa-cog"></i>
                            </div>
                            <div class="quick-action-content">
                                <h4>System Settings</h4>
                                <p>Configure system preferences</p>
                            </div>
                        </button>

                        <button class="quick-action-card" onclick="alert('Backup Data feature coming soon!')">
                            <div class="quick-action-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="quick-action-content">
                                <h4>Backup Data</h4>
                                <p>Create system backup</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderDepartmentView() {
        const container = document.getElementById('dashboard-section');
        if (!this.selectedDepartment) {
            this.currentView = 'dashboard';
            this.render();
            return;
        }

        const department = window.userDatabase.getDepartmentById(this.selectedDepartment);
        if (!department) {
            this.currentView = 'dashboard';
            this.render();
            return;
        }

        // Get all users in this department from the actual database
        const departmentUsers = window.userDatabase.getAllUsers().filter(user =>
            user.department === department.id
        );

        // Also get sample interns for demonstration
        const departmentInterns = this.interns.filter(intern =>
            intern.department === department.name
        );

        // Get department head info
        const head = department.head ? window.userDatabase.users[department.head] : null;

        container.innerHTML = `
            <div class="intern-management-dashboard">
                <!-- Breadcrumb Navigation -->
                <div class="breadcrumb-nav">
                    <button class="breadcrumb-item" onclick="window.simpleInternDashboard.goToDashboard()">
                        <i class="fas fa-home"></i>
                        Dashboard
                    </button>
                    <span class="breadcrumb-separator">
                        <i class="fas fa-chevron-right"></i>
                    </span>
                    <span class="breadcrumb-current">
                        <i class="fas fa-building"></i>
                        ${department.name}
                    </span>
                </div>

                <!-- Department Header -->
                <div class="department-detail-header">
                    <div class="department-detail-info">
                        <h1 class="department-detail-title">
                            <i class="fas fa-building"></i>
                            ${department.name}
                        </h1>
                        <p class="department-detail-description">${department.description}</p>
                        <div class="department-detail-meta">
                            <span class="status-badge ${department.isActive ? 'status-success' : 'status-error'}">
                                ${department.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                            <span class="department-head">
                                <i class="fas fa-user-tie"></i>
                                Head: ${head ? head.name : 'No Head Assigned'}
                            </span>
                        </div>
                    </div>
                    <div class="department-detail-actions">
                        <button class="action-btn secondary" onclick="window.simpleInternDashboard.editDepartment('${department.id}')">
                            <i class="fas fa-edit"></i>
                            <span>Edit Department</span>
                        </button>
                    </div>
                </div>

                <!-- Department Statistics -->
                <div class="stats-grid">
                    <div class="stat-card stat-card--primary">
                        <div class="stat-content">
                            <div class="stat-header">
                                <div class="stat-icon stat-icon--primary">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 class="stat-title">Total Members</h3>
                                    <p class="stat-subtitle">Interns in department</p>
                                </div>
                            </div>
                            <div class="stat-footer">
                                <div class="stat-value">${departmentUsers.length + departmentInterns.length}</div>
                                <div class="stat-trend stat-trend--neutral">
                                    <i class="fas fa-minus"></i>
                                    ${departmentUsers.filter(u => u.isActive).length + departmentInterns.filter(i => i.status === 'active').length} active
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card stat-card--success">
                        <div class="stat-content">
                            <div class="stat-header">
                                <div class="stat-icon stat-icon--success">
                                    <i class="fas fa-user-graduate"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 class="stat-title">Interns</h3>
                                    <p class="stat-subtitle">Intern users</p>
                                </div>
                            </div>
                            <div class="stat-footer">
                                <div class="stat-value">${departmentUsers.filter(u => u.role === 'user').length + departmentInterns.length}</div>
                                <div class="stat-trend stat-trend--positive">
                                    <i class="fas fa-arrow-up"></i>
                                    ${departmentUsers.filter(u => u.role === 'user').length} registered, ${departmentInterns.length} sample
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card stat-card--info">
                        <div class="stat-content">
                            <div class="stat-header">
                                <div class="stat-icon stat-icon--info">
                                    <i class="fas fa-user-tie"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 class="stat-title">Staff</h3>
                                    <p class="stat-subtitle">Admin & Developer users</p>
                                </div>
                            </div>
                            <div class="stat-footer">
                                <div class="stat-value">${departmentUsers.filter(u => u.role !== 'user').length}</div>
                                <div class="stat-trend stat-trend--neutral">
                                    <i class="fas fa-minus"></i>
                                    ${departmentUsers.filter(u => u.role === 'admin').length} admin, ${departmentUsers.filter(u => u.role === 'developer').length} dev
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Department Members -->
                <div class="management-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <i class="fas fa-users"></i>
                            Department Members
                        </h2>
                        <div class="actions">
                            <button class="action-btn secondary" onclick="alert('Filter feature coming soon!')">
                                <i class="fas fa-filter"></i>
                                <span>Filter</span>
                            </button>
                            <button class="action-btn primary" onclick="alert('Add Member feature coming soon!')">
                                <i class="fas fa-user-plus"></i>
                                <span>Add Member</span>
                            </button>
                        </div>
                    </div>

                    <div class="members-grid">
                        ${this.renderDepartmentMembers(departmentUsers, departmentInterns)}
                    </div>
                </div>
            </div>
        `;
    }

    renderDepartmentMembers(departmentUsers, departmentInterns) {
        const allMembers = [];

        // Add real users from database
        departmentUsers.forEach(user => {
            allMembers.push({
                type: 'user',
                id: user.id,
                name: user.name,
                position: user.position,
                email: user.email,
                status: user.isActive ? 'active' : 'inactive',
                role: user.role,
                avatar: user.avatar,
                school: user.school || 'Not specified',
                applicantId: user.applicantId || user.id,
                timeRequired: user.timeRequired || 'Not specified',
                progress: user.progress || 0,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            });
        });

        // Add sample interns
        departmentInterns.forEach(intern => {
            allMembers.push({
                type: 'intern',
                id: intern.id,
                name: intern.name,
                position: intern.position,
                email: intern.email,
                status: intern.status,
                role: 'intern',
                avatar: null,
                school: intern.school || 'Sample University',
                applicantId: intern.applicantId || `INTERN-${intern.id}`,
                timeRequired: intern.timeRequired || '600 hours',
                progress: Math.round((intern.totalHours / 600) * 100),
                totalHours: intern.totalHours,
                completedActivities: intern.completedActivities,
                startDate: intern.startDate
            });
        });

        if (allMembers.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3>No Members Found</h3>
                    <p>This department doesn't have any users assigned yet.</p>
                    <button class="action-btn primary" onclick="alert('Add Member feature coming soon!')">
                        <i class="fas fa-user-plus"></i>
                        <span>Add Member</span>
                    </button>
                </div>
            `;
        }

        return allMembers.map(member => {
            const statusClass = member.status === 'active' ? 'status-success' : 'status-error';
            const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase();
            const roleClass = member.role === 'user' || member.role === 'intern' ? 'role-user' :
                             member.role === 'admin' ? 'role-admin' : 'role-developer';

            return `
                <div class="member-card" data-member-id="${member.id}" data-member-type="${member.type}">
                    <div class="member-header">
                        <div class="member-avatar">
                            ${member.avatar ?
                                `<img src="${member.avatar}" alt="${member.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` :
                                `<div class="avatar-fallback">${initials}</div>`
                            }
                        </div>
                        <div class="member-info">
                            <h4 class="member-name">
                                <button class="name-link" onclick="window.simpleInternDashboard.viewUserDetails('${member.id}', '${member.type}')">
                                    ${member.name}
                                </button>
                            </h4>
                            <p class="member-position">${member.position}</p>
                            <div class="member-badges">
                                <span class="status-badge ${statusClass}">${member.status.toUpperCase()}</span>
                                <span class="role-badge ${roleClass}">${member.role.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div class="member-stats">
                        <div class="stat-item">
                            <span class="stat-label">School</span>
                            <span class="stat-value">${member.school}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Applicant ID</span>
                            <span class="stat-value">${member.applicantId}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Time Required</span>
                            <span class="stat-value">${member.timeRequired}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Progress</span>
                            <span class="stat-value">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${member.progress}%"></div>
                                    <span class="progress-text">${member.progress}%</span>
                                </div>
                            </span>
                        </div>
                    </div>

                    <div class="member-actions">
                        <button class="action-btn small secondary" onclick="window.simpleInternDashboard.viewUserDetails('${member.id}', '${member.type}')">
                            <i class="fas fa-eye"></i>
                            <span>View Details</span>
                        </button>
                        <button class="action-btn small primary" onclick="alert('Edit ${member.name} feature coming soon!')">
                            <i class="fas fa-edit"></i>
                            <span>Edit</span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderInternDetailView() {
        const container = document.getElementById('dashboard-section');
        if (!this.selectedIntern) {
            this.currentView = 'dashboard';
            this.render();
            return;
        }

        // Try to find user in database first, then in sample interns
        let user = null;
        let userType = 'user';

        if (window.userDatabase) {
            user = window.userDatabase.getUserById(this.selectedIntern);
        }

        if (!user) {
            user = this.interns.find(i => i.id === this.selectedIntern);
            userType = 'intern';
        }

        if (!user) {
            this.currentView = 'dashboard';
            this.render();
            return;
        }

        // Normalize user data for both types
        const userData = this.normalizeUserData(user, userType);

        // Generate sample attendance and activity data
        const attendanceData = this.generateSampleAttendance(userData);
        const activityData = this.generateSampleActivities(userData);

        container.innerHTML = `
            <div class="intern-management-dashboard">
                <!-- Breadcrumb Navigation -->
                <div class="breadcrumb-nav">
                    <button class="breadcrumb-item" onclick="window.simpleInternDashboard.goToDashboard()">
                        <i class="fas fa-home"></i>
                        Dashboard
                    </button>
                    <span class="breadcrumb-separator">
                        <i class="fas fa-chevron-right"></i>
                    </span>
                    <button class="breadcrumb-item" onclick="window.simpleInternDashboard.goToDepartment('${userData.departmentId}')">
                        <i class="fas fa-building"></i>
                        ${userData.departmentName}
                    </button>
                    <span class="breadcrumb-separator">
                        <i class="fas fa-chevron-right"></i>
                    </span>
                    <span class="breadcrumb-current">
                        <i class="fas fa-user"></i>
                        ${userData.name}
                    </span>
                </div>

                <!-- User Profile Header -->
                <div class="intern-profile-header">
                    <div class="intern-profile-info">
                        <div class="intern-profile-avatar">
                            ${userData.avatar ?
                                `<img src="${userData.avatar}" alt="${userData.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` :
                                `<div class="avatar-fallback large">${userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>`
                            }
                        </div>
                        <div class="intern-profile-details">
                            <h1 class="intern-profile-name">${userData.name}</h1>
                            <p class="intern-profile-position">${userData.position}</p>
                            <div class="intern-profile-meta">
                                <span class="status-badge ${userData.status === 'active' ? 'status-success' : 'status-error'}">
                                    ${userData.status.toUpperCase()}
                                </span>
                                <span class="role-badge role-badge--${userData.role}">
                                    ${userData.role.toUpperCase()}
                                </span>
                                <span class="intern-department">
                                    <i class="fas fa-building"></i>
                                    ${userData.departmentName}
                                </span>
                                <span class="intern-email">
                                    <i class="fas fa-envelope"></i>
                                    ${userData.email}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="intern-profile-actions">
                        <button class="action-btn secondary" onclick="alert('Edit Profile feature coming soon!')">
                            <i class="fas fa-edit"></i>
                            <span>Edit Profile</span>
                        </button>
                        <button class="action-btn primary" onclick="alert('Generate Report feature coming soon!')">
                            <i class="fas fa-file-pdf"></i>
                            <span>Generate Report</span>
                        </button>
                    </div>
                </div>

                <!-- User Information Grid -->
                <div class="user-info-grid">
                    <div class="info-card">
                        <div class="info-header">
                            <i class="fas fa-graduation-cap"></i>
                            <h3>Academic Information</h3>
                        </div>
                        <div class="info-content">
                            <div class="info-item">
                                <label>School:</label>
                                <span>${userData.school}</span>
                            </div>
                            <div class="info-item">
                                <label>Applicant ID:</label>
                                <span>${userData.applicantId}</span>
                            </div>
                            <div class="info-item">
                                <label>Time Required:</label>
                                <span>${userData.timeRequired}</span>
                            </div>
                            <div class="info-item">
                                <label>Progress:</label>
                                <div class="progress-container">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${userData.progress}%"></div>
                                    </div>
                                    <span class="progress-percentage">${userData.progress}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="info-header">
                            <i class="fas fa-clock"></i>
                            <h3>Time Tracking</h3>
                        </div>
                        <div class="info-content">
                            <div class="info-item">
                                <label>Total Hours:</label>
                                <span>${userData.totalHours || 0}h</span>
                            </div>
                            <div class="info-item">
                                <label>Hours Remaining:</label>
                                <span>${userData.hoursRemaining || 'N/A'}h</span>
                            </div>
                            <div class="info-item">
                                <label>Average per Day:</label>
                                <span>${userData.avgHoursPerDay || 0}h</span>
                            </div>
                            <div class="info-item">
                                <label>Start Date:</label>
                                <span>${userData.startDate ? new Date(userData.startDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="info-card">
                        <div class="info-header">
                            <i class="fas fa-tasks"></i>
                            <h3>Activity Summary</h3>
                        </div>
                        <div class="info-content">
                            <div class="info-item">
                                <label>Completed Tasks:</label>
                                <span>${userData.completedActivities || 0}</span>
                            </div>
                            <div class="info-item">
                                <label>Pending Tasks:</label>
                                <span>${activityData.filter(a => a.status === 'pending').length}</span>
                            </div>
                            <div class="info-item">
                                <label>In Progress:</label>
                                <span>${activityData.filter(a => a.status === 'in-progress').length}</span>
                            </div>
                            <div class="info-item">
                                <label>Attendance Rate:</label>
                                <span>${Math.round(attendanceData.filter(a => a.status === 'Present').length / attendanceData.length * 100)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Attendance and Activities Tabs -->
                <div class="detail-tabs">
                    <div class="tab-navigation">
                        <button class="tab-btn active" data-tab="attendance">
                            <i class="fas fa-calendar-alt"></i>
                            Attendance History
                        </button>
                        <button class="tab-btn" data-tab="activities">
                            <i class="fas fa-tasks"></i>
                            Activities
                        </button>
                    </div>

                    <div class="tab-content active" id="attendance-tab">
                        ${this.renderAttendanceHistory(attendanceData)}
                    </div>

                    <div class="tab-content" id="activities-tab">
                        ${this.renderActivitiesHistory(activityData)}
                    </div>
                </div>
            </div>
        `;

        // Add tab switching functionality
        this.setupTabSwitching();
    }

    renderDepartments() {
        if (!window.userDatabase) {
            return '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Loading departments...</div>';
        }

        const departments = window.userDatabase.getAllDepartments();

        if (departments.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <h3>No Departments Found</h3>
                    <p>Create your first department to get started with organizing your interns.</p>
                    <button class="action-btn primary" onclick="window.simpleInternDashboard.createDepartment()">
                        <i class="fas fa-plus"></i>
                        <span>Create Department</span>
                    </button>
                </div>
            `;
        }

        return departments.map(dept => {
            const head = dept.head ? window.userDatabase.users[dept.head] : null;
            const memberCount = dept.members.length;
            const statusClass = dept.isActive ? 'status-success' : 'status-error';

            return `
                <div class="department-card clickable" data-department-id="${dept.id}" onclick="window.simpleInternDashboard.viewDepartment('${dept.id}')">
                    <div class="department-header">
                        <div class="department-info">
                            <h4 class="department-name">${dept.name}</h4>
                            <p class="department-description">${dept.description}</p>
                        </div>
                        <span class="status-badge ${statusClass}">
                            ${dept.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                    </div>

                    <div class="department-stats">
                        <div class="stat-item">
                            <span class="stat-label">Department Head</span>
                            <span class="stat-value">${head ? head.name : 'No Head Assigned'}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Members</span>
                            <span class="stat-value">${memberCount} ${memberCount === 1 ? 'person' : 'people'}</span>
                        </div>
                    </div>

                    <div class="department-actions" onclick="event.stopPropagation()">
                        <button class="action-btn small secondary" onclick="window.simpleInternDashboard.editDepartment('${dept.id}')">
                            <i class="fas fa-edit"></i>
                            <span>Edit</span>
                        </button>
                        <button class="action-btn small primary" onclick="window.simpleInternDashboard.viewDepartment('${dept.id}')">
                            <i class="fas fa-users"></i>
                            <span>View Members</span>
                        </button>
                        <button class="action-btn small danger" onclick="window.simpleInternDashboard.deleteDepartment('${dept.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Department Management Methods
    createDepartment() {
        const name = prompt('Enter department name:');
        if (!name) return;

        const description = prompt('Enter department description:') || '';
        const deptId = name.toUpperCase().replace(/\s+/g, '_');

        const newDepartment = {
            id: deptId,
            name: name,
            description: description,
            head: null,
            members: [],
            isActive: true
        };

        const result = window.userDatabase.createDepartment(newDepartment);

        if (result.success) {
            alert(`Department "${name}" created successfully!`);
            this.refreshDepartments();
        } else {
            alert(result.message || 'Failed to create department');
        }
    }

    editDepartment(deptId) {
        const department = window.userDatabase.getDepartmentById(deptId);
        if (!department) return;

        const newName = prompt('Enter new department name:', department.name);
        if (!newName) return;

        const newDescription = prompt('Enter new description:', department.description) || '';
        const isActive = confirm('Is this department active?');

        const updates = {
            name: newName,
            description: newDescription,
            isActive: isActive
        };

        const success = window.userDatabase.updateDepartment(deptId, updates);

        if (success) {
            alert('Department updated successfully!');
            this.refreshDepartments();
        } else {
            alert('Failed to update department');
        }
    }

    manageDepartmentMembers(deptId) {
        const department = window.userDatabase.getDepartmentById(deptId);
        if (!department) return;

        const members = department.members.map(username => {
            const user = window.userDatabase.users[username];
            return user ? `${user.name} (${user.position})` : username;
        }).join('\n');

        alert(`Department: ${department.name}\n\nMembers:\n${members || 'No members assigned'}\n\nNote: Full member management will be available in the next update.`);
    }

    deleteDepartment(deptId) {
        const department = window.userDatabase.getDepartmentById(deptId);
        if (!department) return;

        if (!confirm(`Are you sure you want to delete the "${department.name}" department?\n\nThis will remove all users from this department.`)) {
            return;
        }

        const success = window.userDatabase.deleteDepartment(deptId);

        if (success) {
            alert('Department deleted successfully!');
            this.refreshDepartments();
        } else {
            alert('Failed to delete department');
        }
    }

    refreshDepartments() {
        const departmentsGrid = document.getElementById('departments-grid');
        if (departmentsGrid) {
            departmentsGrid.innerHTML = this.renderDepartments();
        }
    }

    // Navigation Methods
    viewDepartment(departmentId) {
        this.selectedDepartment = departmentId;
        this.currentView = 'department';
        this.render();
    }

    viewInternDetails(internId) {
        this.selectedIntern = internId;
        this.currentView = 'intern';
        this.render();
    }

    viewUserDetails(userId, userType = 'user') {
        this.selectedIntern = userId;
        this.selectedUserType = userType;
        this.currentView = 'intern';
        this.render();
    }

    goToDashboard() {
        this.currentView = 'dashboard';
        this.selectedDepartment = null;
        this.selectedIntern = null;
        this.render();
    }

    goToDepartment(departmentId) {
        this.selectedDepartment = departmentId;
        this.currentView = 'department';
        this.selectedIntern = null;
        this.render();
    }

    // Helper Methods
    getDepartmentIdByName(departmentName) {
        if (!window.userDatabase) return null;
        const departments = window.userDatabase.getAllDepartments();
        const dept = departments.find(d => d.name === departmentName);
        return dept ? dept.id : null;
    }

    normalizeUserData(user, userType) {
        let department = null;
        let departmentId = null;
        let departmentName = 'No Department';

        if (userType === 'user' && user.department && window.userDatabase) {
            department = window.userDatabase.getDepartmentById(user.department);
            departmentId = user.department;
            departmentName = department ? department.name : 'Unknown Department';
        } else if (userType === 'intern' && user.department) {
            departmentId = this.getDepartmentIdByName(user.department);
            departmentName = user.department;
        }

        const timeRequired = userType === 'user' ? (user.timeRequired || '600 hours') : (user.timeRequired || '600 hours');
        const totalHours = userType === 'user' ? (user.totalHours || 0) : (user.totalHours || 0);
        const requiredHours = parseInt(timeRequired.replace(/[^\d]/g, '')) || 600;
        const progress = Math.min(Math.round((totalHours / requiredHours) * 100), 100);
        const hoursRemaining = Math.max(requiredHours - totalHours, 0);
        const workingDays = userType === 'user' ? this.getWorkingDays(user.createdAt) : this.getWorkingDays(user.startDate);
        const avgHoursPerDay = workingDays > 0 ? (totalHours / workingDays).toFixed(1) : 0;

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            position: user.position,
            status: userType === 'user' ? (user.isActive ? 'active' : 'inactive') : user.status,
            role: userType === 'user' ? user.role : 'intern',
            avatar: user.avatar || null,
            school: user.school || (userType === 'intern' ? 'Sample University' : 'Not specified'),
            applicantId: user.applicantId || (userType === 'intern' ? `INTERN-${user.id}` : user.id),
            timeRequired: timeRequired,
            totalHours: totalHours,
            progress: progress,
            hoursRemaining: hoursRemaining,
            avgHoursPerDay: avgHoursPerDay,
            completedActivities: user.completedActivities || 0,
            startDate: userType === 'user' ? user.createdAt : user.startDate,
            lastLogin: user.lastLogin || null,
            departmentId: departmentId,
            departmentName: departmentName
        };
    }

    getWorkingDays(startDate) {
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Approximate working days (excluding weekends)
        return Math.floor(diffDays * 5/7);
    }

    generateSampleAttendance(intern) {
        const attendance = [];
        const today = new Date();

        // Generate last 20 working days
        for (let i = 19; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            const isPresent = Math.random() > 0.15; // 85% attendance rate

            attendance.push({
                date: date.toISOString().split('T')[0],
                timeIn: isPresent ? `${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : null,
                timeOut: isPresent ? `${17 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}` : null,
                hours: isPresent ? (7 + Math.random() * 2).toFixed(1) : '0.0',
                status: isPresent ? 'Present' : 'Absent'
            });
        }

        return attendance;
    }

    generateSampleActivities(intern) {
        const activities = [
            { title: 'Database Design Review', description: 'Review and optimize database schema', status: 'completed', date: '2024-01-18' },
            { title: 'Frontend Component Development', description: 'Create reusable UI components', status: 'in-progress', date: '2024-01-19' },
            { title: 'API Integration Testing', description: 'Test API endpoints and data flow', status: 'completed', date: '2024-01-17' },
            { title: 'Documentation Update', description: 'Update project documentation', status: 'pending', date: '2024-01-20' },
            { title: 'Code Review Session', description: 'Participate in team code review', status: 'completed', date: '2024-01-16' },
            { title: 'Bug Fix Implementation', description: 'Fix reported UI bugs', status: 'in-progress', date: '2024-01-19' },
            { title: 'Performance Optimization', description: 'Optimize application performance', status: 'pending', date: '2024-01-21' }
        ];

        return activities.map(activity => ({
            ...activity,
            id: Math.random().toString(36).substr(2, 9),
            assignedBy: 'System Administrator'
        }));
    }

    renderAttendanceHistory(attendanceData) {
        return `
            <div class="attendance-history">
                <div class="attendance-table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time In</th>
                                <th>Time Out</th>
                                <th>Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${attendanceData.map(record => `
                                <tr>
                                    <td>${new Date(record.date).toLocaleDateString()}</td>
                                    <td>${record.timeIn || '-'}</td>
                                    <td>${record.timeOut || '-'}</td>
                                    <td>${record.hours}h</td>
                                    <td>
                                        <span class="status-badge ${record.status === 'Present' ? 'status-success' : 'status-error'}">
                                            ${record.status}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderActivitiesHistory(activityData) {
        return `
            <div class="activities-history">
                <div class="activities-grid">
                    ${activityData.map(activity => `
                        <div class="activity-card">
                            <div class="activity-header">
                                <h4 class="activity-title">${activity.title}</h4>
                                <span class="status-badge ${activity.status === 'completed' ? 'status-success' : activity.status === 'in-progress' ? 'status-warning' : 'status-error'}">
                                    ${activity.status.toUpperCase()}
                                </span>
                            </div>
                            <p class="activity-description">${activity.description}</p>
                            <div class="activity-meta">
                                <span class="activity-date">
                                    <i class="fas fa-calendar"></i>
                                    ${new Date(activity.date).toLocaleDateString()}
                                </span>
                                <span class="activity-assigned">
                                    <i class="fas fa-user"></i>
                                    ${activity.assignedBy}
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    setupTabSwitching() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;

                // Update tab buttons
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // Update tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    }
}

// Create global instance
console.log('📝 Creating SimpleInternDashboard...');
window.simpleInternDashboard = new SimpleInternDashboard();
console.log('✅ SimpleInternDashboard created successfully:', window.simpleInternDashboard);
