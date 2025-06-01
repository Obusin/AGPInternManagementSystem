/**
 * Modern QR Scanner UI Component
 * Beautiful camera scanning interface with real-time feedback
 */

class QRScannerUI {
    constructor() {
        this.isOpen = false;
        this.modal = null;
        this.videoContainer = null;
        this.onScanSuccess = null;
        this.onScanError = null;
        this.scannerActive = false;
    }

    /**
     * Open QR scanner modal
     */
    async openScanner(onSuccess, onError) {
        if (this.isOpen) {
            console.log('Scanner already open');
            return;
        }

        this.onScanSuccess = onSuccess;
        this.onScanError = onError;

        // Create scanner modal
        this.createScannerModal();
        
        // Start camera scanning
        await this.startCameraScanning();
    }

    /**
     * Create scanner modal UI
     */
    createScannerModal() {
        // Create modal overlay
        this.modal = document.createElement('div');
        this.modal.className = 'qr-scanner-modal';
        this.modal.innerHTML = `
            <div class="qr-scanner-overlay"></div>
            <div class="qr-scanner-container">
                <div class="qr-scanner-header">
                    <h2>
                        <i class="fas fa-qrcode"></i>
                        Scan QR Code
                    </h2>
                    <button class="qr-scanner-close" id="qr-scanner-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="qr-scanner-content">
                    <div class="qr-scanner-video-container" id="qr-video-container">
                        <div class="qr-scanner-loading">
                            <div class="loading-spinner"></div>
                            <p>Starting camera...</p>
                        </div>
                        
                        <div class="qr-scanner-frame">
                            <div class="qr-scanner-corners">
                                <div class="corner top-left"></div>
                                <div class="corner top-right"></div>
                                <div class="corner bottom-left"></div>
                                <div class="corner bottom-right"></div>
                            </div>
                        </div>
                        
                        <div class="qr-scanner-instructions">
                            <p>Position the QR code within the frame</p>
                            <small>Make sure the code is clearly visible and well-lit</small>
                        </div>
                    </div>
                    
                    <div class="qr-scanner-status" id="qr-scanner-status">
                        <div class="status-indicator">
                            <i class="fas fa-search"></i>
                            <span>Scanning...</span>
                        </div>
                        <div class="scan-count">
                            Scans: <span id="scan-count">0</span>
                        </div>
                    </div>
                    
                    <div class="qr-scanner-controls">
                        <button class="qr-control-btn" id="switch-camera-btn">
                            <i class="fas fa-sync-alt"></i>
                            <span>Switch Camera</span>
                        </button>
                        <button class="qr-control-btn" id="toggle-flash-btn" style="display: none;">
                            <i class="fas fa-lightbulb"></i>
                            <span>Flash</span>
                        </button>
                        <button class="qr-control-btn secondary" id="manual-entry-btn">
                            <i class="fas fa-keyboard"></i>
                            <span>Manual Entry</span>
                        </button>
                    </div>
                </div>
                
                <div class="qr-scanner-footer">
                    <p>Scan your AG&P attendance QR code or ID barcode</p>
                </div>
            </div>
        `;

        // Add styles
        this.addScannerStyles();

        // Add to page
        document.body.appendChild(this.modal);
        this.isOpen = true;

        // Setup event listeners
        this.setupEventListeners();

        // Animate in
        setTimeout(() => {
            this.modal.classList.add('active');
        }, 10);
    }

