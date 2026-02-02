// Service Requests Management Module - COMPLETE FIXED VERSION
class RequestsModule {
    constructor() {
        this.requests = [];
        this.filteredRequests = [];
        this.servicesList = [];
        this.requestsListener = null;
        this.currentRequestId = null; // Add this to fix the error
        this.init();
    }

    init() {
        // Load requests section when activated
        document.addEventListener('DOMContentLoaded', () => {
            // Check if we're on the requests section
            if (document.getElementById('requestsSection')) {
                this.setupRequestsSection();
            }
        });
    }

    setupRequestsSection() {
        const requestsSection = document.getElementById('requestsSection');
        if (!requestsSection) return;

        // Check if collections are available
        if (!window.collections) {
            console.warn('Collections not available, retrying...');
            setTimeout(() => this.setupRequestsSection(), 1000);
            return;
        }

        requestsSection.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-tasks"></i> Service Requests Management</h2>
                <div class="table-controls">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="searchRequests" placeholder="Search requests...">
                    </div>
                    <select class="filter-select" id="filterServiceType">
                        <option value="all">All Services</option>
                    </select>
                    <select class="filter-select" id="filterStatus">
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select class="filter-select" id="filterUrgency">
                        <option value="all">All Urgency</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                    <button class="logout-btn" onclick="refreshRequests()" style="background-color: var(--kenya-green);">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            </div>
            
            <div class="data-table-container">
                <div class="table-header">
                    <h3>All Service Requests</h3>
                    <div class="table-stats">
                        <span>Showing <strong id="showingCount">0</strong> of <strong id="totalCount">0</strong> requests</span>
                    </div>
                </div>
                
                <div class="table-wrapper">
                    <table class="data-table" id="requestsTable">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Client</th>
                                <th>Cost</th>
                                <th>Urgency</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="requestsTableBody">
                            ${window.UtilsModule ? window.UtilsModule.createLoadingElement('Loading service requests...') : 'Loading...'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.loadRequests();
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchRequests');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterRequests());
        }

        // Filter selects
        document.getElementById('filterServiceType')?.addEventListener('change', () => this.filterRequests());
        document.getElementById('filterStatus')?.addEventListener('change', () => this.filterRequests());
        document.getElementById('filterUrgency')?.addEventListener('change', () => this.filterRequests());
    }

