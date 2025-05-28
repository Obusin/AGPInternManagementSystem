/**
 * Security Service - Comprehensive security utilities for AG&P Attendance System
 * Handles password hashing, session management, and security validations
 */

class SecurityService {
    constructor() {
        this.saltRounds = 12;
        this.sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
        this.maxFailedAttempts = 5;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
        this.passwordMinLength = 8;
        
        // Initialize failed login tracking
        this.failedAttempts = this.loadFailedAttempts();
        this.lockedAccounts = this.loadLockedAccounts();
    }

    /**
     * Hash password using PBKDF2 with salt
     */
    async hashPassword(password) {
        try {
            // Generate random salt
            const salt = this.generateSalt();
            
            // Use Web Crypto API for PBKDF2
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const saltBuffer = encoder.encode(salt);
            
            // Import password as key material
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                data,
                { name: 'PBKDF2' },
                false,
                ['deriveBits']
            );
            
            // Derive key using PBKDF2
            const derivedKey = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: saltBuffer,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                256
            );
            
            // Convert to hex string
            const hashArray = Array.from(new Uint8Array(derivedKey));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            return {
                hash: hashHex,
                salt: salt,
                algorithm: 'PBKDF2',
                iterations: 100000
            };
        } catch (error) {
            console.error('Password hashing failed:', error);
            throw new Error('Password hashing failed');
        }
    }

    /**
     * Verify password against hash
     */
    async verifyPassword(password, storedHash) {
        try {
            if (!storedHash || !storedHash.hash || !storedHash.salt) {
                return false;
            }
            
            // Hash the provided password with the stored salt
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const saltBuffer = encoder.encode(storedHash.salt);
            
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                data,
                { name: 'PBKDF2' },
                false,
                ['deriveBits']
            );
            
            const derivedKey = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: saltBuffer,
                    iterations: storedHash.iterations || 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                256
            );
            
            const hashArray = Array.from(new Uint8Array(derivedKey));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            return hashHex === storedHash.hash;
        } catch (error) {
            console.error('Password verification failed:', error);
            return false;
        }
    }

    /**
     * Generate cryptographically secure salt
     */
    generateSalt(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Validate password strength
     */
    validatePasswordStrength(password) {
        const errors = [];
        
        if (password.length < this.passwordMinLength) {
            errors.push(`Password must be at least ${this.passwordMinLength} characters long`);
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        // Check for common weak passwords
        const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey'
        ];
        
        if (commonPasswords.includes(password.toLowerCase())) {
            errors.push('Password is too common. Please choose a more secure password');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            strength: this.calculatePasswordStrength(password)
        };
    }

    /**
     * Calculate password strength score
     */
    calculatePasswordStrength(password) {
        let score = 0;
        
        // Length bonus
        score += Math.min(password.length * 2, 20);
        
        // Character variety bonus
        if (/[a-z]/.test(password)) score += 5;
        if (/[A-Z]/.test(password)) score += 5;
        if (/\d/.test(password)) score += 5;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;
        
        // Complexity bonus
        const uniqueChars = new Set(password).size;
        score += uniqueChars * 2;
        
        // Pattern penalties
        if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
        if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns
        
        // Normalize to 0-100 scale
        score = Math.max(0, Math.min(100, score));
        
        if (score < 30) return 'weak';
        if (score < 60) return 'medium';
        if (score < 80) return 'strong';
        return 'very-strong';
    }

    /**
     * Track failed login attempts
     */
    recordFailedAttempt(identifier) {
        const now = Date.now();
        
        if (!this.failedAttempts[identifier]) {
            this.failedAttempts[identifier] = [];
        }
        
        // Add current attempt
        this.failedAttempts[identifier].push(now);
        
        // Remove attempts older than lockout duration
        this.failedAttempts[identifier] = this.failedAttempts[identifier]
            .filter(timestamp => now - timestamp < this.lockoutDuration);
        
        // Check if account should be locked
        if (this.failedAttempts[identifier].length >= this.maxFailedAttempts) {
            this.lockAccount(identifier);
        }
        
        this.saveFailedAttempts();
    }

    /**
     * Check if account is locked
     */
    isAccountLocked(identifier) {
        const lockInfo = this.lockedAccounts[identifier];
        if (!lockInfo) return false;
        
        const now = Date.now();
        if (now - lockInfo.lockedAt > this.lockoutDuration) {
            // Lock has expired, remove it
            delete this.lockedAccounts[identifier];
            delete this.failedAttempts[identifier];
            this.saveLockedAccounts();
            this.saveFailedAttempts();
            return false;
        }
        
        return true;
    }

    /**
     * Lock account
     */
    lockAccount(identifier) {
        this.lockedAccounts[identifier] = {
            lockedAt: Date.now(),
            attempts: this.failedAttempts[identifier].length
        };
        this.saveLockedAccounts();
    }

    /**
     * Clear failed attempts on successful login
     */
    clearFailedAttempts(identifier) {
        delete this.failedAttempts[identifier];
        delete this.lockedAccounts[identifier];
        this.saveFailedAttempts();
        this.saveLockedAccounts();
    }

    /**
     * Generate secure session token
     */
    generateSessionToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Create secure session
     */
    createSession(user) {
        const sessionToken = this.generateSessionToken();
        const expiresAt = Date.now() + this.sessionTimeout;
        
        const session = {
            token: sessionToken,
            userId: user.id,
            email: user.email,
            role: user.role,
            createdAt: Date.now(),
            expiresAt: expiresAt,
            lastActivity: Date.now(),
            ipAddress: this.getClientIP(),
            userAgent: navigator.userAgent
        };
        
        // Store session
        localStorage.setItem('agp_session', JSON.stringify(session));
        localStorage.setItem('agp_session_token', sessionToken);
        
        return session;
    }

    /**
     * Validate session
     */
    validateSession() {
        try {
            const sessionData = localStorage.getItem('agp_session');
            const sessionToken = localStorage.getItem('agp_session_token');
            
            if (!sessionData || !sessionToken) {
                return { valid: false, reason: 'No session found' };
            }
            
            const session = JSON.parse(sessionData);
            
            // Check token match
            if (session.token !== sessionToken) {
                return { valid: false, reason: 'Invalid session token' };
            }
            
            // Check expiration
            if (Date.now() > session.expiresAt) {
                this.clearSession();
                return { valid: false, reason: 'Session expired' };
            }
            
            // Check inactivity timeout (2 hours)
            const inactivityTimeout = 2 * 60 * 60 * 1000;
            if (Date.now() - session.lastActivity > inactivityTimeout) {
                this.clearSession();
                return { valid: false, reason: 'Session inactive too long' };
            }
            
            // Update last activity
            session.lastActivity = Date.now();
            localStorage.setItem('agp_session', JSON.stringify(session));
            
            return { valid: true, session: session };
        } catch (error) {
            console.error('Session validation error:', error);
            this.clearSession();
            return { valid: false, reason: 'Session validation failed' };
        }
    }

    /**
     * Clear session
     */
    clearSession() {
        localStorage.removeItem('agp_session');
        localStorage.removeItem('agp_session_token');
        localStorage.removeItem('agp_current_user');
        localStorage.removeItem('agp_login_time');
    }

    /**
     * Get client IP (simplified for demo)
     */
    getClientIP() {
        // In a real application, this would be handled server-side
        return 'client-ip';
    }

    /**
     * Load failed attempts from storage
     */
    loadFailedAttempts() {
        try {
            const data = localStorage.getItem('agp_failed_attempts');
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Failed to load failed attempts:', error);
            return {};
        }
    }

    /**
     * Save failed attempts to storage
     */
    saveFailedAttempts() {
        try {
            localStorage.setItem('agp_failed_attempts', JSON.stringify(this.failedAttempts));
        } catch (error) {
            console.error('Failed to save failed attempts:', error);
        }
    }

    /**
     * Load locked accounts from storage
     */
    loadLockedAccounts() {
        try {
            const data = localStorage.getItem('agp_locked_accounts');
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Failed to load locked accounts:', error);
            return {};
        }
    }

    /**
     * Save locked accounts to storage
     */
    saveLockedAccounts() {
        try {
            localStorage.setItem('agp_locked_accounts', JSON.stringify(this.lockedAccounts));
        } catch (error) {
            console.error('Failed to save locked accounts:', error);
        }
    }
}

// Create global instance
window.securityService = new SecurityService();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityService;
}
