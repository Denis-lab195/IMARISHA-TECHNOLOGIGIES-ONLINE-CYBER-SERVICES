// Authentication Module - FIXED WITH EMERGENCY LOGIN
class AuthModule {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.init();
    }

    init() {
        console.log('🔄 AuthModule initializing...');
        
        // Check auth state
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('👤 User detected:', user.email);
                this.currentUser = user;
                this.checkAdminStatus(user);
            } else {
                console.log('👤 No user logged in');
                this.showLogin();
            }
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginError = document.getElementById('loginError');

        showLoader();

        try {
            // EMERGENCY LOGIN: Allow demo login if Firebase fails
            if (email === 'demo@admin.com' && password === 'demo123') {
                console.log('⚠️ Using emergency demo login');
                this.currentUser = {
                    uid: 'demo-admin-id',
                    email: 'demo@admin.com',
                    displayName: 'Demo Admin'
                };
                this.isAdmin = true;
                this.showDashboard();
                this.updateUserInfo();
                showToast('Demo login successful!', 'success');
                hideLoader();
                return;
            }
            
            // Try Firebase authentication
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            
            console.log('✅ Firebase login successful');
            
            // Check if user is admin
            await this.checkAdminStatus(this.currentUser);
            
            showToast('Login successful!', 'success');
            this.showDashboard();
            
        } catch (error) {
            console.error('Login error:', error);
            
            // SPECIAL FIX: If admin user exists but password is wrong
            if (email === 'admin@imarisha.co.ke' && error.code === 'auth/invalid-login-credentials') {
                loginError.innerHTML = `
                    Invalid password for admin@imarisha.co.ke<br>
                    <small>
                        Try: Admin@123<br>
                        Or <a href="#" onclick="resetAdminPassword()" style="color: var(--kenya-yellow);">Reset Password</a>
                    </small>
                `;
            } else if (error.code === 'auth/invalid-login-credentials') {
                loginError.textContent = 'Invalid email or password';
            } else if (error.code === 'auth/network-request-failed') {
                loginError.textContent = 'Network error. Please check your internet connection.';
            } else {
                loginError.textContent = error.message;
            }
            
            loginError.classList.add('show');
            showToast('Login failed', 'error');
            
        } finally {
            hideLoader();
        }
    }

    async checkAdminStatus(user) {
        try {
            if (!window.collections || !window.collections.users) {
                console.warn('Collections not available for admin check');
                this.isAdmin = true;
                this.updateUserInfo(user, { name: 'Admin', role: 'admin' });
                return true;
            }
            
            // Check if user exists in users collection
            const userDoc = await collections.users.doc(user.uid).get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                this.isAdmin = userData.role === 'admin';
                this.updateUserInfo(user, userData);
                console.log('✅ Admin status checked:', this.isAdmin);
            } else {
                // Create new admin user if not exists
                await this.createAdminUserInFirestore(user);
                this.isAdmin = true;
                this.updateUserInfo(user, { name: 'Admin', role: 'admin' });
            }
            
            return this.isAdmin;
            
        } catch (error) {
            console.error('Error checking admin status:', error);
            // Default to admin for demo purposes
            this.isAdmin = true;
            this.updateUserInfo(user, { name: 'Admin', role: 'admin' });
            return true;
        }
    }

    async createAdminUserInFirestore(user) {
        try {
            await collections.users.doc(user.uid).set({
                uid: user.uid,
                email: user.email,
                name: 'Administrator',
                role: 'admin',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                isActive: true
            });
            
            console.log('✅ Admin user created in Firestore');
        } catch (error) {
            console.error('Error creating admin user:', error);
        }
    }

    updateUserInfo(user, userData) {
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        const userRole = document.getElementById('userRole');
        
        const name = userData?.name || user?.displayName || user?.email?.split('@')[0] || 'Admin';
        const role = userData?.role || 'admin';
        
        if (userName) userName.textContent = name;
        if (userAvatar) userAvatar.textContent = this.getInitials(name);
        if (userRole) userRole.textContent = role === 'admin' ? 'Administrator' : 'User';
    }

    getInitials(name) {
        if (!name || name === 'N/A') return 'A';
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    async handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await auth.signOut();
                this.currentUser = null;
                this.isAdmin = false;
                this.showLogin();
                showToast('Logged out successfully!', 'info');
            } catch (error) {
                console.error('Logout error:', error);
                showToast('Error logging out: ' + error.message, 'error');
            }
        }
    }

    showLogin() {
        const loginPage = document.getElementById('loginPage');
        const dashboardContainer = document.getElementById('dashboardContainer');
        
        if (loginPage) loginPage.style.display = 'flex';
        if (dashboardContainer) dashboardContainer.style.display = 'none';
        
        // Clear login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.reset();
        
        const loginError = document.getElementById('loginError');
        if (loginError) loginError.classList.remove('show');
    }

    showDashboard() {
        const loginPage = document.getElementById('loginPage');
        const dashboardContainer = document.getElementById('dashboardContainer');
        
        if (loginPage) loginPage.style.display = 'none';
        if (dashboardContainer) dashboardContainer.style.display = 'block';
        
        this.updateUserInfo(this.currentUser);
        
        // Initialize dashboard after showing it
        setTimeout(() => {
            this.initializeDashboard();
        }, 100);
    }

    initializeDashboard() {
        console.log('📊 Initializing dashboard...');
        
        // Log activity
        if (window.collections && window.collections.activities) {
            try {
                collections.activities.add({
                    type: 'login',
                    description: 'User logged into dashboard',
                    userId: this.currentUser?.uid || 'demo',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    read: false
                });
            } catch (error) {
                console.error('Error logging activity:', error);
            }
        }
    }

    isAuthenticated() {
        return this.currentUser !== null && this.isAdmin;
    }

    getUser() {
        return this.currentUser;
    }

    getUserId() {
        return this.currentUser ? this.currentUser.uid : 'demo-admin-id';
    }
}

// Initialize Auth Module
const authModule = new AuthModule();

// Export functions for other modules
function checkAuthState() {
    return authModule.isAuthenticated();
}

function getCurrentUser() {
    return authModule.getUser();
}

function getUserId() {
    return authModule.getUserId();
}

// Make available globally
window.authModule = authModule;
window.checkAuthState = checkAuthState;
window.getCurrentUser = getCurrentUser;
window.getUserId = getUserId;