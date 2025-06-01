# 📱 QR Code System Documentation

## 🎯 Overview

The AG&P Attendance System includes a comprehensive QR code system for modern, contactless attendance tracking. Users can generate personalized QR codes and use camera-based scanning for quick check-in/check-out.

## ✨ Features

### 🔐 **Secure QR Code Generation**
- **Unique QR codes** for each user with encrypted data
- **Digital signatures** to prevent forgery
- **Expiration dates** (1 year validity)
- **Professional display** with user information

### 📷 **Camera-based Scanning**
- **Real-time detection** using device camera
- **Legacy barcode support** (backwards compatible)
- **Validation & verification** of scanned codes
- **Attendance confirmation** with time in/out options

### 🗄️ **Database Integration**
- **Supabase storage** for production environments
- **localStorage fallback** for local development
- **Automatic sync** between local and cloud storage
- **Audit logging** of all QR scans

## 🏗️ Architecture

### **Components**
```
src/services/QRCodeService.js       - Core QR generation & validation
src/services/CameraQRScanner.js    - Camera scanning functionality
src/components/QRScannerUI.js       - Modern scanning interface
src/components/QRCodeManager.js     - QR code management UI
src/config/supabase-client.js       - Database integration
```

### **Database Schema**
```sql
user_qr_codes (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    qr_data JSONB,           -- Encrypted QR data
    qr_image TEXT,           -- Base64 encoded image
    generated_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN
)

qr_scan_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    qr_code_id UUID,
    scan_result VARCHAR,     -- success/failed/expired
    scan_timestamp TIMESTAMP,
    scan_location JSONB
)
```

## 🚀 Usage

### **For Users**

#### **1. View Your QR Code**
```javascript
// Navigate to Profile section
// Click "My QR Code" button
// QR code displays with user information
```

#### **2. Download/Share QR Code**
```javascript
// In QR code modal:
// - Click "Download QR Code" to save as PNG
// - Click "Share QR Code" to use native sharing
// - Click "Regenerate" to create new QR code
```

#### **3. Scan for Attendance**
```javascript
// Navigate to "QR Scanner" section
// Click "Start Camera Scan"
// Allow camera permissions
// Position QR code within frame
// Confirm attendance action
```

### **For Developers**

#### **1. Generate QR Code**
```javascript
const result = await window.qrCodeService.generateUserQRCode(userData);
if (result.success) {
    console.log('QR Code:', result.qrCode);
    console.log('Data:', result.data);
}
```

#### **2. Scan QR Code**
```javascript
window.qrScannerUI.openScanner(
    (scanResult) => {
        console.log('Scan successful:', scanResult);
        // Handle successful scan
    },
    (error) => {
        console.error('Scan failed:', error);
        // Handle scan error
    }
);
```

#### **3. Validate QR Data**
```javascript
const validation = window.qrCodeService.validateQRData(qrData);
if (validation.valid) {
    console.log('Valid QR code:', validation.userData);
} else {
    console.log('Invalid:', validation.reason);
}
```

## 🔧 Configuration

### **Environment Variables**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# QR Code Settings
NEXT_PUBLIC_QR_CODE_EXPIRY_DAYS=365
NEXT_PUBLIC_QR_CODE_SIZE=256
NEXT_PUBLIC_QR_CODE_ERROR_CORRECTION=M

# Camera Settings
NEXT_PUBLIC_CAMERA_SCAN_INTERVAL=100
NEXT_PUBLIC_CAMERA_TIMEOUT=60000
NEXT_PUBLIC_CAMERA_DEBOUNCE_TIME=2000
```

### **QR Code Data Structure**
```json
{
    "version": "2.0",
    "type": "AGP_ATTENDANCE",
    "userId": "user_001",
    "name": "John Doe",
    "email": "john@agp.com",
    "department": "IT",
    "position": "Developer",
    "role": "user",
    "generatedAt": "2024-01-15T08:00:00.000Z",
    "validUntil": "2025-01-15T08:00:00.000Z",
    "issuer": "AG&P_ATTENDANCE_SYSTEM",
    "signature": "a1b2c3d4e5f6"
}
```

## 🔒 Security Features

### **1. Digital Signatures**
- Each QR code includes a cryptographic signature
- Prevents tampering and forgery
- Validates issuer authenticity

### **2. Expiration Control**
- QR codes expire after 1 year
- Automatic cleanup of expired codes
- Regeneration capability

### **3. Audit Logging**
- All scan attempts are logged
- Tracks success/failure rates
- Location and timestamp recording

### **4. Data Validation**
- Multi-layer validation process
- Type checking and format verification
- Signature validation

## 📱 Mobile Support

### **Camera Access**
- Automatic camera permission requests
- Front/back camera switching
- Error handling for camera issues

### **Responsive Design**
- Touch-friendly interface
- Mobile-optimized scanning frame
- Adaptive UI for different screen sizes

### **Offline Support**
- QR codes work without internet
- Local validation capabilities
- Sync when connection restored

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. Camera Not Working**
```javascript
// Check camera permissions
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        console.log('Camera access granted');
        stream.getTracks().forEach(track => track.stop());
    })
    .catch(error => {
        console.error('Camera access denied:', error);
    });
```

#### **2. QR Code Not Generating**
```javascript
// Check Supabase connection
if (window.supabaseService && window.supabaseService.isReady) {
    console.log('Supabase connected');
} else {
    console.log('Using localStorage fallback');
}
```

#### **3. Scan Not Working**
- Ensure good lighting
- Hold device steady
- Check QR code is not damaged
- Verify camera permissions

### **Debug Mode**
```javascript
// Enable debug logging
localStorage.setItem('qr_debug', 'true');

// Check QR service status
console.log('QR Service Status:', {
    isSupabaseEnabled: window.qrCodeService.isSupabaseEnabled,
    cacheSize: window.qrCodeService.qrCodes.size,
    scannerActive: window.cameraQRScanner.isScanning
});
```

## 📊 Performance

### **Optimization Features**
- **Caching**: Generated QR codes are cached in memory
- **Debouncing**: Prevents duplicate scans within 2 seconds
- **Lazy Loading**: QR generation only when needed
- **Efficient Scanning**: 100ms scan intervals for smooth performance

### **Browser Compatibility**
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers with camera support

## 🔄 Deployment

### **1. Supabase Setup**
```sql
-- Run the complete schema
\i docs/SUPABASE_SCHEMA.sql
```

### **2. Vercel Configuration**
```json
{
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### **3. Testing**
```bash
# Test QR functionality
open http://localhost:3000/test-qr.html

# Check all services load
# Test QR generation
# Test camera scanning
```

## 📈 Analytics

### **QR Code Statistics**
```javascript
const stats = window.qrCodeService.getQRCodeStats();
console.log('QR Stats:', {
    totalUsers: stats.totalUsers,
    usersWithQRCodes: stats.usersWithQRCodes,
    coverage: stats.coverage + '%'
});
```

### **Scan Metrics**
- Total scans performed
- Success/failure rates
- Most active users
- Peak usage times

## 🎯 Future Enhancements

- **Batch QR generation** for multiple users
- **Custom QR designs** with company branding
- **NFC integration** for contactless alternatives
- **Geofencing** for location-based attendance
- **Advanced analytics** dashboard
- **API endpoints** for external integrations

---

**📞 Support**: For QR code system issues, check the browser console for detailed error messages and refer to the troubleshooting section above.
