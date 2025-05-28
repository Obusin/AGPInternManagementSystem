/**
 * AG&P Attendance System - User Database
 * Advanced user database with role and department management
 */

class UserDatabase {
    constructor() {
        this.users = this.initializeUsers();
        this.departments = this.initializeDepartments();
        this.roles = this.initializeRoles();
        this.currentUser = null;
    }

    /**
     * Initialize departments
     */
    initializeDepartments() {
        return {
            'IT_DEV': {
                id: 'IT_DEV',
                name: 'IT Development',
                description: 'Software development and system architecture',
                head: 'devmark',
                members: ['devmark', 'usermark'],
                isActive: true
            },
            'IT_ADMIN': {
                id: 'IT_ADMIN',
                name: 'IT Administration',
                description: 'System administration and infrastructure',
                head: 'adminmark',
                members: ['adminmark'],
                isActive: true
            },
            'HR': {
                id: 'HR',
                name: 'Human Resources',
                description: 'Employee management and recruitment',
                head: null,
                members: [],
                isActive: true
            },
            'FINANCE': {
                id: 'FINANCE',
                name: 'Finance',
                description: 'Financial management and accounting',
                head: null,
                members: [],
                isActive: true
            },
            'OPERATIONS': {
                id: 'OPERATIONS',
                name: 'Operations',
                description: 'Daily operations and project management',
                head: null,
                members: [],
                isActive: true
            },
            'MARKETING': {
                id: 'MARKETING',
                name: 'Marketing',
                description: 'Marketing and business development',
                head: null,
                members: [],
                isActive: true
            }
        };
    }

    /**
     * Initialize role definitions (simplified to developer and user)
     */
    initializeRoles() {
        return {
            'developer': {
                id: 'developer',
                name: 'Developer',
                description: 'Full system access with development privileges',
                level: 100,
                color: '#9b59b6',
                canManageDepartments: ['IT_DEV', 'IT_ADMIN', 'HR', 'FINANCE', 'OPERATIONS', 'MARKETING'],
                permissions: {
                    // System Level
                    viewDashboard: true,
                    accessDevTools: true,
                    viewSourceCode: true,
                    modifySystem: true,
                    viewDebugInfo: true,

                    // User Management
                    viewUsers: true,
                    createUsers: true,
                    editUsers: true,
                    deleteUsers: true,
                    changeUserRoles: true,
                    assignDepartments: true,

                    // Department Management
                    viewAllDepartments: true,
                    createDepartments: true,
                    editDepartments: true,
                    deleteDepartments: true,
                    assignDepartmentHeads: true,

                    // Data Management
                    viewAllStats: true,
                    editAllTime: true,
                    deleteTimeRecords: true,
                    viewAllActivity: true,
                    editAllActivity: true,
                    deleteAllActivity: true,
                    exportData: true,
                    importData: true,

                    // Reports
                    viewReports: true,
                    createReports: true,
                    exportReports: true,
                    scheduleReports: true,

                    // System Settings
                    viewSystemLogs: true,
                    editSystemSettings: true,

                    // Applicant Management
                    manageApplicants: true
                }
            },
            'user': {
                id: 'user',
                name: 'User',
                description: 'Basic access for regular users and interns',
                level: 20,
                color: '#3498db',
                canManageDepartments: [],
                permissions: {
                    // System Level
                    viewDashboard: true,
                    accessDevTools: false,
                    viewSourceCode: false,
                    modifySystem: false,
                    viewDebugInfo: false,

                    // User Management
                    viewUsers: false,
                    createUsers: false,
                    editUsers: false,
                    deleteUsers: false,
                    changeUserRoles: false,
                    assignDepartments: false,

                    // Department Management
                    viewAllDepartments: false,
                    createDepartments: false,
                    editDepartments: false,
                    deleteDepartments: false,
                    assignDepartmentHeads: false,

                    // Data Management (own data only)
                    viewAllStats: false,
                    editAllTime: true,
                    deleteTimeRecords: false,
                    viewAllActivity: false,
                    editAllActivity: true,
                    deleteAllActivity: true,
                    exportData: false,
                    importData: false,

                    // Reports (own data only)
                    viewReports: false,
                    createReports: false,
                    exportReports: false,
                    scheduleReports: false,

                    // System Settings
                    viewSystemLogs: false,
                    editSystemSettings: false,

                    // Applicant Management
                    manageApplicants: false
                }
            }
        };
    }

