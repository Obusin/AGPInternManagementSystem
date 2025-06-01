/**
 * Applicant QR Code Service
 * Handles QR code generation when applicants are accepted
 */

class ApplicantQRService {
    constructor() {
        this.qrCodeService = null;
        this.userDatabase = null;
        this.isInitialized = false;
        
        // Initialize when dependencies are available
        this.init();
    }

    /**
     * Initialize the service
     */
    async init() {
        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            this.qrCodeService = window.qrCodeService;
            this.userDatabase = window.userDatabase;
            this.isInitialized = true;
            
            console.log('✅ Applicant QR Service initialized');
        } catch (error) {
            console.error('❌ Applicant QR Service initialization failed:', error);
        }
    }

    /**
     * Wait for required dependencies to load
     */
    waitForDependencies() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.qrCodeService && window.userDatabase) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Timeout after 30 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 30000);
        });
    }

    /**
     * Process new applicant acceptance and generate QR code
     */
    async processNewApplicant(applicantData) {
        try {
            console.log('🔄 Starting applicant processing...', applicantData);

            if (!this.isInitialized) {
                console.error('❌ Service not initialized');
                throw new Error('Service not initialized');
            }

            if (!this.qrCodeService) {
                console.error('❌ QR Code Service not available');
                throw new Error('QR Code Service not available');
            }

            if (!this.userDatabase) {
                console.error('❌ User Database not available');
                throw new Error('User Database not available');
            }

            console.log('🔄 Processing new applicant:', applicantData.name);

            // 1. Create user account
            const newUser = await this.createUserAccount(applicantData);
            console.log('✅ User account created:', newUser.id);

            // 2. Generate unique QR code
            const qrResult = await this.generateApplicantQRCode(newUser);
            console.log('✅ QR code generated for:', newUser.name);

            // 3. Store QR code permanently
            await this.storeQRCodePermanently(newUser.id, qrResult);
            console.log('✅ QR code stored permanently');

            // 4. Update user with QR code info
            await this.updateUserWithQRInfo(newUser.id, qrResult);
            console.log('✅ User updated with QR info');

            return {
                success: true,
                user: newUser,
                qrCode: qrResult,
                message: 'Applicant processed and QR code generated successfully'
            };

        } catch (error) {
            console.error('❌ Failed to process applicant:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to process applicant'
            };
        }
    }

    /**
     * Create user account from applicant data
     */
    async createUserAccount(applicantData) {
        const userId = this.generateUniqueUserId();
        
        const newUser = {
            id: userId,
            name: applicantData.name,
            email: applicantData.email,
            username: applicantData.username || applicantData.email.split('@')[0],
            password: applicantData.password || this.generateTemporaryPassword(),
            department: applicantData.department,
            position: applicantData.position || 'Intern',
            role: applicantData.role || 'user',
            avatar: applicantData.avatar || null,
            isActive: true,
            createdAt: new Date().toISOString(),
            acceptedAt: new Date().toISOString(),
            qrCodeGenerated: false,
            qrCodeGeneratedAt: null
        };

        // Add to user database
        const userCreated = this.userDatabase.createUser(newUser);

        if (!userCreated) {
            throw new Error('Failed to create user account - username may already exist');
        }
        
        return newUser;
    }

    /**
     * Generate QR code specifically for new applicant
     */
    async generateApplicantQRCode(user) {
        try {
            console.log('🔄 Generating QR code for user:', user.name);

            // Check if QRCode library is available
            if (typeof QRCode === 'undefined') {
                throw new Error('QRCode library not loaded');
            }

            // Create enhanced QR data for new applicant
            const qrData = {
                version: '2.0',
                type: 'AGP_ATTENDANCE',
                userId: user.id,
                name: user.name,
                email: user.email,
                department: user.department,
                position: user.position,
                role: user.role,
                generatedAt: new Date().toISOString(),
                validUntil: this.calculateExpirationDate(),
                issuer: 'AG&P_ATTENDANCE_SYSTEM',
                applicantId: user.id,
                isNewApplicant: true,
                signature: this.generateSecureSignature(user)
            };

            // Generate QR code image using QRCode library directly
            const qrString = JSON.stringify(qrData);
            const qrCodeDataURL = await QRCode.toDataURL(qrString, {
                width: 256,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            });

            return {
                success: true,
                data: qrData,
                image: qrCodeDataURL,
                generatedAt: new Date().toISOString(),
                userId: user.id
            };

        } catch (error) {
            console.error('Failed to generate applicant QR code:', error);
            throw error;
        }
    }

    /**
     * Store QR code permanently in database
     */
    async storeQRCodePermanently(userId, qrResult) {
        try {
            // Store in QR service
            await this.qrCodeService.storeUserQRCode(userId, qrResult.data, qrResult.image);

            // Also store in local backup
            const qrRecord = {
                userId: userId,
                qrData: qrResult.data,
                qrImage: qrResult.image,
                generatedAt: qrResult.generatedAt,
                isPermanent: true,
                isActive: true,
                downloadCount: 0,
                lastDownloaded: null
            };

            // Store in localStorage as backup
            const qrCodes = JSON.parse(localStorage.getItem('permanentQRCodes') || '{}');
            qrCodes[userId] = qrRecord;
            localStorage.setItem('permanentQRCodes', JSON.stringify(qrCodes));

            console.log('✅ QR code stored permanently for user:', userId);
            return true;

        } catch (error) {
            console.error('Failed to store QR code permanently:', error);
            throw error;
        }
    }

    /**
     * Update user record with QR code information
     */
    async updateUserWithQRInfo(userId, qrResult) {
        try {
            const user = this.userDatabase.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Update user with QR info
            user.qrCodeGenerated = true;
            user.qrCodeGeneratedAt = qrResult.generatedAt;
            user.qrCodeId = `qr_${userId}_${Date.now()}`;
            user.hasQRCode = true;

            // Update in database
            this.userDatabase.updateUser(userId, user);

            return true;
        } catch (error) {
            console.error('Failed to update user with QR info:', error);
            throw error;
        }
    }

    /**
     * Allow user to download their QR code
     */
    async downloadUserQRCode(userId, filename) {
        try {
            const qrCodes = JSON.parse(localStorage.getItem('permanentQRCodes') || '{}');
            const userQR = qrCodes[userId];

            if (!userQR) {
                throw new Error('QR code not found for user');
            }

            // Create download
            const link = document.createElement('a');
            link.download = filename || `AGP-QRCode-${userId}-${Date.now()}.png`;
            link.href = userQR.qrImage;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Update download count
            userQR.downloadCount = (userQR.downloadCount || 0) + 1;
            userQR.lastDownloaded = new Date().toISOString();
            qrCodes[userId] = userQR;
            localStorage.setItem('permanentQRCodes', JSON.stringify(qrCodes));

            console.log('✅ QR code downloaded for user:', userId);
            return true;

        } catch (error) {
            console.error('Failed to download QR code:', error);
            throw error;
        }
    }

    /**
     * Get user's permanent QR code
     */
    getUserQRCode(userId) {
        try {
            const qrCodes = JSON.parse(localStorage.getItem('permanentQRCodes') || '{}');
            return qrCodes[userId] || null;
        } catch (error) {
            console.error('Failed to get user QR code:', error);
            return null;
        }
    }

    /**
     * Get QR code statistics
     */
    getQRCodeStats() {
        try {
            const qrCodes = JSON.parse(localStorage.getItem('permanentQRCodes') || '{}');
            const users = this.userDatabase ? this.userDatabase.getAllUsers() : [];
            
            const totalUsers = users.length;
            const usersWithQR = Object.keys(qrCodes).length;
            const totalDownloads = Object.values(qrCodes).reduce((sum, qr) => sum + (qr.downloadCount || 0), 0);

            return {
                totalUsers,
                usersWithQR,
                coverage: totalUsers > 0 ? ((usersWithQR / totalUsers) * 100).toFixed(1) : 0,
                totalDownloads,
                averageDownloads: usersWithQR > 0 ? (totalDownloads / usersWithQR).toFixed(1) : 0
            };
        } catch (error) {
            console.error('Failed to get QR stats:', error);
            return { totalUsers: 0, usersWithQR: 0, coverage: 0, totalDownloads: 0 };
        }
    }

    /**
     * Generate unique user ID
     */
    generateUniqueUserId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `user_${timestamp}_${random}`;
    }

    /**
     * Generate temporary password for new users
     */
    generateTemporaryPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    /**
     * Calculate QR code expiration date (1 year from now)
     */
    calculateExpirationDate() {
        const expiration = new Date();
        expiration.setFullYear(expiration.getFullYear() + 1);
        return expiration.toISOString();
    }

    /**
     * Generate secure signature for QR code
     */
    generateSecureSignature(user) {
        const signatureData = `${user.id}-${user.email}-${Date.now()}-AGP_SECRET_KEY`;
        return this.simpleHash(signatureData);
    }

    /**
     * Simple hash function
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
}

// Create global instance
window.applicantQRService = new ApplicantQRService();

console.log('✅ Applicant QR Service loaded');
