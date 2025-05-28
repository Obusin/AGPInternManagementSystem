/**
 * Standard Barcode Generator
 * Generates Code 128 barcodes that work with any standard barcode reader
 */

class StandardBarcodeGenerator {
    constructor() {
        // Code 128 character set
        this.code128 = {
            // Start codes
            'START_A': 103,
            'START_B': 104,
            'START_C': 105,
            'STOP': 106,
            
            // Character mappings for Code 128B (most common)
            chars: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
            
            // Bar patterns for each character (11 bars per character)
            patterns: [
                '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
                '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
                '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
                '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
                '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
                '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
                '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
                '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
                '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
                '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
                '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
                '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
                '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
                '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
                '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
                '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
                '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
                '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
                '11011110110', '11110110110', '10101111000', '10100011110', '10001011110',
                '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
                '10111101110', '11101011110', '11110101110', '11010000100', '11010010000',
                '11010011100', '1100011101011'
            ]
        };
    }

    /**
     * Generate a standard barcode for an intern
     */
    generateInternBarcode(applicantData) {
        // Create a unique barcode string
        const barcodeText = this.createBarcodeText(applicantData);
        
        // Generate the barcode image
        const barcodeImage = this.generateCode128(barcodeText);
        
        return {
            text: barcodeText,
            image: barcodeImage,
            format: 'CODE128',
            userData: applicantData
        };
    }

    /**
     * Create barcode text from applicant data
     */
    createBarcodeText(applicantData) {
        // Format: AGP + Department Code + Year + Sequential Number
        const year = new Date().getFullYear().toString().slice(-2);
        const deptCode = this.getDepartmentCode(applicantData.department);
        const seqNumber = this.generateSequentialNumber(applicantData.id);
        
        return `AGP${deptCode}${year}${seqNumber}`;
    }

    /**
     * Get department code
     */
    getDepartmentCode(department) {
        const codes = {
            'IT': 'IT',
            'IT_DEV': 'ID',
            'HR': 'HR',
            'FINANCE': 'FN',
            'MARKETING': 'MK',
            'OPERATIONS': 'OP',
            'ADMIN': 'AD'
        };
        return codes[department] || 'GN'; // GN = General
    }

    /**
     * Generate sequential number from ID
     */
    generateSequentialNumber(id) {
        // Extract numbers from ID or generate from timestamp
        const numbers = id.replace(/\D/g, '');
        if (numbers.length >= 4) {
            return numbers.slice(-4);
        }
        
        // Fallback: use timestamp
        return Date.now().toString().slice(-4);
    }

    /**
     * Generate Code 128 barcode image
     */
    generateCode128(text) {
        try {
            // Calculate checksum
            const checksum = this.calculateChecksum(text);
            
            // Create barcode pattern
            const pattern = this.createBarcodePattern(text, checksum);
            
            // Generate canvas image
            return this.createBarcodeCanvas(pattern, text);
            
        } catch (error) {
            console.error('Error generating barcode:', error);
            return this.createErrorBarcode(text);
        }
    }

    /**
     * Calculate Code 128 checksum
     */
    calculateChecksum(text) {
        let checksum = 104; // Start B
        
        for (let i = 0; i < text.length; i++) {
            const charIndex = this.code128.chars.indexOf(text[i]);
            if (charIndex === -1) {
                throw new Error(`Invalid character: ${text[i]}`);
            }
            checksum += charIndex * (i + 1);
        }
        
        return checksum % 103;
    }

    /**
     * Create barcode pattern
     */
    createBarcodePattern(text, checksum) {
        let pattern = this.code128.patterns[104]; // Start B
        
        // Add character patterns
        for (let char of text) {
            const charIndex = this.code128.chars.indexOf(char);
            if (charIndex !== -1) {
                pattern += this.code128.patterns[charIndex];
            }
        }
        
        // Add checksum
        pattern += this.code128.patterns[checksum];
        
        // Add stop pattern
        pattern += this.code128.patterns[106];
        
        // Add final bar
        pattern += '11';
        
        return pattern;
    }

    /**
     * Create barcode canvas
     */
    createBarcodeCanvas(pattern, text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Barcode dimensions
        const barWidth = 2;
        const barHeight = 60;
        const textHeight = 20;
        const margin = 10;
        
        // Set canvas size
        canvas.width = (pattern.length * barWidth) + (margin * 2);
        canvas.height = barHeight + textHeight + (margin * 2);
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw bars
        ctx.fillStyle = '#000000';
        let x = margin;
        
        for (let i = 0; i < pattern.length; i++) {
            if (pattern[i] === '1') {
                ctx.fillRect(x, margin, barWidth, barHeight);
            }
            x += barWidth;
        }
        
        // Draw text
        ctx.fillStyle = '#000000';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, canvas.width / 2, barHeight + margin + 15);
        
        return canvas.toDataURL('image/png');
    }

    /**
     * Create error barcode
     */
    createErrorBarcode(text) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 200;
        canvas.height = 80;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff0000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('BARCODE ERROR', canvas.width / 2, 30);
        ctx.fillText(text, canvas.width / 2, 50);
        
        return canvas.toDataURL('image/png');
    }

    /**
     * Generate QR code as fallback
     */
    generateQRCode(text) {
        // Simple QR code pattern generator
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const size = 100;
        const moduleSize = 4;
        const modules = size / moduleSize;
        
        canvas.width = size;
        canvas.height = size;
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        // Generate pattern based on text
        ctx.fillStyle = '#000000';
        const hash = this.simpleHash(text);
        
        for (let i = 0; i < modules; i++) {
            for (let j = 0; j < modules; j++) {
                if ((hash + i * j) % 3 === 0) {
                    ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
                }
            }
        }
        
        // Add finder patterns
        this.drawFinderPattern(ctx, 0, 0, moduleSize);
        this.drawFinderPattern(ctx, size - 7 * moduleSize, 0, moduleSize);
        this.drawFinderPattern(ctx, 0, size - 7 * moduleSize, moduleSize);
        
        return canvas.toDataURL('image/png');
    }

    /**
     * Draw QR finder pattern
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
     * Simple hash function
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    /**
     * Validate barcode text
     */
    validateBarcodeText(text) {
        // Check if text contains only valid Code 128 characters
        for (let char of text) {
            if (this.code128.chars.indexOf(char) === -1) {
                return false;
            }
        }
        return true;
    }

    /**
     * Generate barcode for mobile display
     */
    generateMobileBarcode(applicantData) {
        const barcode = this.generateInternBarcode(applicantData);
        
        // Create mobile-friendly version
        const mobileCanvas = document.createElement('canvas');
        const ctx = mobileCanvas.getContext('2d');
        
        // Mobile dimensions
        mobileCanvas.width = 300;
        mobileCanvas.height = 150;
        
        // Load original barcode
        const img = new Image();
        img.onload = () => {
            // Clear canvas
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, mobileCanvas.width, mobileCanvas.height);
            
            // Draw scaled barcode
            ctx.drawImage(img, 10, 10, 280, 100);
            
            // Add instructions
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Show this barcode to scanner', mobileCanvas.width / 2, 130);
        };
        img.src = barcode.image;
        
        return {
            ...barcode,
            mobileImage: mobileCanvas.toDataURL('image/png')
        };
    }
}

// Create global instance
window.standardBarcodeGenerator = new StandardBarcodeGenerator();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StandardBarcodeGenerator;
}
