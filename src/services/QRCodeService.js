/**
 * Modern QR Code Service with Supabase Integration
 * Handles QR code generation and management for attendance tracking
 */

class QRCodeService {
    constructor() {
        this.qrCodes = new Map(); // Cache generated QR codes
        this.supabase = null;
        this.isSupabaseEnabled = false;
        this.config = {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 256
        };

        // Initialize Supabase connection
        this.initSupabase().catch(error => {
            console.warn('QR Service: Supabase initialization failed:', error);
        });
    }

    /**
     * Initialize Supabase connection
     */
    async initSupabase() {
        try {
            // Wait for Supabase service to be available
            if (window.supabaseService) {
                // Check if already initialized
                if (window.supabaseService.isReady) {
                    this.supabase = window.supabaseService;
                    this.isSupabaseEnabled = true;
                    console.log('✅ QR Service: Using existing Supabase connection');
                } else {
                    // Try to initialize
                    const success = await window.supabaseService.init();
                    if (success) {
                        this.supabase = window.supabaseService;
                        this.isSupabaseEnabled = true;
                        console.log('✅ QR Service: Supabase initialized');
                    } else {
                        console.log('⚠️ QR Service: Supabase initialization failed, using localStorage');
                    }
                }
            } else {
                console.log('📱 QR Service: Supabase service not available, using localStorage');
            }
        } catch (error) {
            console.error('❌ QR Service: Supabase initialization failed:', error);
            this.isSupabaseEnabled = false;
        }
    }

    /**
     * Generate QR code for a user
     */
    async generateUserQRCode(userData) {
        try {
            console.log('🔄 QR Service: Starting QR generation for user:', userData.name);

            const qrData = this.createQRData(userData);
            console.log('✅ QR Service: QR data created');

            const qrCodeDataURL = await this.generateQRCodeImage(qrData);
            console.log('✅ QR Service: QR image generated');

            // Cache the QR code
            this.qrCodes.set(userData.id, {
                data: qrData,
                image: qrCodeDataURL,
                generatedAt: new Date().toISOString(),
                userData: userData
            });
            console.log('✅ QR Service: QR code cached');

            // Store in user database
            try {
                await this.storeUserQRCode(userData.id, qrData, qrCodeDataURL);
                console.log('✅ QR Service: QR code stored');
            } catch (storeError) {
                console.warn('⚠️ QR Service: Storage failed but continuing:', storeError.message);
            }

            return {
                success: true,
                qrCode: qrCodeDataURL,
                data: qrData,
                message: 'QR code generated successfully'
            };

        } catch (error) {
            console.error('❌ QR Service: Generation failed:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to generate QR code: ' + error.message
            };
        }
    }

    /**
     * Create QR data object for user
     */
    createQRData(userData) {
        const timestamp = Date.now();
        const validUntil = new Date();
        validUntil.setFullYear(validUntil.getFullYear() + 1); // Valid for 1 year

        return {
            version: '2.0',
            type: 'AGP_ATTENDANCE',
            userId: userData.id,
            name: userData.name,
            email: userData.email,
            department: userData.department,
            position: userData.position,
            role: userData.role,
            generatedAt: new Date().toISOString(),
            validUntil: validUntil.toISOString(),
            issuer: 'AG&P_ATTENDANCE_SYSTEM',
            signature: this.generateSignature(userData, timestamp)
        };
    }

    /**
     * Generate QR code image
     */
    async generateQRCodeImage(data) {
        try {
            const qrString = JSON.stringify(data);
            const qrCodeDataURL = await QRCode.toDataURL(qrString, this.config);
            return qrCodeDataURL;
        } catch (error) {
            console.error('QR image generation failed:', error);
            throw new Error('Failed to generate QR code image');
        }
    }

    /**
     * Generate signature for QR data validation
     */
    generateSignature(userData, timestamp) {
        const signatureData = `${userData.id}-${userData.email}-${timestamp}-AGP_SECRET`;
        return this.simpleHash(signatureData);
    }