    /**
     * Initialize predefined user accounts
     */
    initializeUsers() {
        return {
            'devmark': {
                id: 'dev_001',
                username: 'devmark',
                password: 'try465', // In production, this would be hashed
                name: 'Mark Developer',
                email: 'devmark@agp.com',
                position: 'Senior Software Developer',
                department: 'IT_DEV',
                role: 'developer',
                managedDepartments: ['IT_DEV', 'IT_ADMIN', 'HR', 'FINANCE', 'OPERATIONS', 'MARKETING'],
                primarySite: 'BATANGAS',
                assignedSites: ['BATANGAS', 'BAUAN', 'SAN_ROQUE', 'ILIJAN', 'ANTIPOLO', 'CEMEX'],
                currentShift: 'OFFICE_HOURS',
                workSchedule: 'STANDARD_OFFICE',
                avatar: 'https://ui-avatars.com/api/?name=Mark+Developer&background=9b59b6&color=fff',
                createdAt: '2024-01-15T08:00:00.000Z',
                lastLogin: null,
                isActive: true,
                customPermissions: {} // Override specific permissions if needed
            },
            'usermark': {
                id: 'user_001',
                username: 'usermark',
                password: 'try123',
                name: 'Mark User',
                email: 'usermark@agp.com',
                position: 'Software Development Intern',
                department: 'IT_DEV',
                role: 'user',
                managedDepartments: [], // Users don't manage departments
                primarySite: 'ANTIPOLO',
                assignedSites: ['ANTIPOLO'],
                currentShift: 'OFFICE_HOURS',
                workSchedule: 'STANDARD_OFFICE',
                avatar: 'https://ui-avatars.com/api/?name=Mark+User&background=3498db&color=fff',
                createdAt: '2024-02-01T08:00:00.000Z',
                lastLogin: null,
                isActive: true,
                customPermissions: {} // Override specific permissions if needed
            }
        };
    }

