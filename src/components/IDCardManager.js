/**
 * ID Card Manager Component
 * Manages ID card generation, viewing, and printing for AG&P interns
 */

class IDCardManager {
    constructor() {
        this.generatedCards = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize the ID Card Manager
     */
    init() {
        if (this.isInitialized) return;
        
        this.createIDCardSection();
        this.setupEventListeners();
        this.loadExistingCards();
        this.isInitialized = true;
        
        console.log('ID Card Manager initialized');
    }

    /**
     * Create ID Card management section in admin panel
     */
    createIDCardSection() {
        const adminSection = document.getElementById('admin-section');
        if (!adminSection) return;

        // Check if section already exists
        if (document.getElementById('id-card-management')) return;

        const idCardSection = document.createElement('div');
        idCardSection.id = 'id-card-management';
        idCardSection.className = 'admin-subsection';
        idCardSection.innerHTML = `
            <div class="section-header">
                <h3><i class="fas fa-id-card"></i> ID Card Management</h3>
                <p>Generate and manage ID cards for interns</p>
            </div>

            <div class="id-card-controls">
                <div class="control-group">
                    <button id="generate-all-cards" class="btn btn-primary">
                        <i class="fas fa-magic"></i> Generate All ID Cards
                    </button>
                    <button id="scan-barcode-btn" class="btn btn-secondary">
                        <i class="fas fa-qrcode"></i> Scan ID Card
                    </button>
                    <button id="batch-print-cards" class="btn btn-success">
                        <i class="fas fa-print"></i> Batch Print
                    </button>
                </div>
                
                <div class="search-group">
                    <input type="text" id="card-search" placeholder="Search users..." class="search-input">
                    <select id="department-filter" class="filter-select">
                        <option value="">All Departments</option>
                        <option value="IT">IT</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                        <option value="Marketing">Marketing</option>
                    </select>
                </div>
            </div>

            <div class="id-cards-grid" id="id-cards-grid">
                <div class="loading-cards">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading ID cards...</p>
                </div>
            </div>

            <div class="id-card-stats">
                <div class="stat-item">
                    <span class="stat-label">Total Cards:</span>
                    <span class="stat-value" id="total-cards">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Generated:</span>
                    <span class="stat-value" id="generated-cards">0</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Pending:</span>
                    <span class="stat-value" id="pending-cards">0</span>
                </div>
            </div>
        `;

        // Add to admin section
        adminSection.appendChild(idCardSection);
        
        // Add styles
        this.addIDCardStyles();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Generate all cards
        document.getElementById('generate-all-cards')?.addEventListener('click', () => {
            this.generateAllIDCards();
        });

        // Scan barcode
        document.getElementById('scan-barcode-btn')?.addEventListener('click', () => {
            this.openBarcodeScanner();
        });

        // Batch print
        document.getElementById('batch-print-cards')?.addEventListener('click', () => {
            this.batchPrintCards();
        });

        // Search and filter
        document.getElementById('card-search')?.addEventListener('input', (e) => {
            this.filterCards(e.target.value);
        });

        document.getElementById('department-filter')?.addEventListener('change', (e) => {
            this.filterCardsByDepartment(e.target.value);
        });
    }

    /**
     * Generate ID cards for all users
     */
    async generateAllIDCards() {
        const generateBtn = document.getElementById('generate-all-cards');
        const originalText = generateBtn.innerHTML;
        
        try {
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            generateBtn.disabled = true;

            // Get all users
            const users = window.userDatabase ? window.userDatabase.getAllUsers() : [];
            
            if (users.length === 0) {
                throw new Error('No users found');
            }

            // Show progress
            this.showGenerationProgress(users.length);

            // Generate cards
            const results = await window.idCardGenerator.generateBatchIDCards(users);
            
            // Store generated cards
            results.forEach(result => {
                if (!result.error) {
                    this.generatedCards.set(result.userData.id, result);
                }
            });

            // Update display
            this.displayIDCards();
            this.updateStats();

            // Show success notification
            if (window.uiComponents) {
                window.uiComponents.showToast(
                    `Successfully generated ${results.filter(r => !r.error).length} ID cards`,
                    'success',
                    'ID Cards Generated!'
                );
            }

        } catch (error) {
            console.error('Error generating ID cards:', error);
            if (window.uiComponents) {
                window.uiComponents.showToast(
                    'Failed to generate ID cards: ' + error.message,
                    'error',
                    'Generation Failed'
                );
            }
        } finally {
            generateBtn.innerHTML = originalText;
            generateBtn.disabled = false;
        }
    }

    /**
     * Show generation progress
     */
    showGenerationProgress(total) {
        const grid = document.getElementById('id-cards-grid');
        grid.innerHTML = `
            <div class="generation-progress">
                <h4>Generating ID Cards...</h4>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <p>Processing ${total} users...</p>
            </div>
        `;
    }

    /**
     * Display generated ID cards
     */
    displayIDCards() {
        const grid = document.getElementById('id-cards-grid');
        if (!grid) return;

        if (this.generatedCards.size === 0) {
            grid.innerHTML = `
                <div class="no-cards">
                    <i class="fas fa-id-card"></i>
                    <h4>No ID Cards Generated</h4>
                    <p>Click "Generate All ID Cards" to create ID cards for all users</p>
                </div>
            `;
            return;
        }

        const cardsHTML = Array.from(this.generatedCards.values()).map(card => `
            <div class="id-card-item" data-user-id="${card.userData.id}">
                <div class="card-preview">
                    <img src="${card.dataURL}" alt="ID Card for ${card.userData.name}">
                </div>
                <div class="card-info">
                    <h4>${card.userData.name}</h4>
                    <p>${card.userData.position || 'Intern'}</p>
                    <p class="department">${card.userData.department || 'N/A'}</p>
                    <div class="barcode-info">
                        <small>Barcode: ${card.barcodeData.code}</small>
                    </div>
                </div>
                <div class="card-actions">
                    <button onclick="window.idCardManager.downloadCard('${card.userData.id}')" class="btn-small btn-primary">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button onclick="window.idCardManager.printCard('${card.userData.id}')" class="btn-small btn-secondary">
                        <i class="fas fa-print"></i> Print
                    </button>
                    <button onclick="window.idCardManager.viewCard('${card.userData.id}')" class="btn-small btn-info">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        `).join('');

        grid.innerHTML = cardsHTML;
    }

    /**
     * Download specific card
     */
    downloadCard(userId) {
        const card = this.generatedCards.get(userId);
        if (card) {
            window.idCardGenerator.downloadIDCard(card);
        }
    }

    /**
     * Print specific card
     */
    printCard(userId) {
        const card = this.generatedCards.get(userId);
        if (card) {
            window.idCardGenerator.printIDCard(card);
        }
    }

    /**
     * View card in modal
     */
    viewCard(userId) {
        const card = this.generatedCards.get(userId);
        if (!card) return;

        const modal = document.createElement('div');
        modal.className = 'id-card-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>ID Card - ${card.userData.name}</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <img src="${card.dataURL}" alt="ID Card" style="max-width: 100%; height: auto;">
                        <div class="card-details">
                            <p><strong>Barcode:</strong> ${card.barcodeData.code}</p>
                            <p><strong>Department:</strong> ${card.userData.department}</p>
                            <p><strong>Position:</strong> ${card.userData.position}</p>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button onclick="window.idCardManager.downloadCard('${userId}')" class="btn btn-primary">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <button onclick="window.idCardManager.printCard('${userId}')" class="btn btn-secondary">
                            <i class="fas fa-print"></i> Print
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal handlers
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                document.body.removeChild(modal);
            }
        });
    }

    /**
     * Open barcode scanner
     */
    openBarcodeScanner() {
        if (!window.barcodeScanner) {
            alert('Barcode scanner not available');
            return;
        }

        const modal = window.barcodeScanner.createScannerModal();
        document.body.appendChild(modal);

        // Setup scanner
        const videoContainer = modal.querySelector('#video-container');
        const statusElement = modal.querySelector('#scanner-status');
        const manualInput = modal.querySelector('#manual-barcode');
        const manualSubmit = modal.querySelector('#manual-submit');

        // Start scanning
        window.barcodeScanner.startScanning(
            (barcode) => {
                this.processBarcodeResult(barcode);
                document.body.removeChild(modal);
            },
            (error) => {
                statusElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${error.message}`;
            }
        );

        // Add video element to container
        const videoElement = window.barcodeScanner.getVideoElement();
        if (videoElement) {
            videoContainer.appendChild(videoElement);
        }

        // Manual input handler
        manualSubmit.addEventListener('click', () => {
            const barcodeText = manualInput.value.trim();
            if (barcodeText) {
                const success = window.barcodeScanner.processManualInput(barcodeText);
                if (success) {
                    document.body.removeChild(modal);
                }
            }
        });

        // Close handler
        modal.querySelector('#close-scanner').addEventListener('click', () => {
            window.barcodeScanner.stopScanning();
            document.body.removeChild(modal);
        });
    }

    /**
     * Process barcode scan result
     */
    processBarcodeResult(barcode) {
        console.log('Barcode scanned:', barcode);
        
        try {
            // Parse barcode data
            let userData = null;
            
            if (barcode.data) {
                userData = JSON.parse(barcode.data);
            } else {
                // Extract user ID from barcode code
                const parts = barcode.code.split('-');
                if (parts.length >= 3) {
                    const userId = parts[2];
                    const users = window.userDatabase ? window.userDatabase.getAllUsers() : [];
                    userData = users.find(u => u.id === userId);
                }
            }

            if (userData) {
                // Show user info and attendance action
                this.showAttendanceModal(userData, barcode);
            } else {
                throw new Error('User not found for this barcode');
            }

        } catch (error) {
            console.error('Error processing barcode:', error);
            if (window.uiComponents) {
                window.uiComponents.showToast(
                    'Invalid barcode: ' + error.message,
                    'error',
                    'Scan Error'
                );
            }
        }
    }

    /**
     * Show attendance modal for scanned user
     */
    showAttendanceModal(userData, barcode) {
        const modal = document.createElement('div');
        modal.className = 'attendance-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-check"></i> Attendance Check</h3>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="user-info">
                            <img src="${userData.avatar || ''}" alt="User Photo" class="user-photo">
                            <div class="user-details">
                                <h4>${userData.name}</h4>
                                <p>${userData.position || 'Intern'}</p>
                                <p>${userData.department || 'N/A'}</p>
                                <p class="barcode-code">Barcode: ${barcode.code}</p>
                            </div>
                        </div>
                        <div class="attendance-actions">
                            <button id="time-in-action" class="btn btn-success">
                                <i class="fas fa-sign-in-alt"></i> Time In
                            </button>
                            <button id="time-out-action" class="btn btn-warning">
                                <i class="fas fa-sign-out-alt"></i> Time Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event handlers
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#time-in-action').addEventListener('click', () => {
            this.recordAttendance(userData, 'time-in');
            document.body.removeChild(modal);
        });

        modal.querySelector('#time-out-action').addEventListener('click', () => {
            this.recordAttendance(userData, 'time-out');
            document.body.removeChild(modal);
        });
    }

    /**
     * Record attendance for user
     */
    recordAttendance(userData, action) {
        const timestamp = new Date().toISOString();
        const time = new Date().toLocaleTimeString();

        // Record in attendance system
        if (window.attendanceApp) {
            // Use existing attendance app logic
            if (action === 'time-in') {
                window.attendanceApp.timeIn();
            } else {
                window.attendanceApp.timeOut();
            }
        }

        // Show success notification
        if (window.uiComponents) {
            window.uiComponents.showToast(
                `${userData.name} - ${action.replace('-', ' ')} recorded at ${time}`,
                'success',
                'Attendance Recorded'
            );
        }

        console.log(`Attendance recorded: ${userData.name} - ${action} at ${timestamp}`);
    }

    /**
     * Update statistics
     */
    updateStats() {
        const totalUsers = window.userDatabase ? window.userDatabase.getAllUsers().length : 0;
        const generatedCount = this.generatedCards.size;
        const pendingCount = totalUsers - generatedCount;

        document.getElementById('total-cards').textContent = totalUsers;
        document.getElementById('generated-cards').textContent = generatedCount;
        document.getElementById('pending-cards').textContent = pendingCount;
    }

    /**
     * Filter cards by search term
     */
    filterCards(searchTerm) {
        const cards = document.querySelectorAll('.id-card-item');
        const term = searchTerm.toLowerCase();

        cards.forEach(card => {
            const name = card.querySelector('h4').textContent.toLowerCase();
            const department = card.querySelector('.department').textContent.toLowerCase();
            
            if (name.includes(term) || department.includes(term)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * Filter cards by department
     */
    filterCardsByDepartment(department) {
        const cards = document.querySelectorAll('.id-card-item');

        cards.forEach(card => {
            const cardDepartment = card.querySelector('.department').textContent;
            
            if (!department || cardDepartment === department) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    /**
     * Batch print all cards
     */
    batchPrintCards() {
        if (this.generatedCards.size === 0) {
            alert('No ID cards to print. Generate cards first.');
            return;
        }

        // Open print window with all cards
        const printWindow = window.open('', '_blank');
        const cardsHTML = Array.from(this.generatedCards.values()).map(card => 
            `<div class="print-card">
                <img src="${card.dataURL}" alt="ID Card">
                <div class="card-break"></div>
            </div>`
        ).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>AG&P ID Cards - Batch Print</title>
                    <style>
                        body { margin: 0; padding: 20px; }
                        .print-card { page-break-after: always; text-align: center; }
                        .print-card:last-child { page-break-after: avoid; }
                        img { max-width: 100%; height: auto; }
                        .card-break { height: 20px; }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="no-print">
                        <h2>AG&P ID Cards - Batch Print</h2>
                        <p>Printing ${this.generatedCards.size} ID cards</p>
                        <button onclick="window.print()">Print All</button>
                        <button onclick="window.close()">Close</button>
                        <hr>
                    </div>
                    ${cardsHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
    }

    /**
     * Load existing cards from storage
     */
    loadExistingCards() {
        // Implementation for loading previously generated cards
        // This would typically load from localStorage or a database
        this.updateStats();
    }

    /**
     * Add ID Card styles
     */
    addIDCardStyles() {
        if (document.getElementById('id-card-styles')) return;

        const style = document.createElement('style');
        style.id = 'id-card-styles';
        style.textContent = `
            .id-card-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                flex-wrap: wrap;
                gap: 1rem;
            }
            
            .control-group {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            
            .search-group {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            
            .search-input, .filter-select {
                padding: 0.5rem;
                border: 1px solid var(--border-color, #444);
                border-radius: 6px;
                background: var(--input-bg, #333);
                color: var(--text-color, #fff);
            }
            
            .id-cards-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            
            .id-card-item {
                background: var(--card-bg, #2a2a2a);
                border-radius: 12px;
                padding: 1rem;
                border: 1px solid var(--border-color, #444);
                transition: transform 0.3s, box-shadow 0.3s;
            }
            
            .id-card-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            .card-preview img {
                width: 100%;
                height: auto;
                border-radius: 8px;
                margin-bottom: 1rem;
            }
            
            .card-info h4 {
                margin: 0 0 0.5rem 0;
                color: var(--primary-color, #ff7a45);
            }
            
            .card-info p {
                margin: 0.25rem 0;
                color: var(--text-secondary, #ccc);
            }
            
            .barcode-info {
                margin-top: 0.5rem;
                padding-top: 0.5rem;
                border-top: 1px solid var(--border-color, #444);
            }
            
            .card-actions {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
                flex-wrap: wrap;
            }
            
            .btn-small {
                padding: 0.4rem 0.8rem;
                font-size: 0.85rem;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                transition: background 0.3s;
            }
            
            .btn-primary { background: var(--primary-color, #ff7a45); color: white; }
            .btn-secondary { background: var(--secondary-color, #6c757d); color: white; }
            .btn-info { background: var(--info-color, #17a2b8); color: white; }
            .btn-success { background: var(--success-color, #28a745); color: white; }
            .btn-warning { background: var(--warning-color, #ffc107); color: black; }
            
            .id-card-stats {
                display: flex;
                gap: 2rem;
                padding: 1rem;
                background: var(--card-bg, #2a2a2a);
                border-radius: 8px;
                border: 1px solid var(--border-color, #444);
            }
            
            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .stat-label {
                font-size: 0.9rem;
                color: var(--text-secondary, #ccc);
            }
            
            .stat-value {
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--primary-color, #ff7a45);
            }
            
            .loading-cards, .no-cards {
                text-align: center;
                padding: 3rem;
                color: var(--text-secondary, #ccc);
            }
            
            .generation-progress {
                text-align: center;
                padding: 2rem;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
                margin: 1rem 0;
            }
            
            .progress-fill {
                height: 100%;
                background: var(--primary-color, #ff7a45);
                transition: width 0.3s ease;
            }
            
            .id-card-modal .modal-overlay,
            .attendance-modal .modal-overlay {
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
            }
            
            .id-card-modal .modal-content,
            .attendance-modal .modal-content {
                background: var(--card-bg, #2a2a2a);
                border-radius: 12px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .modal-header {
                background: var(--primary-color, #ff7a45);
                color: white;
                padding: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 12px 12px 0 0;
            }
            
            .close-modal {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.25rem;
            }
            
            .modal-body {
                padding: 1.5rem;
            }
            
            .modal-actions {
                padding: 1rem 1.5rem;
                border-top: 1px solid var(--border-color, #444);
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
            }
            
            .user-info {
                display: flex;
                gap: 1rem;
                margin-bottom: 1.5rem;
                align-items: center;
            }
            
            .user-photo {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                object-fit: cover;
                border: 2px solid var(--primary-color, #ff7a45);
            }
            
            .user-details h4 {
                margin: 0 0 0.5rem 0;
                color: var(--primary-color, #ff7a45);
            }
            
            .user-details p {
                margin: 0.25rem 0;
                color: var(--text-secondary, #ccc);
            }
            
            .barcode-code {
                font-family: monospace;
                background: var(--input-bg, #333);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.9rem;
            }
            
            .attendance-actions {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
            
            @media (max-width: 768px) {
                .id-cards-grid {
                    grid-template-columns: 1fr;
                }
                
                .id-card-controls {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .control-group, .search-group {
                    justify-content: center;
                }
                
                .id-card-stats {
                    flex-direction: column;
                    gap: 1rem;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Create global instance
window.idCardManager = new IDCardManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IDCardManager;
}