    /**
     * Simple hash function for signature
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    /**
     * Store QR code in database (Supabase or localStorage)
     */
    async storeUserQRCode(userId, qrData, qrImage) {
        try {
            const qrCodeRecord = {
                user_id: userId,
                qr_data: qrData,
                qr_image: qrImage,
                generated_at: new Date().toISOString(),
                is_active: true
            };

            // Try Supabase first
            if (this.isSupabaseEnabled && this.supabase) {
                try {
                    const data = await this.supabase.saveQRCode(userId, qrData, qrImage);
                    console.log(`✅ QR code stored in Supabase for user: ${userId}`);
                    return { success: true, data };
                } catch (supabaseError) {
                    console.error('Supabase QR storage failed, falling back to localStorage:', supabaseError);
                }
            }

            // Fallback to localStorage/userDatabase
            if (window.userDatabase) {
                const users = window.userDatabase.getAllUsers();
                const user = users.find(u => u.id === userId);

                if (user) {
                    user.qrCode = {
                        data: qrData,
                        image: qrImage,
                        generatedAt: new Date().toISOString()
                    };

                    // Update user in database
                    window.userDatabase.updateUser(userId, user);
                    console.log(`📱 QR code stored locally for user: ${user.name}`);
                    return { success: true, data: user.qrCode };
                }
            }

            throw new Error('No storage method available');
        } catch (error) {
            console.error('Failed to store QR code:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user's QR code from database
     */
    async getUserQRCode(userId) {
        try {
            // Check cache first
            if (this.qrCodes.has(userId)) {
                return this.qrCodes.get(userId);
            }

            // Try Supabase first
            if (this.isSupabaseEnabled && this.supabase) {
                try {
                    const data = await this.supabase.getQRCode(userId);

                    if (data) {
                        const qrCode = {
                            data: data.qr_data,
                            image: data.qr_image,
                            generatedAt: data.generated_at
                        };

                        // Add to cache
                        this.qrCodes.set(userId, qrCode);
                        return qrCode;
                    }
                } catch (supabaseError) {
                    console.error('Supabase QR fetch failed, trying localStorage:', supabaseError);
                }
            }

            // Fallback to localStorage/userDatabase
            if (window.userDatabase) {
                const users = window.userDatabase.getAllUsers();
                const user = users.find(u => u.id === userId);

                if (user && user.qrCode) {
                    // Add to cache
                    this.qrCodes.set(userId, user.qrCode);
                    return user.qrCode;
                }
            }

            return null;
        } catch (error) {
            console.error('Failed to get QR code:', error);
            return null;
        }
    }

    /**
     * Validate QR code data
     */
    validateQRData(qrData) {
        try {
            // Check if it's our QR code
            if (!qrData.type || qrData.type !== 'AGP_ATTENDANCE') {
                return { valid: false, reason: 'Not an AG&P attendance QR code' };
            }

            // Check version
            if (!qrData.version || qrData.version !== '2.0') {
                return { valid: false, reason: 'Unsupported QR code version' };
            }

            // Check expiration
            const validUntil = new Date(qrData.validUntil);
            if (validUntil < new Date()) {
                return { valid: false, reason: 'QR code has expired' };
            }

            // Check issuer
            if (qrData.issuer !== 'AG&P_ATTENDANCE_SYSTEM') {
                return { valid: false, reason: 'Invalid issuer' };
            }

            // Validate signature
            const expectedSignature = this.generateSignature(
                { id: qrData.userId, email: qrData.email },
                new Date(qrData.generatedAt).getTime()
            );

            if (qrData.signature !== expectedSignature) {
                return { valid: false, reason: 'Invalid signature' };
            }

            return { valid: true, userData: qrData };

        } catch (error) {
            console.error('QR validation error:', error);
            return { valid: false, reason: 'QR code validation failed' };
        }
    }

    /**
     * Generate QR codes for all users
     */
    async generateAllUserQRCodes() {
        try {
            const users = window.userDatabase ? window.userDatabase.getAllUsers() : [];
            const results = [];

            for (const user of users) {
                const result = await this.generateUserQRCode(user);
                results.push({
                    userId: user.id,
                    name: user.name,
                    success: result.success,
                    message: result.message
                });
            }

            return {
                success: true,
                results: results,
                total: users.length,
                successful: results.filter(r => r.success).length
            };

        } catch (error) {
            console.error('Bulk QR generation failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Download QR code as image
     */
    async downloadQRCode(userId, filename) {
        const qrCode = await this.getUserQRCode(userId);
        if (!qrCode) {
            throw new Error('QR code not found for user');
        }

        const link = document.createElement('a');
        link.download = filename || `qr-code-${userId}.png`;
        link.href = qrCode.image;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Get QR code statistics
     */
    getQRCodeStats() {
        const users = window.userDatabase ? window.userDatabase.getAllUsers() : [];
        const usersWithQR = users.filter(u => u.qrCode).length;
        
        return {
            totalUsers: users.length,
            usersWithQRCodes: usersWithQR,
            cacheSize: this.qrCodes.size,
            coverage: users.length > 0 ? (usersWithQR / users.length * 100).toFixed(1) : 0
        };
    }
}

// Create global instance
window.qrCodeService = new QRCodeService();

console.log('✅ QR Code Service initialized');