    /**
     * Authenticate user with username and password (legacy method)
     */
    async authenticate(username, password) {
        const user = this.users[username.toLowerCase()];

        if (!user) {
            return {
                success: false,
                message: 'User not found',
                user: null
            };
        }

        if (!user.isActive) {
            return {
                success: false,
                message: 'Account is deactivated',
                user: null
            };
        }

        // Check if account is locked due to failed attempts
        if (window.securityService && window.securityService.isAccountLocked(username)) {
            return {
                success: false,
                message: 'Account temporarily locked due to multiple failed login attempts. Please try again later.',
                user: null,
                locked: true
            };
        }

        // Verify password (supports both hashed and plain text for migration)
        let passwordValid = false;

        if (typeof user.password === 'object' && user.password.hash) {
            // New hashed password
            if (window.securityService) {
                passwordValid = await window.securityService.verifyPassword(password, user.password);
            }
        } else {
            // Legacy plain text password (for backward compatibility during migration)
            passwordValid = user.password === password;
        }

        if (!passwordValid) {
            // Record failed attempt
            if (window.securityService) {
                window.securityService.recordFailedAttempt(username);
            }

            return {
                success: false,
                message: 'Invalid password',
                user: null
            };
        }

        // Clear failed attempts on successful login
        if (window.securityService) {
            window.securityService.clearFailedAttempts(username);
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        this.currentUser = user;

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;

        return {
            success: true,
            message: 'Authentication successful',
            user: userWithoutPassword
        };
    }

    /**
     * Authenticate user with email and password
     */
    async authenticateByEmail(email, password) {
        // Find user by email
        const user = Object.values(this.users).find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            // Record failed attempt for email
            if (window.securityService) {
                window.securityService.recordFailedAttempt(email);
            }
            return {
                success: false,
                message: 'No account found with this email address',
                user: null
            };
        }

        if (!user.isActive) {
            return {
                success: false,
                message: 'Account is deactivated',
                user: null
            };
        }

        // Check if account is locked due to failed attempts
        if (window.securityService && window.securityService.isAccountLocked(email)) {
            return {
                success: false,
                message: 'Account temporarily locked due to multiple failed login attempts. Please try again later.',
                user: null,
                locked: true
            };
        }

        // Verify password (supports both hashed and plain text for migration)
        let passwordValid = false;

        if (typeof user.password === 'object' && user.password.hash) {
            // New hashed password
            if (window.securityService) {
                passwordValid = await window.securityService.verifyPassword(password, user.password);
            }
        } else {
            // Legacy plain text password (for backward compatibility during migration)
            passwordValid = user.password === password;
        }

        if (!passwordValid) {
            // Record failed attempt
            if (window.securityService) {
                window.securityService.recordFailedAttempt(email);
            }

            return {
                success: false,
                message: 'Invalid password',
                user: null
            };
        }

        // Clear failed attempts on successful login
        if (window.securityService) {
            window.securityService.clearFailedAttempts(email);
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        this.currentUser = user;

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;

        return {
            success: true,
            message: 'Authentication successful',
            user: userWithoutPassword
        };
    }

    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Logout current user
     */
    logout() {
        this.currentUser = null;
    }

    /**
     * Get all users (admin only)
     */
    getAllUsers() {
        return Object.values(this.users).map(user => {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    /**
     * Get user by ID
     */
    getUserById(id) {
        const user = Object.values(this.users).find(u => u.id === id);
        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    /**
     * Update user profile
     */
    updateUser(userId, updates) {
        const user = Object.values(this.users).find(u => u.id === userId);
        if (user) {
            Object.assign(user, updates);
            return true;
        }
        return false;
    }

    /**
     * Check if username exists
     */
    userExists(username) {
        return this.users.hasOwnProperty(username.toLowerCase());
    }

    /**
     * Check if email exists
     */
    emailExists(email) {
        return Object.values(this.users).some(user => user.email.toLowerCase() === email.toLowerCase());
    }

    /**
     * Get user permissions (combines role permissions with custom overrides)
     */
    getUserPermissions(user) {
        const rolePermissions = this.roles[user.role]?.permissions || {};
        const customPermissions = user.customPermissions || {};

        // Merge role permissions with custom overrides
        return { ...rolePermissions, ...customPermissions };
    }

    /**
     * Check if user has specific permission
     */
    hasPermission(user, permission) {
        const permissions = this.getUserPermissions(user);
        return permissions[permission] === true;
    }

    /**
     * Get departments user can manage
     */
    getManagedDepartments(user) {
        if (user.role === 'developer') {
            return Object.keys(this.departments);
        }
        return user.managedDepartments || [];
    }

    /**
     * Check if user can manage specific department
     */
    canManageDepartment(user, departmentId) {
        const managedDepts = this.getManagedDepartments(user);
        return managedDepts.includes(departmentId);
    }

    /**
     * Get all departments
     */
    getAllDepartments() {
        return Object.values(this.departments);
    }

    /**
     * Get department by ID
     */
    getDepartmentById(id) {
        return this.departments[id] || null;
    }

    /**
     * Get all roles
     */
    getAllRoles() {
        return Object.values(this.roles);
    }

    /**
     * Get role by ID
     */
    getRoleById(id) {
        return this.roles[id] || null;
    }

    /**
     * Update user role and managed departments
     */
    updateUserRole(userId, newRole, managedDepartments = []) {
        const user = Object.values(this.users).find(u => u.id === userId);
        if (user) {
            user.role = newRole;
            user.managedDepartments = managedDepartments;
            return true;
        }
        return false;
    }

    /**
     * Add user to department
     */
    addUserToDepartment(userId, departmentId) {
        const user = Object.values(this.users).find(u => u.id === userId);
        const department = this.departments[departmentId];

        if (user && department) {
            user.department = departmentId;
            if (!department.members.includes(user.username)) {
                department.members.push(user.username);
            }
            return true;
        }
        return false;
    }

    /**
     * Remove user from department
     */
    removeUserFromDepartment(userId, departmentId) {
        const user = Object.values(this.users).find(u => u.id === userId);
        const department = this.departments[departmentId];

        if (user && department) {
            const memberIndex = department.members.indexOf(user.username);
            if (memberIndex > -1) {
                department.members.splice(memberIndex, 1);
            }

            // If this was their primary department, clear it
            if (user.department === departmentId) {
                user.department = null;
            }
            return true;
        }
        return false;
    }

    /**
     * Set department head
     */
    setDepartmentHead(departmentId, userId) {
        const user = Object.values(this.users).find(u => u.id === userId);
        const department = this.departments[departmentId];

        if (user && department) {
            department.head = user.username;

            // Add user to department if not already there
            if (!department.members.includes(user.username)) {
                department.members.push(user.username);
            }

            // Update user's department if needed
            if (user.department !== departmentId) {
                user.department = departmentId;
            }

            return true;
        }
        return false;
    }

    /**
     * Create new department
     */
    createDepartment(departmentData) {
        const id = departmentData.id || departmentData.name.toUpperCase().replace(/\s+/g, '_');

        if (this.departments[id]) {
            return { success: false, message: 'Department already exists' };
        }

        this.departments[id] = {
            id: id,
            name: departmentData.name,
            description: departmentData.description || '',
            head: null,
            members: [],
            isActive: true,
            ...departmentData
        };

        return { success: true, department: this.departments[id] };
    }

    /**
     * Update department
     */
    updateDepartment(departmentId, updates) {
        const department = this.departments[departmentId];
        if (department) {
            Object.assign(department, updates);
            return true;
        }
        return false;
    }

    /**
     * Delete department
     */
    deleteDepartment(departmentId) {
        if (this.departments[departmentId]) {
            // Remove users from this department
            Object.values(this.users).forEach(user => {
                if (user.department === departmentId) {
                    user.department = null;
                }

                // Remove from managed departments
                if (user.managedDepartments) {
                    const index = user.managedDepartments.indexOf(departmentId);
                    if (index > -1) {
                        user.managedDepartments.splice(index, 1);
                    }
                }
            });

            delete this.departments[departmentId];
            return true;
        }
        return false;
    }

    /**
     * Get users by department
     */
    getUsersByDepartment(departmentId) {
        return Object.values(this.users).filter(user => user.department === departmentId);
    }

    /**
     * Get users by role
     */
    getUsersByRole(roleId) {
        return Object.values(this.users).filter(user => user.role === roleId);
    }

    /**
     * Create new role
     */
    createRole(roleData) {
        if (this.roles[roleData.id]) {
            return false; // Role already exists
        }

        this.roles[roleData.id] = {
            id: roleData.id,
            name: roleData.name,
            description: roleData.description || '',
            level: roleData.level || 50,
            color: roleData.color || '#6c757d',
            canManageDepartments: roleData.canManageDepartments || [],
            permissions: roleData.permissions || {}
        };

        return true;
    }

    /**
     * Update role
     */
    updateRole(roleId, updates) {
        const role = this.roles[roleId];
        if (role) {
            Object.assign(role, updates);
            return true;
        }
        return false;
    }

    /**
     * Delete role
     */
    deleteRole(roleId) {
        // Check if any users have this role
        const usersWithRole = this.getUsersByRole(roleId);
        if (usersWithRole.length > 0) {
            return {
                success: false,
                message: `Cannot delete role. ${usersWithRole.length} user(s) still have this role.`,
                users: usersWithRole
            };
        }

        if (this.roles[roleId]) {
            delete this.roles[roleId];
            return { success: true, message: 'Role deleted successfully' };
        }

        return { success: false, message: 'Role not found' };
    }

    /**
     * Create new user
     */
    createUser(userData) {
        // Check if username already exists
        if (this.userExists(userData.username)) {
            return false;
        }

        // Generate unique ID if not provided
        const userId = userData.id || `user_${Date.now()}`;

        // Create user object
        this.users[userData.username.toLowerCase()] = {
            id: userId,
            username: userData.username.toLowerCase(),
            password: userData.password,
            name: userData.name,
            email: userData.email,
            position: userData.position,
            department: userData.department || null,
            role: userData.role || 'user',
            managedDepartments: userData.managedDepartments || [],
            avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random&color=fff`,
            createdAt: userData.createdAt || new Date().toISOString(),
            lastLogin: null,
            isActive: userData.isActive !== undefined ? userData.isActive : true,
            customPermissions: userData.customPermissions || {}
        };

        return true;
    }

    /**
     * Delete user
     */
    deleteUser(userId) {
        const user = Object.values(this.users).find(u => u.id === userId);
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // Remove user from all departments
        Object.values(this.departments).forEach(dept => {
            const memberIndex = dept.members.indexOf(user.username);
            if (memberIndex > -1) {
                dept.members.splice(memberIndex, 1);
            }

            // Remove as department head
            if (dept.head === user.username) {
                dept.head = null;
            }
        });

        // Delete user
        delete this.users[user.username];

        return { success: true, message: 'User deleted successfully' };
    }
}

// Create global instance
window.userDatabase = new UserDatabase();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserDatabase;
}
