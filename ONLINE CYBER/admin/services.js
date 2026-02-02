// Cyber Services Management Module
class ServicesModule {
    constructor() {
        this.services = [];
        this.filteredServices = [];
        this.servicesListener = null;
        this.init();
    }

    init() {
        // Load services section when activated
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('servicesSection')) {
                this.setupServicesSection();
            }
        });
    }

    setupServicesSection() {
        const servicesSection = document.getElementById('servicesSection');
        if (!servicesSection) return;

        servicesSection.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-concierge-bell"></i> Cyber Services Management</h2>
                <div class="table-controls">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="searchServices" placeholder="Search services...">
                    </div>
                    <select class="filter-select" id="filterCategory">
                        <option value="all">All Categories</option>
                        <option value="security">Security</option>
                        <option value="development">Development</option>
                        <option value="network">Network</option>
                        <option value="consulting">Consulting</option>
                        <option value="other">Other</option>
                    </select>
                    <select class="filter-select" id="filterStatus">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button class="logout-btn" onclick="showAddServiceModal()" style="background-color: var(--kenya-green);">
                        <i class="fas fa-plus-circle"></i> Add Service
                    </button>
                </div>
            </div>
            
            <div class="dashboard-stats" style="margin-top: 0;">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon">
                            <i class="fas fa-concierge-bell"></i>
                        </div>
                        <div class="stat-title">Total Services</div>
                    </div>
                    <div class="stat-value" id="totalServices">0</div>
                    <div class="stat-trend">
                        <span id="activeServices">0</span> active
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background-color: var(--kenya-red);">
                            <i class="fas fa-fire"></i>
                        </div>
                        <div class="stat-title">Most Popular</div>
                    </div>
                    <div class="stat-value" id="mostPopular">-</div>
                    <div class="stat-trend">
                        <span id="popularCount">0</span> requests
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background-color: #0081C8;">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <div class="stat-title">Avg. Price</div>
                    </div>
                    <div class="stat-value" id="avgPrice">KES 0</div>
                    <div class="stat-trend">
                        Per service
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background-color: var(--kenya-green);">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-title">Revenue</div>
                    </div>
                    <div class="stat-value" id="servicesRevenue">KES 0</div>
                    <div class="stat-trend">
                        This month
                    </div>
                </div>
            </div>
            
            <div class="data-table-container">
                <div class="table-header">
                    <h3>All Cyber Services</h3>
                    <div class="table-stats">
                        <span>Showing <strong id="showingCount">0</strong> of <strong id="totalCount">0</strong> services</span>
                    </div>
                </div>
                
                <div class="table-wrapper">
                    <table class="data-table" id="servicesTable">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Price Range</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Popularity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="servicesTableBody">
                            ${UtilsModule.createLoadingElement('Loading cyber services...')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.loadServices();
        this.loadAddServiceForm();
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchServices');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterServices());
        }

        // Filter selects
        document.getElementById('filterCategory')?.addEventListener('change', () => this.filterServices());
        document.getElementById('filterStatus')?.addEventListener('change', () => this.filterServices());
    }

    async loadServices() {
        showLoader();
        
        try {
            // Set up real-time listener for services
            this.servicesListener = collections.cyberServices
                .orderBy('createdAt', 'desc')
                .onSnapshot(async (snapshot) => {
                    this.services = [];
                    
                    const servicePromises = snapshot.docs.map(async (doc) => {
                        const data = doc.data();
                        const service = {
                            id: doc.id,
                            ...data
                        };
                        
                        // Get request count for this service
                        const requestsSnapshot = await collections.serviceRequests
                            .where('serviceId', '==', service.serviceId)
                            .get();
                        
                        service.requestCount = requestsSnapshot.size;
                        
                        // Get completed requests count
                        const completedSnapshot = await collections.serviceRequests
                            .where('serviceId', '==', service.serviceId)
                            .where('status', '==', 'completed')
                            .get();
                        
                        service.completedCount = completedSnapshot.size;
                        
                        return service;
                    });
                    
                    // Wait for all data to load
                    this.services = await Promise.all(servicePromises);
                    
                    this.filterServices();
                    this.updateDashboardStats();
                    
                    hideLoader();
                    
                    if (this.services.length > 0) {
                        showToast(`Loaded ${this.services.length} cyber services`, 'success');
                    }
                    
                }, (error) => {
                    console.error('Error loading services:', error);
                    showToast('Error loading services: ' + error.message, 'error');
                    hideLoader();
                });
                
        } catch (error) {
            console.error('Error setting up listener:', error);
            showToast('Error loading services', 'error');
            hideLoader();
        }
    }

    filterServices() {
        const searchTerm = document.getElementById('searchServices')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('filterCategory')?.value || 'all';
        const statusFilter = document.getElementById('filterStatus')?.value || 'all';
        
        this.filteredServices = this.services.filter(service => {
            // Filter by category
            if (categoryFilter !== 'all' && service.category !== categoryFilter) {
                return false;
            }
            
            // Filter by status
            if (statusFilter !== 'all' && service.status !== statusFilter) {
                return false;
            }
            
            // Filter by search term
            if (searchTerm) {
                const searchFields = [
                    service.name || '',
                    service.description || '',
                    service.category || '',
                    service.tags?.join(' ') || ''
                ].join(' ').toLowerCase();
                
                if (!searchFields.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.displayServices();
        this.updateTableStats();
    }

    displayServices() {
        const tableBody = document.getElementById('servicesTableBody');
        if (!tableBody) return;
        
        if (this.filteredServices.length === 0) {
            tableBody.innerHTML = UtilsModule.createNoDataElement('No services found matching your filters');
            return;
        }
        
        tableBody.innerHTML = this.filteredServices.map(service => {
            // Get service icon
            const serviceIcon = getServiceIcon(service.name);
            
            // Get status badge
            let statusClass = 'employee-active';
            let statusText = 'Active';
            
            if (service.status === 'inactive') {
                statusClass = 'employee-inactive';
                statusText = 'Inactive';
            }
            
            // Get popularity indicator
            let popularityClass = 'urgency-normal';
            let popularityText = 'Low';
            
            if (service.requestCount > 20) {
                popularityClass = 'urgency-urgent';
                popularityText = 'High';
            } else if (service.requestCount > 10) {
                popularityClass = 'urgency-high';
                popularityText = 'Medium';
            }
            
            // Format price range
            const minPrice = service.minPrice || 0;
            const maxPrice = service.maxPrice || minPrice;
            let priceRange = formatCurrency(minPrice);
            if (maxPrice > minPrice) {
                priceRange += ' - ' + formatCurrency(maxPrice);
            }
            
            return `
                <tr>
                    <td>
                        <div class="service-info">
                            <div class="service-icon">
                                <i class="${serviceIcon}"></i>
                            </div>
                            <div class="service-details">
                                <h4>${service.name || 'Unnamed Service'}</h4>
                                <p>ID: ${service.serviceId || 'N/A'}</p>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge" style="background-color: #e3f2fd; color: #1976d2;">
                            ${service.category || 'Uncategorized'}
                        </span>
                    </td>
                    <td>
                        <p style="margin: 0; line-height: 1.4; font-size: 0.9rem;">
                            ${service.description ? 
                                (service.description.length > 100 ? 
                                    service.description.substring(0, 100) + '...' : 
                                    service.description) : 
                                'No description'}
                        </p>
                    </td>
                    <td>
                        <strong>${priceRange}</strong>
                    </td>
                    <td>
                        ${service.duration || 'N/A'}
                    </td>
                    <td>
                        <span class="employee-status ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="urgency-badge ${popularityClass}">
                                ${popularityText}
                            </span>
                            <small>(${service.requestCount || 0})</small>
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn-small view" onclick="viewServiceDetails('${service.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn-small edit" onclick="editService('${service.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn-small delete" onclick="deleteService('${service.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="action-btn-small" onclick="viewServiceRequests('${service.serviceId}')"
                                    style="background-color: var(--kenya-green); color: white;">
                                <i class="fas fa-list"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateTableStats() {
        const showingCount = document.getElementById('showingCount');
        const totalCount = document.getElementById('totalCount');
        
        if (showingCount) showingCount.textContent = this.filteredServices.length;
        if (totalCount) totalCount.textContent = this.services.length;
    }

    updateDashboardStats() {
        const totalServices = this.services.length;
        const activeServices = this.services.filter(s => s.status === 'active').length;
        
        // Find most popular service
        let mostPopular = '-';
        let popularCount = 0;
        let totalRevenue = 0;
        let totalPrice = 0;
        
        this.services.forEach(service => {
            if (service.requestCount > popularCount) {
                popularCount = service.requestCount;
                mostPopular = service.name;
            }
            
            // Calculate total revenue (simplified)
            const avgPrice = ((service.minPrice || 0) + (service.maxPrice || service.minPrice || 0)) / 2;
            totalRevenue += avgPrice * (service.requestCount || 0);
            totalPrice += avgPrice;
        });
        
        const avgPrice = this.services.length > 0 ? totalPrice / this.services.length : 0;
        
        // Update UI elements
        document.getElementById('totalServices').textContent = totalServices;
        document.getElementById('activeServices').textContent = activeServices;
        document.getElementById('mostPopular').textContent = mostPopular.length > 10 ? 
            mostPopular.substring(0, 10) + '...' : mostPopular;
        document.getElementById('popularCount').textContent = popularCount;
        document.getElementById('avgPrice').textContent = formatCurrency(avgPrice);
        document.getElementById('servicesRevenue').textContent = formatCurrency(totalRevenue);
    }

    loadAddServiceForm() {
        const formContainer = document.getElementById('addServiceForm');
        if (!formContainer) return;
        
        formContainer.innerHTML = `
            <form id="serviceForm" onsubmit="event.preventDefault(); addService();">
                <div class="form-row">
                    <div class="form-group">
                        <label for="serviceName">Service Name *</label>
                        <input type="text" id="serviceName" class="form-control" required 
                               placeholder="e.g., Network Security Audit">
                    </div>
                    
                    <div class="form-group">
                        <label for="serviceId">Service ID *</label>
                        <input type="text" id="serviceId" class="form-control" required 
                               placeholder="e.g., NSEC-001" 
                               pattern="[A-Z0-9-]+" 
                               title="Use uppercase letters, numbers, and hyphens only">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="category">Category *</label>
                        <select id="category" class="form-control" required>
                            <option value="">Select Category</option>
                            <option value="security">Security</option>
                            <option value="development">Development</option>
                            <option value="network">Network</option>
                            <option value="consulting">Consulting</option>
                            <option value="support">Support</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="status">Status *</label>
                        <select id="status" class="form-control" required>
                            <option value="active" selected>Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="description">Description *</label>
                    <textarea id="description" class="form-control" rows="3" required 
                              placeholder="Describe the service in detail..."></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="minPrice">Minimum Price (KES) *</label>
                        <input type="number" id="minPrice" class="form-control" required 
                               min="0" step="100" placeholder="0">
                    </div>
                    
                    <div class="form-group">
                        <label for="maxPrice">Maximum Price (KES)</label>
                        <input type="number" id="maxPrice" class="form-control" 
                               min="0" step="100" placeholder="Leave empty for fixed price">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="duration">Estimated Duration</label>
                        <input type="text" id="duration" class="form-control" 
                               placeholder="e.g., 3-5 days, 2 weeks">
                    </div>
                    
                    <div class="form-group">
                        <label for="complexity">Complexity Level</label>
                        <select id="complexity" class="form-control">
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="tags">Tags (comma separated)</label>
                    <input type="text" id="tags" class="form-control" 
                           placeholder="e.g., security, audit, network, firewall">
                    <small>Use tags to make services easier to find</small>
                </div>
                
                <div class="form-group">
                    <label for="requirements">Client Requirements</label>
                    <textarea id="requirements" class="form-control" rows="2" 
                              placeholder="What does the client need to provide?"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="deliverables">Deliverables</label>
                    <textarea id="deliverables" class="form-control" rows="2" 
                              placeholder="What will the client receive?"></textarea>
                </div>
                
                <button type="submit" class="submit-btn">
                    <i class="fas fa-plus-circle"></i> Add Cyber Service
                </button>
            </form>
        `;
    }

    async addService() {
        // Get form values
        const name = document.getElementById('serviceName').value.trim();
        const serviceId = document.getElementById('serviceId').value.trim().toUpperCase();
        const category = document.getElementById('category').value;
        const status = document.getElementById('status').value;
        const description = document.getElementById('description').value.trim();
        const minPrice = parseFloat(document.getElementById('minPrice').value);
        const maxPrice = document.getElementById('maxPrice').value ? 
            parseFloat(document.getElementById('maxPrice').value) : minPrice;
        const duration = document.getElementById('duration').value.trim();
        const complexity = document.getElementById('complexity').value;
        const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const requirements = document.getElementById('requirements').value.trim();
        const deliverables = document.getElementById('deliverables').value.trim();
        
        // Validation
        if (!name || !serviceId || !category || !description || isNaN(minPrice)) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }
        
        if (minPrice < 0) {
            showToast('Minimum price cannot be negative', 'warning');
            return;
        }
        
        if (maxPrice < minPrice) {
            showToast('Maximum price cannot be less than minimum price', 'warning');
            return;
        }
        
        // Check if service ID already exists
        const existingService = this.services.find(s => s.serviceId === serviceId);
        if (existingService) {
            showToast('Service ID already exists. Please use a different ID.', 'warning');
            return;
        }
        
        showLoader();
        
        try {
            const serviceData = {
                serviceId: serviceId,
                name: name,
                category: category,
                status: status,
                description: description,
                minPrice: minPrice,
                maxPrice: maxPrice,
                duration: duration || 'Not specified',
                complexity: complexity,
                tags: tags,
                requirements: requirements,
                deliverables: deliverables,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: getUserId(),
                isActive: true
            };
            
            // Add service to Firebase
            await collections.cyberServices.add(serviceData);
            
            showToast(`Service "${name}" added successfully!`, 'success');
            utilsModule.logActivity('service', `Added new cyber service: ${name}`);
            
            // Close modal and reset form
            closeModal('addServiceModal');
            document.getElementById('serviceForm').reset();
            
        } catch (error) {
            console.error('Error adding service:', error);
            showToast('Error adding service: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async viewServiceDetails(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;
        
        // Get service requests
        showLoader();
        
        try {
            const requestsSnapshot = await collections.serviceRequests
                .where('serviceId', '==', service.serviceId)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            const requests = [];
            requestsSnapshot.forEach(doc => {
                requests.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            const content = document.getElementById('updateStatusContent');
            content.innerHTML = this.createServiceDetailsHTML(service, requests);
            
            showModal('updateStatusModal');
            
        } catch (error) {
            console.error('Error loading service details:', error);
            showToast('Error loading service details', 'error');
        } finally {
            hideLoader();
        }
    }

    createServiceDetailsHTML(service, requests) {
        const serviceIcon = getServiceIcon(service.name);
        const dateAdded = formatDate(service.createdAt, false);
        
        // Format price range
        const priceRange = service.minPrice === service.maxPrice ? 
            formatCurrency(service.minPrice) : 
            `${formatCurrency(service.minPrice)} - ${formatCurrency(service.maxPrice)}`;
        
        let statusClass = 'employee-active';
        let statusText = 'Active';
        
        if (service.status === 'inactive') {
            statusClass = 'employee-inactive';
            statusText = 'Inactive';
        }
        
        // Format tags
        const tagsHTML = service.tags && service.tags.length > 0 ? 
            service.tags.map(tag => `
                <span style="display: inline-block; background-color: #e3f2fd; color: #1976d2; 
                             padding: 4px 8px; border-radius: 15px; font-size: 0.8rem; margin: 2px;">
                    ${tag}
                </span>
            `).join('') : 'No tags';
        
        return `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background-color: var(--kenya-green); 
                     color: white; display: flex; align-items: center; justify-content: center; 
                     font-size: 2rem; margin: 0 auto 15px;">
                    <i class="${serviceIcon}"></i>
                </div>
                <h3 style="color: var(--kenya-black); margin-bottom: 5px;">${service.name}</h3>
                <p style="color: #666;">${service.serviceId} • ${service.category}</p>
                <span class="employee-status ${statusClass}" style="margin-top: 10px;">
                    ${statusText}
                </span>
            </div>
            
            <div class="request-details-grid">
                <div class="detail-group">
                    <label>Price Range</label>
                    <div class="detail-value">
                        <strong style="color: var(--kenya-green); font-size: 1.2rem;">
                            ${priceRange}
                        </strong>
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Estimated Duration</label>
                    <div class="detail-value">${service.duration || 'Not specified'}</div>
                </div>
                
                <div class="detail-group">
                    <label>Complexity</label>
                    <div class="detail-value">
                        <span class="status-badge" style="background-color: ${this.getComplexityColor(service.complexity)};">
                            ${service.complexity || 'Medium'}
                        </span>
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Date Added</label>
                    <div class="detail-value">${dateAdded}</div>
                </div>
                
                <div class="detail-group">
                    <label>Total Requests</label>
                    <div class="detail-value">
                        <strong style="font-size: 1.2rem;">${service.requestCount || 0}</strong>
                        <small style="color: #666;"> (${service.completedCount || 0} completed)</small>
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Estimated Revenue</label>
                    <div class="detail-value">
                        <strong style="color: var(--kenya-green);">
                            ${formatCurrency((service.minPrice + service.maxPrice) / 2 * (service.requestCount || 0))}
                        </strong>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <h4 style="color: var(--kenya-black); margin-bottom: 10px;">
                    <i class="fas fa-tags"></i> Tags
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                    ${tagsHTML}
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <h4 style="color: var(--kenya-black); margin-bottom: 10px;">
                    <i class="fas fa-align-left"></i> Description
                </h4>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <p style="line-height: 1.6; white-space: pre-wrap;">${service.description}</p>
                </div>
            </div>
            
            ${service.requirements ? `
            <div style="margin-top: 20px;">
                <h4 style="color: var(--kenya-black); margin-bottom: 10px;">
                    <i class="fas fa-clipboard-list"></i> Client Requirements
                </h4>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <p style="line-height: 1.6; white-space: pre-wrap;">${service.requirements}</p>
                </div>
            </div>
            ` : ''}
            
            ${service.deliverables ? `
            <div style="margin-top: 20px;">
                <h4 style="color: var(--kenya-black); margin-bottom: 10px;">
                    <i class="fas fa-box-open"></i> Deliverables
                </h4>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <p style="line-height: 1.6; white-space: pre-wrap;">${service.deliverables}</p>
                </div>
            </div>
            ` : ''}
            
            ${requests.length > 0 ? `
            <div style="margin-top: 20px;">
                <h4 style="color: var(--kenya-black); margin-bottom: 10px;">
                    <i class="fas fa-history"></i> Recent Requests
                </h4>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; max-height: 200px; overflow-y: auto;">
                    ${requests.map(req => `
                        <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${req.clientName || 'Anonymous'}</strong><br>
                                <small>${formatDate(req.createdAt, true)}</small>
                            </div>
                            <span class="status-badge ${req.status === 'completed' ? 'status-completed' : 'status-processing'}">
                                ${req.status}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div style="display: flex; gap: 15px; margin-top: 30px;">
                <button class="logout-btn" onclick="editService('${service.id}')" 
                        style="background-color: #0081C8;">
                    <i class="fas fa-edit"></i> Edit Service
                </button>
                <button class="logout-btn" onclick="viewServiceRequests('${service.serviceId}')" 
                        style="background-color: var(--kenya-green);">
                    <i class="fas fa-list"></i> View All Requests
                </button>
                <button class="logout-btn" onclick="deleteService('${service.id}')" 
                        style="background-color: var(--kenya-red);">
                    <i class="fas fa-trash"></i> Delete Service
                </button>
            </div>
        `;
    }

    getComplexityColor(complexity) {
        switch(complexity) {
            case 'low': return '#d4edda';
            case 'medium': return '#fff3cd';
            case 'high': return '#f8d7da';
            case 'expert': return '#cce5ff';
            default: return '#e2e3e5';
        }
    }

    async editService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;
        
        const content = document.getElementById('updateStatusContent');
        content.innerHTML = this.createEditServiceForm(service);
        
        showModal('updateStatusModal');
    }

    createEditServiceForm(service) {
        // Format tags as comma-separated string
        const tagsString = service.tags ? service.tags.join(', ') : '';
        
        return `
            <form id="editServiceForm" onsubmit="event.preventDefault(); updateService('${service.id}');">
                <div class="form-row">
                    <div class="form-group">
                        <label for="editName">Service Name *</label>
                        <input type="text" id="editName" class="form-control" required 
                               value="${service.name || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="editServiceId">Service ID *</label>
                        <input type="text" id="editServiceId" class="form-control" required 
                               value="${service.serviceId || ''}" readonly
                               style="background-color: #f5f5f5;">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editCategory">Category *</label>
                        <select id="editCategory" class="form-control" required>
                            <option value="security" ${service.category === 'security' ? 'selected' : ''}>Security</option>
                            <option value="development" ${service.category === 'development' ? 'selected' : ''}>Development</option>
                            <option value="network" ${service.category === 'network' ? 'selected' : ''}>Network</option>
                            <option value="consulting" ${service.category === 'consulting' ? 'selected' : ''}>Consulting</option>
                            <option value="support" ${service.category === 'support' ? 'selected' : ''}>Support</option>
                            <option value="other" ${service.category === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="editStatus">Status *</label>
                        <select id="editStatus" class="form-control" required>
                            <option value="active" ${service.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${service.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editDescription">Description *</label>
                    <textarea id="editDescription" class="form-control" rows="3" required>${service.description || ''}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editMinPrice">Minimum Price (KES) *</label>
                        <input type="number" id="editMinPrice" class="form-control" required 
                               min="0" step="100" value="${service.minPrice || 0}">
                    </div>
                    
                    <div class="form-group">
                        <label for="editMaxPrice">Maximum Price (KES)</label>
                        <input type="number" id="editMaxPrice" class="form-control" 
                               min="0" step="100" value="${service.maxPrice || service.minPrice || ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editDuration">Estimated Duration</label>
                        <input type="text" id="editDuration" class="form-control" 
                               value="${service.duration || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="editComplexity">Complexity Level</label>
                        <select id="editComplexity" class="form-control">
                            <option value="low" ${service.complexity === 'low' ? 'selected' : ''}>Low</option>
                            <option value="medium" ${service.complexity === 'medium' ? 'selected' : ''}>Medium</option>
                            <option value="high" ${service.complexity === 'high' ? 'selected' : ''}>High</option>
                            <option value="expert" ${service.complexity === 'expert' ? 'selected' : ''}>Expert</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editTags">Tags (comma separated)</label>
                    <input type="text" id="editTags" class="form-control" 
                           value="${tagsString}">
                </div>
                
                <div class="form-group">
                    <label for="editRequirements">Client Requirements</label>
                    <textarea id="editRequirements" class="form-control" rows="2">${service.requirements || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="editDeliverables">Deliverables</label>
                    <textarea id="editDeliverables" class="form-control" rows="2">${service.deliverables || ''}</textarea>
                </div>
                
                <button type="submit" class="submit-btn">
                    <i class="fas fa-save"></i> Update Service
                </button>
            </form>
        `;
    }

    async updateService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;
        
        // Get form values
        const name = document.getElementById('editName').value.trim();
        const category = document.getElementById('editCategory').value;
        const status = document.getElementById('editStatus').value;
        const description = document.getElementById('editDescription').value.trim();
        const minPrice = parseFloat(document.getElementById('editMinPrice').value);
        const maxPrice = document.getElementById('editMaxPrice').value ? 
            parseFloat(document.getElementById('editMaxPrice').value) : minPrice;
        const duration = document.getElementById('editDuration').value.trim();
        const complexity = document.getElementById('editComplexity').value;
        const tags = document.getElementById('editTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const requirements = document.getElementById('editRequirements').value.trim();
        const deliverables = document.getElementById('editDeliverables').value.trim();
        
        // Validation
        if (!name || !category || !description || isNaN(minPrice)) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }
        
        if (minPrice < 0) {
            showToast('Minimum price cannot be negative', 'warning');
            return;
        }
        
        if (maxPrice < minPrice) {
            showToast('Maximum price cannot be less than minimum price', 'warning');
            return;
        }
        
        showLoader();
        
        try {
            const updateData = {
                name: name,
                category: category,
                status: status,
                description: description,
                minPrice: minPrice,
                maxPrice: maxPrice,
                duration: duration || 'Not specified',
                complexity: complexity,
                tags: tags,
                requirements: requirements,
                deliverables: deliverables,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: getUserId()
            };
            
            await collections.cyberServices.doc(serviceId).update(updateData);
            
            showToast(`Service "${name}" updated successfully!`, 'success');
            utilsModule.logActivity('update', `Updated cyber service: ${name}`);
            
            closeModal('updateStatusModal');
            
        } catch (error) {
            console.error('Error updating service:', error);
            showToast('Error updating service: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async deleteService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;
        
        // Check if service has requests
        if (service.requestCount > 0) {
            if (!confirm(`This service has ${service.requestCount} requests. Deleting it may affect those requests. Are you sure you want to delete?`)) {
                return;
            }
        } else {
            if (!confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) {
                return;
            }
        }
        
        showLoader();
        
        try {
            // Instead of deleting, mark as inactive
            await collections.cyberServices.doc(serviceId).update({
                status: 'inactive',
                isActive: false,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            showToast(`Service "${service.name}" marked as inactive`, 'success');
            utilsModule.logActivity('delete', `Deleted cyber service: ${service.name}`);
            
            // Close modal if open
            closeModal('updateStatusModal');
            
        } catch (error) {
            console.error('Error deleting service:', error);
            showToast('Error deleting service: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async viewServiceRequests(serviceId) {
        // Redirect to requests section with filter
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        const requestsNav = document.querySelector('.nav-item[data-section="requests"]');
        if (requestsNav) {
            requestsNav.classList.add('active');
        }
        
        // Show requests section
        const contentSections = document.querySelectorAll('.content-section');
        contentSections.forEach(section => section.classList.remove('active'));
        
        const requestsSection = document.getElementById('requestsSection');
        if (requestsSection) {
            requestsSection.classList.add('active');
            requestsSection.innerHTML = UtilsModule.createLoadingElement('Loading requests for service...');
            
            // Load requests for this service
            this.loadServiceRequests(serviceId);
        }
        
        closeModal('updateStatusModal');
    }

    async loadServiceRequests(serviceId) {
        showLoader();
        
        try {
            const requestsSnapshot = await collections.serviceRequests
                .where('serviceId', '==', serviceId)
                .orderBy('createdAt', 'desc')
                .get();
            
            const requests = [];
            requestsSnapshot.forEach(doc => {
                requests.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            const service = this.services.find(s => s.serviceId === serviceId);
            
            const requestsSection = document.getElementById('requestsSection');
            if (requestsSection) {
                requestsSection.innerHTML = this.createServiceRequestsView(service, requests);
            }
            
        } catch (error) {
            console.error('Error loading service requests:', error);
            showToast('Error loading requests: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    createServiceRequestsView(service, requests) {
        return `
            <div class="section-header">
                <h2><i class="fas fa-list"></i> Requests for ${service?.name || 'Service'}</h2>
                <button class="logout-btn" onclick="loadRequestsSection()" style="background-color: var(--kenya-green);">
                    <i class="fas fa-arrow-left"></i> Back to All Requests
                </button>
            </div>
            
            <div class="data-table-container">
                <div class="table-header">
                    <h3>${requests.length} Request${requests.length !== 1 ? 's' : ''} Found</h3>
                    <div class="table-stats">
                        <span>Service ID: <strong>${service?.serviceId || 'N/A'}</strong></span>
                    </div>
                </div>
                
                <div class="table-wrapper">
                    ${requests.length === 0 ? 
                        UtilsModule.createNoDataElement('No requests found for this service') :
                        this.createServiceRequestsTable(requests)
                    }
                </div>
            </div>
        `;
    }

    createServiceRequestsTable(requests) {
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Cost</th>
                        <th>Urgency</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${requests.map(request => {
                        let statusClass = 'status-pending';
                        let statusText = 'Pending';
                        
                        switch(request.status) {
                            case 'processing':
                                statusClass = 'status-processing';
                                statusText = 'In Progress';
                                break;
                            case 'completed':
                                statusClass = 'status-completed';
                                statusText = 'Completed';
                                break;
                            case 'cancelled':
                                statusClass = 'status-cancelled';
                                statusText = 'Cancelled';
                                break;
                        }
                        
                        let urgencyClass = 'urgency-normal';
                        let urgencyText = 'Normal';
                        
                        switch(request.urgency) {
                            case 'high':
                                urgencyClass = 'urgency-high';
                                urgencyText = 'High';
                                break;
                            case 'urgent':
                                urgencyClass = 'urgency-urgent';
                                urgencyText = 'Urgent';
                                break;
                        }
                        
                        return `
                            <tr>
                                <td>
                                    <strong>${request.clientName || 'Anonymous'}</strong><br>
                                    <small>${request.clientEmail || 'No email'}</small>
                                </td>
                                <td>${formatDate(request.createdAt, false)}</td>
                                <td>${formatCurrency(request.cost)}</td>
                                <td>
                                    <span class="urgency-badge ${urgencyClass}">
                                        ${urgencyText}
                                    </span>
                                </td>
                                <td>
                                    <span class="status-badge ${statusClass}">
                                        ${statusText}
                                    </span>
                                </td>
                                <td>
                                    ${request.assignedTo ? 'Assigned' : 'Not Assigned'}
                                </td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="action-btn-small view" onclick="viewRequestDetails('${request.id}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }
}

// Initialize Services Module
const servicesModule = new ServicesModule();

// Global functions for button clicks
function viewServiceDetails(serviceId) {
    servicesModule.viewServiceDetails(serviceId);
}

function editService(serviceId) {
    servicesModule.editService(serviceId);
}

function deleteService(serviceId) {
    servicesModule.deleteService(serviceId);
}

function viewServiceRequests(serviceId) {
    servicesModule.viewServiceRequests(serviceId);
}

function addService() {
    servicesModule.addService();
}

function updateService(serviceId) {
    servicesModule.updateService(serviceId);
}

// Load services section when navigated to
function loadServicesSection() {
    servicesModule.setupServicesSection();
}