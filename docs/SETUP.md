# 🚀 AG&P Attendance System - Setup Guide

## 📋 **Quick Start**

### **Option 1: Direct Browser Access**
1. Navigate to the project folder
2. Open `core/index.html` in your web browser
3. Use test accounts to log in and explore

### **Option 2: Local Web Server (Recommended)**
```bash
# Using Python 3
cd /path/to/agp-attendance-system
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server . -p 8000

# Using PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000/core/index.html`

## 🔐 **Test Accounts**

### **Developer Account**
- **Email**: `devmark@agp.com`
- **Password**: `try465`
- **Access**: Full system administration, intern management dashboard

### **Admin Account**
- **Email**: `adminmark@agp.com`
- **Password**: `try123`
- **Access**: User management, applicant approval

### **User Account**
- **Email**: `usermark@agp.com`
- **Password**: `try123`
- **Access**: Basic attendance tracking

## 🏗️ **File Structure After Setup**

```
agp-attendance-system/
├── core/
│   ├── index.html          ← Main application entry point
│   ├── login.html          ← Login page
│   ├── register.html       ← Registration page
│   └── app-browser.js      ← Core application logic
├── src/
│   ├── components/         ← UI components
│   ├── services/           ← Business logic
│   ├── styles/             ← CSS stylesheets
│   └── utils/              ← Utility functions
├── modules/
│   ├── user-management/    ← User & role management
│   ├── intern-management/  ← Intern-specific features
│   └── multi-site/         ← Legacy features
├── assets/
│   ├── images/             ← Images and logos
│   └── icons/              ← Icons and graphics
├── config/
│   ├── manifest.json       ← PWA configuration
│   └── sw.js               ← Service worker
├── docs/                   ← Documentation
├── tests/                  ← Test files
└── archive/                ← Archived files
```

## ⚙️ **Configuration**

### **PWA Settings**
The system includes Progressive Web App features. To customize:

1. Edit `config/manifest.json` for app metadata
2. Modify `config/sw.js` for caching strategies
3. Update icons in `assets/icons/` directory

### **Branding Customization**
1. Replace `assets/images/AGP-Logo.png` with your logo
2. Update colors in `src/styles/variables.css`
3. Modify company name in HTML files

### **Department Configuration**
Add or modify departments in the user database:
```javascript
// In modules/user-management/users-database.js
departments: {
    'IT': { name: 'IT Department', members: [] },
    'Marketing': { name: 'Marketing', members: [] },
    'Finance': { name: 'Finance', members: [] },
    'HR': { name: 'HR', members: [] }
}
```

## 🔧 **Development Setup**

### **For Development Work**
1. Use a local web server to avoid CORS issues
2. Enable browser developer tools
3. Check console for debug information
4. Use the test accounts for different role testing

### **File Editing**
- **HTML**: Core application structure in `core/`
- **CSS**: Styles organized in `src/styles/`
- **JavaScript**: Components in `src/components/` and modules in `modules/`

### **Adding New Features**
1. Create new files in appropriate directories
2. Update imports in main HTML files
3. Follow the existing naming conventions
4. Test with different user roles

## 📱 **Mobile Testing**

### **Responsive Design Testing**
1. Open browser developer tools
2. Toggle device simulation
3. Test various screen sizes
4. Verify touch interactions work properly

### **PWA Installation Testing**
1. Open the app in Chrome/Edge
2. Look for install prompt in address bar
3. Test offline functionality (when implemented)
4. Verify app icon and splash screen

## 🐛 **Troubleshooting**

### **Common Issues**

**Login Not Working**
- Check browser console for errors
- Verify test account credentials
- Clear browser cache and localStorage

**Files Not Loading**
- Use a local web server instead of file:// protocol
- Check file paths are correct after organization
- Verify all files were moved to correct directories

**Styles Not Applied**
- Check CSS file paths in HTML
- Verify stylesheets are in `src/styles/` directory
- Clear browser cache

**JavaScript Errors**
- Check browser console for specific errors
- Verify all script files are properly linked
- Ensure modules are in correct directories

### **Debug Mode**
Enable debug logging by opening browser console and running:
```javascript
localStorage.setItem('debug', 'true');
```

## 🔄 **Data Management**

### **Resetting Data**
To reset all application data:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

### **Backing Up Data**
```javascript
// Export all data
const backup = {
    users: localStorage.getItem('agp_users'),
    applicants: localStorage.getItem('applicantsData'),
    activities: localStorage.getItem('agp_activities')
};
console.log(JSON.stringify(backup));
```

### **Importing Data**
```javascript
// Restore from backup
const backup = /* your backup data */;
Object.keys(backup).forEach(key => {
    if (backup[key]) localStorage.setItem(key, backup[key]);
});
location.reload();
```

## 🚀 **Deployment**

### **For Production Use**
1. Upload all files to web server
2. Ensure proper file permissions
3. Configure HTTPS for security
4. Set up proper domain/subdomain
5. Test all functionality in production environment

### **Security Considerations**
- Use HTTPS in production
- Implement proper session management
- Add server-side validation
- Consider database integration for production use

## 📞 **Getting Help**

If you encounter issues:
1. Check this setup guide
2. Review the main README.md
3. Check browser console for errors
4. Test with different browsers
5. Verify file organization is correct

---

**🎉 You're ready to use the AG&P Attendance System!**
