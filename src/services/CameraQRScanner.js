/**
 * Modern Camera QR Scanner Service
 * Real-time QR code scanning using device camera
 */

class CameraQRScanner {
    constructor() {
        this.isScanning = false;
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.animationFrame = null;
        this.onScanCallback = null;
        this.onErrorCallback = null;
        this.scanCount = 0;
        this.lastScanTime = 0;
        
        // Scanner configuration
        this.config = {
            video: {
                width: { ideal: 1280, max: 1920 },
                height: { ideal: 720, max: 1080 },
                facingMode: 'environment', // Use back camera
                frameRate: { ideal: 30, max: 60 }
            },
            scanInterval: 100, // Scan every 100ms
            timeout: 60000, // 60 second timeout
            debounceTime: 2000 // 2 seconds between same QR scans
        };
    }

    /**
     * Start camera and QR scanning
     */
    async startScanning(onScan, onError) {
        if (this.isScanning) {
            console.log('Scanner already running');
            return { success: false, message: 'Scanner already active' };
        }

        this.onScanCallback = onScan;
        this.onErrorCallback = onError;

        try {
            // Check for camera support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera not supported on this device');
            }

            // Request camera permission
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: this.config.video,
                audio: false
            });

            // Create video element
            this.video = document.createElement('video');
            this.video.srcObject = this.stream;
            this.video.setAttribute('playsinline', true);
            this.video.play();

            // Wait for video to load
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    resolve();
                };
            });

            // Create canvas for frame capture
            this.canvas = document.createElement('canvas');
            this.context = this.canvas.getContext('2d');
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;

            this.isScanning = true;
            this.scanCount = 0;
            
            // Start scanning loop
            this.scanLoop();

            console.log('✅ Camera QR scanner started');
            return { 
                success: true, 
                message: 'Camera scanning started',
                videoWidth: this.video.videoWidth,
                videoHeight: this.video.videoHeight
            };

        } catch (error) {
            console.error('Failed to start camera scanner:', error);
            this.cleanup();
            
            const errorMessage = this.getErrorMessage(error);
            if (this.onErrorCallback) {
                this.onErrorCallback(errorMessage);
            }
            
            return { success: false, message: errorMessage };
        }
    }

    /**
     * Main scanning loop
     */
    scanLoop() {
        if (!this.isScanning) return;

        try {
            // Capture frame from video
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Get image data
            const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            // Scan for QR code
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert"
            });

            if (qrCode) {
                this.handleQRCodeDetected(qrCode);
            }

            this.scanCount++;

        } catch (error) {
            console.error('Scan loop error:', error);
        }

        // Continue scanning
        this.animationFrame = requestAnimationFrame(() => {
            setTimeout(() => this.scanLoop(), this.config.scanInterval);
        });
    }

    /**
     * Handle detected QR code
     */
    handleQRCodeDetected(qrCode) {
        const now = Date.now();
        
        // Debounce same QR codes
        if (now - this.lastScanTime < this.config.debounceTime) {
            return;
        }

        this.lastScanTime = now;

        try {
            // Parse QR data
            const qrData = JSON.parse(qrCode.data);
            
            // Validate QR code
            const validation = window.qrCodeService.validateQRData(qrData);
            
            if (validation.valid) {
                console.log('✅ Valid QR code detected:', qrData);
                
                // Stop scanning
                this.stopScanning();
                
                // Call success callback
                if (this.onScanCallback) {
                    this.onScanCallback({
                        success: true,
                        data: qrData,
                        rawData: qrCode.data,
                        location: qrCode.location,
                        scanCount: this.scanCount
                    });
                }
            } else {
                console.log('❌ Invalid QR code:', validation.reason);
                
                // Call error callback for invalid QR
                if (this.onErrorCallback) {
                    this.onErrorCallback(`Invalid QR code: ${validation.reason}`);
                }
            }

        } catch (error) {
            console.error('QR parsing error:', error);
            
            // Try as legacy barcode
            this.handleLegacyBarcode(qrCode.data);
        }
    }

    /**
     * Handle legacy barcode format
     */
    handleLegacyBarcode(data) {
        // Check if it's an AG&P legacy barcode
        if (data.startsWith('AGP-')) {
            console.log('📱 Legacy barcode detected:', data);
            
            // Extract user info from legacy format
            const parts = data.split('-');
            if (parts.length >= 3) {
                const userId = parts[2];
                const users = window.userDatabase ? window.userDatabase.getAllUsers() : [];
                const user = users.find(u => u.id === userId);
                
                if (user) {
                    // Stop scanning
                    this.stopScanning();
                    
                    // Call success callback with legacy data
                    if (this.onScanCallback) {
                        this.onScanCallback({
                            success: true,
                            legacy: true,
                            data: {
                                userId: user.id,
                                name: user.name,
                                department: user.department,
                                position: user.position,
                                type: 'LEGACY_BARCODE'
                            },
                            rawData: data,
                            scanCount: this.scanCount
                        });
                    }
                    return;
                }
            }
        }

        // Unknown QR/barcode format
        if (this.onErrorCallback) {
            this.onErrorCallback('Unrecognized QR code or barcode format');
        }
    }

    /**
     * Stop scanning and cleanup
     */
    stopScanning() {
        this.isScanning = false;
        this.cleanup();
        console.log('🛑 Camera QR scanner stopped');
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        // Stop animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
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

        // Cleanup canvas
        this.canvas = null;
        this.context = null;
    }

    /**
     * Get user-friendly error message
     */
    getErrorMessage(error) {
        if (error.name === 'NotAllowedError') {
            return 'Camera permission denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
            return 'No camera found on this device.';
        } else if (error.name === 'NotSupportedError') {
            return 'Camera not supported on this device.';
        } else if (error.name === 'NotReadableError') {
            return 'Camera is being used by another application.';
        } else {
            return `Camera error: ${error.message}`;
        }
    }

    /**
     * Get scanner status
     */
    getStatus() {
        return {
            isScanning: this.isScanning,
            scanCount: this.scanCount,
            hasCamera: !!(this.video && this.stream),
            videoWidth: this.video ? this.video.videoWidth : 0,
            videoHeight: this.video ? this.video.videoHeight : 0
        };
    }

    /**
     * Get available cameras
     */
    async getAvailableCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter(device => device.kind === 'videoinput');
            
            return cameras.map(camera => ({
                deviceId: camera.deviceId,
                label: camera.label || `Camera ${camera.deviceId.slice(0, 8)}`,
                groupId: camera.groupId
            }));
        } catch (error) {
            console.error('Failed to get cameras:', error);
            return [];
        }
    }

    /**
     * Switch camera (front/back)
     */
    async switchCamera(facingMode = 'environment') {
        if (this.isScanning) {
            const callbacks = {
                onScan: this.onScanCallback,
                onError: this.onErrorCallback
            };
            
            this.stopScanning();
            
            // Update config
            this.config.video.facingMode = facingMode;
            
            // Restart with new camera
            return await this.startScanning(callbacks.onScan, callbacks.onError);
        }
        
        return { success: false, message: 'Scanner not active' };
    }
}

// Create global instance
window.cameraQRScanner = new CameraQRScanner();

console.log('✅ Camera QR Scanner initialized');
