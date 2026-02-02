// Employees Management Module
class EmployeesModule {
    constructor() {
        this.employees = [];
        this.filteredEmployees = [];
        this.employeesListener = null;
        this.init();
    }

    init() {
        // Load employees section when activated
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('employeesSection')) {
                this.setupEmployeesSection();
            }
        });
    }

    setupEmployeesSection() {
        const employeesSection = document.getElementById('employeesSection');
        if (!employeesSection) return;

        employeesSection.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-users"></i> Employees Management</h2>
                <div class="table-controls">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="searchEmployees" placeholder="Search employees...">
                    </div>
                    <select class="filter-select" id="filterRole">
                        <option value="all">All Roles</option>
                        <option value="technician">Technician</option>
                        <option value="support">Support</option>
                        <option value="developer">Developer</option>
                        <option value="manager">Manager</option>
                        <option value="other">Other</option>
                    </select>
                    <select class="filter-select" id="filterStatus">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on-leave">On Leave</option>
                    </select>
                    <button class="logout-btn" onclick="showAddEmployeeModal()" style="background-color: var(--kenya-green);">
                        <i class="fas fa-user-plus"></i> Add Employee
                    </button>
                </div>
            </div>
            
            <div class="data-table-container">
                <div class="table-header">
                    <h3>All Employees</h3>
                    <div class="table-stats">
                        <span>Showing <strong id="showingCount">0</strong> of <strong id="totalCount">0</strong> employees</span>
                    </div>
                </div>
                
                <div class="table-wrapper">
                    <table class="data-table" id="employeesTable">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Role</th>
                                <th>Contact</th>
                                <th>Percentage</th>
                                <th>Status</th>
                                <th>Assigned Jobs</th>
                                <th>Performance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="employeesTableBody">
                            ${UtilsModule.createLoadingElement('Loading employees...')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.loadEmployees();
        this.loadAddEmployeeForm();
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchEmployees');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterEmployees());
        }

        // Filter selects
        document.getElementById('filterRole')?.addEventListener('change', () => this.filterEmployees());
        document.getElementById('filterStatus')?.addEventListener('change', () => this.filterEmployees());
    }

    async loadEmployees() {
        showLoader();
        
        try {
            // Set up real-time listener for employees
            this.employeesListener = collections.employees
                .orderBy('createdAt', 'desc')
                .onSnapshot((snapshot) => {
                    this.employees = [];
                    
                    snapshot.forEach((doc) => {
                        this.employees.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    
                    // Load job counts for each employee
                    this.loadEmployeeJobCounts().then(() => {
                        this.filterEmployees();
                        this.updateDashboardStats();
                        hideLoader();
                    });
                    
                }, (error) => {
                    console.error('Error loading employees:', error);
                    showToast('Error loading employees: ' + error.message, 'error');
                    hideLoader();
                });
                
        } catch (error) {
            console.error('Error setting up listener:', error);
            showToast('Error loading employees', 'error');
            hideLoader();
        }
    }

    async loadEmployeeJobCounts() {
        // Get assignment counts for each employee
        for (const employee of this.employees) {
            const assignmentsSnapshot = await collections.assignments
                .where('employeeId', '==', employee.id)
                .get();
            
            employee.totalJobs = assignmentsSnapshot.size;
            
            const activeJobsSnapshot = await collections.assignments
                .where('employeeId', '==', employee.id)
                .where('status', 'in', ['assigned', 'in-progress'])
                .get();
            
            employee.activeJobs = activeJobsSnapshot.size;
            
            const completedJobsSnapshot = await collections.assignments
                .where('employeeId', '==', employee.id)
                .where('status', '==', 'completed')
                .get();
            
            employee.completedJobs = completedJobsSnapshot.size;
        }
    }

    filterEmployees() {
        const searchTerm = document.getElementById('searchEmployees')?.value.toLowerCase() || '';
        const roleFilter = document.getElementById('filterRole')?.value || 'all';
        const statusFilter = document.getElementById('filterStatus')?.value || 'all';
        
        this.filteredEmployees = this.employees.filter(employee => {
            // Filter by role
            if (roleFilter !== 'all' && employee.role !== roleFilter) {
                return false;
            }
            
            // Filter by status
            if (statusFilter !== 'all' && employee.status !== statusFilter) {
                return false;
            }
            
            // Filter by search term
            if (searchTerm) {
                const searchFields = [
                    employee.name || '',
                    employee.email || '',
                    employee.phone || '',
                    employee.role || '',
                    employee.specialization || ''
                ].join(' ').toLowerCase();
                
                if (!searchFields.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.displayEmployees();
        this.updateTableStats();
    }

    displayEmployees() {
        const tableBody = document.getElementById('employeesTableBody');
        if (!tableBody) return;
        
        if (this.filteredEmployees.length === 0) {
            tableBody.innerHTML = UtilsModule.createNoDataElement('No employees found matching your filters');
            return;
        }
        
        tableBody.innerHTML = this.filteredEmployees.map(employee => {
            // Get status badge
            let statusClass = 'employee-active';
            let statusText = 'Active';
            
            switch(employee.status) {
                case 'inactive':
                    statusClass = 'employee-inactive';
                    statusText = 'Inactive';
                    break;
                case 'on-leave':
                    statusClass = 'employee-on-leave';
                    statusText = 'On Leave';
                    break;
            }
            
            // Calculate performance percentage
            const performance = employee.totalJobs > 0 ? 
                Math.round((employee.completedJobs / employee.totalJobs) * 100) : 0;
            
            // Get performance color
            let performanceColor = '#4CAF50'; // Green
            if (performance < 60) performanceColor = '#f44336'; // Red
            else if (performance < 80) performanceColor = '#FF9800'; // Orange
            
            // Get initials for avatar
            const initials = this.getInitials(employee.name);
            
            return `
                <tr>
                    <td>
                        <div class="service-info">
                            <div class="service-icon" style="background-color: var(--kenya-green);">
                                ${initials}
                            </div>
                            <div class="service-details">
                                <h4>${employee.name || 'Unknown'}</h4>
                                <p>${employee.employeeId || 'No ID'}</p>
                            </div>
                        </div>
                    </td>
                    <td>
                        <strong>${employee.role || 'N/A'}</strong><br>
                        <small>${employee.specialization || 'No specialization'}</small>
                    </td>
                    <td>
                        <p><i class="fas fa-envelope"></i> ${employee.email || 'N/A'}</p>
                        <p><i class="fas fa-phone"></i> ${employee.phone || 'N/A'}</p>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 100%; background-color: #f0f0f0; border-radius: 10px; height: 10px;">
                                <div style="width: ${employee.percentage || 0}%; background-color: var(--kenya-green); height: 100%; border-radius: 10px;"></div>
                            </div>
                            <strong>${employee.percentage || 0}%</strong>
                        </div>
                    </td>
                    <td>
                        <span class="employee-status ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        <div style="text-align: center;">
                            <strong style="font-size: 1.2rem; color: var(--kenya-black);">${employee.activeJobs || 0}</strong><br>
                            <small>Active / ${employee.totalJobs || 0} Total</small>
                        </div>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 100%; background-color: #f0f0f0; border-radius: 10px; height: 10px;">
                                <div style="width: ${performance}%; background-color: ${performanceColor}; height: 100%; border-radius: 10px;"></div>
                            </div>
                            <strong style="color: ${performanceColor};">${performance}%</strong>
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn-small view" onclick="viewEmployeeDetails('${employee.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn-small edit" onclick="editEmployee('${employee.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn-small assign" onclick="assignJobToEmployee('${employee.id}')">
                                <i class="fas fa-clipboard-check"></i>
                            </button>
                            <button class="action-btn-small delete" onclick="deleteEmployee('${employee.id}')">
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
        
        if (showingCount) showingCount.textContent = this.filteredEmployees.length;
        if (totalCount) totalCount.textContent = this.employees.length;
    }

    updateDashboardStats() {
        const activeEmployees = this.employees.filter(emp => emp.status === 'active').length;
        
        // Update UI elements
        const activeEmployeesEl = document.getElementById('activeEmployees');
        if (activeEmployeesEl) activeEmployeesEl.textContent = activeEmployees;
        
        // Find top performing employee
        const topEmployee = this.employees
            .filter(emp => emp.completedJobs > 0)
            .sort((a, b) => {
                const aPerf = a.totalJobs > 0 ? (a.completedJobs / a.totalJobs) : 0;
                const bPerf = b.totalJobs > 0 ? (b.completedJobs / b.totalJobs) : 0;
                return bPerf - aPerf;
            })[0];
        
        const topEmployeeEl = document.getElementById('topEmployee');
        if (topEmployeeEl) {
            topEmployeeEl.textContent = topEmployee ? topEmployee.name : 'No data';
        }
        
        // Update nav badge
        const navBadge = document.getElementById('navBadgeEmployees');
        if (navBadge) navBadge.textContent = this.employees.length > 0 ? this.employees.length : '';
    }

    getInitials(name) {
        if (!name) return '??';
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    loadAddEmployeeForm() {
        const formContainer = document.getElementById('addEmployeeForm');
        if (!formContainer) return;
        
        formContainer.innerHTML = `
            <form id="employeeForm" onsubmit="event.preventDefault(); addEmployee();">
                <div class="form-row">
                    <div class="form-group">
                        <label for="employeeName">Full Name *</label>
                        <input type="text" id="employeeName" class="form-control" required 
                               placeholder="Enter employee's full name">
                    </div>
                    
                    <div class="form-group">
                        <label for="employeeEmail">Email Address *</label>
                        <input type="email" id="employeeEmail" class="form-control" required 
                               placeholder="employee@imarisha.co.ke">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="employeePhone">Phone Number *</label>
                        <input type="tel" id="employeePhone" class="form-control" required 
                               placeholder="0712 345 678">
                    </div>
                    
                    <div class="form-group">
                        <label for="employeeRole">Role *</label>
                        <select id="employeeRole" class="form-control" required>
                            <option value="">Select Role</option>
                            <option value="technician">Technician</option>
                            <option value="support">Support Staff</option>
                            <option value="developer">Developer</option>
                            <option value="manager">Manager</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="specialization">Specialization</label>
                    <input type="text" id="specialization" class="form-control" 
                           placeholder="e.g., Network Security, Software Development">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="percentage">Percentage Share *</label>
                        <input type="number" id="percentage" class="form-control" required 
                               min="0" max="100" value="30" 
                               placeholder="Percentage for completed jobs">
                        <small>Percentage this employee gets from completed jobs</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="status">Status *</label>
                        <select id="status" class="form-control" required>
                            <option value="active" selected>Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on-leave">On Leave</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="address">Address</label>
                    <textarea id="address" class="form-control" rows="2" 
                              placeholder="Enter employee's address"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="notes">Additional Notes</label>
                    <textarea id="notes" class="form-control" rows="3" 
                              placeholder="Any additional information about the employee"></textarea>
                </div>
                
                <button type="submit" class="submit-btn">
                    <i class="fas fa-user-plus"></i> Add Employee
                </button>
            </form>
        `;
    }

    async addEmployee() {
        // Get form values
        const name = document.getElementById('employeeName').value.trim();
        const email = document.getElementById('employeeEmail').value.trim();
        const phone = document.getElementById('employeePhone').value.trim();
        const role = document.getElementById('employeeRole').value;
        const specialization = document.getElementById('specialization').value.trim();
        const percentage = parseInt(document.getElementById('percentage').value);
        const status = document.getElementById('status').value;
        const address = document.getElementById('address').value.trim();
        const notes = document.getElementById('notes').value.trim();
        
        // Validation
        if (!name || !email || !phone || !role || isNaN(percentage)) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }
        
        if (!UtilsModule.validateEmail(email)) {
            showToast('Please enter a valid email address', 'warning');
            return;
        }
        
        if (!UtilsModule.validatePhone(phone)) {
            showToast('Please enter a valid phone number', 'warning');
            return;
        }
        
        if (percentage < 0 || percentage > 100) {
            showToast('Percentage must be between 0 and 100', 'warning');
            return;
        }
        
        showLoader();
        
        try {
            // Generate employee ID
            const employeeId = 'EMP' + Date.now().toString().substr(-6);
            
            const employeeData = {
                employeeId: employeeId,
                name: name,
                email: email,
                phone: phone,
                role: role,
                specialization: specialization,
                percentage: percentage,
                status: status,
                address: address,
                notes: notes,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: getUserId(),
                isActive: true
            };
            
            // Add employee to Firebase
            const docRef = await collections.employees.add(employeeData);
            
            showToast(`Employee ${name} added successfully!`, 'success');
            utilsModule.logActivity('employee', `Added new employee: ${name}`);
            
            // Close modal and reset form
            closeModal('addEmployeeModal');
            document.getElementById('employeeForm').reset();
            
            // Update dashboard
            this.updateDashboardStats();
            
        } catch (error) {
            console.error('Error adding employee:', error);
            showToast('Error adding employee: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async viewEmployeeDetails(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) return;
        
        showLoader();
        
        try {
            // Get employee's assignments
            const assignmentsSnapshot = await collections.assignments
                .where('employeeId', '==', employeeId)
                .orderBy('assignedAt', 'desc')
                .limit(5)
                .get();
            
            const assignments = [];
            assignmentsSnapshot.forEach(doc => {
                assignments.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            const content = document.getElementById('employeeDetailsContent');
            content.innerHTML = this.createEmployeeDetailsHTML(employee, assignments);
            
            showModal('employeeDetailsModal');
            
        } catch (error) {
            console.error('Error loading employee details:', error);
            showToast('Error loading employee details', 'error');
        } finally {
            hideLoader();
        }
    }

    createEmployeeDetailsHTML(employee, assignments) {
        const dateJoined = formatDate(employee.createdAt, false);
        const initials = this.getInitials(employee.name);
        
        let statusClass = 'employee-active';
        let statusText = 'Active';
        
        switch(employee.status) {
            case 'inactive':
                statusClass = 'employee-inactive';
                statusText = 'Inactive';
                break;
            case 'on-leave':
                statusClass = 'employee-on-leave';
                statusText = 'On Leave';
                break;
        }
        
        return `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--kenya-green) 0%, var(--kenya-black) 100%); 
                     color: white; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: bold; margin: 0 auto 15px;">
                    ${initials}
                </div>
                <h3 style="color: var(--kenya-black); margin-bottom: 5px;">${employee.name}</h3>
                <p style="color: #666;">${employee.role} • ${employee.specialization || 'No specialization'}</p>
                <span class="employee-status ${statusClass}" style="margin-top: 10px;">
                    ${statusText}
                </span>
            </div>
            
            <div class="request-details-grid">
                <div class="detail-group">
                    <label>Employee ID</label>
                    <div class="detail-value">${employee.employeeId || 'N/A'}</div>
                </div>
                
                <div class="detail-group">
                    <label>Percentage Share</label>
                    <div class="detail-value">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 100%; background-color: #f0f0f0; border-radius: 10px; height: 10px;">
                                <div style="width: ${employee.percentage || 0}%; background-color: var(--kenya-green); height: 100%; border-radius: 10px;"></div>
                            </div>
                            <strong>${employee.percentage || 0}%</strong>
                        </div>
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Contact Information</label>
                    <div class="detail-value">
                        <p><i class="fas fa-envelope"></i> ${employee.email || 'N/A'}</p>
                        <p><i class="fas fa-phone"></i> ${employee.phone || 'N/A'}</p>
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Job Statistics</label>
                    <div class="detail-value">
                        <p><strong>Total Jobs:</strong> ${employee.totalJobs || 0}</p>
                        <p><strong>Active Jobs:</strong> ${employee.activeJobs || 0}</p>
                        <p><strong>Completed:</strong> ${employee.completedJobs || 0}</p>
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Date Joined</label>
                    <div class="detail-value">${dateJoined}</div>
                </div>
                
                ${employee.address ? `
                <div class="detail-group">
                    <label>Address</label>
                    <div class="detail-value">${employee.address}</div>
                </div>
                ` : ''}
            </div>
            
            ${assignments.length > 0 ? `
            <div style="margin-top: 30px;">
                <h4 style="color: var(--kenya-black); margin-bottom: 15px;">
                    <i class="fas fa-clipboard-list"></i> Recent Assignments
                </h4>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 10px;">
                    ${assignments.map(assignment => `
                        <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>Request: ${assignment.requestId}</strong><br>
                                <small>Assigned: ${formatDate(assignment.assignedAt, true)}</small>
                            </div>
                            <span class="status-badge ${assignment.status === 'completed' ? 'status-completed' : 'status-processing'}">
                                ${assignment.status}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${employee.notes ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h4 style="margin-bottom: 15px; color: var(--kenya-black);">
                    <i class="fas fa-sticky-note"></i> Additional Notes
                </h4>
                <p style="line-height: 1.6;">${employee.notes}</p>
            </div>
            ` : ''}
            
            <div style="display: flex; gap: 15px; margin-top: 30px;">
                <button class="logout-btn" onclick="editEmployee('${employee.id}')" 
                        style="background-color: #0081C8;">
                    <i class="fas fa-edit"></i> Edit Employee
                </button>
                <button class="logout-btn" onclick="assignJobToEmployee('${employee.id}')" 
                        style="background-color: var(--kenya-green);">
                    <i class="fas fa-clipboard-check"></i> Assign Job
                </button>
                <button class="logout-btn" onclick="deleteEmployee('${employee.id}')" 
                        style="background-color: var(--kenya-red);">
                    <i class="fas fa-trash"></i> Remove Employee
                </button>
            </div>
        `;
    }

    async editEmployee(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) return;
        
        // Load edit form
        const content = document.getElementById('updateStatusContent');
        content.innerHTML = this.createEditEmployeeForm(employee);
        
        showModal('updateStatusModal');
    }

    createEditEmployeeForm(employee) {
        return `
            <form id="editEmployeeForm" onsubmit="event.preventDefault(); updateEmployee('${employee.id}');">
                <div class="form-row">
                    <div class="form-group">
                        <label for="editName">Full Name *</label>
                        <input type="text" id="editName" class="form-control" required 
                               value="${employee.name || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="editEmail">Email Address *</label>
                        <input type="email" id="editEmail" class="form-control" required 
                               value="${employee.email || ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editPhone">Phone Number *</label>
                        <input type="tel" id="editPhone" class="form-control" required 
                               value="${employee.phone || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="editRole">Role *</label>
                        <select id="editRole" class="form-control" required>
                            <option value="technician" ${employee.role === 'technician' ? 'selected' : ''}>Technician</option>
                            <option value="support" ${employee.role === 'support' ? 'selected' : ''}>Support Staff</option>
                            <option value="developer" ${employee.role === 'developer' ? 'selected' : ''}>Developer</option>
                            <option value="manager" ${employee.role === 'manager' ? 'selected' : ''}>Manager</option>
                            <option value="other" ${employee.role === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editSpecialization">Specialization</label>
                    <input type="text" id="editSpecialization" class="form-control" 
                           value="${employee.specialization || ''}">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="editPercentage">Percentage Share *</label>
                        <input type="number" id="editPercentage" class="form-control" required 
                               min="0" max="100" value="${employee.percentage || 30}">
                    </div>
                    
                    <div class="form-group">
                        <label for="editStatus">Status *</label>
                        <select id="editStatus" class="form-control" required>
                            <option value="active" ${employee.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${employee.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                            <option value="on-leave" ${employee.status === 'on-leave' ? 'selected' : ''}>On Leave</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="editAddress">Address</label>
                    <textarea id="editAddress" class="form-control" rows="2">${employee.address || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="editNotes">Additional Notes</label>
                    <textarea id="editNotes" class="form-control" rows="3">${employee.notes || ''}</textarea>
                </div>
                
                <button type="submit" class="submit-btn">
                    <i class="fas fa-save"></i> Update Employee
                </button>
            </form>
        `;
    }

    async updateEmployee(employeeId) {
        // Get form values
        const name = document.getElementById('editName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const phone = document.getElementById('editPhone').value.trim();
        const role = document.getElementById('editRole').value;
        const specialization = document.getElementById('editSpecialization').value.trim();
        const percentage = parseInt(document.getElementById('editPercentage').value);
        const status = document.getElementById('editStatus').value;
        const address = document.getElementById('editAddress').value.trim();
        const notes = document.getElementById('editNotes').value.trim();
        
        // Validation
        if (!name || !email || !phone || !role || isNaN(percentage)) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }
        
        if (!UtilsModule.validateEmail(email)) {
            showToast('Please enter a valid email address', 'warning');
            return;
        }
        
        if (percentage < 0 || percentage > 100) {
            showToast('Percentage must be between 0 and 100', 'warning');
            return;
        }
        
        showLoader();
        
        try {
            const updateData = {
                name: name,
                email: email,
                phone: phone,
                role: role,
                specialization: specialization,
                percentage: percentage,
                status: status,
                address: address,
                notes: notes,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: getUserId()
            };
            
            await collections.employees.doc(employeeId).update(updateData);
            
            showToast(`Employee ${name} updated successfully!`, 'success');
            utilsModule.logActivity('update', `Updated employee: ${name}`);
            
            closeModal('updateStatusModal');
            closeModal('employeeDetailsModal');
            
        } catch (error) {
            console.error('Error updating employee:', error);
            showToast('Error updating employee: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async deleteEmployee(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) return;
        
        if (!confirm(`Are you sure you want to remove ${employee.name}? This action cannot be undone.`)) {
            return;
        }
        
        // Check if employee has active assignments
        const activeAssignments = await collections.assignments
            .where('employeeId', '==', employeeId)
            .where('status', 'in', ['assigned', 'in-progress'])
            .get();
        
        if (!activeAssignments.empty) {
            showToast('Cannot remove employee with active assignments. Reassign or complete jobs first.', 'warning');
            return;
        }
        
        showLoader();
        
        try {
            // Instead of deleting, mark as inactive
            await collections.employees.doc(employeeId).update({
                status: 'inactive',
                isActive: false,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            showToast(`Employee ${employee.name} marked as inactive`, 'success');
            utilsModule.logActivity('delete', `Removed employee: ${employee.name}`);
            
            // Close modals if open
            closeModal('employeeDetailsModal');
            closeModal('updateStatusModal');
            
        } catch (error) {
            console.error('Error removing employee:', error);
            showToast('Error removing employee: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async assignJobToEmployee(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (!employee) return;
        
        // Load unassigned requests
        showLoader();
        
        try {
            const requestsSnapshot = await collections.serviceRequests
                .where('assignedTo', '==', null)
                .where('status', '==', 'pending')
                .limit(10)
                .get();
            
            const requests = [];
            requestsSnapshot.forEach(doc => {
                requests.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            if (requests.length === 0) {
                showToast('No pending requests available for assignment', 'info');
                return;
            }
            
            const content = document.getElementById('updateStatusContent');
            content.innerHTML = this.createQuickAssignmentForm(employee, requests);
            
            showModal('updateStatusModal');
            
        } catch (error) {
            console.error('Error loading requests:', error);
            showToast('Error loading requests: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    createQuickAssignmentForm(employee, requests) {
        return `
            <div class="status-form">
                <div class="form-group">
                    <label>Assign Job to <strong>${employee.name}</strong></label>
                    <p style="color: #666; margin-bottom: 15px;">
                        Role: ${employee.role} | Percentage: ${employee.percentage}%
                    </p>
                </div>
                
                <div class="form-group">
                    <label for="selectRequest">Select Request to Assign</label>
                    <select id="selectRequest" class="form-control">
                        <option value="">-- Select a Request --</option>
                        ${requests.map(req => `
                            <option value="${req.id}">
                                ${req.serviceName} - ${formatCurrency(req.cost)} (${req.urgency})
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="quickNotes">Assignment Notes</label>
                    <textarea id="quickNotes" class="form-control" rows="3" 
                              placeholder="Add notes about this assignment..."></textarea>
                </div>
                
                <button class="submit-btn" onclick="submitQuickAssignment('${employee.id}')">
                    <i class="fas fa-user-check"></i> Assign to ${employee.name}
                </button>
            </div>
        `;
    }

    async submitQuickAssignment(employeeId) {
        const requestId = document.getElementById('selectRequest').value;
        const notes = document.getElementById('quickNotes').value;
        
        if (!requestId) {
            showToast('Please select a request to assign', 'warning');
            return;
        }
        
        showLoader();
        
        try {
            // Update request
            await collections.serviceRequests.doc(requestId).update({
                assignedTo: employeeId,
                assignedBy: getUserId(),
                assignedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'processing'
            });
            
            // Create assignment record
            await collections.assignments.add({
                requestId: requestId,
                employeeId: employeeId,
                assignedBy: getUserId(),
                assignedAt: firebase.firestore.FieldValue.serverTimestamp(),
                notes: notes || '',
                status: 'assigned'
            });
            
            showToast('Job assigned successfully!', 'success');
            utilsModule.logActivity('assignment', `Quick-assigned job to employee`);
            
            closeModal('updateStatusModal');
            
        } catch (error) {
            console.error('Error assigning job:', error);
            showToast('Error assigning job: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }
}

// Initialize Employees Module
const employeesModule = new EmployeesModule();

// Global functions for button clicks
function viewEmployeeDetails(employeeId) {
    employeesModule.viewEmployeeDetails(employeeId);
}

function editEmployee(employeeId) {
    employeesModule.editEmployee(employeeId);
}

function deleteEmployee(employeeId) {
    employeesModule.deleteEmployee(employeeId);
}

function assignJobToEmployee(employeeId) {
    employeesModule.assignJobToEmployee(employeeId);
}

function submitQuickAssignment(employeeId) {
    employeesModule.submitQuickAssignment(employeeId);
}

function addEmployee() {
    employeesModule.addEmployee();
}

function updateEmployee(employeeId) {
    employeesModule.updateEmployee(employeeId);
}

// Load employees section when navigated to
function loadEmployeesSection() {
    employeesModule.setupEmployeesSection();
}