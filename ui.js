// UI Module
const UI = {
    // DOM Elements
    elements: {
        mobileMenuBtn: document.getElementById('mobileMenuBtn'),
        navLinks: document.getElementById('navLinks'),
        userAuth: document.getElementById('userAuth'),
        authModal: document.getElementById('authModal'),
        loginPrompt: document.getElementById('loginPrompt'),
        govServicesGrid: document.getElementById('govServicesGrid'),
        cyberServicesGrid: document.getElementById('cyberServicesGrid'),
        partnersGrid: document.getElementById('partnersGrid'),
        loginForm: null,
        registerForm: null,
        serviceRequestForm: null,
        dashboardModal: null,
        serviceRequestModal: null
    },

    // Selected service for request
    selectedService: null,

    // Initialize UI
    init() {
        this.renderCyberServices();
        this.renderGovernmentServices();
        this.renderPartners();
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners() {
        // Mobile menu
        this.elements.mobileMenuBtn?.addEventListener('click', () => {
            this.elements.navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.elements.navLinks.contains(e.target) && 
                !this.elements.mobileMenuBtn.contains(e.target)) {
                this.elements.navLinks.classList.remove('active');
            }
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    this.elements.navLinks.classList.remove('active');
                }
            });
        });
    },

    // Render cyber services
    renderCyberServices() {
        if (!this.elements.cyberServicesGrid) return;

        const servicesHTML = Services.cyberServices.map(service => `
            <div class="service-card" data-service="${service.id}">
                <div class="service-image">
                    <img src="${service.image}" alt="${service.name}">
                </div>
                <div class="service-content">
                    <div class="service-icon">
                        <i class="fas ${service.icon}"></i>
                    </div>
                    <h3>${service.name}</h3>
                    <p>${service.description}</p>
                    <div class="service-price">${service.price}</div>
                </div>
            </div>
        `).join('');

        this.elements.cyberServicesGrid.innerHTML = servicesHTML;
    },

    // Render government services
    renderGovernmentServices() {
        if (!this.elements.govServicesGrid) return;

        const servicesHTML = Services.governmentServices.map(service => `
            <div class="gov-service-card locked" data-service="${service.id}">
                <div class="gov-service-icon">
                    <i class="fas ${service.icon}"></i>
                </div>
                <div class="gov-service-content">
                    <h4>${service.name}</h4>
                    <p>${service.description}</p>
                    <div class="service-price-tag">${service.price}</div>
                </div>
            </div>
        `).join('');

        this.elements.govServicesGrid.innerHTML = servicesHTML;

        // Add click handlers to service cards
        this.elements.govServicesGrid.querySelectorAll('.gov-service-card').forEach(card => {
            card.addEventListener('click', () => {
                const serviceId = card.getAttribute('data-service');
                if (card.classList.contains('locked')) {
                    this.openAuthModal(true);
                } else {
                    this.handleServiceCardClick(serviceId);
                }
            });
        });
    },

    // Render partners
    renderPartners() {
        if (!this.elements.partnersGrid) return;

        const partnersHTML = Services.partners.map(partner => `
            <div class="partner-logo">
                <img src="${partner.logo}" alt="${partner.alt}">
            </div>
        `).join('');

        this.elements.partnersGrid.innerHTML = partnersHTML;
    },

    // Update UI for logged in user
    updateUIForLoggedInUser(user) {
        // Update header
        const displayName = Auth.getDisplayName();
        this.elements.userAuth.innerHTML = `
            <div class="user-profile" id="userProfile">
                <div class="user-avatar">${displayName.charAt(0).toUpperCase()}</div>
                <span>${displayName}</span>
                <div class="user-dropdown" id="userDropdown">
                    <a href="#" id="viewDashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                    <a href="#" id="viewProfile"><i class="fas fa-user"></i> Profile</a>
                    <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </div>
            </div>
        `;

        // Update login prompt
        this.elements.loginPrompt.innerHTML = `
            <h3><i class="fas fa-check-circle"></i> Welcome back, ${displayName}!</h3>
            <p>You are now logged in and can access all government services below.</p>
            <div>
                <button class="btn-primary" id="viewDashboardBtn"><i class="fas fa-tachometer-alt"></i> View Dashboard</button>
            </div>
        `;

        // Unlock services
        this.elements.govServicesGrid.querySelectorAll('.gov-service-card.locked').forEach(card => {
            card.classList.remove('locked');
        });

        // Add event listeners for new elements
        setTimeout(() => {
            document.getElementById('userProfile')?.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('userDropdown')?.classList.toggle('active');
            });

            document.getElementById('viewDashboard')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.openDashboardModal();
            });

            document.getElementById('viewDashboardBtn')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.openDashboardModal();
            });

            document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.user-profile')) {
                    document.getElementById('userDropdown')?.classList.remove('active');
                }
            });
        }, 100);
    },

    // Update UI for logged out user
    updateUIForLoggedOutUser() {
        // Update header
        this.elements.userAuth.innerHTML = `
            <a href="#" class="login-btn" id="openLoginModal"><i class="fas fa-sign-in-alt"></i> Login</a>
            <a href="#" class="register-btn" id="openRegisterModal"><i class="fas fa-user-plus"></i> Register</a>
        `;

        // Update login prompt
        this.elements.loginPrompt.innerHTML = `
            <h3><i class="fas fa-lock"></i> Login Required</h3>
            <p>You need to login or register to access these government services. Create an account to get started with KRA, NTSA, HELB, TSC and many more services.</p>
            <div>
                <button class="btn-primary" id="promptLoginBtn"><i class="fas fa-sign-in-alt"></i> Login to Access Services</button>
                <button class="btn-secondary" id="promptRegisterBtn"><i class="fas fa-user-plus"></i> Register Now</button>
            </div>
        `;

        // Lock services
        this.elements.govServicesGrid.querySelectorAll('.gov-service-card:not(.locked)').forEach(card => {
            card.classList.add('locked');
        });

        // Add event listeners
        setTimeout(() => {
            document.getElementById('openLoginModal')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAuthModal(true);
            });

            document.getElementById('openRegisterModal')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.openAuthModal(false);
            });

            document.getElementById('promptLoginBtn')?.addEventListener('click', () => {
                this.openAuthModal(true);
            });

            document.getElementById('promptRegisterBtn')?.addEventListener('click', () => {
                this.openAuthModal(false);
            });
        }, 100);
    },

    // Handle service card click
    handleServiceCardClick(serviceId) {
        const service = Services.getServiceById(serviceId);
        if (!service) return;

        this.selectedService = service;
        this.openServiceRequestModal();
    },

    // Open authentication modal
    openAuthModal(isLogin = true) {
        this.renderAuthModal(isLogin);
        this.elements.authModal.style.display = 'flex';
    },

    // Open service request modal
    openServiceRequestModal() {
        if (!this.selectedService) return;
        this.renderServiceRequestModal();
        this.elements.serviceRequestModal.style.display = 'flex';
    },

    // Open dashboard modal
    async openDashboardModal() {
        this.renderDashboardModal();
        await this.loadDashboardData();
        this.elements.dashboardModal.style.display = 'flex';
    },

    // Load dashboard data
    async loadDashboardData() {
        if (!Auth.isLoggedIn()) return;

        try {
            const stats = await Services.getServiceRequestStats(Auth.getUserId());
            const requests = await Services.getUserServiceRequests(Auth.getUserId());

            // Update stats
            document.getElementById('totalRequests').textContent = stats.total;
            document.getElementById('pendingRequests').textContent = stats.pending;
            document.getElementById('completedRequests').textContent = stats.completed;
            document.getElementById('totalSpent').textContent = `KES ${stats.totalSpent}`;

            // Update requests list
            this.updateServiceRequestsList(requests);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        }
    },

    // Update service requests list
    updateServiceRequestsList(requests) {
        const requestsList = document.getElementById('serviceRequestsList');
        
        if (requests.length === 0) {
            requestsList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                    <p>No service requests yet</p>
                </div>
            `;
            return;
        }

        const requestsHTML = requests.map(request => `
            <div class="request-item">
                <div class="request-info">
                    <h4>${request.serviceName}</h4>
                    <p>${request.details.substring(0, 100)}${request.details.length > 100 ? '...' : ''}</p>
                    <small>Requested: ${new Date(request.createdAt?.toDate()).toLocaleDateString()}</small>
                </div>
                <div class="request-status status-${request.status}">
                    ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
            </div>
        `).join('');

        requestsList.innerHTML = requestsHTML;
    },

    // Render authentication modal
    renderAuthModal(isLogin) {
        this.elements.authModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <button class="close-modal" id="closeModal">&times;</button>
                    <h2 id="modalTitle">${isLogin ? 'Login to Your Account' : 'Create New Account'}</h2>
                    <p>${isLogin ? 'Access government services and manage your account' : 'Create an account to access all government services'}</p>
                </div>
                <div class="modal-body">
                    <form id="loginForm" ${isLogin ? '' : 'style="display: none;"'}>
                        <div class="form-group">
                            <label for="loginEmail">Email Address</label>
                            <input type="email" id="loginEmail" placeholder="Enter your email" required>
                            <div class="form-error" id="loginEmailError"></div>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" placeholder="Enter your password" required>
                            <div class="form-error" id="loginPasswordError"></div>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%;" id="loginSubmitBtn">
                            <span id="loginBtnText">Login</span>
                            <div id="loginSpinner" style="display: none;">Loading...</div>
                        </button>
                        <div class="form-toggle">
                            Don't have an account? <a href="#" id="switchToRegister">Register here</a>
                        </div>
                    </form>
                    
                    <form id="registerForm" ${isLogin ? 'style="display: none;"' : ''}>
                        <div class="form-group">
                            <label for="registerName">Full Name</label>
                            <input type="text" id="registerName" placeholder="Enter your full name" required>
                            <div class="form-error" id="registerNameError"></div>
                        </div>
                        <div class="form-group">
                            <label for="registerEmail">Email Address</label>
                            <input type="email" id="registerEmail" placeholder="Enter your email" required>
                            <div class="form-error" id="registerEmailError"></div>
                        </div>
                        <div class="form-group">
                            <label for="registerPhone">Phone Number</label>
                            <input type="tel" id="registerPhone" placeholder="07XXXXXXXX" required>
                            <div class="form-error" id="registerPhoneError"></div>
                        </div>
                        <div class="form-group">
                            <label for="registerPassword">Password</label>
                            <input type="password" id="registerPassword" placeholder="Create a password (min. 6 characters)" required>
                            <div class="form-error" id="registerPasswordError"></div>
                        </div>
                        <div class="form-group">
                            <label for="registerConfirmPassword">Confirm Password</label>
                            <input type="password" id="registerConfirmPassword" placeholder="Confirm your password" required>
                            <div class="form-error" id="registerConfirmPasswordError"></div>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%;" id="registerSubmitBtn">
                            <span id="registerBtnText">Create Account</span>
                            <div id="registerSpinner" style="display: none;">Loading...</div>
                        </button>
                        <div class="form-toggle">
                            Already have an account? <a href="#" id="switchToLogin">Login here</a>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add event listeners
        this.setupAuthModalListeners(isLogin);
    },

    // Render service request modal
    renderServiceRequestModal() {
        if (!this.selectedService) return;

        this.elements.serviceRequestModal = document.getElementById('serviceRequestModal') || 
            this.createModal('serviceRequestModal');

        this.elements.serviceRequestModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <button class="close-modal" id="closeServiceModal">&times;</button>
                    <h2 id="serviceModalTitle">Request: ${this.selectedService.name}</h2>
                    <p id="serviceModalSubtitle">${this.selectedService.description}</p>
                </div>
                <div class="modal-body">
                    <form id="serviceRequestForm">
                        <div class="form-group">
                            <label>Service</label>
                            <input type="text" id="serviceName" value="${this.selectedService.name}" readonly>
                        </div>
                        <div class="form-group">
                            <label for="serviceDetails">Service Details</label>
                            <textarea id="serviceDetails" placeholder="Provide details about the service you need (e.g., 'I need to register a new KRA PIN', 'I lost my NSSF card')" required></textarea>
                            <div class="form-error" id="serviceDetailsError"></div>
                        </div>
                        <div class="form-group">
                            <label for="urgency">Urgency Level</label>
                            <select id="urgency" required>
                                <option value="">Select urgency</option>
                                <option value="normal">Normal (24-48 hours)</option>
                                <option value="urgent">Urgent (Same day)</option>
                                <option value="emergency">Emergency (Within 4 hours)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Estimated Cost</label>
                            <input type="text" id="serviceCost" value="${this.selectedService.price}" readonly>
                        </div>
                        <button type="submit" class="btn-primary" style="width: 100%;" id="serviceRequestSubmitBtn">
                            <span id="serviceRequestBtnText">Submit Request</span>
                            <div id="serviceRequestSpinner" style="display: none;">Processing...</div>
                        </button>
                    </form>
                </div>
            </div>
        `;

        this.setupServiceRequestModalListeners();
    },

    // Render dashboard modal
    renderDashboardModal() {
        this.elements.dashboardModal = document.getElementById('dashboardModal') || 
            this.createModal('dashboardModal');

        this.elements.dashboardModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <button class="close-modal" id="closeDashboardModal">&times;</button>
                    <h2>My Dashboard</h2>
                    <p>Manage your service requests and account</p>
                </div>
                <div class="modal-body">
                    <div class="dashboard-header">
                        <div class="dashboard-welcome">
                            <h3 id="dashboardWelcome">Welcome back!</h3>
                            <p id="dashboardEmail"></p>
                        </div>
                        <button class="btn-primary" id="newServiceRequestBtn">
                            <i class="fas fa-plus"></i> New Service Request
                        </button>
                    </div>
                    
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <div class="stat-number" id="totalRequests">0</div>
                            <div class="stat-label">Total Requests</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="pendingRequests">0</div>
                            <div class="stat-label">Pending</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="completedRequests">0</div>
                            <div class="stat-label">Completed</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number" id="totalSpent">KES 0</div>
                            <div class="stat-label">Total Spent</div>
                        </div>
                    </div>
                    
                    <h3 style="margin-bottom: 20px;">Recent Service Requests</h3>
                    <div class="service-requests" id="serviceRequestsList">
                        <div style="text-align: center; padding: 40px; color: #666;">
                            <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                            <p>No service requests yet</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupDashboardModalListeners();
    },

    // Create modal element
    createModal(id) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = id === 'dashboardModal' ? 'modal dashboard-modal' : 'modal';
        document.body.appendChild(modal);
        return modal;
    },

    // Setup auth modal listeners
    setupAuthModalListeners(isLogin) {
        const modal = this.elements.authModal;

        // Close modal
        modal.querySelector('#closeModal')?.addEventListener('click', () => this.closeModal(modal));

        // Form switching
        modal.querySelector('#switchToRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.renderAuthModal(false);
        });

        modal.querySelector('#switchToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.renderAuthModal(true);
        });

        // Form submissions
        modal.querySelector('#loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        modal.querySelector('#registerForm')?.addEventListener('submit', (e) => this.handleRegister(e));

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    },

    // Setup service request modal listeners
    setupServiceRequestModalListeners() {
        const modal = this.elements.serviceRequestModal;

        modal.querySelector('#closeServiceModal')?.addEventListener('click', () => {
            this.closeModal(modal);
            this.selectedService = null;
        });

        modal.querySelector('#serviceRequestForm')?.addEventListener('submit', (e) => this.handleServiceRequest(e));

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
                this.selectedService = null;
            }
        });
    },

    // Setup dashboard modal listeners
    setupDashboardModalListeners() {
        const modal = this.elements.dashboardModal;

        modal.querySelector('#closeDashboardModal')?.addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#newServiceRequestBtn')?.addEventListener('click', () => {
            this.closeModal(modal);
            this.openServiceRequestModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    },

    // Handle login
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = document.getElementById('loginSubmitBtn');
        const btnText = document.getElementById('loginBtnText');
        const spinner = document.getElementById('loginSpinner');
        
        // Clear previous errors
        this.clearFormErrors('login');
        
        // Validation
        if (!email) {
            this.showError('loginEmailError', 'Email is required');
            return;
        }
        
        if (!password) {
            this.showError('loginPasswordError', 'Password is required');
            return;
        }
        
        // Show loading
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
        
        try {
            const result = await Auth.login(email, password);
            if (result.success) {
                this.closeModal(this.elements.authModal);
                this.showNotification('Login successful!', 'success');
            } else {
                this.showError('loginPasswordError', result.error);
            }
        } catch (error) {
            this.showError('loginPasswordError', 'An error occurred during login');
        } finally {
            // Hide loading
            btnText.style.display = 'block';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    },

    // Handle registration
    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const submitBtn = document.getElementById('registerSubmitBtn');
        const btnText = document.getElementById('registerBtnText');
        const spinner = document.getElementById('registerSpinner');
        
        // Clear previous errors
        this.clearFormErrors('register');
        
        // Validation
        let isValid = true;
        
        if (!name) {
            this.showError('registerNameError', 'Full name is required');
            isValid = false;
        }
        
        if (!email) {
            this.showError('registerEmailError', 'Email is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            this.showError('registerEmailError', 'Invalid email address');
            isValid = false;
        }
        
        if (!phone) {
            this.showError('registerPhoneError', 'Phone number is required');
            isValid = false;
        } else if (!/^07\d{8}$/.test(phone)) {
            this.showError('registerPhoneError', 'Please enter a valid Kenyan phone number (07XXXXXXXX)');
            isValid = false;
        }
        
        if (!password) {
            this.showError('registerPasswordError', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showError('registerPasswordError', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (!confirmPassword) {
            this.showError('registerConfirmPasswordError', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            this.showError('registerConfirmPasswordError', 'Passwords do not match');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
        
        try {
            const result = await Auth.register(name, email, phone, password);
            if (result.success) {
                this.closeModal(this.elements.authModal);
                this.showNotification('Registration successful! Welcome to Imarisha Technologies.', 'success');
            } else {
                this.showError('registerEmailError', result.error);
            }
        } catch (error) {
            this.showError('registerEmailError', 'An error occurred during registration');
        } finally {
            // Hide loading
            btnText.style.display = 'block';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    },

    // Handle service request
    async handleServiceRequest(e) {
        e.preventDefault();
        
        if (!Auth.isLoggedIn() || !this.selectedService) {
            this.showNotification('Please login to submit service requests', 'error');
            return;
        }
        
        const details = document.getElementById('serviceDetails').value;
        const urgency = document.getElementById('urgency').value;
        const submitBtn = document.getElementById('serviceRequestSubmitBtn');
        const btnText = document.getElementById('serviceRequestBtnText');
        const spinner = document.getElementById('serviceRequestSpinner');
        
        // Clear previous errors
        this.clearFormErrors('service');
        
        // Validation
        if (!details) {
            this.showError('serviceDetailsError', 'Please provide service details');
            return;
        }
        
        if (!urgency) {
            this.showNotification('Please select urgency level', 'error');
            return;
        }
        
        // Show loading
        btnText.style.display = 'none';
        spinner.style.display = 'block';
        submitBtn.disabled = true;
        
        try {
            await Services.submitServiceRequest(this.selectedService.id, details, urgency);
            
            this.closeModal(this.elements.serviceRequestModal);
            this.showNotification('Service request submitted successfully! We will contact you shortly.', 'success');
            
            // Reset form
            document.getElementById('serviceRequestForm')?.reset();
            this.selectedService = null;
            
            // Refresh dashboard if open
            if (this.elements.dashboardModal?.style.display === 'flex') {
                await this.loadDashboardData();
            }
            
        } catch (error) {
            console.error('Service request error:', error);
            this.showNotification('Failed to submit service request. Please try again.', 'error');
        } finally {
            // Hide loading
            btnText.style.display = 'block';
            spinner.style.display = 'none';
            submitBtn.disabled = false;
        }
    },

    // Handle logout
    async handleLogout() {
        try {
            const result = await Auth.logout();
            if (result.success) {
                this.showNotification('Logged out successfully', 'success');
                document.getElementById('userDropdown')?.classList.remove('active');
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.showNotification('Error logging out', 'error');
        }
    },

    // Close modal
    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // Clear form errors
    clearFormErrors(formType) {
        const errorElements = document.querySelectorAll(`[id$="${formType}Error"]`);
        errorElements.forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
    },

    // Show form error
    showError(elementId, message) {
        const errorEl = document.getElementById(elementId);
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    },

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Add close functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
};