/**
 * QR Code Manager Component
 * Manages QR code generation, display, and user management
 */

class QRCodeManager {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
    }

    /**
     * Initialize QR Code Manager
     */
    init(user) {
        this.currentUser = user;
        this.isInitialized = true;
        console.log('QR Code Manager initialized for user:', user.name);
    }

    /**
     * Show user's QR code
     */
    async showUserQRCode(userId) {
        try {
            const users = window.userDatabase ? window.userDatabase.getAllUsers() : [];
            const user = users.find(u => u.id === userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            // Get or generate QR code
            let qrCode = await window.qrCodeService.getUserQRCode(userId);

            if (!qrCode) {
                console.log('Generating new QR code for user:', user.name);
                const result = await window.qrCodeService.generateUserQRCode(user);

                if (!result.success) {
                    throw new Error(result.message);
                }

                qrCode = {
                    image: result.qrCode,
                    data: result.data
                };
            }

            // Show QR code modal
            this.displayQRCodeModal(user, qrCode);

        } catch (error) {
            console.error('Failed to show QR code:', error);
            this.showError('Failed to load QR code: ' + error.message);
        }
    }

    /**
     * Display QR code in modal
     */
    displayQRCodeModal(user, qrCode) {
        const modal = document.createElement('div');
        modal.className = 'qr-code-modal';
        modal.innerHTML = `
            <div class="qr-modal-overlay"></div>
            <div class="qr-modal-container">
                <div class="qr-modal-header">
                    <h2>
                        <i class="fas fa-qrcode"></i>
                        Your QR Code
                    </h2>
                    <button class="qr-modal-close">&times;</button>
                </div>
                
                <div class="qr-modal-content">
                    <div class="qr-user-info">
                        <div class="qr-user-avatar">
                            <img src="${user.avatar}" alt="${user.name}">
                        </div>
                        <div class="qr-user-details">
                            <h3>${user.name}</h3>
                            <p>${user.position}</p>
                            <p>${user.department}</p>
                            <span class="qr-user-role">${user.role.toUpperCase()}</span>
                        </div>
                    </div>
                    
                    <div class="qr-code-display">
                        <div class="qr-code-container">
                            <img src="${qrCode.image}" alt="QR Code" class="qr-code-image">
                            <div class="qr-code-overlay">
                                <div class="qr-scan-line"></div>
                            </div>
                        </div>
                        
                        <div class="qr-code-info">
                            <p><strong>QR Code ID:</strong> ${qrCode.data.userId}</p>
                            <p><strong>Generated:</strong> ${new Date(qrCode.data.generatedAt).toLocaleDateString()}</p>
                            <p><strong>Valid Until:</strong> ${new Date(qrCode.data.validUntil).toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    <div class="qr-instructions">
                        <h4>How to use your QR code:</h4>
                        <ul>
                            <li>Show this QR code to scan for attendance</li>
                            <li>Keep your device screen bright for better scanning</li>
                            <li>Position the code within the scanner frame</li>
                            <li>Wait for the confirmation beep or message</li>
                        </ul>
                    </div>
                    
                    <div class="qr-actions">
                        <button class="qr-action-btn primary" id="download-qr">
                            <i class="fas fa-download"></i>
                            Download QR Code
                        </button>
                        <button class="qr-action-btn secondary" id="share-qr">
                            <i class="fas fa-share"></i>
                            Share QR Code
                        </button>
                        <button class="qr-action-btn" id="regenerate-qr">
                            <i class="fas fa-sync-alt"></i>
                            Regenerate
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        this.addQRModalStyles();

        // Add to page
        document.body.appendChild(modal);

        // Setup event listeners
        this.setupQRModalEvents(modal, user, qrCode);

        // Animate in
        setTimeout(() => modal.classList.add('active'), 10);
    }

    /**
     * Add QR modal styles
     */
    addQRModalStyles() {
        if (document.getElementById('qr-modal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'qr-modal-styles';
        styles.textContent = `
            .qr-code-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .qr-code-modal.active {
                opacity: 1;
                visibility: visible;
            }

            .qr-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
            }

            .qr-modal-container {
                position: relative;
                width: 90%;
                max-width: 500px;
                margin: 20px auto;
                background: var(--card-bg, #2e3540);
                border-radius: 16px;
                overflow: hidden;
                transform: translateY(50px);
                transition: transform 0.3s ease;
                max-height: 90vh;
                overflow-y: auto;
            }

            .qr-code-modal.active .qr-modal-container {
                transform: translateY(0);
            }

            .qr-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: linear-gradient(135deg, #ff7a45, #ff6b35);
                color: white;
            }

            .qr-modal-header h2 {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 600;
            }

            .qr-modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: background 0.3s ease;
            }

            .qr-modal-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .qr-modal-content {
                padding: 20px;
            }

            .qr-user-info {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 25px;
                padding: 15px;
                background: rgba(255, 122, 69, 0.1);
                border-radius: 12px;
            }

            .qr-user-avatar img {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                object-fit: cover;
            }

            .qr-user-details h3 {
                margin: 0 0 5px 0;
                color: var(--text-color, #ffffff);
            }

            .qr-user-details p {
                margin: 2px 0;
                color: var(--text-secondary, #a0a0a0);
                font-size: 0.9rem;
            }

            .qr-user-role {
                display: inline-block;
                padding: 4px 8px;
                background: #ff7a45;
                color: white;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 600;
                margin-top: 5px;
            }

            .qr-code-display {
                text-align: center;
                margin-bottom: 25px;
            }

            .qr-code-container {
                position: relative;
                display: inline-block;
                padding: 20px;
                background: white;
                border-radius: 16px;
                margin-bottom: 15px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }

            .qr-code-image {
                width: 200px;
                height: 200px;
                display: block;
            }

            .qr-code-overlay {
                position: absolute;
                top: 20px;
                left: 20px;
                width: 200px;
                height: 200px;
                pointer-events: none;
            }

            .qr-scan-line {
                width: 100%;
                height: 2px;
                background: #ff7a45;
                animation: scan 2s linear infinite;
            }

            @keyframes scan {
                0% { transform: translateY(0); opacity: 1; }
                50% { opacity: 0.5; }
                100% { transform: translateY(196px); opacity: 1; }
            }

            .qr-code-info {
                text-align: left;
                background: rgba(255, 255, 255, 0.05);
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }

            .qr-code-info p {
                margin: 5px 0;
                color: var(--text-color, #ffffff);
                font-size: 0.9rem;
            }

            .qr-instructions {
                background: rgba(255, 122, 69, 0.1);
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }

            .qr-instructions h4 {
                margin: 0 0 10px 0;
                color: #ff7a45;
            }

            .qr-instructions ul {
                margin: 0;
                padding-left: 20px;
                color: var(--text-color, #ffffff);
            }

            .qr-instructions li {
                margin: 5px 0;
                font-size: 0.9rem;
            }

            .qr-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .qr-action-btn {
                flex: 1;
                min-width: 120px;
                padding: 12px 16px;
                background: var(--secondary-bg, #4a5568);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .qr-action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .qr-action-btn.primary {
                background: #ff7a45;
            }

            .qr-action-btn.primary:hover {
                background: #e05a25;
            }

            .qr-action-btn.secondary {
                background: #3498db;
            }

            .qr-action-btn.secondary:hover {
                background: #2980b9;
            }

            @media (max-width: 768px) {
                .qr-modal-container {
                    width: 95%;
                    margin: 10px auto;
                }

                .qr-user-info {
                    flex-direction: column;
                    text-align: center;
                }

                .qr-code-image {
                    width: 150px;
                    height: 150px;
                }

                .qr-action-btn {
                    min-width: 100px;
                    padding: 10px 12px;
                    font-size: 0.9rem;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Setup QR modal event listeners
     */
    setupQRModalEvents(modal, user, qrCode) {
        // Close button
        modal.querySelector('.qr-modal-close').addEventListener('click', () => {
            this.closeQRModal(modal);
        });

        // Overlay click
        modal.querySelector('.qr-modal-overlay').addEventListener('click', () => {
            this.closeQRModal(modal);
        });

        // Download QR code
        modal.querySelector('#download-qr').addEventListener('click', async () => {
            await this.downloadQRCode(user, qrCode);
        });

        // Share QR code
        modal.querySelector('#share-qr').addEventListener('click', () => {
            this.shareQRCode(user, qrCode);
        });

        // Regenerate QR code
        modal.querySelector('#regenerate-qr').addEventListener('click', async () => {
            await this.regenerateQRCode(modal, user);
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeQRModal(modal);
            }
        });
    }

    /**
     * Close QR modal
     */
    closeQRModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    /**
     * Download QR code
     */
    async downloadQRCode(user, qrCode) {
        try {
            await window.qrCodeService.downloadQRCode(user.id, `${user.name}-qr-code.png`);
            this.showSuccess('QR code downloaded successfully!');
        } catch (error) {
            this.showError('Failed to download QR code: ' + error.message);
        }
    }

    /**
     * Share QR code
     */
    async shareQRCode(user, qrCode) {
        if (navigator.share) {
            try {
                // Convert data URL to blob
                const response = await fetch(qrCode.image);
                const blob = await response.blob();
                const file = new File([blob], `${user.name}-qr-code.png`, { type: 'image/png' });

                await navigator.share({
                    title: `${user.name}'s QR Code`,
                    text: `AG&P Attendance QR Code for ${user.name}`,
                    files: [file]
                });
            } catch (error) {
                console.error('Share failed:', error);
                this.fallbackShare(qrCode);
            }
        } else {
            this.fallbackShare(qrCode);
        }
    }

    /**
     * Fallback share method
     */
    fallbackShare(qrCode) {
        // Copy QR data to clipboard
        navigator.clipboard.writeText(JSON.stringify(qrCode.data, null, 2)).then(() => {
            this.showSuccess('QR code data copied to clipboard!');
        }).catch(() => {
            this.showError('Sharing not supported on this device');
        });
    }

    /**
     * Regenerate QR code
     */
    async regenerateQRCode(modal, user) {
        const regenerateBtn = modal.querySelector('#regenerate-qr');
        regenerateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Regenerating...';
        regenerateBtn.disabled = true;

        try {
            const result = await window.qrCodeService.generateUserQRCode(user);
            
            if (result.success) {
                this.showSuccess('QR code regenerated successfully!');
                this.closeQRModal(modal);
                // Show new QR code
                setTimeout(() => this.showUserQRCode(user.id), 300);
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            this.showError('Failed to regenerate QR code: ' + error.message);
            regenerateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Regenerate';
            regenerateBtn.disabled = false;
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        if (window.uiComponents) {
            window.uiComponents.showToast(message, 'success');
        } else {
            alert(message);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        if (window.uiComponents) {
            window.uiComponents.showToast(message, 'error');
        } else {
            alert(message);
        }
    }
}

// Create global instance
window.qrCodeManager = new QRCodeManager();

console.log('✅ QR Code Manager initialized');
