// Utility Functions Module - COMPLETE
class UtilsModule {
    constructor() {
        this.activities = [];
        this.init();
    }

    init() {
        // Wait for collections to be available
        setTimeout(() => {
            if (!window.collections) {
                console.warn('Collections not available for UtilsModule');
                setTimeout(() => this.init(), 500);
                return;
            }
            
            console.log('✅ UtilsModule initialized');
            this.loadRecentActivities();
        }, 1000);
    }

    // Show loader
    static showLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.add('active');
        }
    }

    // Hide loader
    static hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.classList.remove('active');
        }
    }

    // Show toast notification
    static showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.className = `toast ${type} show`;
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // Format date
    static formatDate(date, includeTime = false) {
        if (!date) return 'N/A';
        
        try {
            const d = date.toDate ? date.toDate() : new Date(date);
            
            if (includeTime) {
                return d.toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else {
                return d.toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }
        } catch (e) {
            return 'Invalid Date';
        }
    }

    // Format currency
    static formatCurrency(amount) {
        if (!amount) return 'KES 0';
        
        const num = parseFloat(amount);
        if (isNaN(num)) return 'KES 0';
        
        return 'KES ' + num.toLocaleString('en-KE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Generate random ID
    static generateId(prefix = '') {
        return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get service icon
    static getServiceIcon(serviceName) {
        if (!serviceName) return 'fas fa-question';
        
        const service = serviceName.toLowerCase();
        
        if (service.includes('work permit') || service.includes('visa')) {
            return 'fas fa-passport';
        } else if (service.includes('kra') || service.includes('tax')) {
            return 'fas fa-file-invoice-dollar';
        } else if (service.includes('ntsa') || service.includes('license')) {
            return 'fas fa-car';
        } else if (service.includes('helb') || service.includes('loan')) {
            return 'fas fa-graduation-cap';
        } else if (service.includes('tsc') || service.includes('teacher')) {
            return 'fas fa-chalkboard-teacher';
        } else if (service.includes('passport')) {
            return 'fas fa-id-card';
        } else if (service.includes('business') || service.includes('company')) {
            return 'fas fa-briefcase';
        } else if (service.includes('cyber') || service.includes('security')) {
            return 'fas fa-shield-alt';
        } else if (service.includes('software') || service.includes('app')) {
            return 'fas fa-code';
        } else if (service.includes('website') || service.includes('web')) {
            return 'fas fa-globe';
        } else if (service.includes('network')) {
            return 'fas fa-network-wired';
        } else {
            return 'fas fa-concierge-bell';
        }
    }

    // Log activity
    async logActivity(type, description, userId = null) {
        try {
            if (!window.collections || !window.collections.activities) {
                console.warn('Collections not available for logging activity');
                return;
            }
            
            const activity = {
                type: type,
                description: description,
                userId: userId || getUserId(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            };
            
            await window.collections.activities.add(activity);
            
            // Update local activities list
            this.activities.unshift({
                ...activity,
                id: UtilsModule.generateId('act_')
            });
            
            // Update UI if needed
            this.updateActivityUI();
            
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    // Load recent activities
    async loadRecentActivities() {
        try {
            if (!window.collections || !window.collections.activities) {
                console.warn('Collections not available for loading activities');
                return;
            }
            
            const snapshot = await window.collections.activities
                .orderBy('timestamp', 'desc')
                .limit(10)
                .get();
            
            this.activities = [];
            snapshot.forEach(doc => {
                this.activities.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.updateActivityUI();
            
        } catch (error) {
            console.error('Error loading activities:', error);
        }
    }

    // Update activity UI - THIS WAS MISSING
    updateActivityUI() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        if (this.activities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="activity-details">
                        <p>No recent activities</p>
                        <span class="activity-time">Just now</span>
                    </div>
                </div>
            `;
            return;
        }
        
        activityList.innerHTML = this.activities.map(activity => {
            const icon = this.getActivityIcon(activity.type);
            const time = UtilsModule.formatDate(activity.timestamp, true);
            
            return `
                <div class="activity-item">
                    <div class="activity-icon" style="background-color: ${this.getActivityColor(activity.type)};">
                        <i class="${icon}"></i>
                    </div>
                    <div class="activity-details">
                        <p>${activity.description}</p>
                        <span class="activity-time">${time}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    getActivityIcon(type) {
        switch(type) {
            case 'login': return 'fas fa-sign-in-alt';
            case 'logout': return 'fas fa-sign-out-alt';
            case 'request': return 'fas fa-tasks';
            case 'assignment': return 'fas fa-clipboard-check';
            case 'employee': return 'fas fa-user-plus';
            case 'service': return 'fas fa-concierge-bell';
            case 'update': return 'fas fa-edit';
            case 'delete': return 'fas fa-trash';
            default: return 'fas fa-info-circle';
        }
    }

    getActivityColor(type) {
        switch(type) {
            case 'login': return '#4CAF50';
            case 'logout': return '#f44336';
            case 'request': return '#2196F3';
            case 'assignment': return '#FF9800';
            case 'employee': return '#9C27B0';
            case 'service': return '#00BCD4';
            case 'update': return '#FFC107';
            case 'delete': return '#E91E63';
            default: return '#607D8B';
        }
    }

    // Calculate percentage
    static calculatePercentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    }

    // Validate email
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validate phone
    static validatePhone(phone) {
        const re = /^[0-9+\-\s()]{10,}$/;
        return re.test(phone);
    }

    // Create loading element
    static createLoadingElement(text = 'Loading...') {
        return `
            <div class="no-data">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${text}</p>
            </div>
        `;
    }

    // Create no data element
    static createNoDataElement(message = 'No data available') {
        return `
            <div class="no-data">
                <i class="fas fa-inbox"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize Utils Module
const utilsModule = new UtilsModule();

// Export utility functions
function showLoader() {
    UtilsModule.showLoader();
}

function hideLoader() {
    UtilsModule.hideLoader();
}

function showToast(message, type) {
    UtilsModule.showToast(message, type);
}

function formatDate(date, includeTime) {
    return UtilsModule.formatDate(date, includeTime);
}

function formatCurrency(amount) {
    return UtilsModule.formatCurrency(amount);
}

function getServiceIcon(serviceName) {
    return UtilsModule.getServiceIcon(serviceName);
}

// Make available globally for other modules
window.utilsModule = utilsModule;
window.showLoader = showLoader;
window.hideLoader = hideLoader;
window.showToast = showToast;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.getServiceIcon = getServiceIcon;