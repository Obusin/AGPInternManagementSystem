/**
 * ID Card PDF Generator
 * Generates printable PDF ID cards for approved applicants with standard barcodes
 */

class IDCardPDFGenerator {
    constructor() {
        this.cardWidth = 400;
        this.cardHeight = 250;
    }

    /**
     * Generate PDF ID card for approved applicant
     */
    async generateIDCardPDF(applicantData) {
        try {
            // Generate barcode
            const barcode = window.standardBarcodeGenerator.generateInternBarcode(applicantData);

            // Create ID card canvas
            const cardCanvas = await this.createIDCard(applicantData, barcode);

            // Generate PDF
            const pdfData = this.createPDFFromCanvas(cardCanvas, applicantData);

            return {
                success: true,
                pdfData: pdfData,
                barcode: barcode,
                applicantData: applicantData
            };

        } catch (error) {
            console.error('Error generating ID card PDF:', error);
            return {
                success: false,
                error: error.message,
                applicantData: applicantData
            };
        }
    }

    /**
     * Create ID card canvas
     */
    async createIDCard(applicantData, barcode) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = this.cardWidth;
        canvas.height = this.cardHeight;

        // Draw card background
        this.drawCardBackground(ctx);

        // Draw header
        await this.drawHeader(ctx);

        // Draw user photo
        await this.drawUserPhoto(ctx, applicantData);

        // Draw user information
        this.drawUserInfo(ctx, applicantData);

        // Draw barcode
        await this.drawBarcode(ctx, barcode);

        // Draw footer
        this.drawFooter(ctx);