    async loadRequests() {
        showLoader();
        
        try {
            // Set up real-time listener for service requests
            this.requestsListener = window.collections.serviceRequests
                .orderBy('createdAt', 'desc')
                .onSnapshot((snapshot) => {
                    this.requests = [];
                    const uniqueServices = new Set();
                    
                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        this.requests.push({
                            id: doc.id,
                            ...data
                        });
                        
                        // Collect unique service names
                        if (data.serviceName) {
                            uniqueServices.add(data.serviceName);
                        }
                    });
                    
                    // Update service filter dropdown
                    this.updateServiceFilter(Array.from(uniqueServices));
                    
                    // Initial filter and display
                    this.filterRequests();
                    
                    // Update dashboard stats
                    this.updateDashboardStats();
                    
                    hideLoader();
                    
                    if (this.requests.length > 0) {
                        showToast(`Loaded ${this.requests.length} service requests`, 'success');
                        if (window.utilsModule) {
                            window.utilsModule.logActivity('request', `Loaded ${this.requests.length} service requests`);
                        }
                    }
                    
                }, (error) => {
                    console.error('Error loading requests:', error);
                    showToast('Error loading requests: ' + error.message, 'error');
                    hideLoader();
                });
                
        } catch (error) {
            console.error('Error setting up listener:', error);
            showToast('Error loading requests', 'error');
            hideLoader();
        }
    }

    updateServiceFilter(services) {
        const filterSelect = document.getElementById('filterServiceType');
        if (!filterSelect) return;
        
        // Clear existing options except "All Services"
        while (filterSelect.options.length > 1) {
            filterSelect.remove(1);
        }
        
        // Add services to dropdown
        services.sort().forEach(service => {
            const option = document.createElement('option');
            option.value = service;
            option.textContent = service;
            filterSelect.appendChild(option);
        });
    }

    filterRequests() {
        const searchTerm = document.getElementById('searchRequests')?.value.toLowerCase() || '';
        const serviceType = document.getElementById('filterServiceType')?.value || 'all';
        const statusFilter = document.getElementById('filterStatus')?.value || 'all';
        const urgencyFilter = document.getElementById('filterUrgency')?.value || 'all';
        
        this.filteredRequests = this.requests.filter(request => {
            // Filter by service type
            if (serviceType !== 'all' && request.serviceName !== serviceType) {
                return false;
            }
            
            // Filter by status
            if (statusFilter !== 'all' && request.status !== statusFilter) {
                return false;
            }
            
            // Filter by urgency
            if (urgencyFilter !== 'all' && request.urgency !== urgencyFilter) {
                return false;
            }
            
            // Filter by search term
            if (searchTerm) {
                const searchFields = [
                    request.serviceName || '',
                    request.serviceId || '',
                    request.details || '',
                    request.cost || '',
                    request.clientName || '',
                    request.clientEmail || ''
                ].join(' ').toLowerCase();
                
                if (!searchFields.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.displayRequests();
        this.updateTableStats();
    }

    displayRequests() {
        const tableBody = document.getElementById('requestsTableBody');
        if (!tableBody) return;
        
        if (this.filteredRequests.length === 0) {
            tableBody.innerHTML = window.UtilsModule ? 
                window.UtilsModule.createNoDataElement('No service requests found matching your filters') :
                '<tr><td colspan="8">No requests found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = this.filteredRequests.map(request => {
            // Get status badge
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
            
            // Get urgency badge
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
            
            // Format date
            const dateFormatted = window.formatDate ? window.formatDate(request.createdAt) : 'N/A';
            
            // Get service icon
            const serviceIcon = window.getServiceIcon ? window.getServiceIcon(request.serviceName) : 'fas fa-question';
            
            return `
                <tr>
                    <td>
                        <div class="service-info">
                            <div class="service-icon">
                                <i class="${serviceIcon}"></i>
                            </div>
                            <div class="service-details">
                                <h4>${request.serviceName || 'Unknown Service'}</h4>
                                <p>${request.serviceId || 'No ID'}</p>
                            </div>
                        </div>
                    </td>
                    <td>
                        <strong>${request.clientName || 'N/A'}</strong><br>
                        <small>${request.clientEmail || 'No email'}</small>
                    </td>
                    <td>${window.formatCurrency ? window.formatCurrency(request.cost) : request.cost || 'KES 0'}</td>
                    <td>
                        <span class="urgency-badge ${urgencyClass}">
                            ${urgencyText}
                        </span>
                    </td>
                    <td>${dateFormatted}</td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        ${request.assignedTo ? 
                            `<span class="employee-status employee-active">Assigned</span>` : 
                            `<span class="employee-status employee-inactive">Not Assigned</span>`
                        }
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn-small view" onclick="viewRequestDetails('${request.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn-small assign" onclick="assignRequestToEmployee('${request.id}')">
                                <i class="fas fa-user-check"></i>
                            </button>
                            <button class="action-btn-small edit" onclick="showUpdateStatusForm('${request.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn-small delete" onclick="deleteRequest('${request.id}')">
                                <i class="fas fa-trash"></i>
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
        
        if (showingCount) showingCount.textContent = this.filteredRequests.length;
        if (totalCount) totalCount.textContent = this.requests.length;
    }

    updateDashboardStats() {
        const totalRequests = this.requests.length;
        const pendingRequests = this.requests.filter(req => req.status === 'pending').length;
        
        // Update UI elements
        const totalRequestsEl = document.getElementById('totalRequests');
        const pendingAssignmentsEl = document.getElementById('pendingAssignments');
        
        if (totalRequestsEl) totalRequestsEl.textContent = totalRequests;
        if (pendingAssignmentsEl) pendingAssignmentsEl.textContent = pendingRequests;
        
        // Update nav badge
        const navBadge = document.getElementById('navBadgeRequests');
        if (navBadge) navBadge.textContent = pendingRequests > 0 ? pendingRequests : '';
    }

    async viewRequestDetails(requestId) {
        const request = this.requests.find(req => req.id === requestId);
        if (!request) return;
        
        showLoader();
        
        try {
            // Get employee details if assigned
            let assignedEmployee = null;
            if (request.assignedTo && window.collections) {
                try {
                    const employeeDoc = await window.collections.employees.doc(request.assignedTo).get();
                    if (employeeDoc.exists) {
                        assignedEmployee = employeeDoc.data();
                    }
                } catch (error) {
                    console.error('Error loading employee:', error);
                }
            }
            
            const content = document.getElementById('requestDetailsContent');
            if (!content) {
                console.error('requestDetailsContent element not found');
                return;
            }
            
            content.innerHTML = this.createRequestDetailsHTML(request, assignedEmployee);
            
            showModal('requestDetailsModal');
            
        } catch (error) {
            console.error('Error loading request details:', error);
            showToast('Error loading request details', 'error');
        } finally {
            hideLoader();
        }
    }

    createRequestDetailsHTML(request, assignedEmployee) {
        const dateFormatted = window.formatDate ? window.formatDate(request.createdAt, true) : 'N/A';
        const serviceIcon = window.getServiceIcon ? window.getServiceIcon(request.serviceName) : 'fas fa-question';
        
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
        
        return `
            <div class="request-details-grid">
                <div class="detail-group">
                    <label>Service Name</label>
                    <div class="detail-value">
                        <i class="${serviceIcon}"></i> ${request.serviceName || 'N/A'}
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Service ID</label>
                    <div class="detail-value">${request.serviceId || 'N/A'}</div>
                </div>
                
                <div class="detail-group">
                    <label>Cost</label>
                    <div class="detail-value">${window.formatCurrency ? window.formatCurrency(request.cost) : request.cost || 'KES 0'}</div>
                </div>
                
                <div class="detail-group">
                    <label>Status</label>
                    <div class="detail-value">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Client Information</label>
                    <div class="detail-value">
                        <p><strong>Name:</strong> ${request.clientName || 'N/A'}</p>
                        <p><strong>Email:</strong> ${request.clientEmail || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${request.clientPhone || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Date Submitted</label>
                    <div class="detail-value">${dateFormatted}</div>
                </div>
                
                ${assignedEmployee ? `
                <div class="detail-group">
                    <label>Assigned Employee</label>
                    <div class="detail-value">
                        <p><strong>Name:</strong> ${assignedEmployee.name}</p>
                        <p><strong>Role:</strong> ${assignedEmployee.role}</p>
                        <p><strong>Percentage:</strong> ${assignedEmployee.percentage || '0'}%</p>
                    </div>
                </div>
                ` : ''}
            </div>
            
            ${request.details ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h4 style="margin-bottom: 15px; color: var(--kenya-black);">
                    <i class="fas fa-file-alt"></i> Service Details
                </h4>
                <p style="line-height: 1.6; white-space: pre-wrap;">${request.details}</p>
            </div>
            ` : ''}
            
            <div style="display: flex; gap: 15px; margin-top: 30px;">
                ${!request.assignedTo ? `
                <button class="logout-btn" onclick="assignRequestToEmployee('${request.id}')" 
                        style="background-color: var(--kenya-green);">
                    <i class="fas fa-user-check"></i> Assign to Employee
                </button>
                ` : ''}
                <button class="logout-btn" onclick="showUpdateStatusForm('${request.id}')" 
                        style="background-color: #0081C8;">
                    <i class="fas fa-edit"></i> Update Status
                </button>
                <button class="logout-btn" onclick="deleteRequest('${request.id}')" 
                        style="background-color: var(--kenya-red);">
                    <i class="fas fa-trash"></i> Delete Request
                </button>
            </div>
        `;
    }

    async assignRequestToEmployee(requestId) {
        const request = this.requests.find(req => req.id === requestId);
        if (!request) return;
        
        // Load employees for assignment
        showLoader();
        
        try {
            // Check if element exists
            const content = document.getElementById('updateStatusContent');
            if (!content) {
                console.error('updateStatusContent element not found');
                showToast('Cannot load assignment form', 'error');
                hideLoader();
                return;
            }
            
            let employees = [];
            if (window.collections) {
                const employeesSnapshot = await window.collections.employees
                    .where('status', '==', 'active')
                    .get();
                
                employeesSnapshot.forEach(doc => {
                    employees.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            }
            
            if (employees.length === 0) {
                content.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-users-slash"></i>
                        <p>No active employees available</p>
                        <p>Please add employees first</p>
                        <button class="logout-btn" onclick="showAddEmployeeModal()" 
                                style="margin-top: 15px; background-color: var(--kenya-green);">
                            <i class="fas fa-user-plus"></i> Add Employee
                        </button>
                    </div>
                `;
            } else {
                content.innerHTML = this.createAssignmentForm(requestId, employees);
            }
            
            showModal('updateStatusModal');
            
        } catch (error) {
            console.error('Error loading employees:', error);
            showToast('Error loading employees', 'error');
        } finally {
            hideLoader();
        }
    }

    createAssignmentForm(requestId, employees) {
        return `
            <div class="status-form">
                <div class="form-group">
                    <label for="assignEmployee">Select Employee</label>
                    <select id="assignEmployee" class="form-control">
                        <option value="">-- Select Employee --</option>
                        ${employees.map(emp => `
                            <option value="${emp.id}">
                                ${emp.name} - ${emp.role} (${emp.percentage || 0}%)
                            </option>
                        `).join('')}
                        <option value="admin">Assign to Myself (Admin)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="assignmentNotes">Assignment Notes</label>
                    <textarea id="assignmentNotes" class="form-control" rows="3" 
                              placeholder="Add notes about this assignment..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="deadline">Deadline (Optional)</label>
                    <input type="date" id="deadline" class="form-control">
                </div>
                
                <button class="save-btn" onclick="submitAssignment('${requestId}')">
                    <i class="fas fa-user-check"></i> Assign Request
                </button>
            </div>
        `;
    }

    async submitAssignment(requestId) {
        const employeeId = document.getElementById('assignEmployee').value;
        const notes = document.getElementById('assignmentNotes').value;
        const deadline = document.getElementById('deadline').value;
        
        if (!employeeId) {
            showToast('Please select an employee', 'warning');
            return;
        }
        
        showLoader();
        
        try {
            const updateData = {
                assignedTo: employeeId === 'admin' ? 'admin' : employeeId,
                assignedBy: window.getUserId ? window.getUserId() : 'admin',
                assignedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'processing'
            };
            
            if (notes) updateData.assignmentNotes = notes;
            if (deadline) updateData.deadline = deadline;
            
            await window.collections.serviceRequests.doc(requestId).update(updateData);
            
            // Log assignment
            const assignmentData = {
                requestId: requestId,
                employeeId: employeeId === 'admin' ? 'admin' : employeeId,
                assignedBy: window.getUserId ? window.getUserId() : 'admin',
                assignedAt: firebase.firestore.FieldValue.serverTimestamp(),
                notes: notes || '',
                deadline: deadline || null,
                status: 'assigned'
            };
            
            await window.collections.assignments.add(assignmentData);
            
            showToast('Request assigned successfully!', 'success');
            if (window.utilsModule) {
                window.utilsModule.logActivity('assignment', `Assigned request ${requestId} to employee`);
            }
            
            closeModal('updateStatusModal');
            closeModal('requestDetailsModal');
            
        } catch (error) {
            console.error('Error assigning request:', error);
            showToast('Error assigning request: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async showUpdateStatusForm(requestId) {
        const request = this.requests.find(req => req.id === requestId);
        
        if (request) {
            this.currentRequestId = requestId;
            
            // Check if modal exists
            const modal = document.getElementById('updateStatusModal');
            if (!modal) {
                console.error('updateStatusModal not found in DOM');
                showToast('Modal not found. Please refresh the page.', 'error');
                return;
            }
            
            const content = document.getElementById('updateStatusContent');
            if (!content) {
                console.error('updateStatusContent element not found');
                showToast('Error loading form', 'error');
                return;
            }
            
            content.innerHTML = `
                <div class="status-form">
                    <div class="form-group">
                        <label for="newStatus">Update Status</label>
                        <select id="newStatus" class="form-control">
                            <option value="pending" ${request.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${request.status === 'processing' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${request.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="updateNotes">Update Notes</label>
                        <textarea id="updateNotes" class="form-control" rows="3" 
                                  placeholder="Add any notes about this update..."></textarea>
                    </div>
                    
                    <button class="save-btn" onclick="updateRequestStatus()">
                        <i class="fas fa-save"></i> Update Status
                    </button>
                </div>
            `;
            
            // Show modal
            modal.style.display = 'flex';
        }
    }

    async updateRequestStatus() {
        const newStatus = document.getElementById('newStatus').value;
        const notes = document.getElementById('updateNotes').value;
        
        if (!this.currentRequestId) {
            showToast('No request selected', 'error');
            return;
        }
        
        showLoader();
        
        try {
            const updateData = {
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Add notes if provided
            if (notes.trim()) {
                // Check if details field exists and add note
                const request = this.requests.find(req => req.id === this.currentRequestId);
                if (request && request.details) {
                    updateData.details = request.details + '\n\n--- Status Update ---\n' + 
                        new Date().toLocaleString() + ': ' + newStatus + 
                        (notes ? '\nNotes: ' + notes : '');
                }
            }
            
            await window.collections.serviceRequests.doc(this.currentRequestId).update(updateData);
            
            showToast(`Request status updated to ${newStatus}`, 'success');
            
            // Close modal
            document.getElementById('updateStatusModal').style.display = 'none';
            document.getElementById('requestDetailsModal').style.display = 'none';
            
            // Clear current request ID
            this.currentRequestId = null;
            
            // Refresh the requests list
            this.loadRequests();
            
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Error updating status: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async deleteRequest(requestId) {
        if (!confirm('Are you sure you want to delete this service request? This action cannot be undone.')) {
            return;
        }
        
        showLoader();
        
        try {
            await window.collections.serviceRequests.doc(requestId).delete();
            
            showToast('Service request deleted successfully', 'success');
            
            // Close modals if open
            document.getElementById('requestDetailsModal').style.display = 'none';
            document.getElementById('updateStatusModal').style.display = 'none';
            
        } catch (error) {
            console.error('Error deleting request:', error);
            showToast('Error deleting request: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }
}

// Initialize Requests Module
const requestsModule = new RequestsModule();

// Global functions for button clicks
function refreshRequests() {
    if (requestsModule) {
        requestsModule.loadRequests();
        showToast('Refreshing requests...', 'info');
    }
}

function viewRequestDetails(requestId) {
    if (requestsModule) {
        requestsModule.viewRequestDetails(requestId);
    }
}

function assignRequestToEmployee(requestId) {
    if (requestsModule) {
        requestsModule.assignRequestToEmployee(requestId);
    }
}

function showUpdateStatusForm(requestId) {
    if (requestsModule) {
        requestsModule.showUpdateStatusForm(requestId);
    }
}

function deleteRequest(requestId) {
    if (requestsModule) {
        requestsModule.deleteRequest(requestId);
    }
}

function submitAssignment(requestId) {
    if (requestsModule) {
        requestsModule.submitAssignment(requestId);
    }
}

function updateRequestStatus() {
    if (requestsModule) {
        requestsModule.updateRequestStatus();
    }
}

// Load requests section when navigated to
function loadRequestsSection() {
    if (requestsModule) {
        requestsModule.setupRequestsSection();
    }s
}

// Make module available globally
window.requestsModule = requestsModule;
