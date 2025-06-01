/**
 * Applicant QR Manager Component
 * Handles UI for applicant QR code generation and management
 */

class ApplicantQRManager {
    constructor() {
        this.applicantQRService = null;
        this.isInitialized = false;
        
        // Initialize when dependencies are available
        this.init();
    }

    /**
     * Initialize the component
     */
    async init() {
        try {
            // Wait for service to be available
            await this.waitForService();
            this.applicantQRService = window.applicantQRService;
            this.isInitialized = true;
            
            console.log('✅ Applicant QR Manager initialized');
        } catch (error) {
            console.error('❌ Applicant QR Manager initialization failed:', error);
        }
    }

    /**
     * Wait for applicant QR service
     */
    waitForService() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.applicantQRService && window.applicantQRService.isInitialized) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 30000);
        });
    }

    /**
     * Show applicant acceptance modal with QR generation
     */
    showApplicantAcceptanceModal(applicantData) {
        const modal = this.createApplicantModal(applicantData);
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    /**
     * Create applicant acceptance modal
     */
    createApplicantModal(applicantData) {
        const modal = document.createElement('div');
        modal.className = 'applicant-modal-overlay';
        modal.innerHTML = `
            <div class="applicant-modal">
                <div class="applicant-modal-header">
                    <h2>🎉 Accept New Applicant</h2>
                    <button class="close-btn" onclick="this.closest('.applicant-modal-overlay').remove()">×</button>
                </div>
                
                <div class="applicant-modal-body">
                    <div class="applicant-info">
                        <h3>📋 Applicant Information</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Name:</label>
                                <span>${applicantData.name}</span>
                            </div>
                            <div class="info-item">
                                <label>Email:</label>
                                <span>${applicantData.email}</span>
                            </div>
                            <div class="info-item">
                                <label>Department:</label>
                                <span>${applicantData.department}</span>
                            </div>
                            <div class="info-item">
                                <label>Position:</label>
                                <span>${applicantData.position || 'Intern'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="qr-generation-section">
                        <h3>📱 QR Code Generation</h3>
                        <div id="qr-generation-status" class="status-area">
                            <p>Click "Accept & Generate QR" to create the applicant's unique QR code.</p>
                        </div>
                        <div id="qr-display-area" class="qr-display" style="display: none;">
                            <!-- QR code will be displayed here -->
                        </div>
                    </div>
                </div>
                
                <div class="applicant-modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.applicant-modal-overlay').remove()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" id="accept-generate-btn" onclick="window.applicantQRManager.processApplicantAcceptance('${applicantData.id}')">
                        🎯 Accept & Generate QR
                    </button>
                </div>
            </div>
        `;

        // Add styles
        this.addModalStyles();
        
        return modal;
    }

    /**
     * Process applicant acceptance and generate QR code
     */
    async processApplicantAcceptance(applicantId) {
        try {
            const statusArea = document.getElementById('qr-generation-status');
            const qrDisplayArea = document.getElementById('qr-display-area');
            const acceptBtn = document.getElementById('accept-generate-btn');
            
            // Disable button and show loading
            acceptBtn.disabled = true;
            acceptBtn.innerHTML = '🔄 Processing...';
            statusArea.innerHTML = '<div class="status loading">🔄 Processing applicant and generating QR code...</div>';

            // Get applicant data (this would come from your applicant database)
            const applicantData = this.getApplicantData(applicantId);
            
            if (!applicantData) {
                throw new Error('Applicant data not found');
            }

            // Process applicant through the service
            const result = await this.applicantQRService.processNewApplicant(applicantData);

            if (result.success) {
                // Show success and QR code
                statusArea.innerHTML = `
                    <div class="status success">✅ Applicant accepted and QR code generated successfully!</div>
                    <div class="user-info">
                        <p><strong>User ID:</strong> ${result.user.id}</p>
                        <p><strong>QR Code Generated:</strong> ${new Date(result.qrCode.generatedAt).toLocaleString()}</p>
                    </div>
                `;

                // Display QR code
                qrDisplayArea.innerHTML = `
                    <div class="qr-code-container">
                        <h4>📱 User's QR Code</h4>
                        <img src="${result.qrCode.image}" alt="User QR Code" class="qr-image">
                        <div class="qr-actions">
                            <button class="btn btn-download" onclick="window.applicantQRManager.downloadQRCode('${result.user.id}', '${result.user.name}')">
                                📥 Download QR Code
                            </button>
                            <button class="btn btn-info" onclick="window.applicantQRManager.showQRDetails('${result.user.id}')">
                                📋 View Details
                            </button>
                        </div>
                        <p class="qr-note">💡 This QR code is now permanently stored and can be downloaded anytime.</p>
                    </div>
                `;
                qrDisplayArea.style.display = 'block';

                // Update button
                acceptBtn.innerHTML = '✅ Completed';
                acceptBtn.disabled = true;

                // Show notification
                this.showNotification('Applicant accepted and QR code generated successfully!', 'success');

            } else {
                throw new Error(result.message || 'Failed to process applicant');
            }

        } catch (error) {
            console.error('Failed to process applicant:', error);
            
            const statusArea = document.getElementById('qr-generation-status');
            const acceptBtn = document.getElementById('accept-generate-btn');
            
            statusArea.innerHTML = `<div class="status error">❌ Error: ${error.message}</div>`;
            acceptBtn.innerHTML = '🎯 Accept & Generate QR';
            acceptBtn.disabled = false;
            
            this.showNotification('Failed to process applicant: ' + error.message, 'error');
        }
    }

    /**
     * Download QR code for user
     */
    async downloadQRCode(userId, userName) {
        try {
            const filename = `AGP-QRCode-${userName.replace(/\s+/g, '-')}-${Date.now()}.png`;
            await this.applicantQRService.downloadUserQRCode(userId, filename);
            this.showNotification('QR code downloaded successfully!', 'success');
        } catch (error) {
            console.error('Failed to download QR code:', error);
            this.showNotification('Failed to download QR code: ' + error.message, 'error');
        }
    }

    /**
     * Show QR code details
     */
    showQRDetails(userId) {
        const qrData = this.applicantQRService.getUserQRCode(userId);
        if (!qrData) {
            this.showNotification('QR code not found', 'error');
            return;
        }

        const detailsModal = document.createElement('div');
        detailsModal.className = 'qr-details-modal-overlay';
        detailsModal.innerHTML = `
            <div class="qr-details-modal">
                <div class="modal-header">
                    <h3>📋 QR Code Details</h3>
                    <button class="close-btn" onclick="this.closest('.qr-details-modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="qr-stats">
                        <p><strong>Generated:</strong> ${new Date(qrData.generatedAt).toLocaleString()}</p>
                        <p><strong>Downloads:</strong> ${qrData.downloadCount || 0}</p>
                        <p><strong>Last Downloaded:</strong> ${qrData.lastDownloaded ? new Date(qrData.lastDownloaded).toLocaleString() : 'Never'}</p>
                        <p><strong>Status:</strong> ${qrData.isActive ? '✅ Active' : '❌ Inactive'}</p>
                    </div>
                    <details>
                        <summary>🔍 QR Data (Click to expand)</summary>
                        <pre>${JSON.stringify(qrData.qrData, null, 2)}</pre>
                    </details>
                </div>
            </div>
        `;
        
        document.body.appendChild(detailsModal);
        setTimeout(() => detailsModal.classList.add('show'), 10);
    }

    /**
     * Get applicant data from global applicant storage or demo data
     */
    getApplicantData(applicantId) {
        // Try to get from global applicant storage first
        if (window.sampleApplicants) {
            const applicant = window.sampleApplicants.find(a => a.id === applicantId);
            if (applicant) {
                return {
                    id: applicant.id,
                    name: applicant.name,
                    email: applicant.email,
                    department: applicant.department,
                    position: applicant.position,
                    role: applicant.role || 'user',
                    username: applicant.username || applicant.email.split('@')[0]
                };
            }
        }

        // Fallback to mock data
        return {
            id: applicantId,
            name: 'John Doe',
            email: 'john.doe@example.com',
            department: 'IT',
            position: 'Software Intern',
            role: 'user',
            username: 'johndoe'
        };
    }

    /**
     * Show QR code statistics dashboard
     */
    showQRStatsDashboard() {
        const stats = this.applicantQRService.getQRCodeStats();
        
        const dashboard = document.createElement('div');
        dashboard.className = 'qr-stats-modal-overlay';
        dashboard.innerHTML = `
            <div class="qr-stats-modal">
                <div class="modal-header">
                    <h3>📊 QR Code Statistics</h3>
                    <button class="close-btn" onclick="this.closest('.qr-stats-modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h4>👥 Total Users</h4>
                            <div class="stat-value">${stats.totalUsers}</div>
                        </div>
                        <div class="stat-card">
                            <h4>📱 Users with QR</h4>
                            <div class="stat-value">${stats.usersWithQR}</div>
                        </div>
                        <div class="stat-card">
                            <h4>📈 Coverage</h4>
                            <div class="stat-value">${stats.coverage}%</div>
                        </div>
                        <div class="stat-card">
                            <h4>📥 Total Downloads</h4>
                            <div class="stat-value">${stats.totalDownloads}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dashboard);
        setTimeout(() => dashboard.classList.add('show'), 10);
    }

    /**
     * Add modal styles
     */
    addModalStyles() {
        if (document.getElementById('applicant-qr-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'applicant-qr-styles';
        styles.textContent = `
            .applicant-modal-overlay, .qr-details-modal-overlay, .qr-stats-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .applicant-modal-overlay.show, .qr-details-modal-overlay.show, .qr-stats-modal-overlay.show {
                opacity: 1;
            }
            
            .applicant-modal, .qr-details-modal, .qr-stats-modal {
                background: #2e3540;
                border-radius: 12px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                color: white;
            }
            
            .applicant-modal-header, .modal-header {
                padding: 20px;
                border-bottom: 1px solid #3a4553;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .applicant-modal-body, .modal-body {
                padding: 20px;
            }
            
            .applicant-modal-footer {
                padding: 20px;
                border-top: 1px solid #3a4553;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 15px 0;
            }
            
            .info-item {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .info-item label {
                font-weight: bold;
                color: #ff7a45;
            }
            
            .status-area {
                margin: 15px 0;
                padding: 15px;
                border-radius: 8px;
                background: #1a1a1a;
            }
            
            .status.loading {
                color: #17a2b8;
            }
            
            .status.success {
                color: #28a745;
            }
            
            .status.error {
                color: #dc3545;
            }
            
            .qr-display {
                text-align: center;
                margin: 20px 0;
            }
            
            .qr-image {
                max-width: 250px;
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 15px 0;
            }
            
            .qr-actions {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin: 15px 0;
            }
            
            .qr-note {
                font-size: 0.9em;
                color: #aaa;
                font-style: italic;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
            }
            
            .stat-card {
                background: #1a1a1a;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
            }
            
            .stat-value {
                font-size: 2em;
                font-weight: bold;
                color: #ff7a45;
                margin-top: 10px;
            }
            
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s ease;
            }
            
            .btn-primary {
                background: #ff7a45;
                color: white;
            }
            
            .btn-primary:hover {
                background: #e05a25;
            }
            
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .btn-download {
                background: #28a745;
                color: white;
            }
            
            .btn-info {
                background: #17a2b8;
                color: white;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            pre {
                background: #1a1a1a;
                padding: 15px;
                border-radius: 6px;
                overflow-x: auto;
                font-size: 0.9em;
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Create global instance
window.applicantQRManager = new ApplicantQRManager();

console.log('✅ Applicant QR Manager loaded');
