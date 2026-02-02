// Admin Module
const Admin = {
    // Admin users (you can add more emails here)
    adminEmails: [
        'admin@imarishatech.co.ke',
        'info@imarishatech.co.ke',
        'your-email@gmail.com' // Add your email here
    ],

    // Current admin state
    isAdmin: false,
    adminData: null,

    // Initialize admin module
    async init() {
        const user = Auth.currentUser;
        if (!user) return;

        // Check if current user is admin
        this.isAdmin = this.adminEmails.includes(user.email);
        
        if (this.isAdmin) {
            console.log('🛡️ Admin access granted for:', user.email);
            await this.loadAdminData();
            this.setupAdminFeatures();
        }
    },

    // Load admin data
    async loadAdminData() {
        try {
            // Get all users
            const usersSnapshot = await Firebase.db.collection('users').get();
            const users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Get all service requests
            const requestsSnapshot = await Firebase.db.collection('serviceRequests').get();
            const requests = requestsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.adminData = {
                users: users,
                serviceRequests: requests,
                stats: this.calculateStats(users, requests),
                lastUpdated: new Date()
            };

            console.log('📊 Admin data loaded:', {
                totalUsers: users.length,
                totalRequests: requests.length
            });

        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    },

    // Calculate statistics
    calculateStats(users, requests) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const recentRequests = requests.filter(req => {
            const reqDate = req.createdAt?.toDate ? req.createdAt.toDate() : new Date(req.createdAt);
            return reqDate >= today;
        });

        return {
            totalUsers: users.length,
            totalRequests: requests.length,
            pendingRequests: requests.filter(r => r.status === 'pending').length,
            completedRequests: requests.filter(r => r.status === 'completed').length,
            todayRequests: recentRequests.length,
            revenue: this.calculateRevenue(requests),
            popularServices: this.getPopularServices(requests),
            activeHours: this.getActiveHours(requests)
        };
    },

    // Calculate total revenue
    calculateRevenue(requests) {
        return requests
            .filter(r => r.status === 'completed' && r.cost)
            .reduce((sum, r) => {
                const cost = parseInt(r.cost.replace(/[^\d]/g, '')) || 0;
                return sum + cost;
            }, 0);
    },

    // Get popular services
    getPopularServices(requests) {
        const serviceCount = {};
        requests.forEach(req => {
            const serviceName = req.serviceName || 'Unknown';
            serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
        });

        return Object.entries(serviceCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    },

    // Get active hours
    getActiveHours(requests) {
        const hours = Array(24).fill(0);
        
        requests.forEach(req => {
            if (req.createdAt) {
                const date = req.createdAt.toDate ? req.createdAt.toDate() : new Date(req.createdAt);
                const hour = date.getHours();
                hours[hour]++;
            }
        });

        return hours;
    },

    // Setup admin features
    setupAdminFeatures() {
        // Add admin button to user dropdown
        this.addAdminButton();
        
        // Listen for new service requests
        this.setupRealTimeListeners();
        
        // Log admin access
        this.logAdminAccess();
    },

    // Add admin button to UI
    addAdminButton() {
        // Wait for user dropdown to be created
        setTimeout(() => {
            const userDropdown = document.getElementById('userDropdown');
            if (userDropdown && this.isAdmin) {
                const adminLink = document.createElement('a');
                adminLink.href = '#';
                adminLink.id = 'adminPanelBtn';
                adminLink.innerHTML = '<i class="fas fa-crown"></i> Admin Panel';
                adminLink.style.color = '#FFD700'; // Gold color for admin
                
                // Insert before logout button
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    userDropdown.insertBefore(adminLink, logoutBtn);
                } else {
                    userDropdown.appendChild(adminLink);
                }

                // Add click event
                adminLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openAdminPanel();
                });
            }
        }, 1000);
    },

    // Open admin panel
    async openAdminPanel() {
        await this.loadAdminData();
        UI.renderAdminPanel(this.adminData);
    },

    // Setup real-time listeners
    setupRealTimeListeners() {
        // Listen for new service requests
        Firebase.db.collection('serviceRequests')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const newRequest = change.doc.data();
                        this.notifyNewRequest(newRequest);
                        this.updateAdminData(newRequest);
                    }
                });
            });

        // Listen for new users
        Firebase.db.collection('users')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const newUser = change.doc.data();
                        this.notifyNewUser(newUser);
                    }
                });
            });
    },

    // Notify about new service request
    notifyNewRequest(request) {
        if (this.isAdmin && document.visibilityState === 'visible') {
            const notification = document.createElement('div');
            notification.className = 'admin-notification';
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-bell" style="color: #FFD700;"></i>
                    <div>
                        <strong>New Service Request!</strong>
                        <p>${request.serviceName || 'Unknown Service'}</p>
                        <small>${request.details?.substring(0, 50)}...</small>
                    </div>
                </div>
                <button class="notification-close">&times;</button>
            `;

            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #1a1a3e 0%, #2d2d5e 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                border-left: 4px solid #FFD700;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                z-index: 9999;
                animation: slideInRight 0.3s ease;
            `;

            notification.querySelector('.notification-content').style.cssText = `
                display: flex;
                align-items: center;
                gap: 15px;
                margin-right: 15px;
            `;

            notification.querySelector('.notification-close').style.cssText = `
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 1.5rem;
            `;

            document.body.appendChild(notification);

            // Auto-remove after 10 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 10000);

            // Close button
            notification.querySelector('.notification-close').addEventListener('click', () => {
                notification.remove();
            });
        }
    },

    // Notify about new user
    notifyNewUser(user) {
        if (this.isAdmin && document.visibilityState === 'visible') {
            console.log('👤 New user registered:', user.email);
            // You can add a notification similar to newRequest if needed
        }
    },

    // Update admin data
    updateAdminData(newRequest) {
        if (this.adminData) {
            this.adminData.serviceRequests.unshift(newRequest);
            this.adminData.stats = this.calculateStats(
                this.adminData.users,
                this.adminData.serviceRequests
            );
        }
    },

    // Log admin access
    logAdminAccess() {
        const user = Auth.currentUser;
        if (user) {
            console.log(`🔐 Admin Panel Access - User: ${user.email}, Time: ${new Date().toLocaleString()}`);
            
            // Log to Firestore (optional)
            Firebase.db.collection('adminLogs').add({
                adminEmail: user.email,
                action: 'admin_panel_access',
                timestamp: Firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent
            }).catch(console.error);
        }
    },

    // Get user activity (recent logins)
    async getUserActivity(limit = 20) {
        try {
            const snapshot = await Firebase.db.collection('userActivity')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting user activity:', error);
            return [];
        }
    },

    // Export data (for reports)
    async exportData(type = 'all') {
        try {
            let data = {};
            
            if (type === 'users' || type === 'all') {
                const usersSnapshot = await Firebase.db.collection('users').get();
                data.users = usersSnapshot.docs.map(doc => doc.data());
            }
            
            if (type === 'requests' || type === 'all') {
                const requestsSnapshot = await Firebase.db.collection('serviceRequests').get();
                data.serviceRequests = requestsSnapshot.docs.map(doc => doc.data());
            }
            
            // Convert to JSON and download
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `imarisha-export-${type}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log(`✅ Data exported: ${type}`);
            return true;
            
        } catch (error) {
            console.error('Error exporting data:', error);
            return false;
        }
    },

    // Search functionality
    async search(query, type = 'all') {
        try {
            let results = {};
            
            if (type === 'users' || type === 'all') {
                const usersSnapshot = await Firebase.db.collection('users').get();
                results.users = usersSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => 
                        user.email?.toLowerCase().includes(query.toLowerCase()) ||
                        user.name?.toLowerCase().includes(query.toLowerCase()) ||
                        user.phone?.includes(query)
                    );
            }
            
            if (type === 'requests' || type === 'all') {
                const requestsSnapshot = await Firebase.db.collection('serviceRequests').get();
                results.serviceRequests = requestsSnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(req =>
                        req.serviceName?.toLowerCase().includes(query.toLowerCase()) ||
                        req.details?.toLowerCase().includes(query.toLowerCase()) ||
                        req.userId?.includes(query)
                    );
            }
            
            return results;
            
        } catch (error) {
            console.error('Error searching:', error);
            return { users: [], serviceRequests: [] };
        }
    }
};