        return canvas;
    }

    /**
     * Draw card background
     */
    drawCardBackground(ctx) {
        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.cardWidth, this.cardHeight);

        // Border
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, this.cardWidth - 10, this.cardHeight - 10);

        // Inner border
        ctx.strokeStyle = '#ff7a45';
        ctx.lineWidth = 1;
        ctx.strokeRect(10, 10, this.cardWidth - 20, this.cardHeight - 20);
    }

    /**
     * Draw header with AG&P branding
     */
    async drawHeader(ctx) {
        // Header background
        const gradient = ctx.createLinearGradient(0, 15, 0, 50);
        gradient.addColorStop(0, '#ff7a45');
        gradient.addColorStop(1, '#ff9a65');

        ctx.fillStyle = gradient;
        ctx.fillRect(15, 15, this.cardWidth - 30, 35);

        // Company name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('AG&P GROUP', this.cardWidth / 2, 35);

        // Subtitle
        ctx.font = '12px Arial';
        ctx.fillText('INTERN IDENTIFICATION CARD', this.cardWidth / 2, 47);
    }

    /**
     * Draw user photo
     */
    async drawUserPhoto(ctx, applicantData) {
        const photoX = 25;
        const photoY = 65;
        const photoSize = 80;

        // Photo border
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2;
        ctx.strokeRect(photoX - 2, photoY - 2, photoSize + 4, photoSize + 4);

        if (applicantData.photo) {
            try {
                await this.loadAndDrawImage(ctx, applicantData.photo, photoX, photoY, photoSize, photoSize);
            } catch (error) {
                console.log('Photo not available, using placeholder');
                this.drawPhotoPlaceholder(ctx, photoX, photoY, photoSize);
            }
        } else {
            this.drawPhotoPlaceholder(ctx, photoX, photoY, photoSize);
        }
    }

    /**
     * Load and draw image
     */
    loadAndDrawImage(ctx, src, x, y, width, height) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
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
    drawPhotoPlaceholder(ctx, x, y, size) {
        // Background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(x, y, size, size);

        // Icon
        ctx.fillStyle = '#6c757d';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👤', x + size / 2, y + size / 2 + 10);
    }

    /**
     * Draw user information
     */
    drawUserInfo(ctx, applicantData) {
        const infoX = 120;
        const infoY = 75;
        const lineHeight = 16;

        ctx.textAlign = 'left';

        // Name
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(applicantData.name || 'N/A', infoX, infoY);

        // Position
        ctx.fillStyle = '#6c757d';
        ctx.font = '12px Arial';
        ctx.fillText(applicantData.position || 'Intern', infoX, infoY + lineHeight);

        // Department
        const departmentName = this.getDepartmentName(applicantData.department);
        ctx.fillText(departmentName, infoX, infoY + lineHeight * 2);

        // ID Number
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 11px Arial';
        ctx.fillText(`ID: ${applicantData.id || 'N/A'}`, infoX, infoY + lineHeight * 3);

        // Valid dates
        const validFrom = new Date().toLocaleDateString();
        const validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString();
        ctx.fillStyle = '#6c757d';
        ctx.font = '9px Arial';
        ctx.fillText(`Valid: ${validFrom} - ${validUntil}`, infoX, infoY + lineHeight * 4.5);
    }

    /**
     * Get department name
     */
    getDepartmentName(department) {
        const names = {
            'IT': 'Information Technology',
            'IT_DEV': 'IT Development',
            'HR': 'Human Resources',
            'FINANCE': 'Finance',
            'MARKETING': 'Marketing',
            'OPERATIONS': 'Operations',
            'ADMIN': 'Administration'
        };
        return names[department] || department || 'General';
    }

    /**
     * Draw barcode
     */
    async drawBarcode(ctx, barcode) {
        const barcodeX = this.cardWidth - 120;
        const barcodeY = 65;

        try {
            // Load barcode image
            await this.loadAndDrawImage(ctx, barcode.image, barcodeX, barcodeY, 100, 60);

            // Barcode text
            ctx.fillStyle = '#2c3e50';
            ctx.font = '8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(barcode.text, barcodeX + 50, barcodeY + 75);

        } catch (error) {
            console.error('Error drawing barcode:', error);
            // Draw placeholder
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(barcodeX, barcodeY, 100, 60);
            ctx.fillStyle = '#6c757d';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('BARCODE', barcodeX + 50, barcodeY + 35);
        }
    }

    /**
     * Draw footer
     */
    drawFooter(ctx) {
        const footerY = this.cardHeight - 25;

        // Footer background
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(15, footerY - 5, this.cardWidth - 30, 20);

        // Footer text
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Property of AG&P Group', 20, footerY + 5);

        ctx.textAlign = 'right';
        ctx.fillText('Report if found: security@agp.com', this.cardWidth - 20, footerY + 5);
    }

    /**
     * Create PDF from canvas using browser print
     */
    createPDFFromCanvas(canvas, applicantData) {
        // Create a print-friendly HTML page
        const printContent = this.createPrintHTML(canvas, applicantData);

        // Open in new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();

        return {
            printWindow: printWindow,
            canvas: canvas,
            dataURL: canvas.toDataURL('image/png')
        };
    }

    /**
     * Create print HTML
     */
    createPrintHTML(canvas, applicantData) {
        const dataURL = canvas.toDataURL('image/png');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>AG&P ID Card - ${applicantData.name}</title>
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                        text-align: center;
                    }
                    .id-card {
                        max-width: 100%;
                        height: auto;
                        border: 1px solid #ccc;
                        margin: 20px auto;
                        display: block;
                    }
                    .instructions {
                        margin: 20px 0;
                        padding: 15px;
                        background: #f8f9fa;
                        border-radius: 5px;
                        border-left: 4px solid #ff7a45;
                    }
                    .barcode-info {
                        margin: 15px 0;
                        padding: 10px;
                        background: #e9ecef;
                        border-radius: 5px;
                    }
                    .actions {
                        margin: 20px 0;
                    }
                    .btn {
                        padding: 10px 20px;
                        margin: 0 10px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                    }
                    .btn-primary {
                        background: #ff7a45;
                        color: white;
                    }
                    .btn-secondary {
                        background: #6c757d;
                        color: white;
                    }
                    @media print {
                        .no-print {
                            display: none;
                        }
                        body {
                            padding: 0;
                        }
                        .id-card {
                            margin: 0;
                            border: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="no-print">
                    <h1>AG&P Intern ID Card</h1>
                    <div class="instructions">
                        <h3>📋 Printing Instructions</h3>
                        <p>1. Use high-quality cardstock paper (recommended: 300gsm)</p>
                        <p>2. Print at 100% scale (no scaling)</p>
                        <p>3. Cut along the border lines</p>
                        <p>4. Laminate for durability</p>
                    </div>

                    <div class="barcode-info">
                        <h4>📱 Mobile Barcode</h4>
                        <p>Intern can use their phone to display the barcode for scanning</p>
                        <p><strong>Barcode:</strong> <code id="barcode-text"></code></p>
                        <button class="btn btn-secondary" onclick="generateMobileBarcode()">
                            📱 Generate Mobile Version
                        </button>
                    </div>

                    <div class="actions">
                        <button class="btn btn-primary" onclick="window.print()">
                            🖨️ Print ID Card
                        </button>
                        <button class="btn btn-secondary" onclick="downloadImage()">
                            💾 Download Image
                        </button>
                        <button class="btn btn-secondary" onclick="window.close()">
                            ❌ Close
                        </button>
                    </div>
                </div>

                <img src="${dataURL}" alt="ID Card" class="id-card">

                <script>
                    // Set barcode text
                    const applicantData = ${JSON.stringify(applicantData)};

                    // Generate barcode text
                    function generateBarcodeText() {
                        const year = new Date().getFullYear().toString().slice(-2);
                        const deptCode = getDepartmentCode(applicantData.department);
                        const seqNumber = applicantData.id.replace(/\\D/g, '').slice(-4) || Date.now().toString().slice(-4);
                        return 'AGP' + deptCode + year + seqNumber;
                    }

                    function getDepartmentCode(department) {
                        const codes = {
                            'IT': 'IT', 'IT_DEV': 'ID', 'HR': 'HR',
                            'FINANCE': 'FN', 'MARKETING': 'MK',
                            'OPERATIONS': 'OP', 'ADMIN': 'AD'
                        };
                        return codes[department] || 'GN';
                    }

                    // Set barcode text in page
                    document.getElementById('barcode-text').textContent = generateBarcodeText();

                    // Download image function
                    function downloadImage() {
                        const link = document.createElement('a');
                        link.download = 'AGP_ID_' + applicantData.name.replace(/\\s+/g, '_') + '.png';
                        link.href = '${dataURL}';
                        link.click();
                    }

                    // Generate mobile barcode
                    function generateMobileBarcode() {
                        const barcodeText = generateBarcodeText();
                        const mobileWindow = window.open('', '_blank');
                        mobileWindow.document.write(\`
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <title>Mobile Barcode - \${applicantData.name}</title>
                                <meta name="viewport" content="width=device-width, initial-scale=1">
                                <style>
                                    body {
                                        margin: 0;
                                        padding: 20px;
                                        font-family: Arial, sans-serif;
                                        text-align: center;
                                        background: #f8f9fa;
                                    }
                                    .mobile-card {
                                        background: white;
                                        border-radius: 10px;
                                        padding: 20px;
                                        margin: 20px auto;
                                        max-width: 300px;
                                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                    }
                                    .barcode-display {
                                        font-size: 24px;
                                        font-weight: bold;
                                        font-family: monospace;
                                        background: #f8f9fa;
                                        padding: 15px;
                                        border-radius: 5px;
                                        margin: 15px 0;
                                        letter-spacing: 2px;
                                    }
                                    .instructions {
                                        color: #6c757d;
                                        font-size: 14px;
                                        margin: 10px 0;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="mobile-card">
                                    <h2>AG&P Intern Barcode</h2>
                                    <h3>\${applicantData.name}</h3>
                                    <div class="barcode-display">\${barcodeText}</div>
                                    <div class="instructions">
                                        Show this screen to the barcode scanner
                                    </div>
                                    <div class="instructions">
                                        Keep screen brightness high for better scanning
                                    </div>
                                </div>
                            </body>
                            </html>
                        \`);
                        mobileWindow.document.close();
                    }
                </script>
            </body>
            </html>
        `;
    }

    /**
     * Generate mobile-friendly barcode page
     */
    generateMobileBarcodeHTML(applicantData, barcodeText) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mobile Barcode - ${applicantData.name}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                        text-align: center;
                        background: #f8f9fa;
                    }
                    .mobile-card {
                        background: white;
                        border-radius: 10px;
                        padding: 20px;
                        margin: 20px auto;
                        max-width: 300px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .barcode-display {
                        font-size: 24px;
                        font-weight: bold;
                        font-family: monospace;
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 15px 0;
                        letter-spacing: 2px;
                    }
                    .instructions {
                        color: #6c757d;
                        font-size: 14px;
                        margin: 10px 0;
                    }
                </style>
            </head>
            <body>
                <div class="mobile-card">
                    <h2>AG&P Intern Barcode</h2>
                    <h3>${applicantData.name}</h3>
                    <div class="barcode-display">${barcodeText}</div>
                    <div class="instructions">
                        Show this screen to the barcode scanner
                    </div>
                    <div class="instructions">
                        Keep screen brightness high for better scanning
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

// Create global instance
window.idCardPDFGenerator = new IDCardPDFGenerator();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IDCardPDFGenerator;
}
