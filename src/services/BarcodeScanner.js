/**
 * Barcode Scanner Service
 * Handles barcode/QR code scanning for attendance tracking
 */

class BarcodeScanner {
    constructor() {
        this.isScanning = false;
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.scanInterval = null;
        this.onScanCallback = null;
        this.onErrorCallback = null;
        
        // Scanner configuration
        this.config = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'environment' // Use back camera
            },
            scanInterval: 100, // Scan every 100ms
            timeout: 30000 // 30 second timeout
        };
    }

    /**
     * Initialize camera and start scanning
     */
    async startScanning(onScan, onError) {
        if (this.isScanning) {
            console.log('Scanner already running');
            return;
        }

        this.onScanCallback = onScan;
        this.onErrorCallback = onError;

        try {
            // Check if camera is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera not supported in this browser');
            }

            // Request camera permission
            this.stream = await navigator.mediaDevices.getUserMedia(this.config);
            
            // Create video element
            this.createVideoElement();
            
            // Start video stream
            this.video.srcObject = this.stream;
            await this.video.play();
            
            // Initialize canvas for frame capture
            this.initializeCanvas();
            
            // Start scanning loop
            this.startScanLoop();
            
            this.isScanning = true;
            console.log('Barcode scanner started successfully');
            
        } catch (error) {
            console.error('Failed to start scanner:', error);
            if (this.onErrorCallback) {
                this.onErrorCallback(error);
            }
            this.stopScanning();
        }
    }

    /**
     * Create video element for camera feed
     */
    createVideoElement() {
        this.video = document.createElement('video');
        this.video.setAttribute('playsinline', true);
        this.video.style.width = '100%';
        this.video.style.height = '100%';
        this.video.style.objectFit = 'cover';
    }

    /**
     * Initialize canvas for frame processing
     */
    initializeCanvas() {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        
        // Set canvas size to match video
        this.canvas.width = this.video.videoWidth || 640;
        this.canvas.height = this.video.videoHeight || 480;
    }

    /**
     * Start the scanning loop
     */
    startScanLoop() {
        this.scanInterval = setInterval(() => {
            if (this.video && this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                this.captureAndAnalyzeFrame();
            }
        }, this.config.scanInterval);

        // Set timeout to stop scanning
        setTimeout(() => {
            if (this.isScanning) {
                this.stopScanning();
                if (this.onErrorCallback) {
                    this.onErrorCallback(new Error('Scanning timeout'));
                }
            }
        }, this.config.timeout);
    }

    /**
     * Capture frame and analyze for barcodes
     */
    captureAndAnalyzeFrame() {
        try {
            // Update canvas size if needed
            if (this.canvas.width !== this.video.videoWidth) {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
            }

            // Draw current video frame to canvas
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Get image data
            const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            // Analyze for barcodes/QR codes
            this.analyzeImageData(imageData);
            
        } catch (error) {
            console.error('Error capturing frame:', error);
        }
    }

    /**
     * Analyze image data for barcodes/QR codes
     * This is a simplified implementation - in production, use a library like ZXing
     */
    analyzeImageData(imageData) {
        // For demo purposes, we'll simulate barcode detection
        // In a real implementation, you would use a library like:
        // - ZXing-js
        // - QuaggaJS
        // - jsQR
        
        // Simulate finding a barcode with some probability
        if (Math.random() < 0.1) { // 10% chance per frame
            const simulatedBarcode = this.generateSimulatedBarcode();
            this.handleBarcodeDetected(simulatedBarcode);
        }
    }

    /**
     * Generate simulated barcode for demo
     */
    generateSimulatedBarcode() {
        const users = window.userDatabase ? window.userDatabase.getAllUsers() : [];
        if (users.length > 0) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            return {
                code: `AGP-${randomUser.department || 'INTERN'}-${randomUser.id}`,
                format: 'QR_CODE',
                data: JSON.stringify({
                    id: randomUser.id,
                    name: randomUser.name,
                    department: randomUser.department,
                    position: randomUser.position,
                    issuer: 'AG&P_ATTENDANCE_SYSTEM'
                })
            };
        }
        
        return {
            code: 'AGP-INTERN-DEMO123',
            format: 'QR_CODE',
            data: JSON.stringify({
                id: 'demo123',
                name: 'Demo User',
                department: 'IT',
                position: 'Intern',
                issuer: 'AG&P_ATTENDANCE_SYSTEM'
            })
        };
    }

    /**
     * Handle barcode detection
     */
    handleBarcodeDetected(barcode) {
        console.log('Barcode detected:', barcode);
        
        // Validate barcode
        if (this.validateBarcode(barcode)) {
            this.stopScanning();
            
            if (this.onScanCallback) {
                this.onScanCallback(barcode);
            }
        }
    }

    /**
     * Validate detected barcode
     */
    validateBarcode(barcode) {
        try {
            // Check if it's an AG&P barcode
            if (!barcode.code.startsWith('AGP-')) {
                console.log('Not an AG&P barcode');
                return false;
            }

            // Try to parse QR data
            if (barcode.data) {
                const data = JSON.parse(barcode.data);
                if (data.issuer !== 'AG&P_ATTENDANCE_SYSTEM') {
                    console.log('Invalid issuer');
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('Barcode validation error:', error);
            return false;
        }
    }

    /**
     * Stop scanning and cleanup
     */
    stopScanning() {
        this.isScanning = false;

        // Clear scan interval
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }

        // Stop video stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        // Cleanup video element
        if (this.video) {
            this.video.srcObject = null;
            this.video = null;
        }

        console.log('Barcode scanner stopped');
    }

    /**
     * Get video element for display
     */
    getVideoElement() {
        return this.video;
    }

    /**
     * Check if scanning is active
     */
    isActive() {
        return this.isScanning;
    }

    /**
     * Process manual barcode input
     */
    processManualInput(barcodeText) {
        try {
            // Parse manual input
            const barcode = {
                code: barcodeText,
                format: 'MANUAL',
                data: null
            };

            // Try to extract data if it's a JSON string
            if (barcodeText.includes('{')) {
                const jsonMatch = barcodeText.match(/\{.*\}/);
                if (jsonMatch) {
                    barcode.data = jsonMatch[0];
                }
            }

            // Validate and process
            if (this.validateBarcode(barcode)) {
                if (this.onScanCallback) {
                    this.onScanCallback(barcode);
                }
                return true;
            } else {
                if (this.onErrorCallback) {
                    this.onErrorCallback(new Error('Invalid barcode format'));
                }
                return false;
            }
        } catch (error) {
            console.error('Manual input processing error:', error);
            if (this.onErrorCallback) {
                this.onErrorCallback(error);
            }
            return false;
        }
    }

    /**
     * Create scanner UI modal
     */
    createScannerModal() {
        const modal = document.createElement('div');
        modal.className = 'barcode-scanner-modal';
        modal.innerHTML = `
            <div class="scanner-overlay">
                <div class="scanner-container">
                    <div class="scanner-header">
                        <h3><i class="fas fa-qrcode"></i> Scan ID Card</h3>
                        <button class="close-scanner" id="close-scanner">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="scanner-content">
                        <div class="video-container" id="video-container">
                            <div class="scanner-frame">
                                <div class="scanner-line"></div>
                            </div>
                            <div class="scanner-instructions">
                                <p>Position the QR code within the frame</p>
                                <div class="scanner-status" id="scanner-status">
                                    <i class="fas fa-camera"></i> Initializing camera...
                                </div>
                            </div>
                        </div>
                        
                        <div class="manual-input-section">
                            <p>Or enter barcode manually:</p>
                            <div class="manual-input-group">
                                <input type="text" id="manual-barcode" placeholder="Enter barcode (e.g., AGP-INTERN-123)">
                                <button id="manual-submit" class="btn-primary">
                                    <i class="fas fa-keyboard"></i> Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        this.addScannerStyles();

        return modal;
    }

    /**
     * Add scanner modal styles
     */
    addScannerStyles() {
        if (document.getElementById('scanner-styles')) return;

        const style = document.createElement('style');
        style.id = 'scanner-styles';
        style.textContent = `
            .barcode-scanner-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            }
            
            .scanner-container {
                background: var(--card-bg, #2a2a2a);
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow: hidden;
            }
            
            .scanner-header {
                background: var(--primary-color, #ff7a45);
                color: white;
                padding: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .close-scanner {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 50%;
                transition: background 0.3s;
            }
            
            .close-scanner:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .scanner-content {
                padding: 1.5rem;
            }
            
            .video-container {
                position: relative;
                width: 100%;
                height: 300px;
                background: #000;
                border-radius: 8px;
                overflow: hidden;
                margin-bottom: 1rem;
            }
            
            .scanner-frame {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 200px;
                height: 200px;
                border: 2px solid var(--primary-color, #ff7a45);
                border-radius: 8px;
                z-index: 2;
            }
            
            .scanner-line {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background: var(--primary-color, #ff7a45);
                animation: scan-line 2s linear infinite;
            }
            
            @keyframes scan-line {
                0% { top: 0; }
                100% { top: 100%; }
            }
            
            .scanner-instructions {
                position: absolute;
                bottom: 1rem;
                left: 1rem;
                right: 1rem;
                text-align: center;
                color: white;
                background: rgba(0, 0, 0, 0.7);
                padding: 0.5rem;
                border-radius: 4px;
            }
            
            .scanner-status {
                margin-top: 0.5rem;
                font-size: 0.9rem;
                opacity: 0.8;
            }
            
            .manual-input-section {
                border-top: 1px solid var(--border-color, #444);
                padding-top: 1rem;
                text-align: center;
            }
            
            .manual-input-group {
                display: flex;
                gap: 0.5rem;
                margin-top: 0.5rem;
            }
            
            .manual-input-group input {
                flex: 1;
                padding: 0.75rem;
                border: 1px solid var(--border-color, #444);
                border-radius: 6px;
                background: var(--input-bg, #333);
                color: var(--text-color, #fff);
            }
            
            .btn-primary {
                background: var(--primary-color, #ff7a45);
                color: white;
                border: none;
                padding: 0.75rem 1rem;
                border-radius: 6px;
                cursor: pointer;
                transition: background 0.3s;
            }
            
            .btn-primary:hover {
                background: var(--primary-hover, #ff6b35);
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Create global instance
window.barcodeScanner = new BarcodeScanner();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BarcodeScanner;
}