    /**
     * Add scanner styles
     */
    addScannerStyles() {
        if (document.getElementById('qr-scanner-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'qr-scanner-styles';
        styles.textContent = `
            .qr-scanner-modal {
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

            .qr-scanner-modal.active {
                opacity: 1;
                visibility: visible;
            }

            .qr-scanner-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
            }

            .qr-scanner-container {
                position: relative;
                width: 90%;
                max-width: 500px;
                margin: 20px auto;
                background: var(--card-bg, #2e3540);
                border-radius: 16px;
                overflow: hidden;
                transform: translateY(50px);
                transition: transform 0.3s ease;
            }

            .qr-scanner-modal.active .qr-scanner-container {
                transform: translateY(0);
            }

            .qr-scanner-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: linear-gradient(135deg, #ff7a45, #ff6b35);
                color: white;
            }

            .qr-scanner-header h2 {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 600;
            }

            .qr-scanner-header h2 i {
                margin-right: 10px;
            }

            .qr-scanner-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: background 0.3s ease;
            }

            .qr-scanner-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .qr-scanner-content {
                padding: 20px;
            }

            .qr-scanner-video-container {
                position: relative;
                width: 100%;
                height: 300px;
                background: #000;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 20px;
            }

            .qr-scanner-video {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .qr-scanner-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: white;
            }

            .qr-scanner-frame {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 200px;
                height: 200px;
                transform: translate(-50%, -50%);
                pointer-events: none;
            }

            .qr-scanner-corners {
                position: relative;
                width: 100%;
                height: 100%;
            }

            .corner {
                position: absolute;
                width: 30px;
                height: 30px;
                border: 3px solid #ff7a45;
            }

            .corner.top-left {
                top: 0;
                left: 0;
                border-right: none;
                border-bottom: none;
            }

            .corner.top-right {
                top: 0;
                right: 0;
                border-left: none;
                border-bottom: none;
            }

            .corner.bottom-left {
                bottom: 0;
                left: 0;
                border-right: none;
                border-top: none;
            }

            .corner.bottom-right {
                bottom: 0;
                right: 0;
                border-left: none;
                border-top: none;
            }

            .qr-scanner-instructions {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                text-align: center;
                color: white;
                background: rgba(0, 0, 0, 0.7);
                padding: 10px 15px;
                border-radius: 8px;
            }

            .qr-scanner-instructions p {
                margin: 0 0 5px 0;
                font-weight: 500;
            }

            .qr-scanner-instructions small {
                opacity: 0.8;
            }

            .qr-scanner-status {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: rgba(255, 122, 69, 0.1);
                border-radius: 8px;
                margin-bottom: 20px;
                color: var(--text-color, #ffffff);
            }

            .status-indicator {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .status-indicator i {
                color: #ff7a45;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .qr-scanner-controls {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .qr-control-btn {
                flex: 1;
                min-width: 120px;
                padding: 12px 16px;
                background: #ff7a45;
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

            .qr-control-btn:hover {
                background: #e05a25;
                transform: translateY(-2px);
            }

            .qr-control-btn.secondary {
                background: var(--secondary-bg, #4a5568);
            }

            .qr-control-btn.secondary:hover {
                background: var(--secondary-hover, #2d3748);
            }

            .qr-scanner-footer {
                padding: 15px 20px;
                text-align: center;
                background: rgba(255, 255, 255, 0.05);
                color: var(--text-secondary, #a0a0a0);
                font-size: 0.9rem;
            }

            @media (max-width: 768px) {
                .qr-scanner-container {
                    width: 95%;
                    margin: 10px auto;
                }

                .qr-scanner-video-container {
                    height: 250px;
                }

                .qr-control-btn {
                    min-width: 100px;
                    padding: 10px 12px;
                    font-size: 0.9rem;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Close button
        const closeBtn = this.modal.querySelector('#qr-scanner-close');
        closeBtn.addEventListener('click', () => this.closeScanner());

        // Overlay click to close
        const overlay = this.modal.querySelector('.qr-scanner-overlay');
        overlay.addEventListener('click', () => this.closeScanner());

        // Switch camera
        const switchBtn = this.modal.querySelector('#switch-camera-btn');
        switchBtn.addEventListener('click', () => this.switchCamera());

        // Manual entry
        const manualBtn = this.modal.querySelector('#manual-entry-btn');
        manualBtn.addEventListener('click', () => this.openManualEntry());

        // Escape key to close
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Handle keyboard events
     */
    handleKeyDown(event) {
        if (event.key === 'Escape' && this.isOpen) {
            this.closeScanner();
        }
    }

    /**
     * Start camera scanning
     */
    async startCameraScanning() {
        const videoContainer = this.modal.querySelector('#qr-video-container');
        const statusElement = this.modal.querySelector('#qr-scanner-status');
        const scanCountElement = this.modal.querySelector('#scan-count');

        try {
            const result = await window.cameraQRScanner.startScanning(
                (scanResult) => this.handleScanSuccess(scanResult),
                (error) => this.handleScanError(error)
            );

            if (result.success) {
                // Add video element to container
                const video = window.cameraQRScanner.video;
                if (video) {
                    video.className = 'qr-scanner-video';
                    videoContainer.appendChild(video);
                }

                // Hide loading
                const loading = videoContainer.querySelector('.qr-scanner-loading');
                if (loading) loading.style.display = 'none';

                this.scannerActive = true;

                // Update scan count periodically
                this.scanCountInterval = setInterval(() => {
                    const status = window.cameraQRScanner.getStatus();
                    scanCountElement.textContent = status.scanCount;
                }, 500);

            } else {
                this.showError(result.message);
            }

        } catch (error) {
            console.error('Failed to start camera:', error);
            this.showError('Failed to start camera scanning');
        }
    }

    /**
     * Handle successful scan
     */
    handleScanSuccess(scanResult) {
        console.log('QR scan successful:', scanResult);
        
        // Close scanner
        this.closeScanner();
        
        // Call success callback
        if (this.onScanSuccess) {
            this.onScanSuccess(scanResult);
        }
    }

    /**
     * Handle scan error
     */
    handleScanError(error) {
        console.error('QR scan error:', error);
        this.showError(error);
        
        if (this.onScanError) {
            this.onScanError(error);
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const statusElement = this.modal.querySelector('#qr-scanner-status');
        statusElement.innerHTML = `
            <div class="status-indicator">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <span>${message}</span>
            </div>
            <button class="qr-control-btn" onclick="location.reload()">
                <i class="fas fa-redo"></i>
                Retry
            </button>
        `;
    }

    /**
     * Switch camera (front/back)
     */
    async switchCamera() {
        if (!this.scannerActive) return;

        const switchBtn = this.modal.querySelector('#switch-camera-btn');
        switchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Switching...</span>';

        try {
            const currentFacing = window.cameraQRScanner.config.video.facingMode;
            const newFacing = currentFacing === 'environment' ? 'user' : 'environment';
            
            await window.cameraQRScanner.switchCamera(newFacing);
            
            switchBtn.innerHTML = '<i class="fas fa-sync-alt"></i><span>Switch Camera</span>';
        } catch (error) {
            console.error('Failed to switch camera:', error);
            switchBtn.innerHTML = '<i class="fas fa-sync-alt"></i><span>Switch Camera</span>';
        }
    }

    /**
     * Open manual entry dialog
     */
    openManualEntry() {
        const manualModal = document.createElement('div');
        manualModal.className = 'manual-entry-modal';
        manualModal.innerHTML = `
            <div class="manual-entry-overlay"></div>
            <div class="manual-entry-container">
                <div class="manual-entry-header">
                    <h3>Manual QR Code Entry</h3>
                    <button class="manual-entry-close">&times;</button>
                </div>
                <div class="manual-entry-content">
                    <p>Enter the QR code data manually:</p>
                    <textarea id="manual-qr-input" placeholder="Paste QR code data here..." rows="4"></textarea>
                    <div class="manual-entry-actions">
                        <button class="manual-entry-btn primary" id="process-manual-qr">
                            <i class="fas fa-check"></i>
                            Process QR Code
                        </button>
                        <button class="manual-entry-btn secondary" id="cancel-manual-entry">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add manual entry styles
        const manualStyles = document.createElement('style');
        manualStyles.textContent = `
            .manual-entry-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .manual-entry-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
            }

            .manual-entry-container {
                position: relative;
                width: 90%;
                max-width: 400px;
                background: var(--card-bg, #2e3540);
                border-radius: 12px;
                overflow: hidden;
            }

            .manual-entry-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: #ff7a45;
                color: white;
            }

            .manual-entry-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
            }

            .manual-entry-content {
                padding: 20px;
            }

            #manual-qr-input {
                width: 100%;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                margin: 10px 0;
                font-family: monospace;
                background: var(--input-bg, #fff);
                color: var(--text-color, #333);
            }

            .manual-entry-actions {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }

            .manual-entry-btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
            }

            .manual-entry-btn.primary {
                background: #ff7a45;
                color: white;
            }

            .manual-entry-btn.secondary {
                background: #6c757d;
                color: white;
            }
        `;

        document.head.appendChild(manualStyles);
        document.body.appendChild(manualModal);

        // Event listeners
        manualModal.querySelector('.manual-entry-close').addEventListener('click', () => {
            document.body.removeChild(manualModal);
            document.head.removeChild(manualStyles);
        });

        manualModal.querySelector('.manual-entry-overlay').addEventListener('click', () => {
            document.body.removeChild(manualModal);
            document.head.removeChild(manualStyles);
        });

        manualModal.querySelector('#cancel-manual-entry').addEventListener('click', () => {
            document.body.removeChild(manualModal);
            document.head.removeChild(manualStyles);
        });

        manualModal.querySelector('#process-manual-qr').addEventListener('click', () => {
            const input = manualModal.querySelector('#manual-qr-input').value.trim();
            if (input) {
                try {
                    const qrData = JSON.parse(input);
                    this.handleScanSuccess({
                        success: true,
                        data: qrData,
                        rawData: input,
                        manual: true
                    });
                } catch (error) {
                    alert('Invalid QR code data format');
                }
            }
            document.body.removeChild(manualModal);
            document.head.removeChild(manualStyles);
        });
    }

    /**
     * Close scanner
     */
    closeScanner() {
        if (!this.isOpen) return;

        // Stop camera
        if (this.scannerActive) {
            window.cameraQRScanner.stopScanning();
            this.scannerActive = false;
        }

        // Clear intervals
        if (this.scanCountInterval) {
            clearInterval(this.scanCountInterval);
            this.scanCountInterval = null;
        }

        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));

        // Animate out and remove
        this.modal.classList.remove('active');
        setTimeout(() => {
            if (this.modal && this.modal.parentNode) {
                this.modal.parentNode.removeChild(this.modal);
            }
            this.modal = null;
            this.isOpen = false;
        }, 300);
    }
}

// Create global instance
window.qrScannerUI = new QRScannerUI();

console.log('✅ QR Scanner UI initialized');
