/**
 * ID Card Generator Service
 * Automatically generates professional ID cards with barcodes for AG&P interns
 */

class IDCardGenerator {
    constructor() {
        this.cardWidth = 400;
        this.cardHeight = 250;
        this.photoSize = 80;
        this.barcodeHeight = 40;
        this.qrCodeSize = 60;

        // AG&P Brand Colors
        this.brandColors = {
            primary: '#ff7a45',
            secondary: '#2c3e50',
            accent: '#3498db',
            text: '#2c3e50',
            textLight: '#7f8c8d',
            background: '#ffffff',
            border: '#bdc3c7'
        };
    }

    /**
     * Generate ID card for a user
     */
    async generateIDCard(userData, options = {}) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size
            canvas.width = this.cardWidth;
            canvas.height = this.cardHeight;

            // Generate barcode data
            const barcodeData = this.generateBarcodeData(userData);

            // Draw ID card
            await this.drawIDCard(ctx, userData, barcodeData, options);

            return {
                canvas: canvas,
                dataURL: canvas.toDataURL('image/png'),
                barcodeData: barcodeData,
                userData: userData
            };
        } catch (error) {
            console.error('Error generating ID card:', error);
            throw new Error('Failed to generate ID card: ' + error.message);
        }
    }

    /**
     * Draw the complete ID card
     */
    async drawIDCard(ctx, userData, barcodeData, options) {
        // Clear canvas
        ctx.fillStyle = this.brandColors.background;
        ctx.fillRect(0, 0, this.cardWidth, this.cardHeight);

        // Draw card border
        this.drawCardBorder(ctx);

        // Draw header with AG&P logo and branding
        await this.drawHeader(ctx);

        // Draw user photo
        await this.drawUserPhoto(ctx, userData.photo || userData.avatar);

        // Draw user information
        this.drawUserInfo(ctx, userData);

        // Draw barcode/QR code
        await this.drawBarcode(ctx, barcodeData);

        // Draw footer
        this.drawFooter(ctx, userData);

        // Draw security features
        this.drawSecurityFeatures(ctx);
    }

    /**
     * Draw card border and background
     */
    drawCardBorder(ctx) {
        // Outer border
        ctx.strokeStyle = this.brandColors.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, this.cardWidth - 10, this.cardHeight - 10);

        // Inner border
        ctx.strokeStyle = this.brandColors.primary;
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 10, this.cardWidth - 20, this.cardHeight - 20);

        // Corner accents
        this.drawCornerAccents(ctx);
    }

    /**
     * Draw corner accent designs
     */
    drawCornerAccents(ctx) {
        const accentSize = 15;
        ctx.fillStyle = this.brandColors.primary;

        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(10 + accentSize, 10);
        ctx.lineTo(10, 10 + accentSize);
        ctx.closePath();
        ctx.fill();

        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(this.cardWidth - 10, 10);
        ctx.lineTo(this.cardWidth - 10 - accentSize, 10);
        ctx.lineTo(this.cardWidth - 10, 10 + accentSize);
        ctx.closePath();
        ctx.fill();

        // Bottom corners
        ctx.beginPath();
        ctx.moveTo(10, this.cardHeight - 10);
        ctx.lineTo(10 + accentSize, this.cardHeight - 10);
        ctx.lineTo(10, this.cardHeight - 10 - accentSize);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.cardWidth - 10, this.cardHeight - 10);
        ctx.lineTo(this.cardWidth - 10 - accentSize, this.cardHeight - 10);
        ctx.lineTo(this.cardWidth - 10, this.cardHeight - 10 - accentSize);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draw header with AG&P branding
     */
    async drawHeader(ctx) {
        // Header background
        const gradient = ctx.createLinearGradient(0, 15, 0, 50);
        gradient.addColorStop(0, this.brandColors.primary);
        gradient.addColorStop(1, '#ff9a65');

        ctx.fillStyle = gradient;
        ctx.fillRect(15, 15, this.cardWidth - 30, 35);

        // Company name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('AG&P GROUP', this.cardWidth / 2, 35);

        // Subtitle
        ctx.font = '10px Arial';
        ctx.fillText('INTERN IDENTIFICATION CARD', this.cardWidth / 2, 45);

        // Try to load and draw AG&P logo
        try {
            await this.drawLogo(ctx, 20, 20, 25, 25);
        } catch (error) {
            console.log('Logo not available, using text placeholder');
        }
    }

    /**
     * Draw AG&P logo
     */
    async drawLogo(ctx, x, y, width, height) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, x, y, width, height);
                resolve();
            };
            img.onerror = () => {
                // Fallback: draw text logo
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'left';
                ctx.fillText('AG&P', x, y + 15);
                resolve();
            };
            img.src = '../assets/images/AGP-Logo.png';
        });
    }

    /**
     * Draw user photo
     */
    async drawUserPhoto(ctx, photoSrc) {
        const photoX = 25;
        const photoY = 65;

        // Photo border
        ctx.strokeStyle = this.brandColors.border;
        ctx.lineWidth = 2;
        ctx.strokeRect(photoX - 2, photoY - 2, this.photoSize + 4, this.photoSize + 4);

        if (photoSrc && photoSrc !== '') {
            try {
                await this.loadAndDrawImage(ctx, photoSrc, photoX, photoY, this.photoSize, this.photoSize);
            } catch (error) {
                console.log('Photo not available, using placeholder');
                this.drawPhotoPlaceholder(ctx, photoX, photoY);
            }
        } else {
            this.drawPhotoPlaceholder(ctx, photoX, photoY);
        }
    }

    /**
     * Load and draw image
     */
    loadAndDrawImage(ctx, src, x, y, width, height) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // Draw image with proper scaling
                ctx.save();
                ctx.beginPath();
                ctx.rect(x, y, width, height);
                ctx.clip();

                // Calculate scaling to maintain aspect ratio
                const scale = Math.max(width / img.width, height / img.height);
                const scaledWidth = img.width * scale;
                const scaledHeight = img.height * scale;
                const offsetX = (width - scaledWidth) / 2;
                const offsetY = (height - scaledHeight) / 2;

                ctx.drawImage(img, x + offsetX, y + offsetY, scaledWidth, scaledHeight);
                ctx.restore();
                resolve();
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = src;
        });
    }

    /**
     * Draw photo placeholder
     */
    drawPhotoPlaceholder(ctx, x, y) {
        // Background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(x, y, this.photoSize, this.photoSize);

        // Icon
        ctx.fillStyle = this.brandColors.textLight;
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👤', x + this.photoSize / 2, y + this.photoSize / 2 + 10);
    }

    /**
     * Draw user information
     */
    drawUserInfo(ctx, userData) {
        const infoX = 120;
        const infoY = 70;
        const lineHeight = 16;

        ctx.textAlign = 'left';

        // Name
        ctx.fillStyle = this.brandColors.text;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(userData.name || 'N/A', infoX, infoY);

        // Position
        ctx.fillStyle = this.brandColors.textLight;
        ctx.font = '11px Arial';
        ctx.fillText(userData.position || 'Intern', infoX, infoY + lineHeight);

        // Department
        ctx.fillText(userData.department || 'N/A', infoX, infoY + lineHeight * 2);

        // ID Number
        ctx.fillStyle = this.brandColors.text;
        ctx.font = 'bold 10px Arial';
        ctx.fillText(`ID: ${userData.id || userData.applicationId || 'N/A'}`, infoX, infoY + lineHeight * 3);

        // Valid dates
        const validFrom = new Date().toLocaleDateString();
        const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString();
        ctx.fillStyle = this.brandColors.textLight;
        ctx.font = '8px Arial';
        ctx.fillText(`Valid: ${validFrom} - ${validUntil}`, infoX, infoY + lineHeight * 4.5);
    }

    /**
     * Generate barcode data
     */
    generateBarcodeData(userData) {
        const timestamp = Date.now();
        const userId = userData.id || userData.applicationId || timestamp;
        const department = userData.department || 'INTERN';

        return {
            code: `AGP-${department}-${userId}`,
            qrData: JSON.stringify({
                id: userId,
                name: userData.name,
                department: userData.department,
                position: userData.position,
                validFrom: new Date().toISOString(),
                validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                issuer: 'AG&P_ATTENDANCE_SYSTEM'
            })
        };
    }

    /**
     * Draw barcode/QR code
     */
    async drawBarcode(ctx, barcodeData) {
        const barcodeX = this.cardWidth - 80;
        const barcodeY = 65;

        // QR Code placeholder (simplified representation)
        await this.drawQRCode(ctx, barcodeData.qrData, barcodeX, barcodeY);

        // Barcode text
        ctx.fillStyle = this.brandColors.text;
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(barcodeData.code, barcodeX + this.qrCodeSize / 2, barcodeY + this.qrCodeSize + 12);
    }

    /**
     * Draw simplified QR code representation
     */
    async drawQRCode(ctx, data, x, y) {
        const size = this.qrCodeSize;
        const moduleSize = size / 21; // 21x21 modules for QR code

        // QR code border
        ctx.fillStyle = '#000000';
        ctx.fillRect(x - 2, y - 2, size + 4, size + 4);

        // QR code background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, size, size);

        // Generate simple pattern based on data
        ctx.fillStyle = '#000000';
        const hash = this.simpleHash(data);

        for (let i = 0; i < 21; i++) {
            for (let j = 0; j < 21; j++) {
                // Create pattern based on hash and position
                if ((hash + i * j) % 3 === 0) {
                    ctx.fillRect(
                        x + i * moduleSize,
                        y + j * moduleSize,
                        moduleSize,
                        moduleSize
                    );
                }
            }
        }

        // Add finder patterns (corners)
        this.drawFinderPattern(ctx, x, y, moduleSize);
        this.drawFinderPattern(ctx, x + size - 7 * moduleSize, y, moduleSize);
        this.drawFinderPattern(ctx, x, y + size - 7 * moduleSize, moduleSize);
    }

    /**
     * Draw QR code finder pattern
     */
    drawFinderPattern(ctx, x, y, moduleSize) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
    }

    /**
     * Simple hash function for QR pattern
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Draw footer information
     */
    drawFooter(ctx, userData) {
        const footerY = this.cardHeight - 25;

        // Footer background
        ctx.fillStyle = this.brandColors.secondary;
        ctx.fillRect(15, footerY - 5, this.cardWidth - 30, 20);

        // Footer text
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('This card is property of AG&P Group', 20, footerY + 5);

        ctx.textAlign = 'right';
        ctx.fillText('Report if found: security@agp.com', this.cardWidth - 20, footerY + 5);
    }

    /**
     * Draw security features
     */
    drawSecurityFeatures(ctx) {
        // Holographic effect simulation
        const gradient = ctx.createLinearGradient(0, 0, this.cardWidth, this.cardHeight);
        gradient.addColorStop(0, 'rgba(255, 122, 69, 0.1)');
        gradient.addColorStop(0.5, 'rgba(52, 152, 219, 0.1)');
        gradient.addColorStop(1, 'rgba(155, 89, 182, 0.1)');

        ctx.fillStyle = gradient;
        ctx.fillRect(15, 15, this.cardWidth - 30, this.cardHeight - 30);

        // Security watermark
        ctx.fillStyle = 'rgba(255, 122, 69, 0.05)';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.save();
        ctx.translate(this.cardWidth / 2, this.cardHeight / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText('AG&P', 0, 0);
        ctx.restore();
    }

    /**
     * Generate PDF for printing
     */
    async generatePDF(idCards) {
        // This would integrate with a PDF library like jsPDF
        // For now, return the canvas data URLs
        return idCards.map(card => ({
            dataURL: card.dataURL,
            userData: card.userData,
            barcodeData: card.barcodeData
        }));
    }

    /**
     * Batch generate ID cards
     */
    async generateBatchIDCards(usersData, options = {}) {
        const results = [];

        for (const userData of usersData) {
            try {
                const idCard = await this.generateIDCard(userData, options);
                results.push(idCard);
            } catch (error) {
                console.error(`Failed to generate ID for ${userData.name}:`, error);
                results.push({
                    error: error.message,
                    userData: userData
                });
            }
        }

        return results;
    }

    /**
     * Download ID card as image
     */
    downloadIDCard(idCard, filename) {
        const link = document.createElement('a');
        link.download = filename || `AGP_ID_${idCard.userData.name.replace(/\s+/g, '_')}.png`;
        link.href = idCard.dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Print ID card
     */
    printIDCard(idCard) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>AG&P ID Card - ${idCard.userData.name}</title>
                    <style>
                        body { margin: 0; padding: 20px; text-align: center; }
                        img { max-width: 100%; height: auto; }
                        @media print {
                            body { padding: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="no-print">
                        <h2>AG&P ID Card - ${idCard.userData.name}</h2>
                        <p>Click Print to print this ID card</p>
                        <button onclick="window.print()">Print</button>
                        <button onclick="window.close()">Close</button>
                        <hr>
                    </div>
                    <img src="${idCard.dataURL}" alt="ID Card">
                </body>
            </html>
        `);
        printWindow.document.close();
    }
}

// Create global instance
window.idCardGenerator = new IDCardGenerator();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IDCardGenerator;
}
