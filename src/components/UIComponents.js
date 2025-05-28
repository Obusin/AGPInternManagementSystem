/**
 * AG&P Attendance System - Enhanced UI Components Library
 * Modern, reusable UI components with animations and interactions
 */

class UIComponents {
    constructor() {
        this.toasts = [];
        this.modals = new Map();
        this.tooltips = new Map();
        this.init();
    }

    init() {
        this.createToastContainer();
        this.setupGlobalEventListeners();
        this.initializeAnimations();
    }

    /**
     * Toast Notifications
     */
    createToastContainer() {
        if (document.getElementById('toast-container')) return;
        
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.innerHTML = `
            <style>
                .toast-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: var(--z-toast);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    pointer-events: none;
                }
                
                .toast {
                    background: var(--glass-bg);
                    backdrop-filter: var(--glass-backdrop);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-lg);
                    padding: 16px 20px;
                    min-width: 300px;
                    max-width: 400px;
                    box-shadow: var(--shadow-lg);
                    transform: translateX(100%);
                    transition: all var(--transition-normal);
                    pointer-events: auto;
                    position: relative;
                    overflow: hidden;
                }
                
                .toast.show {
                    transform: translateX(0);
                }
                
                .toast::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 4px;
                    height: 100%;
                    background: var(--primary-gradient);
                }
                
                .toast.success::before {
                    background: var(--success-gradient);
                }
                
                .toast.warning::before {
                    background: var(--warning-gradient);
                }
                
                .toast.error::before {
                    background: var(--danger-gradient);
                }
                
                .toast-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                
                .toast-icon {
                    font-size: 20px;
                    margin-top: 2px;
                    flex-shrink: 0;
                }
                
                .toast-message {
                    flex: 1;
                }
                
                .toast-title {
                    font-weight: 600;
                    color: var(--light-text);
                    margin-bottom: 4px;
                }
                
                .toast-text {
                    font-size: var(--font-sm);
                    color: var(--muted-text);
                    line-height: 1.4;
                }
                
                .toast-close {
                    background: none;
                    border: none;
                    color: var(--muted-text);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all var(--transition-fast);
                }
                
                .toast-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--light-text);
                }
                
                @media (max-width: 768px) {
                    .toast-container {
                        top: 10px;
                        right: 10px;
                        left: 10px;
                    }
                    
                    .toast {
                        min-width: auto;
                        max-width: none;
                    }
                }
            </style>
        `;
        
        document.body.appendChild(container);
    }

    showToast(message, type = 'info', title = '', duration = 5000) {
        const toast = document.createElement('div');
        const toastId = `toast-${Date.now()}`;
        toast.id = toastId;
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="toast-icon ${icons[type] || icons.info}"></i>
                <div class="toast-message">
                    ${title ? `<div class="toast-title">${title}</div>` : ''}
                    <div class="toast-text">${message}</div>
                </div>
                <button class="toast-close" onclick="uiComponents.hideToast('${toastId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto-hide
        if (duration > 0) {
            setTimeout(() => this.hideToast(toastId), duration);
        }
        
        this.toasts.push({ id: toastId, element: toast });
        return toastId;
    }

    hideToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
                this.toasts = this.toasts.filter(t => t.id !== toastId);
            }, 300);
        }
    }

    /**
     * Modern Modal System
     */
    createModal(id, options = {}) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal-modern';
        
        const {
            title = 'Modal',
            content = '',
            size = 'medium',
            closable = true,
            backdrop = true
        } = options;
        
        modal.innerHTML = `
            <div class="modal-content-modern modal-${size}">
                <div class="modal-header-modern">
                    <h3 class="modal-title-modern">${title}</h3>
                    ${closable ? `
                        <button class="modal-close-modern" onclick="uiComponents.hideModal('${id}')">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
                <div class="modal-body-modern">
                    ${content}
                </div>
            </div>
        `;
        
        // Add styles
        if (!document.getElementById('modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'modal-styles';
            styles.textContent = `
                .modal-header-modern {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: var(--space-xl);
                    padding-bottom: var(--space-lg);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .modal-title-modern {
                    font-size: var(--font-xl);
                    font-weight: 600;
                    color: var(--light-text);
                    margin: 0;
                }
                
                .modal-close-modern {
                    background: none;
                    border: none;
                    color: var(--muted-text);
                    font-size: 20px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: var(--radius-md);
                    transition: all var(--transition-fast);
                }
                
                .modal-close-modern:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--light-text);
                }
                
                .modal-body-modern {
                    color: var(--muted-text);
                    line-height: 1.6;
                }
                
                .modal-small .modal-content-modern {
                    max-width: 400px;
                }
                
                .modal-medium .modal-content-modern {
                    max-width: 600px;
                }
                
                .modal-large .modal-content-modern {
                    max-width: 800px;
                }
                
                .modal-full .modal-content-modern {
                    max-width: 95vw;
                    max-height: 95vh;
                }
            `;
            document.head.appendChild(styles);
        }
        
        if (backdrop) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(id);
                }
            });
        }
        
        document.body.appendChild(modal);
        this.modals.set(id, { element: modal, options });
        
        return modal;
    }

    showModal(id, options = {}) {
        let modal = document.getElementById(id);
        
        if (!modal) {
            modal = this.createModal(id, options);
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus management
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    hideModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            setTimeout(() => {
                if (this.modals.has(id)) {
                    modal.remove();
                    this.modals.delete(id);
                }
            }, 300);
        }
    }

    /**
     * Loading States
     */
    showLoading(containerId, message = 'Loading...') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            </div>
            <style>
                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: var(--z-modal);
                    border-radius: inherit;
                }
                
                .loading-content {
                    text-align: center;
                    color: var(--light-text);
                }
                
                .loading-message {
                    margin-top: var(--space-md);
                    font-size: var(--font-sm);
                    color: var(--muted-text);
                }
            </style>
        `;
        
        container.style.position = 'relative';
        container.appendChild(loader);
    }

    hideLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            const loader = container.querySelector('.loading-overlay');
            if (loader) {
                loader.remove();
            }
        }
    }

    /**
     * Enhanced Animations
     */
    animateElement(element, animation, duration = 600) {
        return new Promise((resolve) => {
            element.style.animation = `${animation} ${duration}ms ease-out`;
            
            const handleAnimationEnd = () => {
                element.style.animation = '';
                element.removeEventListener('animationend', handleAnimationEnd);
                resolve();
            };
            
            element.addEventListener('animationend', handleAnimationEnd);
        });
    }

    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease-out`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    }

    slideIn(element, direction = 'up', duration = 400) {
        const transforms = {
            up: 'translateY(20px)',
            down: 'translateY(-20px)',
            left: 'translateX(20px)',
            right: 'translateX(-20px)'
        };
        
        element.style.transform = transforms[direction];
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        
        setTimeout(() => {
            element.style.transform = 'translate(0)';
            element.style.opacity = '1';
        }, 10);
    }

    /**
     * Intersection Observer for Animations
     */
    initializeAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animation = element.dataset.animation || 'fadeInUp';
                    const delay = parseInt(element.dataset.delay) || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animate-' + animation);
                    }, delay);
                    
                    observer.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe elements with animation data attributes
        document.querySelectorAll('[data-animation]').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Enhanced Form Validation
     */
    validateForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;
        
        let isValid = true;
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const isFieldValid = this.validateField(input);
            if (!isFieldValid) isValid = false;
        });
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        // Remove existing error states
        this.clearFieldError(field);
        
        // Required validation
        if (required && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        // Type-specific validation
        if (value) {
            switch (type) {
                case 'email':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        this.showFieldError(field, 'Please enter a valid email address');
                        return false;
                    }
                    break;
                    
                case 'password':
                    if (value.length < 6) {
                        this.showFieldError(field, 'Password must be at least 6 characters');
                        return false;
                    }
                    break;
                    
                case 'tel':
                    if (!/^\+?[\d\s\-\(\)]+$/.test(value)) {
                        this.showFieldError(field, 'Please enter a valid phone number');
                        return false;
                    }
                    break;
            }
        }
        
        return true;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--danger-color);
            font-size: var(--font-xs);
            margin-top: var(--space-xs);
            animation: fadeInUp 0.3s ease-out;
        `;
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Global Event Listeners
     */
    setupGlobalEventListeners() {
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal-modern.active');
                if (activeModal) {
                    this.hideModal(activeModal.id);
                }
            }
        });
        
        // Auto-initialize tooltips
        document.addEventListener('mouseover', (e) => {
            if (e.target.hasAttribute('data-tooltip')) {
                this.showTooltip(e.target);
            }
        });
        
        // Form validation on submit
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.hasAttribute('data-validate')) {
                e.preventDefault();
                if (this.validateForm(form.id)) {
                    // Form is valid, proceed with submission
                    form.dispatchEvent(new CustomEvent('validSubmit'));
                }
            }
        });
        
        // Real-time field validation
        document.addEventListener('blur', (e) => {
            if (e.target.matches('input, select, textarea')) {
                this.validateField(e.target);
            }
        }, true);
    }

    /**
     * Utility Methods
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    formatDate(date, format = 'short') {
        const options = {
            short: { month: 'short', day: 'numeric', year: 'numeric' },
            long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            datetime: { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        };
        
        return new Intl.DateTimeFormat('en-US', options[format]).format(new Date(date));
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Failed to copy to clipboard', 'error');
        });
    }
}

// Create global instance
window.uiComponents = new UIComponents();
