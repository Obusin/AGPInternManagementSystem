# 🏢 AG&P Attendance Tracking System

A comprehensive, modern web-based attendance tracking system designed for intern management with role-based access control, real-time monitoring, and advanced reporting capabilities.

## ✨ Features

### 🔐 **Authentication & Security**
- Email-based login system
- Role-based access control (User, Admin, Developer)
- Session management with automatic timeout
- Secure user registration with document upload

### 📊 **Dashboard & Analytics**
- Real-time attendance statistics
- Interactive charts and visualizations
- Department-based activity tracking
- Performance metrics and insights

### 👥 **User Management**
- Comprehensive user profiles
- Department assignment and management
- Role management with custom permissions
- Bulk user operations

### 📱 **Modern UI/UX**
- Dark theme with modern design
- Fully responsive mobile interface
- Progressive Web App (PWA) support
- Touch-friendly interactions

### 📈 **Reporting System**
- Daily, weekly, and monthly reports
- PDF report generation with AG&P branding
- Activity logging and tracking
- Export capabilities (CSV, Excel, PDF)

### 🔧 **Developer Features**
- Intern management dashboard
- System administration tools
- Advanced user controls
- Debug and monitoring capabilities

## 🏗️ **Project Structure**

```
agp-attendance-system/
├── 📁 core/                          # Core application files
│   ├── index.html                    # Main application entry
│   ├── login.html                    # Authentication pages
│   ├── register.html
│   └── app-browser.js                # Main application logic
│
├── 📁 src/                           # Source code organization
│   ├── 📁 components/                # Reusable UI components
│   ├── 📁 services/                  # Business logic & API services
│   ├── 📁 utils/                     # Utility functions
│   └── 📁 styles/                    # Stylesheets
│
├── 📁 modules/                       # Feature modules
│   ├── 📁 user-management/           # User & role management
│   ├── 📁 intern-management/         # Intern-specific features
│   └── 📁 multi-site/                # Legacy multi-site support
│
├── 📁 assets/                        # Static assets
│   ├── 📁 images/                    # Images and graphics
│   └── 📁 icons/                     # Icons and small graphics
│
├── 📁 config/                        # Configuration files
│   ├── manifest.json                 # PWA manifest
│   └── sw.js                         # Service worker
│
├── 📁 docs/                          # Documentation
├── 📁 tests/                         # Testing files
└── 📁 archive/                       # Archived/legacy files
```

## 🚀 **Getting Started**

### **Prerequisites**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional for development)

### **Installation**
1. Clone or download the project files
2. Open `core/index.html` in your web browser
3. Use the test accounts to explore the system

### **Test Accounts**
| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Developer | devmark@agp.com | try465 | Full system access |
| Admin | adminmark@agp.com | try123 | User management |
| User | usermark@agp.com | try123 | Basic access |

## 🎯 **User Roles**

### **👨‍💻 Developer**
- Full system administration
- Intern management dashboard
- User role assignment
- System configuration
- Advanced reporting

### **👨‍💼 Admin**
- User management within assigned departments
- Applicant approval workflow
- Department-specific reporting
- User activity monitoring

### **👤 User (Intern)**
- Personal attendance tracking
- Activity logging
- Profile management
- Personal reports

## 📱 **Mobile Support**

The system is fully optimized for mobile devices with:
- Responsive design that adapts to all screen sizes
- Touch-friendly interface elements
- Mobile navigation with hamburger menu
- PWA support for app-like experience
- Offline capabilities (coming soon)

## 🔧 **Technical Details**

### **Frontend Technologies**
- Vanilla JavaScript (ES6+)
- Modern CSS with CSS Grid and Flexbox
- Font Awesome icons
- Chart.js for data visualization
- Progressive Web App features

### **Data Storage**
- LocalStorage for client-side data persistence
- JSON-based data structure
- Automatic data backup and sync

### **Browser Compatibility**
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📊 **Features Overview**

### **Attendance Tracking**
- Clock in/out functionality
- Barcode-based time tracking (planned)
- Real-time status monitoring
- Automatic time calculations

### **Activity Management**
- Daily activity logging
- Task assignment and tracking
- Progress monitoring
- Performance analytics

### **Document Management**
- Secure document upload
- Admin approval workflow
- Document versioning
- Digital signatures (planned)

## 🛠️ **Development**

### **File Organization**
The project follows a modular architecture:
- **Core files**: Essential application components
- **Modules**: Feature-specific functionality
- **Components**: Reusable UI elements
- **Services**: Business logic and data management

### **Adding New Features**
1. Create new modules in the `modules/` directory
2. Add reusable components to `src/components/`
3. Update routing in the main application
4. Add appropriate styling in `src/styles/`

## 📈 **Roadmap**

### **Phase 1: Foundation** ✅
- [x] Core attendance system
- [x] User authentication
- [x] Basic reporting
- [x] Mobile optimization

### **Phase 2: Enhancement** 🚧
- [ ] Barcode scanning integration
- [ ] Enhanced security features
- [ ] Advanced analytics
- [ ] Email notifications

### **Phase 3: Advanced** 📋
- [ ] Biometric integration
- [ ] API development
- [ ] Third-party integrations
- [ ] Advanced reporting

## 🤝 **Contributing**

1. Follow the established file organization
2. Maintain consistent coding style
3. Test thoroughly before submitting changes
4. Document new features and changes

## 📞 **Support**

For technical support or questions:
- Check the documentation in the `docs/` folder
- Review the test files in `tests/` for examples
- Contact the development team

---

**© 2024 AG&P Attendance System - Professional Intern Management Solution**
