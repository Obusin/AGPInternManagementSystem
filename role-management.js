/**
 * AG&P Attendance System - Role Management Component
 * Advanced role and department management interface
 */

class RoleManagement {
    constructor() {
        this.currentUser = null;
        this.selectedUser = null;
        this.selectedDepartment = null;
    }

    /**
     * Initialize role management interface
     */
    init(user) {
        this.currentUser = user;
        this.render();
        this.attachEventListeners();
    }

    /**
     * Check if current user has permission to manage applicants
     */
    canManageApplicants() {
        if (!this.currentUser) return false;
        return window.userDatabase.hasPermission(this.currentUser, 'manageApplicants');
    }

    /**
     * Setup applicant filters
     */
    setupApplicantFilters() {
        const searchInput = document.getElementById('applicant-search');
        const statusFilter = document.getElementById('application-status');
        const departmentFilter = document.getElementById('application-department');

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterApplicants();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterApplicants();
            });
        }

        if (departmentFilter) {
            departmentFilter.addEventListener('change', () => {
                this.filterApplicants();
            });
        }
    }

    /**
     * Filter applicants based on selected criteria
     */
    filterApplicants() {
        const searchInput = document.getElementById('applicant-search');
        const statusFilter = document.getElementById('application-status');
        const departmentFilter = document.getElementById('application-department');

        if (!statusFilter || !departmentFilter) return;

        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedStatus = statusFilter.value;
        const selectedDepartment = departmentFilter.value;

        // Get all applicant cards
        const applicantCards = document.querySelectorAll('.applicant-card');

        let visibleCount = 0;

        applicantCards.forEach(card => {
            const applicantId = card.getAttribute('data-applicant-id');

            // Get applicant data
            const applicants = JSON.parse(localStorage.getItem('applicantsData') || '[]');
            const applicant = applicants.find(a => a.id === applicantId);

            if (!applicant) {
                card.style.display = 'none';
                return;
            }

            let showCard = true;

            // Filter by search term
            if (searchTerm) {
                const searchableText = `${applicant.name} ${applicant.email} ${applicant.position}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    showCard = false;
                }
            }

            // Filter by status
            if (selectedStatus !== 'all' && applicant.status !== selectedStatus) {
                showCard = false;
            }

            // Filter by department
            if (selectedDepartment !== 'all' && applicant.department !== selectedDepartment) {
                showCard = false;
            }

            // Show/hide card
            if (showCard) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update filter results message
        this.updateFilterResults(visibleCount, applicantCards.length);
    }

    /**
     * Update filter results message
     */
    updateFilterResults(visibleCount, totalCount) {
        // Remove existing filter message
        const existingMessage = document.querySelector('.filter-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Add new filter message
        const applicantsGrid = document.getElementById('applicants-grid');
        if (applicantsGrid && visibleCount !== totalCount) {
            const message = document.createElement('div');
            message.className = 'filter-results-message';
            message.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #a0a0a0; font-style: italic;">
                    <i class="fas fa-filter"></i>
                    Showing ${visibleCount} of ${totalCount} applicants
                    <button onclick="roleManagement.clearFilters()" style="margin-left: 10px; background: none; border: 1px solid #ff7a45; color: #ff7a45; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                        Clear Filters
                    </button>
                </div>
            `;
            applicantsGrid.parentNode.insertBefore(message, applicantsGrid);
        }
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        const searchInput = document.getElementById('applicant-search');
        const statusFilter = document.getElementById('application-status');
        const departmentFilter = document.getElementById('application-department');

        if (searchInput) searchInput.value = '';
        if (statusFilter) statusFilter.value = 'all';
        if (departmentFilter) departmentFilter.value = 'all';

        // Show all cards
        const applicantCards = document.querySelectorAll('.applicant-card');
        applicantCards.forEach(card => {
            card.style.display = 'block';
        });

        // Remove filter message
        const existingMessage = document.querySelector('.filter-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    /**
     * Render the role management interface
     */
    render() {
        const container = document.getElementById('admin-section');
        if (!container) return;

        const roleManagementHTML = `
            <div class="role-management-container">
                <div class="section-header">
                    <h1>
                        <i class="fas fa-users-cog"></i>
                        Role & Department Management
                    </h1>
                    <div class="actions">
                        <button class="action-btn secondary" id="create-department-btn">
                            <i class="fas fa-plus"></i>
                            <span>New Department</span>
                        </button>
                        <button class="action-btn primary" id="create-user-btn">
                            <i class="fas fa-user-plus"></i>
                            <span>New User</span>
                        </button>
                    </div>
                </div>

                <div class="role-management-tabs">
                    <button class="tab-btn active" data-tab="users">User Management</button>
                    ${this.canManageApplicants() ? `
                        <button class="tab-btn" data-tab="applicants">Applicants</button>
                    ` : ''}
                    <button class="tab-btn" data-tab="departments">Department Management</button>
                    <button class="tab-btn" data-tab="roles">Role Definitions</button>
                </div>

                <!-- Users Tab -->
                <div class="tab-content active" id="users-tab">
                    <div class="users-management">
                        <div class="users-filters">
                            <div class="filter-row">
                                <div class="filter-group">
                                    <label>Filter by Department:</label>
                                    <select id="department-filter">
                                        <option value="">All Departments</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label>Filter by Role:</label>
                                    <select id="role-filter">
                                        <option value="">All Roles</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label>Filter by Site:</label>
                                    <select id="site-filter">
                                        <option value="">All Sites</option>
                                    </select>
                                </div>
                                <div class="filter-group">
                                    <label>Status:</label>
                                    <select id="status-filter">
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div class="search-row">
                                <div class="search-group">
                                    <label>Search Users:</label>
                                    <div class="search-input-wrapper">
                                        <i class="fas fa-search search-icon"></i>
                                        <input type="text" id="user-search" placeholder="Search by name, email, position, or username...">
                                        <button class="clear-search" id="clear-user-search" title="Clear search">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="filter-actions">
                                    <button class="action-btn secondary" id="reset-filters">
                                        <i class="fas fa-undo"></i>
                                        <span>Reset Filters</span>
                                    </button>
                                    <button class="action-btn primary" id="advanced-search">
                                        <i class="fas fa-filter"></i>
                                        <span>Advanced</span>
                                    </button>
                                </div>
                            </div>
                            <div class="filter-summary" id="filter-summary">
                                <span class="results-count" id="results-count">Showing all users</span>
                                <div class="active-filters" id="active-filters"></div>
                            </div>
                        </div>
                        <div class="users-grid" id="users-grid">
                            <!-- Users will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Applicants Tab -->
                ${this.canManageApplicants() ? `
                <div class="tab-content" id="applicants-tab">
                    <div class="applicants-management">
                        <div class="applicants-header">
                            <div class="applicants-info">
                                <h3>Intern Applications</h3>
                                <p>Review and approve intern applications with document verification</p>
                            </div>
                            <div class="applicants-stats">
                                <div class="stat-card">
                                    <span class="stat-number" id="pending-applications">5</span>
                                    <span class="stat-label">Pending</span>
                                </div>
                                <div class="stat-card">
                                    <span class="stat-number" id="approved-applications">12</span>
                                    <span class="stat-label">Approved</span>
                                </div>
                                <div class="stat-card">
                                    <span class="stat-number" id="rejected-applications">3</span>
                                    <span class="stat-label">Rejected</span>
                                </div>
                            </div>
                        </div>

                        <div class="applicants-filters">
                            <div class="filter-group">
                                <label for="applicant-search">Search:</label>
                                <input type="text" id="applicant-search" placeholder="Search by name, email, or position..." style="padding: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: #fff; border-radius: 4px; width: 250px;">
                            </div>
                            <div class="filter-group">
                                <label for="application-status">Status:</label>
                                <select id="application-status">
                                    <option value="all">All Applications</option>
                                    <option value="pending">Pending Review</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="documents-missing">Documents Missing</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label for="application-department">Department:</label>
                                <select id="application-department">
                                    <option value="all">All Departments</option>
                                    <option value="IT_DEV">IT Development</option>
                                    <option value="HR">Human Resources</option>
                                    <option value="FINANCE">Finance</option>
                                    <option value="OPERATIONS">Operations</option>
                                    <option value="MARKETING">Marketing</option>
                                </select>
                            </div>
                        </div>

                        <div class="applicants-grid" id="applicants-grid">
                            <!-- Applicants will be populated here -->
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Departments Tab -->
                <div class="tab-content" id="departments-tab">
                    <div class="departments-management">
                        <div class="departments-grid" id="departments-grid">
                            <!-- Departments will be populated here -->
                        </div>
                    </div>
                </div>

                <!-- Roles Tab -->
                <div class="tab-content" id="roles-tab">
                    <div class="roles-management">
                        <div class="roles-header">
                            <div class="roles-info">
                                <h3>System Roles</h3>
                                <p>View role definitions and permissions (Developer and User roles)</p>
                            </div>
                        </div>
                        <div class="roles-grid" id="roles-grid">
                            <!-- Roles will be populated here -->
                        </div>
                    </div>
                </div>

            </div>
        `;

        container.innerHTML = roleManagementHTML;
        this.populateFilters();
        this.populateUsers();
        this.populateApplicants();
        this.populateDepartments();
        this.populateRoles();
        this.setupApplicantFilters();
    }

    /**
     * Populate filter dropdowns
     */
    populateFilters() {
        const departmentFilter = document.getElementById('department-filter');
        const roleFilter = document.getElementById('role-filter');
        const siteFilter = document.getElementById('site-filter');

        // Populate departments
        if (departmentFilter) {
            const departments = window.userDatabase.getAllDepartments();
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.textContent = dept.name;
                departmentFilter.appendChild(option);
            });
        }

        // Populate roles
        if (roleFilter) {
            const roles = window.userDatabase.getAllRoles();
            roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role.id;
                option.textContent = role.name;
                roleFilter.appendChild(option);
            });
        }

        // Populate sites
        if (siteFilter && window.multiSiteSystem) {
            const sites = window.multiSiteSystem.getAllSites();
            sites.forEach(site => {
                const option = document.createElement('option');
                option.value = site.id;
                option.textContent = site.name;
                siteFilter.appendChild(option);
            });
        }
    }

    /**
     * Populate users grid
     */
    populateUsers() {
        const usersGrid = document.getElementById('users-grid');
        const users = window.userDatabase.getAllUsers();

        usersGrid.innerHTML = users.map(user => {
            const department = window.userDatabase.getDepartmentById(user.department);
            const role = window.userDatabase.getRoleById(user.role);
            const managedDepts = user.managedDepartments || [];

            return `
                <div class="user-card" data-user-id="${user.id}">
                    <div class="user-avatar">
                        <img src="${user.avatar}" alt="${user.name}">
                        <div class="role-badge" style="background-color: ${role?.color || '#666'}">
                            ${role?.name || 'Unknown'}
                        </div>
                    </div>
                    <div class="user-info">
                        <h3>${user.name}</h3>
                        <p class="user-position">${user.position}</p>
                        <p class="user-department">${department?.name || 'No Department'}</p>
                        <p class="user-email">${user.email}</p>
                        ${managedDepts.length > 0 ? `
                            <div class="managed-departments">
                                <small>Manages: ${managedDepts.map(id => window.userDatabase.getDepartmentById(id)?.name).join(', ')}</small>
                            </div>
                        ` : ''}
                    </div>
                    <div class="user-actions">
                        <button class="action-btn small secondary" onclick="roleManagement.editUser('${user.id}')">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="action-btn small primary" onclick="roleManagement.manageUserRoles('${user.id}')">
                            <i class="fas fa-user-cog"></i>
                            Roles
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Populate departments grid
     */
    populateDepartments() {
        const departmentsGrid = document.getElementById('departments-grid');
        const departments = window.userDatabase.getAllDepartments();

        departmentsGrid.innerHTML = departments.map(dept => {
            const head = dept.head ? window.userDatabase.users[dept.head] : null;
            const memberCount = dept.members.length;

            return `
                <div class="department-card" data-dept-id="${dept.id}">
                    <div class="department-header">
                        <h3>${dept.name}</h3>
                        <div class="department-status ${dept.isActive ? 'active' : 'inactive'}">
                            ${dept.isActive ? 'Active' : 'Inactive'}
                        </div>
                    </div>
                    <div class="department-info">
                        <p class="department-description">${dept.description}</p>
                        <div class="department-stats">
                            <div class="stat">
                                <span class="stat-label">Head:</span>
                                <span class="stat-value">${head ? head.name : 'No Head Assigned'}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Members:</span>
                                <span class="stat-value">${memberCount} ${memberCount === 1 ? 'person' : 'people'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="department-actions">
                        <button class="action-btn small secondary" onclick="roleManagement.editDepartment('${dept.id}')">
                            <i class="fas fa-edit"></i>
                            Edit
                        </button>
                        <button class="action-btn small primary" onclick="roleManagement.manageDepartmentMembers('${dept.id}')">
                            <i class="fas fa-users"></i>
                            Members
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Populate applicants grid
     */
    populateApplicants() {
        const applicantsGrid = document.getElementById('applicants-grid');
        if (!applicantsGrid) return;

        // Get applicants from localStorage
        const applicants = JSON.parse(localStorage.getItem('applicantsData') || '[]');

        // Add some sample data if no real applicants exist
        if (applicants.length === 0) {
            applicants.push(
                {
                    id: 'app_001',
                    name: 'John Doe',
                    email: 'john.doe@email.com',
                    position: 'Software Development Intern',
                    department: 'IT_DEV',
                    status: 'pending',
                    applicationDate: '2024-12-20',
                    documents: {
                        'resume': { uploaded: true, status: 'completed' },
                        'barangay-clearance': { uploaded: true, status: 'completed' },
                        'medical-certificate': { uploaded: false, status: 'pending' },
                        'vaccination-card': { uploaded: false, status: 'missing' },
                        'enrollment-form': { uploaded: false, status: 'missing' }
                    }
                },
                {
                    id: 'app_002',
                    name: 'Jane Smith',
                    email: 'jane.smith@email.com',
                    position: 'Marketing Intern',
                    department: 'MARKETING',
                    status: 'approved',
                    applicationDate: '2024-12-18',
                    documents: {
                        'resume': { uploaded: true, status: 'completed' },
                        'barangay-clearance': { uploaded: true, status: 'completed' },
                        'medical-certificate': { uploaded: true, status: 'completed' },
                        'vaccination-card': { uploaded: true, status: 'completed' },
                        'enrollment-form': { uploaded: true, status: 'completed' }
                    }
                }
            );
        }

        // Update statistics
        this.updateApplicantStats(applicants);

        // Store applicants for filtering
        this.currentApplicants = applicants;

        applicantsGrid.innerHTML = applicants.map(applicant => {
            const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(applicant.name)}&background=random&color=fff`;
            const departmentName = this.getDepartmentDisplayName(applicant.department);

            return `
                <div class="applicant-card" data-applicant-id="${applicant.id}">
                    <div class="applicant-header">
                        <div class="applicant-avatar">
                            <img src="${avatar}" alt="${applicant.name}">
                            <div class="status-badge ${applicant.status}">${applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}</div>
                        </div>
                        <div class="applicant-info">
                            <h3>${applicant.name}</h3>
                            <p class="applicant-email">${applicant.email}</p>
                            <p class="applicant-position">${applicant.position}</p>
                            <p class="applicant-department">${departmentName}</p>
                            <p class="applicant-date">Applied: ${new Date(applicant.applicationDate).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div class="applicant-documents">
                        <h4>Required Documents</h4>
                        <div class="documents-checklist">
                            ${this.renderDocumentChecklist(applicant.documents)}
                        </div>
                    </div>

                    <div class="applicant-actions">
                        <button class="action-btn small secondary" onclick="roleManagement.viewApplicantDetails('${applicant.id}')">
                            <i class="fas fa-eye"></i>
                            View Details
                        </button>
                        ${applicant.status === 'pending' ? `
                            <button class="action-btn small success" onclick="roleManagement.approveApplicant('${applicant.id}')">
                                <i class="fas fa-check"></i>
                                Approve
                            </button>
                            <button class="action-btn small danger" onclick="roleManagement.rejectApplicant('${applicant.id}')">
                                <i class="fas fa-times"></i>
                                Reject
                            </button>
                        ` : applicant.status === 'approved' ? `
                            <button class="action-btn small primary" onclick="roleManagement.generateBarcode('${applicant.id}')">
                                <i class="fas fa-qrcode"></i>
                                Generate Barcode
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update applicant statistics
     */
    updateApplicantStats(applicants) {
        const pending = applicants.filter(a => a.status === 'pending').length;
        const approved = applicants.filter(a => a.status === 'approved').length;
        const rejected = applicants.filter(a => a.status === 'rejected').length;

        const pendingElement = document.getElementById('pending-applications');
        const approvedElement = document.getElementById('approved-applications');
        const rejectedElement = document.getElementById('rejected-applications');

        if (pendingElement) pendingElement.textContent = pending;
        if (approvedElement) approvedElement.textContent = approved;
        if (rejectedElement) rejectedElement.textContent = rejected;
    }

    /**
     * Render document checklist
     */
    renderDocumentChecklist(documents) {
        const documentTypes = {
            'resume': 'Resume/CV',
            'barangay-clearance': 'Barangay Clearance',
            'medical-certificate': 'Medical Certificate',
            'vaccination-card': 'Vaccination Card',
            'enrollment-form': 'Enrollment Form'
        };

        return Object.entries(documentTypes).map(([key, label]) => {
            const doc = documents && documents[key];
            const status = doc ? doc.status || 'missing' : 'missing';
            const icon = status === 'completed' ? 'check-circle' :
                        status === 'pending' ? 'clock' : 'times-circle';

            return `
                <div class="document-item ${status}">
                    <i class="fas fa-${icon}"></i>
                    <span>${label}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Get department display name
     */
    getDepartmentDisplayName(deptId) {
        const departments = {
            'IT_DEV': 'IT Development',
            'HR': 'Human Resources',
            'FINANCE': 'Finance',
            'OPERATIONS': 'Operations',
            'MARKETING': 'Marketing'
        };
        return departments[deptId] || deptId;
    }

    /**
     * Populate roles grid
     */
    populateRoles() {
        const rolesGrid = document.getElementById('roles-grid');
        const roles = window.userDatabase.getAllRoles();

        rolesGrid.innerHTML = roles.map(role => {
            const userCount = window.userDatabase.getUsersByRole(role.id).length;

            return `
                <div class="role-card" data-role-id="${role.id}">
                    <div class="role-header">
                        <div class="role-badge" style="background-color: ${role.color}">
                            ${role.name}
                        </div>
                        <div class="role-level">Level ${role.level}</div>
                    </div>
                    <div class="role-info">
                        <p class="role-description">${role.description}</p>
                        <div class="role-stats">
                            <div class="stat">
                                <span class="stat-label">Users:</span>
                                <span class="stat-value">${userCount}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Permissions:</span>
                                <span class="stat-value">${Object.values(role.permissions).filter(p => p).length}</span>
                            </div>
                        </div>
                    </div>
                    <div class="role-actions">
                        <button class="action-btn small primary" onclick="roleManagement.viewRolePermissions('${role.id}')">
                            <i class="fas fa-key"></i>
                            Permissions
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }



    /**
     * Format permission name for display
     */
    formatPermissionName(permission) {
        return permission
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Tab switching
        document.querySelectorAll('.role-management-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Filters
        document.getElementById('department-filter')?.addEventListener('change', () => this.filterUsers());
        document.getElementById('role-filter')?.addEventListener('change', () => this.filterUsers());
        document.getElementById('site-filter')?.addEventListener('change', () => this.filterUsers());
        document.getElementById('status-filter')?.addEventListener('change', () => this.filterUsers());
        document.getElementById('user-search')?.addEventListener('input', () => this.filterUsers());

        // Enhanced filter controls
        document.getElementById('clear-user-search')?.addEventListener('click', () => this.clearSearch());
        document.getElementById('reset-filters')?.addEventListener('click', () => this.resetAllFilters());
        document.getElementById('advanced-search')?.addEventListener('click', () => this.showAdvancedSearch());

        // Create buttons
        document.getElementById('create-department-btn')?.addEventListener('click', () => this.createDepartment());
        document.getElementById('create-user-btn')?.addEventListener('click', () => this.createUser());
        document.getElementById('create-role-btn')?.addEventListener('click', () => this.createRole());
    }

    /**
     * Switch between tabs
     */
    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.role-management-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');

        // Refresh data when switching to applicants tab
        if (tabId === 'applicants') {
            this.populateApplicants();
            // Reset filters when switching to applicants tab
            setTimeout(() => {
                this.setupApplicantFilters();
            }, 100);
        }
    }

    /**
     * Filter users based on selected criteria
     */
    filterUsers() {
        const departmentFilter = document.getElementById('department-filter')?.value || '';
        const roleFilter = document.getElementById('role-filter')?.value || '';
        const siteFilter = document.getElementById('site-filter')?.value || '';
        const statusFilter = document.getElementById('status-filter')?.value || '';
        const searchTerm = document.getElementById('user-search')?.value.toLowerCase() || '';

        const userCards = document.querySelectorAll('.user-card');
        let visibleCount = 0;
        const activeFilters = [];

        userCards.forEach(card => {
            const userId = card.dataset.userId;
            const user = window.userDatabase.getUserById(userId);

            let show = true;

            // Department filter
            if (departmentFilter && user.department !== departmentFilter) {
                show = false;
            }

            // Role filter
            if (roleFilter && user.role !== roleFilter) {
                show = false;
            }

            // Site filter
            if (siteFilter && user.primarySite !== siteFilter &&
                (!user.assignedSites || !user.assignedSites.includes(siteFilter))) {
                show = false;
            }

            // Status filter
            if (statusFilter) {
                const isActive = user.isActive !== false;
                if ((statusFilter === 'active' && !isActive) ||
                    (statusFilter === 'inactive' && isActive)) {
                    show = false;
                }
            }

            // Enhanced search filter
            if (searchTerm) {
                const searchableText = [
                    user.name,
                    user.email,
                    user.position,
                    user.username,
                    user.department
                ].join(' ').toLowerCase();

                if (!searchableText.includes(searchTerm)) {
                    show = false;
                }
            }

            card.style.display = show ? 'block' : 'none';
            if (show) visibleCount++;
        });

        // Update filter summary
        this.updateFilterSummary(visibleCount, userCards.length, {
            department: departmentFilter,
            role: roleFilter,
            site: siteFilter,
            status: statusFilter,
            search: searchTerm
        });
    }

    /**
     * Update filter summary display
     */
    updateFilterSummary(visibleCount, totalCount, filters) {
        const resultsCount = document.getElementById('results-count');
        const activeFilters = document.getElementById('active-filters');

        if (resultsCount) {
            resultsCount.textContent = `Showing ${visibleCount} of ${totalCount} users`;
        }

        if (activeFilters) {
            const filterTags = [];

            if (filters.department) {
                const dept = window.userDatabase.getDepartmentById(filters.department);
                filterTags.push(`Department: ${dept?.name || filters.department}`);
            }

            if (filters.role) {
                const role = window.userDatabase.getRoleById(filters.role);
                filterTags.push(`Role: ${role?.name || filters.role}`);
            }

            if (filters.site) {
                const site = window.multiSiteSystem?.getSiteById(filters.site);
                filterTags.push(`Site: ${site?.name || filters.site}`);
            }

            if (filters.status) {
                filterTags.push(`Status: ${filters.status}`);
            }

            if (filters.search) {
                filterTags.push(`Search: "${filters.search}"`);
            }

            activeFilters.innerHTML = filterTags.map(tag =>
                `<span class="filter-tag">${tag}</span>`
            ).join('');
        }
    }

    /**
     * Clear search input
     */
    clearSearch() {
        const searchInput = document.getElementById('user-search');
        if (searchInput) {
            searchInput.value = '';
            this.filterUsers();
        }
    }

    /**
     * Reset all filters
     */
    resetAllFilters() {
        const filters = ['department-filter', 'role-filter', 'site-filter', 'status-filter'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) element.value = '';
        });

        const searchInput = document.getElementById('user-search');
        if (searchInput) searchInput.value = '';

        this.filterUsers();
    }

    /**
     * Show advanced search modal
     */
    showAdvancedSearch() {
        const modal = this.createModal('Advanced Search & Filters', `
            <form id="advanced-search-form" class="modal-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="adv-created-after">Created After</label>
                        <input type="date" id="adv-created-after">
                    </div>
                    <div class="form-group">
                        <label for="adv-created-before">Created Before</label>
                        <input type="date" id="adv-created-before">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="adv-last-login">Last Login</label>
                        <select id="adv-last-login">
                            <option value="">Any time</option>
                            <option value="today">Today</option>
                            <option value="week">This week</option>
                            <option value="month">This month</option>
                            <option value="never">Never logged in</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="adv-permissions">Has Permission</label>
                        <select id="adv-permissions">
                            <option value="">Any permission</option>
                            <option value="viewDashboard">View Dashboard</option>
                            <option value="editUsers">Edit Users</option>
                            <option value="manageRoles">Manage Roles</option>
                            <option value="exportData">Export Data</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="adv-managed-departments">
                        Has managed departments
                    </label>
                </div>

                <div class="form-actions">
                    <button type="button" class="action-btn secondary" onclick="roleManagement.closeModal()">Cancel</button>
                    <button type="button" class="action-btn secondary" onclick="roleManagement.clearAdvancedSearch()">Clear</button>
                    <button type="submit" class="action-btn primary">Apply Filters</button>
                </div>
            </form>
        `);

        document.getElementById('advanced-search-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.applyAdvancedSearch();
        });
    }

    /**
     * Apply advanced search filters
     */
    applyAdvancedSearch() {
        // Implementation for advanced search
        this.showNotification('Advanced search applied!', 'success');
        this.closeModal();
    }

    /**
     * Clear advanced search
     */
    clearAdvancedSearch() {
        const form = document.getElementById('advanced-search-form');
        if (form) {
            form.reset();
        }
    }

    /**
     * Edit user information
     */
    editUser(userId) {
        const user = window.userDatabase.getUserById(userId);
        if (!user) return;

        this.showUserEditModal(user);
    }

    /**
     * Manage user roles and departments
     */
    manageUserRoles(userId) {
        const user = window.userDatabase.getUserById(userId);
        if (!user) return;

        this.showUserRoleModal(user);
    }

    /**
     * Edit department information
     */
    editDepartment(deptId) {
        const department = window.userDatabase.getDepartmentById(deptId);
        if (!department) return;

        this.showDepartmentEditModal(department);
    }

    /**
     * Manage department members
     */
    manageDepartmentMembers(deptId) {
        const department = window.userDatabase.getDepartmentById(deptId);
        if (!department) return;

        this.showDepartmentMembersModal(department);
    }

    /**
     * View role permissions
     */
    viewRolePermissions(roleId) {
        const role = window.userDatabase.getRoleById(roleId);
        if (!role) return;

        this.showRolePermissionsModal(role);
    }

    /**
     * Create new department
     */
    createDepartment() {
        this.showDepartmentCreateModal();
    }

    /**
     * Create new user
     */
    createUser() {
        this.showUserCreateModal();
    }

    /**
     * Create new role
     */
    createRole() {
        this.showRoleCreateModal();
    }

    /**
     * View applicant details
     */
    viewApplicantDetails(applicantId) {
        this.showNotification(`Viewing details for applicant ${applicantId}`, 'info');
        // Implementation for viewing applicant details
    }

    /**
     * Approve applicant
     */
    approveApplicant(applicantId) {
        if (!this.canManageApplicants()) {
            this.showNotification('You do not have permission to manage applicants', 'error');
            return;
        }

        if (confirm('Are you sure you want to approve this applicant?')) {
            // Get applicants data
            const applicants = JSON.parse(localStorage.getItem('applicantsData') || '[]');

            // Find and update the applicant
            const applicantIndex = applicants.findIndex(a => a.id === applicantId);
            if (applicantIndex !== -1) {
                applicants[applicantIndex].status = 'approved';
                applicants[applicantIndex].approvedDate = new Date().toISOString();

                // Save back to localStorage
                localStorage.setItem('applicantsData', JSON.stringify(applicants));

                // Refresh the display
                this.populateApplicants();

                this.showNotification('Applicant approved successfully! They can now generate their barcode.', 'success');
            } else {
                this.showNotification('Applicant not found', 'error');
            }
        }
    }

    /**
     * Reject applicant
     */
    rejectApplicant(applicantId) {
        if (!this.canManageApplicants()) {
            this.showNotification('You do not have permission to manage applicants', 'error');
            return;
        }

        const reason = prompt('Please provide a reason for rejection (optional):');
        if (reason !== null) { // User didn't cancel
            // Get applicants data
            const applicants = JSON.parse(localStorage.getItem('applicantsData') || '[]');

            // Find and update the applicant
            const applicantIndex = applicants.findIndex(a => a.id === applicantId);
            if (applicantIndex !== -1) {
                applicants[applicantIndex].status = 'rejected';
                applicants[applicantIndex].rejectedDate = new Date().toISOString();
                applicants[applicantIndex].rejectionReason = reason;

                // Save back to localStorage
                localStorage.setItem('applicantsData', JSON.stringify(applicants));

                // Refresh the display
                this.populateApplicants();

                this.showNotification('Applicant rejected', 'warning');
            } else {
                this.showNotification('Applicant not found', 'error');
            }
        }
    }

    /**
     * Generate barcode for approved applicant
     */
    generateBarcode(applicantId) {
        this.showNotification('Barcode generated successfully!', 'success');
        // Implementation for generating barcode
        // This would typically:
        // 1. Generate unique barcode for the intern
        // 2. Store barcode in database
        // 3. Send barcode to intern via email
        // 4. Update applicant status to "barcode generated"
    }

    /**
     * Show user edit modal
     */
    showUserEditModal(user) {
        const modal = this.createModal('Edit User', `
            <form id="edit-user-form" class="modal-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-user-name">Full Name</label>
                        <input type="text" id="edit-user-name" value="${user.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-user-email">Email</label>
                        <input type="email" id="edit-user-email" value="${user.email}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-user-position">Position</label>
                        <input type="text" id="edit-user-position" value="${user.position}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-user-department">Department</label>
                        <select id="edit-user-department" required>
                            ${this.getDepartmentOptions(user.department)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="edit-user-avatar">Avatar URL</label>
                    <input type="url" id="edit-user-avatar" value="${user.avatar}">
                </div>
                <div class="form-actions">
                    <button type="button" class="action-btn secondary" onclick="roleManagement.closeModal()">Cancel</button>
                    <button type="submit" class="action-btn primary">Save Changes</button>
                </div>
            </form>
        `);

        document.getElementById('edit-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateUser(user.id, {
                name: document.getElementById('edit-user-name').value,
                email: document.getElementById('edit-user-email').value,
                position: document.getElementById('edit-user-position').value,
                department: document.getElementById('edit-user-department').value,
                avatar: document.getElementById('edit-user-avatar').value
            });
        });
    }

    /**
     * Show user role management modal
     */
    showUserRoleModal(user) {
        const currentRole = window.userDatabase.getRoleById(user.role);
        const managedDepts = user.managedDepartments || [];

        const modal = this.createModal('Manage User Roles', `
            <form id="user-role-form" class="modal-form">
                <div class="current-role-display">
                    <h3>Current Role</h3>
                    <div class="role-badge" style="background-color: ${currentRole?.color || '#666'}">
                        ${currentRole?.name || 'Unknown'} (Level ${currentRole?.level || 0})
                    </div>
                </div>

                <div class="form-group">
                    <label for="user-role-select">Assign New Role</label>
                    <select id="user-role-select" required>
                        ${this.getRoleOptions(user.role)}
                    </select>
                </div>

                <div class="form-group">
                    <label>Managed Departments</label>
                    <div class="department-checkboxes" id="managed-departments">
                        ${this.getDepartmentCheckboxes(managedDepts)}
                    </div>
                </div>

                <div class="permissions-preview" id="permissions-preview">
                    <h4>Role Permissions Preview</h4>
                    <div class="permissions-list" id="permissions-list">
                        ${this.getPermissionsList(currentRole)}
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="action-btn secondary" onclick="roleManagement.closeModal()">Cancel</button>
                    <button type="submit" class="action-btn primary">Update Role</button>
                </div>
            </form>
        `);

        // Add role change listener
        document.getElementById('user-role-select').addEventListener('change', (e) => {
            const newRole = window.userDatabase.getRoleById(e.target.value);
            document.getElementById('permissions-list').innerHTML = this.getPermissionsList(newRole);
        });

        document.getElementById('user-role-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateUserRole(user.id);
        });
    }

    /**
     * Show department edit modal
     */
    showDepartmentEditModal(department) {
        const modal = this.createModal('Edit Department', `
            <form id="edit-department-form" class="modal-form">
                <div class="form-group">
                    <label for="edit-dept-name">Department Name</label>
                    <input type="text" id="edit-dept-name" value="${department.name}" required>
                </div>
                <div class="form-group">
                    <label for="edit-dept-description">Description</label>
                    <textarea id="edit-dept-description" rows="3" required>${department.description}</textarea>
                </div>
                <div class="form-group">
                    <label for="edit-dept-head">Department Head</label>
                    <select id="edit-dept-head">
                        <option value="">No Head Assigned</option>
                        ${this.getUserOptions(department.head)}
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="edit-dept-active" ${department.isActive ? 'checked' : ''}>
                        Department is Active
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" class="action-btn secondary" onclick="roleManagement.closeModal()">Cancel</button>
                    <button type="submit" class="action-btn primary">Save Changes</button>
                </div>
            </form>
        `);

        document.getElementById('edit-department-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateDepartment(department.id);
        });
    }

    /**
     * Show department members modal
     */
    showDepartmentMembersModal(department) {
        const allUsers = window.userDatabase.getAllUsers();
        const departmentMembers = department.members || [];

        const modal = this.createModal('Manage Department Members', `
            <div class="department-members-manager">
                <div class="current-members">
                    <h3>Current Members (${departmentMembers.length})</h3>
                    <div class="members-list" id="current-members-list">
                        ${departmentMembers.map(username => {
                            const user = window.userDatabase.users[username];
                            return user ? `
                                <div class="member-item">
                                    <img src="${user.avatar}" alt="${user.name}" class="member-avatar">
                                    <div class="member-info">
                                        <strong>${user.name}</strong>
                                        <small>${user.position}</small>
                                    </div>
                                    <button class="action-btn small secondary" onclick="roleManagement.removeMemberFromDepartment('${user.id}', '${department.id}')">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            ` : '';
                        }).join('')}
                    </div>
                </div>

                <div class="available-users">
                    <h3>Add Members</h3>
                    <div class="user-search">
                        <input type="text" id="member-search" placeholder="Search users...">
                    </div>
                    <div class="available-users-list" id="available-users-list">
                        ${allUsers.filter(user => !departmentMembers.includes(user.username)).map(user => `
                            <div class="member-item">
                                <img src="${user.avatar}" alt="${user.name}" class="member-avatar">
                                <div class="member-info">
                                    <strong>${user.name}</strong>
                                    <small>${user.position}</small>
                                </div>
                                <button class="action-btn small primary" onclick="roleManagement.addMemberToDepartment('${user.id}', '${department.id}')">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="action-btn primary" onclick="roleManagement.closeModal()">Done</button>
            </div>
        `);
    }

    /**
     * Show department creation modal
     */
    showDepartmentCreateModal() {
        const modal = this.createModal('Create New Department', `
            <form id="create-department-form" class="modal-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="new-dept-id">Department ID</label>
                        <input type="text" id="new-dept-id" placeholder="e.g., MARKETING" required>
                        <small>Unique identifier (uppercase, underscores allowed)</small>
                    </div>
                    <div class="form-group">
                        <label for="new-dept-name">Department Name</label>
                        <input type="text" id="new-dept-name" placeholder="e.g., Marketing" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="new-dept-description">Description</label>
                    <textarea id="new-dept-description" rows="3" placeholder="Brief description of this department..." required></textarea>
                </div>

                <div class="form-group">
                    <label for="new-dept-head">Department Head (Optional)</label>
                    <select id="new-dept-head">
                        <option value="">No Head Assigned</option>
                        ${this.getUserOptions()}
                    </select>
                </div>

                <div class="form-group">
                    <label>
                        <input type="checkbox" id="new-dept-active" checked>
                        Department is Active
                    </label>
                </div>

                <div class="form-actions">
                    <button type="button" class="action-btn secondary" onclick="roleManagement.closeModal()">Cancel</button>
                    <button type="submit" class="action-btn primary">Create Department</button>
                </div>
            </form>
        `);

        // Add form validation
        document.getElementById('new-dept-id').addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        });

        document.getElementById('create-department-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDepartmentCreation();
        });
    }

    /**
     * Show user creation modal
     */
    showUserCreateModal() {
        const modal = this.createModal('Create New User', `
            <form id="create-user-form" class="modal-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="new-user-username">Username</label>
                        <input type="text" id="new-user-username" placeholder="e.g., johnsmith" required>
                        <small>Unique username (lowercase, no spaces)</small>
                    </div>
                    <div class="form-group">
                        <label for="new-user-password">Password</label>
                        <input type="password" id="new-user-password" placeholder="Enter password" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="new-user-name">Full Name</label>
                        <input type="text" id="new-user-name" placeholder="e.g., John Smith" required>
                    </div>
                    <div class="form-group">
                        <label for="new-user-email">Email</label>
                        <input type="email" id="new-user-email" placeholder="e.g., john.smith@agp.com" required>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="new-user-position">Position</label>
                        <input type="text" id="new-user-position" placeholder="e.g., Software Developer" required>
                    </div>
                    <div class="form-group">
                        <label for="new-user-department">Department</label>
                        <select id="new-user-department" required>
                            <option value="">Select Department</option>
                            ${this.getDepartmentOptions()}
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="new-user-role">Role</label>
                        <select id="new-user-role" required>
                            <option value="">Select Role</option>
                            ${this.getRoleOptions()}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="new-user-avatar">Avatar URL (Optional)</label>
                        <input type="url" id="new-user-avatar" placeholder="https://...">
                    </div>
                </div>

                <div class="form-group">
                    <label>Managed Departments (for Admin/Manager roles)</label>
                    <div class="department-checkboxes" id="new-user-managed-departments">
                        ${this.getDepartmentCheckboxes()}
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="action-btn secondary" onclick="roleManagement.closeModal()">Cancel</button>
                    <button type="submit" class="action-btn primary">Create User</button>
                </div>
            </form>
        `);

        // Add form validation
        document.getElementById('new-user-username').addEventListener('input', (e) => {
            e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        });

        // Auto-generate avatar URL based on name
        document.getElementById('new-user-name').addEventListener('input', (e) => {
            const name = e.target.value;
            if (name) {
                const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
                document.getElementById('new-user-avatar').value = avatarUrl;
            }
        });

        // Show/hide managed departments based on role
        document.getElementById('new-user-role').addEventListener('change', (e) => {
            const role = e.target.value;
            const managedDeptSection = document.getElementById('new-user-managed-departments').parentElement;

            if (role === 'developer') {
                managedDeptSection.style.display = 'block';
            } else {
                managedDeptSection.style.display = 'none';
            }
        });

        document.getElementById('create-user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleUserCreation();
        });
    }

    /**
     * Show role creation modal
     */
    showRoleCreateModal() {
        const allPermissions = this.getAllUniquePermissions();

        const modal = this.createModal('Create New Role', `
            <form id="create-role-form" class="modal-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="new-role-id">Role ID</label>
                        <input type="text" id="new-role-id" placeholder="e.g., supervisor" required>
                        <small>Unique identifier (lowercase, no spaces)</small>
                    </div>
                    <div class="form-group">
                        <label for="new-role-name">Role Name</label>
                        <input type="text" id="new-role-name" placeholder="e.g., Supervisor" required>
                    </div>
                </div>

                <div class="form-group">
                    <label for="new-role-description">Description</label>
                    <textarea id="new-role-description" rows="2" placeholder="Brief description of this role..." required></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="new-role-level">Access Level</label>
                        <input type="number" id="new-role-level" min="1" max="99" value="40" required>
                        <small>1-99 (higher = more access)</small>
                    </div>
                    <div class="form-group">
                        <label for="new-role-color">Role Color</label>
                        <input type="color" id="new-role-color" value="#6c757d" required>
                    </div>
                </div>

                <div class="form-group">
                    <label>Role Permissions</label>
                    <div class="permission-selection">
                        <div class="permission-presets">
                            <button type="button" class="preset-btn" onclick="roleManagement.applyPermissionPreset('basic')">
                                <i class="fas fa-user"></i> Basic User
                            </button>
                            <button type="button" class="preset-btn" onclick="roleManagement.applyPermissionPreset('manager')">
                                <i class="fas fa-users"></i> Manager
                            </button>
                            <button type="button" class="preset-btn" onclick="roleManagement.applyPermissionPreset('admin')">
                                <i class="fas fa-shield-alt"></i> Administrator
                            </button>
                            <button type="button" class="preset-btn" onclick="roleManagement.applyPermissionPreset('none')">
                                <i class="fas fa-times"></i> Clear All
                            </button>
                        </div>

                        <div class="permissions-grid" id="new-role-permissions">
                            ${allPermissions.map(permission => `
                                <label class="permission-checkbox">
                                    <input type="checkbox" name="permissions" value="${permission}">
                                    <span class="permission-label">${this.formatPermissionName(permission)}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" class="action-btn secondary" onclick="roleManagement.closeModal()">Cancel</button>
                    <button type="submit" class="action-btn primary">Create Role</button>
                </div>
            </form>
        `);

        // Add form validation
        document.getElementById('new-role-id').addEventListener('input', (e) => {
            e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        });

        document.getElementById('create-role-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRoleCreation();
        });
    }

    /**
     * Get all unique permissions from existing roles
     */
    getAllUniquePermissions() {
        const allPermissions = new Set();
        const roles = window.userDatabase.getAllRoles();

        roles.forEach(role => {
            Object.keys(role.permissions).forEach(perm => allPermissions.add(perm));
        });

        return Array.from(allPermissions).sort();
    }

    /**
     * Apply permission preset
     */
    applyPermissionPreset(presetType) {
        const checkboxes = document.querySelectorAll('#new-role-permissions input[type="checkbox"]');

        // Clear all first
        checkboxes.forEach(cb => cb.checked = false);

        switch (presetType) {
            case 'basic':
                this.checkPermissions([
                    'viewDashboard', 'viewOwnStats', 'timeTracking', 'editOwnTime',
                    'createActivity', 'editOwnActivity', 'deleteOwnActivity', 'viewOwnActivity',
                    'viewReports'
                ]);
                break;

            case 'manager':
                this.checkPermissions([
                    'viewDashboard', 'viewOwnStats', 'timeTracking', 'editOwnTime', 'editAllTime',
                    'createActivity', 'editOwnActivity', 'editAllActivity', 'deleteOwnActivity',
                    'viewOwnActivity', 'viewAllActivity', 'viewUsers', 'editUsers',
                    'viewReports', 'createReports', 'exportReports'
                ]);
                break;

            case 'admin':
                this.checkPermissions([
                    'viewDashboard', 'viewOwnStats', 'viewAllStats', 'timeTracking',
                    'editOwnTime', 'editAllTime', 'deleteTimeRecords', 'createActivity',
                    'editOwnActivity', 'editAllActivity', 'deleteOwnActivity', 'deleteAllActivity',
                    'viewOwnActivity', 'viewAllActivity', 'viewUsers', 'createUsers',
                    'editUsers', 'deleteUsers', 'changeUserRoles', 'assignDepartments',
                    'editDepartments', 'exportData', 'viewReports', 'createReports',
                    'exportReports', 'scheduleReports'
                ]);
                break;

            case 'none':
                // Already cleared above
                break;
        }
    }

    /**
     * Check specific permissions
     */
    checkPermissions(permissions) {
        permissions.forEach(permission => {
            const checkbox = document.querySelector(`#new-role-permissions input[value="${permission}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }

    /**
     * Handle department creation
     */
    handleDepartmentCreation() {
        const deptId = document.getElementById('new-dept-id').value.trim();
        const deptName = document.getElementById('new-dept-name').value.trim();
        const description = document.getElementById('new-dept-description').value.trim();
        const head = document.getElementById('new-dept-head').value;
        const isActive = document.getElementById('new-dept-active').checked;

        // Validate department ID uniqueness
        if (window.userDatabase.getDepartmentById(deptId)) {
            this.showNotification('Department ID already exists. Please choose a different ID.', 'error');
            return;
        }

        // Create department object
        const newDepartment = {
            id: deptId,
            name: deptName,
            description: description,
            head: head || null,
            members: head ? [head] : [],
            isActive: isActive
        };

        // Add department to database
        const result = window.userDatabase.createDepartment(newDepartment);

        if (result.success) {
            this.showNotification(`Department "${deptName}" created successfully!`, 'success');
            this.populateDepartments();
            this.populateFilters(); // Update department filter dropdown
            this.closeModal();
        } else {
            this.showNotification(result.message || 'Failed to create department. Please try again.', 'error');
        }
    }

    /**
     * Handle user creation
     */
    handleUserCreation() {
        const username = document.getElementById('new-user-username').value.trim();
        const password = document.getElementById('new-user-password').value;
        const name = document.getElementById('new-user-name').value.trim();
        const email = document.getElementById('new-user-email').value.trim();
        const position = document.getElementById('new-user-position').value.trim();
        const department = document.getElementById('new-user-department').value;
        const role = document.getElementById('new-user-role').value;
        const avatar = document.getElementById('new-user-avatar').value.trim();

        // Get managed departments
        const managedDepartments = Array.from(document.querySelectorAll('#new-user-managed-departments input:checked'))
            .map(cb => cb.value);

        // Validate username uniqueness
        if (window.userDatabase.userExists(username)) {
            this.showNotification('Username already exists. Please choose a different username.', 'error');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Generate user ID
        const userId = `user_${Date.now()}`;

        // Create user object
        const newUser = {
            id: userId,
            username: username,
            password: password, // In production, this would be hashed
            name: name,
            email: email,
            position: position,
            department: department,
            role: role,
            managedDepartments: managedDepartments,
            avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true,
            customPermissions: {}
        };

        // Add user to database
        const success = window.userDatabase.createUser(newUser);

        if (success) {
            // Add user to department if specified
            if (department) {
                window.userDatabase.addUserToDepartment(userId, department);
            }

            this.showNotification(`User "${name}" created successfully!`, 'success');
            this.populateUsers();
            this.populateDepartments(); // Update department member counts
            this.closeModal();
        } else {
            this.showNotification('Failed to create user. Please try again.', 'error');
        }
    }

    /**
     * Handle role creation
     */
    handleRoleCreation() {
        const roleId = document.getElementById('new-role-id').value.trim();
        const roleName = document.getElementById('new-role-name').value.trim();
        const description = document.getElementById('new-role-description').value.trim();
        const level = parseInt(document.getElementById('new-role-level').value);
        const color = document.getElementById('new-role-color').value;

        // Validate role ID uniqueness
        if (window.userDatabase.getRoleById(roleId)) {
            this.showNotification('Role ID already exists. Please choose a different ID.', 'error');
            return;
        }

        // Get selected permissions
        const selectedPermissions = {};
        const allPermissions = this.getAllUniquePermissions();
        const checkedPermissions = Array.from(document.querySelectorAll('#new-role-permissions input:checked'))
            .map(cb => cb.value);

        // Set all permissions (checked = true, unchecked = false)
        allPermissions.forEach(permission => {
            selectedPermissions[permission] = checkedPermissions.includes(permission);
        });

        // Create role object
        const newRole = {
            id: roleId,
            name: roleName,
            description: description,
            level: level,
            color: color,
            canManageDepartments: [], // Will be set per user
            permissions: selectedPermissions
        };

        // Add role to database
        const success = window.userDatabase.createRole(newRole);

        if (success) {
            this.showNotification(`Role "${roleName}" created successfully!`, 'success');
            this.populateRoles();
            this.populateFilters(); // Update role filter dropdown
            this.closeModal();
        } else {
            this.showNotification('Failed to create role. Please try again.', 'error');
        }
    }

    /**
     * Helper method to create modal
     */
    createModal(title, content) {
        // Remove existing modal if any
        this.closeModal();

        const modal = document.createElement('div');
        modal.className = 'role-modal-overlay';
        modal.innerHTML = `
            <div class="role-modal">
                <div class="role-modal-header">
                    <h2>${title}</h2>
                    <button class="close-modal" onclick="roleManagement.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="role-modal-body">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        return modal;
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.querySelector('.role-modal-overlay');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Get department options HTML
     */
    getDepartmentOptions(selectedDept = '') {
        const departments = window.userDatabase.getAllDepartments();
        return departments.map(dept =>
            `<option value="${dept.id}" ${dept.id === selectedDept ? 'selected' : ''}>${dept.name}</option>`
        ).join('');
    }

    /**
     * Get role options HTML
     */
    getRoleOptions(selectedRole = '') {
        const roles = window.userDatabase.getAllRoles();
        return roles.map(role =>
            `<option value="${role.id}" ${role.id === selectedRole ? 'selected' : ''}>${role.name} (Level ${role.level})</option>`
        ).join('');
    }

    /**
     * Get user options HTML
     */
    getUserOptions(selectedUser = '') {
        const users = window.userDatabase.getAllUsers();
        return users.map(user =>
            `<option value="${user.username}" ${user.username === selectedUser ? 'selected' : ''}>${user.name}</option>`
        ).join('');
    }

    /**
     * Get department checkboxes HTML
     */
    getDepartmentCheckboxes(managedDepts = []) {
        const departments = window.userDatabase.getAllDepartments();
        return departments.map(dept => `
            <label class="checkbox-label">
                <input type="checkbox" value="${dept.id}" ${managedDepts.includes(dept.id) ? 'checked' : ''}>
                <span>${dept.name}</span>
            </label>
        `).join('');
    }

    /**
     * Get permissions list HTML
     */
    getPermissionsList(role) {
        if (!role || !role.permissions) return '<p>No permissions available</p>';

        const permissions = Object.entries(role.permissions);
        const granted = permissions.filter(([key, value]) => value);
        const denied = permissions.filter(([key, value]) => !value);

        return `
            <div class="permissions-summary">
                <div class="granted-permissions">
                    <h5><i class="fas fa-check text-success"></i> Granted (${granted.length})</h5>
                    <ul>
                        ${granted.map(([key]) => `<li>${this.formatPermissionName(key)}</li>`).join('')}
                    </ul>
                </div>
                <div class="denied-permissions">
                    <h5><i class="fas fa-times text-danger"></i> Denied (${denied.length})</h5>
                    <ul>
                        ${denied.slice(0, 5).map(([key]) => `<li>${this.formatPermissionName(key)}</li>`).join('')}
                        ${denied.length > 5 ? `<li><em>... and ${denied.length - 5} more</em></li>` : ''}
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * Update user information
     */
    updateUser(userId, updates) {
        const success = window.userDatabase.updateUser(userId, updates);

        if (success) {
            this.showNotification('User updated successfully', 'success');
            this.populateUsers();
            this.closeModal();
        } else {
            this.showNotification('Failed to update user', 'error');
        }
    }

    /**
     * Update user role
     */
    updateUserRole(userId) {
        const newRole = document.getElementById('user-role-select').value;
        const managedDepartments = Array.from(document.querySelectorAll('#managed-departments input:checked'))
            .map(cb => cb.value);

        const success = window.userDatabase.updateUserRole(userId, newRole, managedDepartments);

        if (success) {
            this.showNotification('User role updated successfully', 'success');
            this.populateUsers();
            this.closeModal();
        } else {
            this.showNotification('Failed to update user role', 'error');
        }
    }

    /**
     * Update department
     */
    updateDepartment(deptId) {
        const updates = {
            name: document.getElementById('edit-dept-name').value,
            description: document.getElementById('edit-dept-description').value,
            isActive: document.getElementById('edit-dept-active').checked
        };

        const newHead = document.getElementById('edit-dept-head').value;
        if (newHead) {
            updates.head = newHead;
        }

        const success = window.userDatabase.updateDepartment(deptId, updates);

        if (success) {
            this.showNotification('Department updated successfully', 'success');
            this.populateDepartments();
            this.closeModal();
        } else {
            this.showNotification('Failed to update department', 'error');
        }
    }

    /**
     * Add member to department
     */
    addMemberToDepartment(userId, deptId) {
        const success = window.userDatabase.addUserToDepartment(userId, deptId);

        if (success) {
            this.showNotification('Member added to department', 'success');
            this.populateUsers();
            this.populateDepartments();
            // Refresh the modal
            const department = window.userDatabase.getDepartmentById(deptId);
            this.showDepartmentMembersModal(department);
        } else {
            this.showNotification('Failed to add member', 'error');
        }
    }

    /**
     * Remove member from department
     */
    removeMemberFromDepartment(userId, deptId) {
        const success = window.userDatabase.removeUserFromDepartment(userId, deptId);

        if (success) {
            this.showNotification('Member removed from department', 'success');
            this.populateUsers();
            this.populateDepartments();
            // Refresh the modal
            const department = window.userDatabase.getDepartmentById(deptId);
            this.showDepartmentMembersModal(department);
        } else {
            this.showNotification('Failed to remove member', 'error');
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to notification container
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);

            // Auto remove after 5 seconds
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 5000);
        }
    }
}

// Create global instance
window.roleManagement = new RoleManagement();
