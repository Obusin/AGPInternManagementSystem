/**
 * AG&P Attendance System - PWA Installation Component
 * Handles Progressive Web App installation and offline capabilities
 */

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isStandalone = false;
        this.serviceWorkerRegistration = null;
        
        this.init();
    }

    init() {
        this.checkInstallationStatus();
        this.registerServiceWorker();
        this.setupEventListeners();
        this.createInstallPrompt();
    }

    /**
     * Check if app is already installed or running in standalone mode
     */
    checkInstallationStatus() {
        // Check if running in standalone mode
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone ||
                           document.referrer.includes('android-app://');

        // Check if app is installed
        this.isInstalled = this.isStandalone || localStorage.getItem('pwa-installed') === 'true';

        console.log('PWA Status:', {
            isStandalone: this.isStandalone,
            isInstalled: this.isInstalled
        });
    }

    /**
     * Register service worker for offline functionality
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully:', this.serviceWorkerRegistration);

                // Listen for updates
                this.serviceWorkerRegistration.addEventListener('updatefound', () => {
                    const newWorker = this.serviceWorkerRegistration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });

            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Setup event listeners for PWA installation
     */
    setupEventListeners() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // Listen for app installation
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.isInstalled = true;
            localStorage.setItem('pwa-installed', 'true');
            this.hideInstallPrompt();
            this.showInstallSuccess();
        });

        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.showConnectionStatus('online');
        });

        window.addEventListener('offline', () => {
            this.showConnectionStatus('offline');
        });
    }

    /**
     * Create install prompt UI
     */
    createInstallPrompt() {
        if (document.getElementById('pwa-install-prompt')) return;

        const promptHTML = `
            <div id="pwa-install-prompt" class="pwa-install-prompt" style="display: none;">
                <div class="pwa-prompt-content">
                    <div class="pwa-prompt-icon">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <div class="pwa-prompt-text">
                        <h4>Install AG&P Attendance</h4>
                        <p>Get quick access and work offline</p>
                    </div>
                    <div class="pwa-prompt-actions">
                        <button class="pwa-btn pwa-btn-secondary" onclick="pwaInstaller.dismissInstallPrompt()">
                            Later
                        </button>
                        <button class="pwa-btn pwa-btn-primary" onclick="pwaInstaller.installApp()">
                            Install
                        </button>
                    </div>
                </div>
            </div>

            <style>
                .pwa-install-prompt {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    right: 20px;
                    max-width: 400px;
                    margin: 0 auto;
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-backdrop);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-xl);
                    z-index: var(--z-toast);
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all var(--transition-normal);
                }

                .pwa-install-prompt.show {
                    transform: translateY(0);
                    opacity: 1;
                }

                .pwa-prompt-content {
                    display: flex;
                    align-items: center;
                    gap: var(--space-lg);
                    padding: var(--space-xl);
                }

                .pwa-prompt-icon {
                    width: 48px;
                    height: 48px;
                    background: var(--primary-gradient);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .pwa-prompt-text {
                    flex: 1;
                }

                .pwa-prompt-text h4 {
                    margin: 0 0 var(--space-xs) 0;
                    color: var(--light-text);
                    font-size: var(--font-md);
                    font-weight: 600;
                }

                .pwa-prompt-text p {
                    margin: 0;
                    color: var(--muted-text);
                    font-size: var(--font-sm);
                }

                .pwa-prompt-actions {
                    display: flex;
                    gap: var(--space-sm);
                    flex-shrink: 0;
                }

                .pwa-btn {
                    padding: var(--space-sm) var(--space-lg);
                    border: none;
                    border-radius: var(--radius-md);
                    font-size: var(--font-sm);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .pwa-btn-primary {
                    background: var(--primary-gradient);
                    color: white;
                }

                .pwa-btn-primary:hover {
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-md);
                }

                .pwa-btn-secondary {
                    background: transparent;
                    color: var(--muted-text);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .pwa-btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--light-text);
                }

                @media (max-width: 768px) {
                    .pwa-install-prompt {
                        left: 10px;
                        right: 10px;
                        bottom: 10px;
                    }

                    .pwa-prompt-content {
                        padding: var(--space-lg);
                    }

                    .pwa-prompt-actions {
                        flex-direction: column;
                    }

                    .pwa-btn {
                        width: 100%;
                    }
                }
            </style>
        `;

        document.body.insertAdjacentHTML('beforeend', promptHTML);
    }

    /**
     * Show install prompt
     */
    showInstallPrompt() {
        if (this.isInstalled) return;

        const prompt = document.getElementById('pwa-install-prompt');
        if (prompt) {
            prompt.style.display = 'block';
            setTimeout(() => prompt.classList.add('show'), 100);
        }
    }

    /**
     * Hide install prompt
     */
    hideInstallPrompt() {
        const prompt = document.getElementById('pwa-install-prompt');
        if (prompt) {
            prompt.classList.remove('show');
            setTimeout(() => {
                prompt.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Dismiss install prompt
     */
    dismissInstallPrompt() {
        this.hideInstallPrompt();
        localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
    }

    /**
     * Install the app
     */
    async installApp() {
        if (!this.deferredPrompt) {
            console.log('No deferred prompt available');
            return;
        }

        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log('User choice:', outcome);
            
            if (outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            
            this.deferredPrompt = null;
            this.hideInstallPrompt();
            
        } catch (error) {
            console.error('Error during app installation:', error);
        }
    }

    /**
     * Show installation success message
     */
    showInstallSuccess() {
        if (window.uiComponents) {
            window.uiComponents.showToast(
                'App installed successfully! You can now access it from your home screen.',
                'success',
                'Installation Complete',
                8000
            );
        }
    }

    /**
     * Show app update available notification
     */
    showUpdateAvailable() {
        if (window.uiComponents) {
            const toastId = window.uiComponents.showToast(
                'A new version is available. Refresh to update.',
                'info',
                'Update Available',
                0 // Don't auto-hide
            );

            // Add refresh button to toast
            setTimeout(() => {
                const toast = document.getElementById(toastId);
                if (toast) {
                    const refreshBtn = document.createElement('button');
                    refreshBtn.textContent = 'Refresh';
                    refreshBtn.className = 'pwa-btn pwa-btn-primary';
                    refreshBtn.style.marginTop = '10px';
                    refreshBtn.onclick = () => window.location.reload();
                    
                    const toastMessage = toast.querySelector('.toast-message');
                    if (toastMessage) {
                        toastMessage.appendChild(refreshBtn);
                    }
                }
            }, 100);
        }
    }

    /**
     * Show connection status
     */
    showConnectionStatus(status) {
        const isOnline = status === 'online';
        const message = isOnline ? 'Connection restored' : 'You are offline';
        const type = isOnline ? 'success' : 'warning';
        const title = isOnline ? 'Back Online' : 'Offline Mode';

        if (window.uiComponents) {
            window.uiComponents.showToast(message, type, title, 3000);
        }

        // Update UI to reflect connection status
        document.body.classList.toggle('offline', !isOnline);
    }

    /**
     * Check if app can be installed
     */
    canInstall() {
        return !this.isInstalled && this.deferredPrompt !== null;
    }

    /**
     * Get installation status
     */
    getStatus() {
        return {
            isInstalled: this.isInstalled,
            isStandalone: this.isStandalone,
            canInstall: this.canInstall(),
            isOnline: navigator.onLine,
            hasServiceWorker: !!this.serviceWorkerRegistration
        };
    }

    /**
     * Force show install prompt (for manual trigger)
     */
    forceShowInstallPrompt() {
        if (!this.isInstalled) {
            this.showInstallPrompt();
        }
    }

    /**
     * Add to home screen for iOS
     */
    showIOSInstallInstructions() {
        if (window.uiComponents) {
            const instructions = `
                <div style="text-align: left; line-height: 1.6;">
                    <p>To install this app on your iOS device:</p>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                        <li>Tap the Share button <i class="fas fa-share" style="color: #007AFF;"></i></li>
                        <li>Scroll down and tap "Add to Home Screen"</li>
                        <li>Tap "Add" to confirm</li>
                    </ol>
                    <p style="font-size: 12px; color: var(--muted-text); margin-top: 15px;">
                        The app will appear on your home screen like a native app.
                    </p>
                </div>
            `;

            window.uiComponents.showModal('ios-install-modal', {
                title: 'Install AG&P Attendance',
                content: instructions,
                size: 'medium'
            });
        }
    }
}

// Create global instance
window.pwaInstaller = new PWAInstaller();
