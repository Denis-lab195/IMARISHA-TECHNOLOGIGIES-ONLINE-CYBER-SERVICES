// Job Assignments Module
class AssignmentsModule {
    constructor() {
        this.assignments = [];
        this.filteredAssignments = [];
        this.employeesList = [];
        this.assignmentsListener = null;
        this.init();
    }

    init() {
        // Load assignments section when activated
        document.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('assignmentsSection')) {
                this.setupAssignmentsSection();
            }
        });
    }

    setupAssignmentsSection() {
        const assignmentsSection = document.getElementById('assignmentsSection');
        if (!assignmentsSection) return;

        assignmentsSection.innerHTML = `
            <div class="section-header">
                <h2><i class="fas fa-clipboard-check"></i> Job Assignments Management</h2>
                <div class="table-controls">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="searchAssignments" placeholder="Search assignments...">
                    </div>
                    <select class="filter-select" id="filterEmployee">
                        <option value="all">All Employees</option>
                    </select>
                    <select class="filter-select" id="filterStatus">
                        <option value="all">All Status</option>
                        <option value="assigned">Assigned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <select class="filter-select" id="filterPriority">
                        <option value="all">All Priority</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <button class="logout-btn" onclick="showAssignJobModal()" style="background-color: var(--kenya-green);">
                        <i class="fas fa-plus-circle"></i> New Assignment
                    </button>
                </div>
            </div>
            
            <div class="dashboard-stats" style="margin-top: 0;">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon">
                            <i class="fas fa-clipboard-check"></i>
                        </div>
                        <div class="stat-title">Total Assignments</div>
                    </div>
                    <div class="stat-value" id="totalAssignments">0</div>
                    <div class="stat-trend">
                        <span id="activeAssignments">0</span> active
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background-color: var(--kenya-red);">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div class="stat-title">Overdue</div>
                    </div>
                    <div class="stat-value" id="overdueAssignments">0</div>
                    <div class="stat-trend">
                        Needs attention
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background-color: #0081C8;">
                            <i class="fas fa-user-check"></i>
                        </div>
                        <div class="stat-title">Top Performer</div>
                    </div>
                    <div class="stat-value" id="topPerformer">-</div>
                    <div class="stat-trend">
                        <span id="topPerformerJobs">0</span> jobs completed
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-icon" style="background-color: var(--kenya-green);">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <div class="stat-title">Total Payout</div>
                    </div>
                    <div class="stat-value" id="totalPayout">KES 0</div>
                    <div class="stat-trend">
                        This month
                    </div>
                </div>
            </div>
            
            <div class="data-table-container">
                <div class="table-header">
                    <h3>All Job Assignments</h3>
                    <div class="table-stats">
                        <span>Showing <strong id="showingCount">0</strong> of <strong id="totalCount">0</strong> assignments</span>
                    </div>
                </div>
                
                <div class="table-wrapper">
                    <table class="data-table" id="assignmentsTable">
                        <thead>
                            <tr>
                                <th>Request</th>
                                <th>Employee</th>
                                <th>Assigned By</th>
                                <th>Deadline</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Percentage</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="assignmentsTableBody">
                            ${UtilsModule.createLoadingElement('Loading assignments...')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.setupEventListeners();
        this.loadAssignments();
        this.loadAssignJobForm();
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchAssignments');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterAssignments());
        }

        // Filter selects
        document.getElementById('filterEmployee')?.addEventListener('change', () => this.filterAssignments());
        document.getElementById('filterStatus')?.addEventListener('change', () => this.filterAssignments());
        document.getElementById('filterPriority')?.addEventListener('change', () => this.filterAssignments());
    }

    async loadAssignments() {
        showLoader();
        
        try {
            // Set up real-time listener for assignments
            this.assignmentsListener = collections.assignments
                .orderBy('assignedAt', 'desc')
                .onSnapshot(async (snapshot) => {
                    this.assignments = [];
                    
                    // Get all assignments
                    const assignmentsPromises = snapshot.docs.map(async (doc) => {
                        const data = doc.data();
                        const assignment = {
                            id: doc.id,
                            ...data
                        };
                        
                        // Get employee details
                        if (data.employeeId && data.employeeId !== 'admin') {
                            try {
                                const employeeDoc = await collections.employees.doc(data.employeeId).get();
                                if (employeeDoc.exists) {
                                    assignment.employee = employeeDoc.data();
                                }
                            } catch (error) {
                                console.error('Error loading employee:', error);
                            }
                        } else if (data.employeeId === 'admin') {
                            assignment.employee = {
                                name: 'Admin',
                                role: 'Administrator',
                                percentage: 0
                            };
                        }
                        
                        // Get request details
                        if (data.requestId) {
                            try {
                                const requestDoc = await collections.serviceRequests.doc(data.requestId).get();
                                if (requestDoc.exists) {
                                    assignment.request = requestDoc.data();
                                }
                            } catch (error) {
                                console.error('Error loading request:', error);
                            }
                        }
                        
                        // Get assigned by user details
                        if (data.assignedBy) {
                            try {
                                const userDoc = await collections.users.doc(data.assignedBy).get();
                                if (userDoc.exists) {
                                    assignment.assignedByUser = userDoc.data();
                                }
                            } catch (error) {
                                console.error('Error loading user:', error);
                            }
                        }
                        
                        return assignment;
                    });
                    
                    // Wait for all data to load
                    this.assignments = await Promise.all(assignmentsPromises);
                    
                    // Load employees for filter dropdown
                    await this.loadEmployeesForFilter();
                    
                    this.filterAssignments();
                    this.updateDashboardStats();
                    
                    hideLoader();
                    
                    if (this.assignments.length > 0) {
                        showToast(`Loaded ${this.assignments.length} assignments`, 'success');
                    }
                    
                }, (error) => {
                    console.error('Error loading assignments:', error);
                    showToast('Error loading assignments: ' + error.message, 'error');
                    hideLoader();
                });
                
        } catch (error) {
            console.error('Error setting up listener:', error);
            showToast('Error loading assignments', 'error');
            hideLoader();
        }
    }

    async loadEmployeesForFilter() {
        try {
            const employeesSnapshot = await collections.employees.get();
            this.employeesList = [];
            
            employeesSnapshot.forEach(doc => {
                this.employeesList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Update employee filter dropdown
            this.updateEmployeeFilter();
            
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    }

    updateEmployeeFilter() {
        const filterSelect = document.getElementById('filterEmployee');
        if (!filterSelect) return;
        
        // Clear existing options except "All Employees"
        while (filterSelect.options.length > 1) {
            filterSelect.remove(1);
        }
        
        // Add employees to dropdown
        this.employeesList.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = employee.name;
            filterSelect.appendChild(option);
        });
    }

    filterAssignments() {
        const searchTerm = document.getElementById('searchAssignments')?.value.toLowerCase() || '';
        const employeeFilter = document.getElementById('filterEmployee')?.value || 'all';
        const statusFilter = document.getElementById('filterStatus')?.value || 'all';
        const priorityFilter = document.getElementById('filterPriority')?.value || 'all';
        
        this.filteredAssignments = this.assignments.filter(assignment => {
            // Filter by employee
            if (employeeFilter !== 'all' && assignment.employeeId !== employeeFilter) {
                return false;
            }
            
            // Filter by status
            if (statusFilter !== 'all' && assignment.status !== statusFilter) {
                return false;
            }
            
            // Filter by priority (assuming priority is in request data)
            if (priorityFilter !== 'all' && assignment.request) {
                const urgency = assignment.request.urgency || 'normal';
                if (priorityFilter === 'high' && urgency !== 'urgent') return false;
                if (priorityFilter === 'medium' && urgency !== 'high') return false;
                if (priorityFilter === 'low' && urgency === 'urgent') return false;
            }
            
            // Filter by search term
            if (searchTerm) {
                const searchFields = [
                    assignment.request?.serviceName || '',
                    assignment.employee?.name || '',
                    assignment.assignedByUser?.name || '',
                    assignment.notes || ''
                ].join(' ').toLowerCase();
                
                if (!searchFields.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.displayAssignments();
        this.updateTableStats();
    }

    displayAssignments() {
        const tableBody = document.getElementById('assignmentsTableBody');
        if (!tableBody) return;
        
        if (this.filteredAssignments.length === 0) {
            tableBody.innerHTML = UtilsModule.createNoDataElement('No assignments found matching your filters');
            return;
        }
        
        tableBody.innerHTML = this.filteredAssignments.map(assignment => {
            // Get status badge
            let statusClass = 'status-processing';
            let statusText = 'Assigned';
            
            switch(assignment.status) {
                case 'in-progress':
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
            
            // Get priority badge
            const urgency = assignment.request?.urgency || 'normal';
            let priorityClass = 'urgency-normal';
            let priorityText = 'Normal';
            
            switch(urgency) {
                case 'high':
                    priorityClass = 'urgency-high';
                    priorityText = 'High';
                    break;
                case 'urgent':
                    priorityClass = 'urgency-urgent';
                    priorityText = 'Urgent';
                    break;
            }
            
            // Format dates
            const assignedDate = formatDate(assignment.assignedAt, false);
            const deadlineDate = assignment.deadline ? 
                new Date(assignment.deadline).toLocaleDateString('en-KE') : 
                'No deadline';
            
            // Check if overdue
            const isOverdue = assignment.deadline && 
                new Date(assignment.deadline) < new Date() && 
                assignment.status !== 'completed' && 
                assignment.status !== 'cancelled';
            
            // Employee percentage
            const percentage = assignment.employee?.percentage || 0;
            
            return `
                <tr ${isOverdue ? 'style="background-color: #fff8f8;"' : ''}>
                    <td>
                        <strong>${assignment.request?.serviceName || 'Unknown Service'}</strong><br>
                        <small>${assignment.requestId?.substring(0, 8)}...</small>
                    </td>
                    <td>
                        ${assignment.employee ? 
                            `<strong>${assignment.employee.name}</strong><br>
                             <small>${assignment.employee.role}</small>` :
                            'Unassigned'
                        }
                    </td>
                    <td>
                        ${assignment.assignedByUser?.name || 'Admin'}<br>
                        <small>${assignedDate}</small>
                    </td>
                    <td>
                        ${deadlineDate}
                        ${isOverdue ? '<br><small style="color: var(--kenya-red);">⚠️ Overdue</small>' : ''}
                    </td>
                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    <td>
                        <span class="urgency-badge ${priorityClass}">
                            ${priorityText}
                        </span>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 100%; background-color: #f0f0f0; border-radius: 10px; height: 10px;">
                                <div style="width: ${percentage}%; background-color: var(--kenya-green); height: 100%; border-radius: 10px;"></div>
                            </div>
                            <strong>${percentage}%</strong>
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn-small view" onclick="viewAssignmentDetails('${assignment.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn-small edit" onclick="updateAssignment('${assignment.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn-small delete" onclick="removeAssignment('${assignment.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                            ${assignment.status === 'completed' ? `
                            <button class="action-btn-small" onclick="processPayout('${assignment.id}')" 
                                    style="background-color: var(--kenya-green); color: white;">
                                <i class="fas fa-money-bill-wave"></i>
                            </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateTableStats() {
        const showingCount = document.getElementById('showingCount');
        const totalCount = document.getElementById('totalCount');
        
        if (showingCount) showingCount.textContent = this.filteredAssignments.length;
        if (totalCount) totalCount.textContent = this.assignments.length;
    }

    updateDashboardStats() {
        const totalAssignments = this.assignments.length;
        const activeAssignments = this.assignments.filter(a => 
            a.status === 'assigned' || a.status === 'in-progress'
        ).length;
        
        const overdueAssignments = this.assignments.filter(a => {
            if (!a.deadline || a.status === 'completed' || a.status === 'cancelled') return false;
            return new Date(a.deadline) < new Date();
        }).length;
        
        // Calculate total potential payout
        let totalPayout = 0;
        const completedAssignments = this.assignments.filter(a => a.status === 'completed');
        
        completedAssignments.forEach(assignment => {
            if (assignment.request?.cost && assignment.employee?.percentage) {
                const cost = parseFloat(assignment.request.cost) || 0;
                const percentage = assignment.employee.percentage || 0;
                totalPayout += (cost * percentage) / 100;
            }
        });
        
        // Find top performer
        const employeePerformance = {};
        this.assignments.forEach(assignment => {
            if (assignment.employeeId && assignment.status === 'completed') {
                if (!employeePerformance[assignment.employeeId]) {
                    employeePerformance[assignment.employeeId] = {
                        count: 0,
                        name: assignment.employee?.name || 'Unknown'
                    };
                }
                employeePerformance[assignment.employeeId].count++;
            }
        });
        
        let topPerformer = '-';
        let topPerformerJobs = 0;
        
        Object.entries(employeePerformance).forEach(([empId, data]) => {
            if (data.count > topPerformerJobs) {
                topPerformerJobs = data.count;
                topPerformer = data.name;
            }
        });
        
        // Update UI elements
        document.getElementById('totalAssignments').textContent = totalAssignments;
        document.getElementById('activeAssignments').textContent = activeAssignments;
        document.getElementById('overdueAssignments').textContent = overdueAssignments;
        document.getElementById('topPerformer').textContent = topPerformer;
        document.getElementById('topPerformerJobs').textContent = topPerformerJobs;
        document.getElementById('totalPayout').textContent = formatCurrency(totalPayout);
        
        // Update nav badge
        const navBadge = document.getElementById('navBadgeAssignments');
        if (navBadge) {
            navBadge.textContent = activeAssignments > 0 ? activeAssignments : '';
        }
    }

    async viewAssignmentDetails(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) return;
        
        showLoader();
        
        try {
            // Load additional details if needed
            const content = document.getElementById('updateStatusContent');
            content.innerHTML = this.createAssignmentDetailsHTML(assignment);
            
            showModal('updateStatusModal');
            
        } catch (error) {
            console.error('Error loading assignment details:', error);
            showToast('Error loading assignment details', 'error');
        } finally {
            hideLoader();
        }
    }

    createAssignmentDetailsHTML(assignment) {
        const assignedDate = formatDate(assignment.assignedAt, true);
        const deadlineDate = assignment.deadline ? 
            new Date(assignment.deadline).toLocaleDateString('en-KE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : 'No deadline';
        
        const isOverdue = assignment.deadline && 
            new Date(assignment.deadline) < new Date() && 
            assignment.status !== 'completed' && 
            assignment.status !== 'cancelled';
        
        let statusClass = 'status-processing';
        let statusText = 'Assigned';
        
        switch(assignment.status) {
            case 'in-progress':
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
        
        // Calculate potential payout
        const cost = parseFloat(assignment.request?.cost) || 0;
        const percentage = assignment.employee?.percentage || 0;
        const potentialPayout = (cost * percentage) / 100;
        
        return `
            <div class="request-details-grid">
                <div class="detail-group">
                    <label>Assignment ID</label>
                    <div class="detail-value">${assignment.id.substring(0, 12)}...</div>
                </div>
                
                <div class="detail-group">
                    <label>Status</label>
                    <div class="detail-value">
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Service Request</label>
                    <div class="detail-value">
                        <strong>${assignment.request?.serviceName || 'Unknown'}</strong><br>
                        <small>ID: ${assignment.requestId}</small><br>
                        <small>Cost: ${formatCurrency(cost)}</small>
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Assigned Employee</label>
                    <div class="detail-value">
                        ${assignment.employee ? 
                            `<strong>${assignment.employee.name}</strong><br>
                             <small>${assignment.employee.role}</small><br>
                             <small>Percentage: ${percentage}%</small>` :
                            'Unassigned'
                        }
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Assigned By</label>
                    <div class="detail-value">
                        ${assignment.assignedByUser?.name || 'Admin'}<br>
                        <small>${assignedDate}</small>
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Deadline</label>
                    <div class="detail-value">
                        ${deadlineDate}
                        ${isOverdue ? '<br><span style="color: var(--kenya-red); font-weight: bold;">⚠️ OVERDUE</span>' : ''}
                    </div>
                </div>
                
                <div class="detail-group">
                    <label>Potential Payout</label>
                    <div class="detail-value">
                        <strong style="color: var(--kenya-green); font-size: 1.2rem;">
                            ${formatCurrency(potentialPayout)}
                        </strong><br>
                        <small>${cost} × ${percentage}%</small>
                    </div>
                </div>
            </div>
            
            ${assignment.notes ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
                <h4 style="margin-bottom: 15px; color: var(--kenya-black);">
                    <i class="fas fa-sticky-note"></i> Assignment Notes
                </h4>
                <p style="line-height: 1.6; white-space: pre-wrap;">${assignment.notes}</p>
            </div>
            ` : ''}
            
            <div style="display: flex; gap: 15px; margin-top: 30px;">
                ${assignment.status !== 'completed' && assignment.status !== 'cancelled' ? `
                <button class="logout-btn" onclick="markAssignmentCompleted('${assignment.id}')" 
                        style="background-color: var(--kenya-green);">
                    <i class="fas fa-check-circle"></i> Mark as Completed
                </button>
                ` : ''}
                
                <button class="logout-btn" onclick="reassignAssignment('${assignment.id}')" 
                        style="background-color: #0081C8;">
                    <i class="fas fa-user-friends"></i> Reassign
                </button>
                
                <button class="logout-btn" onclick="removeAssignment('${assignment.id}')" 
                        style="background-color: var(--kenya-red);">
                    <i class="fas fa-trash"></i> Remove Assignment
                </button>
            </div>
        `;
    }

    loadAssignJobForm() {
        const formContainer = document.getElementById('assignJobForm');
        if (!formContainer) return;
        
        formContainer.innerHTML = `
            <div id="assignJobFormContent">
                ${UtilsModule.createLoadingElement('Loading form...')}
            </div>
        `;
        
        // Load form data asynchronously
        this.loadAssignJobFormData();
    }

    async loadAssignJobFormData() {
        showLoader();
        
        try {
            // Get unassigned requests
            const requestsSnapshot = await collections.serviceRequests
                .where('assignedTo', '==', null)
                .where('status', '==', 'pending')
                .limit(20)
                .get();
            
            const requests = [];
            requestsSnapshot.forEach(doc => {
                requests.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Get active employees
            const employeesSnapshot = await collections.employees
                .where('status', '==', 'active')
                .get();
            
            const employees = [];
            employeesSnapshot.forEach(doc => {
                employees.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            const formContainer = document.getElementById('assignJobFormContent');
            formContainer.innerHTML = this.createAssignJobForm(requests, employees);
            
        } catch (error) {
            console.error('Error loading form data:', error);
            showToast('Error loading form data: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    createAssignJobForm(requests, employees) {
        if (requests.length === 0) {
            return `
                <div class="no-data" style="padding: 20px;">
                    <i class="fas fa-inbox fa-2x"></i>
                    <p>No pending requests available for assignment</p>
                    <button class="logout-btn" onclick="closeModal('assignJobModal')" 
                            style="margin-top: 15px; background-color: var(--kenya-green);">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            `;
        }
        
        if (employees.length === 0) {
            return `
                <div class="no-data" style="padding: 20px;">
                    <i class="fas fa-users-slash fa-2x"></i>
                    <p>No active employees available</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Please add employees first</p>
                    <button class="logout-btn" onclick="showAddEmployeeModal()" 
                            style="margin-top: 15px; background-color: var(--kenya-green);">
                        <i class="fas fa-user-plus"></i> Add Employee
                    </button>
                </div>
            `;
        }
        
        return `
            <form id="newAssignmentForm" onsubmit="event.preventDefault(); createNewAssignment();">
                <div class="form-group">
                    <label for="selectRequest">Select Service Request *</label>
                    <select id="selectRequest" class="form-control" required>
                        <option value="">-- Select a Request --</option>
                        ${requests.map(req => `
                            <option value="${req.id}">
                                ${req.serviceName} - ${formatCurrency(req.cost)} (${req.urgency}) - ${req.clientName || 'No client'}
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="selectEmployee">Assign to Employee *</label>
                        <select id="selectEmployee" class="form-control" required>
                            <option value="">-- Select Employee --</option>
                            ${employees.map(emp => `
                                <option value="${emp.id}" data-percentage="${emp.percentage}">
                                    ${emp.name} - ${emp.role} (${emp.percentage}%)
                                </option>
                            `).join('')}
                            <option value="admin">Assign to Myself (Admin)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="assignmentPriority">Priority</label>
                        <select id="assignmentPriority" class="form-control">
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="deadlineDate">Deadline (Optional)</label>
                        <input type="date" id="deadlineDate" class="form-control" 
                               min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label for="estimatedHours">Estimated Hours</label>
                        <input type="number" id="estimatedHours" class="form-control" 
                               min="1" max="100" placeholder="e.g., 8">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="assignmentNotes">Assignment Notes</label>
                    <textarea id="assignmentNotes" class="form-control" rows="4" 
                              placeholder="Provide detailed instructions for this assignment..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="percentageOverride">Percentage Override (Optional)</label>
                    <input type="number" id="percentageOverride" class="form-control" 
                           min="0" max="100" placeholder="Leave empty to use employee's default percentage">
                    <small>This will override the employee's default percentage for this assignment only</small>
                </div>
                
                <button type="submit" class="submit-btn">
                    <i class="fas fa-clipboard-check"></i> Create Assignment
                </button>
            </form>
        `;
    }

    async createNewAssignment() {
        const requestId = document.getElementById('selectRequest').value;
        const employeeId = document.getElementById('selectEmployee').value;
        const priority = document.getElementById('assignmentPriority').value;
        const deadline = document.getElementById('deadlineDate').value;
        const estimatedHours = document.getElementById('estimatedHours').value;
        const notes = document.getElementById('assignmentNotes').value;
        const percentageOverride = document.getElementById('percentageOverride').value;
        
        if (!requestId || !employeeId) {
            showToast('Please select both a request and an employee', 'warning');
            return;
        }
        
        showLoader();
        
        try {
            // Get request details
            const requestDoc = await collections.serviceRequests.doc(requestId).get();
            if (!requestDoc.exists) {
                throw new Error('Request not found');
            }
            
            // Get employee details if not admin
            let employeePercentage = 0;
            if (employeeId !== 'admin') {
                const employeeDoc = await collections.employees.doc(employeeId).get();
                if (employeeDoc.exists) {
                    const employeeData = employeeDoc.data();
                    employeePercentage = percentageOverride || employeeData.percentage;
                }
            }
            
            // Update request status
            await collections.serviceRequests.doc(requestId).update({
                assignedTo: employeeId,
                assignedBy: getUserId(),
                assignedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'processing'
            });
            
            // Create assignment record
            const assignmentData = {
                requestId: requestId,
                employeeId: employeeId,
                assignedBy: getUserId(),
                assignedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'assigned',
                priority: priority,
                notes: notes || '',
                employeePercentage: employeePercentage
            };
            
            if (deadline) assignmentData.deadline = deadline;
            if (estimatedHours) assignmentData.estimatedHours = parseInt(estimatedHours);
            
            const assignmentRef = await collections.assignments.add(assignmentData);
            
            showToast('Assignment created successfully!', 'success');
            utilsModule.logActivity('assignment', `Created new assignment for request ${requestId}`);
            
            closeModal('assignJobModal');
            
            // Reset form
            document.getElementById('newAssignmentForm').reset();
            
        } catch (error) {
            console.error('Error creating assignment:', error);
            showToast('Error creating assignment: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async markAssignmentCompleted(assignmentId) {
        if (!confirm('Mark this assignment as completed? This will trigger payout calculation.')) {
            return;
        }
        
        showLoader();
        
        try {
            const assignment = this.assignments.find(a => a.id === assignmentId);
            if (!assignment) throw new Error('Assignment not found');
            
            // Update assignment status
            await collections.assignments.doc(assignmentId).update({
                status: 'completed',
                completedAt: firebase.firestore.FieldValue.serverTimestamp(),
                completedBy: getUserId()
            });
            
            // Update request status
            if (assignment.requestId) {
                await collections.serviceRequests.doc(assignment.requestId).update({
                    status: 'completed',
                    completedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            showToast('Assignment marked as completed!', 'success');
            utilsModule.logActivity('update', `Marked assignment ${assignmentId} as completed`);
            
            closeModal('updateStatusModal');
            
        } catch (error) {
            console.error('Error completing assignment:', error);
            showToast('Error completing assignment: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async reassignAssignment(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) return;
        
        // Load active employees
        showLoader();
        
        try {
            const employeesSnapshot = await collections.employees
                .where('status', '==', 'active')
                .get();
            
            const employees = [];
            employeesSnapshot.forEach(doc => {
                // Don't include current employee
                if (doc.id !== assignment.employeeId) {
                    employees.push({
                        id: doc.id,
                        ...doc.data()
                    });
                }
            });
            
            const content = document.getElementById('updateStatusContent');
            content.innerHTML = this.createReassignForm(assignmentId, employees);
            
        } catch (error) {
            console.error('Error loading employees:', error);
            showToast('Error loading employees', 'error');
        } finally {
            hideLoader();
        }
    }

    createReassignForm(assignmentId, employees) {
        if (employees.length === 0) {
            return `
                <div class="no-data" style="padding: 20px;">
                    <i class="fas fa-users-slash fa-2x"></i>
                    <p>No other active employees available</p>
                    <button class="logout-btn" onclick="closeModal('updateStatusModal')" 
                            style="margin-top: 15px; background-color: var(--kenya-green);">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            `;
        }
        
        return `
            <div class="status-form">
                <div class="form-group">
                    <label>Reassign Assignment</label>
                    <p style="color: #666; margin-bottom: 15px;">
                        Select a new employee for this assignment
                    </p>
                </div>
                
                <div class="form-group">
                    <label for="reassignEmployee">Select New Employee *</label>
                    <select id="reassignEmployee" class="form-control" required>
                        <option value="">-- Select Employee --</option>
                        ${employees.map(emp => `
                            <option value="${emp.id}">
                                ${emp.name} - ${emp.role} (${emp.percentage}%)
                            </option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="reassignReason">Reason for Reassignment</label>
                    <textarea id="reassignReason" class="form-control" rows="3" 
                              placeholder="Why are you reassigning this assignment?"></textarea>
                </div>
                
                <button class="submit-btn" onclick="submitReassignment('${assignmentId}')">
                    <i class="fas fa-user-friends"></i> Reassign
                </button>
            </div>
        `;
    }

    async submitReassignment(assignmentId) {
        const newEmployeeId = document.getElementById('reassignEmployee').value;
        const reason = document.getElementById('reassignReason').value;
        
        if (!newEmployeeId) {
            showToast('Please select a new employee', 'warning');
            return;
        }
        
        showLoader();
        
        try {
            const assignment = this.assignments.find(a => a.id === assignmentId);
            
            // Update assignment
            await collections.assignments.doc(assignmentId).update({
                employeeId: newEmployeeId,
                reassignedAt: firebase.firestore.FieldValue.serverTimestamp(),
                reassignedBy: getUserId(),
                reassignmentReason: reason || '',
                previousEmployeeId: assignment.employeeId
            });
            
            // Update request
            if (assignment.requestId) {
                await collections.serviceRequests.doc(assignment.requestId).update({
                    assignedTo: newEmployeeId,
                    reassignedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            showToast('Assignment reassigned successfully!', 'success');
            utilsModule.logActivity('assignment', `Reassigned assignment ${assignmentId}`);
            
            closeModal('updateStatusModal');
            
        } catch (error) {
            console.error('Error reassigning:', error);
            showToast('Error reassigning: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async removeAssignment(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) return;
        
        if (!confirm('Are you sure you want to remove this assignment? The request will become unassigned.')) {
            return;
        }
        
        showLoader();
        
        try {
            // Delete assignment
            await collections.assignments.doc(assignmentId).delete();
            
            // Update request to unassigned
            if (assignment.requestId) {
                await collections.serviceRequests.doc(assignment.requestId).update({
                    assignedTo: null,
                    status: 'pending'
                });
            }
            
            showToast('Assignment removed successfully!', 'success');
            utilsModule.logActivity('delete', `Removed assignment ${assignmentId}`);
            
            closeModal('updateStatusModal');
            
        } catch (error) {
            console.error('Error removing assignment:', error);
            showToast('Error removing assignment: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async processPayout(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment || assignment.status !== 'completed') {
            showToast('Only completed assignments can have payouts processed', 'warning');
            return;
        }
        
        if (!confirm('Process payout for this completed assignment?')) {
            return;
        }
        
        showLoader();
        
        try {
            // Calculate payout
            const cost = parseFloat(assignment.request?.cost) || 0;
            const percentage = assignment.employee?.percentage || 0;
            const payoutAmount = (cost * percentage) / 100;
            
            // Create payout record
            const payoutData = {
                assignmentId: assignmentId,
                employeeId: assignment.employeeId,
                amount: payoutAmount,
                percentage: percentage,
                requestCost: cost,
                processedBy: getUserId(),
                processedAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            };
            
            await db.collection('payouts').add(payoutData);
            
            // Update assignment
            await collections.assignments.doc(assignmentId).update({
                payoutProcessed: true,
                payoutAmount: payoutAmount
            });
            
            showToast(`Payout of ${formatCurrency(payoutAmount)} processed for assignment!`, 'success');
            utilsModule.logActivity('update', `Processed payout for assignment ${assignmentId}`);
            
        } catch (error) {
            console.error('Error processing payout:', error);
            showToast('Error processing payout: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }

    async updateAssignment(assignmentId) {
        const assignment = this.assignments.find(a => a.id === assignmentId);
        if (!assignment) return;
        
        const content = document.getElementById('updateStatusContent');
        content.innerHTML = this.createUpdateAssignmentForm(assignment);
        
        showModal('updateStatusModal');
    }

    createUpdateAssignmentForm(assignment) {
        return `
            <form id="updateAssignmentForm" onsubmit="event.preventDefault(); saveAssignmentUpdate('${assignment.id}');">
                <div class="form-group">
                    <label for="updateStatus">Update Status</label>
                    <select id="updateStatus" class="form-control">
                        <option value="assigned" ${assignment.status === 'assigned' ? 'selected' : ''}>Assigned</option>
                        <option value="in-progress" ${assignment.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${assignment.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${assignment.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="updateDeadline">Update Deadline</label>
                        <input type="date" id="updateDeadline" class="form-control" 
                               value="${assignment.deadline ? new Date(assignment.deadline).toISOString().split('T')[0] : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="updatePriority">Update Priority</label>
                        <select id="updatePriority" class="form-control">
                            <option value="normal" ${assignment.priority === 'normal' ? 'selected' : ''}>Normal</option>
                            <option value="high" ${assignment.priority === 'high' ? 'selected' : ''}>High</option>
                            <option value="urgent" ${assignment.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="updateNotes">Update Notes</label>
                    <textarea id="updateNotes" class="form-control" rows="4">${assignment.notes || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="progressUpdate">Progress Update</label>
                    <textarea id="progressUpdate" class="form-control" rows="3" 
                              placeholder="Add progress update..."></textarea>
                </div>
                
                <button type="submit" class="submit-btn">
                    <i class="fas fa-save"></i> Save Changes
                </button>
            </form>
        `;
    }

    async saveAssignmentUpdate(assignmentId) {
        const status = document.getElementById('updateStatus').value;
        const deadline = document.getElementById('updateDeadline').value;
        const priority = document.getElementById('updatePriority').value;
        const notes = document.getElementById('updateNotes').value;
        const progressUpdate = document.getElementById('progressUpdate').value;
        
        showLoader();
        
        try {
            const updateData = {
                status: status,
                priority: priority,
                notes: notes,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            if (deadline) updateData.deadline = deadline;
            
            // Add progress update if provided
            if (progressUpdate) {
                updateData.progressUpdates = firebase.firestore.FieldValue.arrayUnion({
                    text: progressUpdate,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedBy: getUserId()
                });
            }
            
            // If marking as completed, add completion timestamp
            if (status === 'completed') {
                updateData.completedAt = firebase.firestore.FieldValue.serverTimestamp();
                updateData.completedBy = getUserId();
            }
            
            await collections.assignments.doc(assignmentId).update(updateData);
            
            // If status changed to completed, also update request
            if (status === 'completed') {
                const assignment = this.assignments.find(a => a.id === assignmentId);
                if (assignment && assignment.requestId) {
                    await collections.serviceRequests.doc(assignment.requestId).update({
                        status: 'completed',
                        completedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }
            
            showToast('Assignment updated successfully!', 'success');
            utilsModule.logActivity('update', `Updated assignment ${assignmentId}`);
            
            closeModal('updateStatusModal');
            
        } catch (error) {
            console.error('Error updating assignment:', error);
            showToast('Error updating assignment: ' + error.message, 'error');
        } finally {
            hideLoader();
        }
    }
}

// Initialize Assignments Module
const assignmentsModule = new AssignmentsModule();

// Global functions for button clicks
function viewAssignmentDetails(assignmentId) {
    assignmentsModule.viewAssignmentDetails(assignmentId);
}

function updateAssignment(assignmentId) {
    assignmentsModule.updateAssignment(assignmentId);
}

function removeAssignment(assignmentId) {
    assignmentsModule.removeAssignment(assignmentId);
}

function processPayout(assignmentId) {
    assignmentsModule.processPayout(assignmentId);
}

function markAssignmentCompleted(assignmentId) {
    assignmentsModule.markAssignmentCompleted(assignmentId);
}

function reassignAssignment(assignmentId) {
    assignmentsModule.reassignAssignment(assignmentId);
}

function submitReassignment(assignmentId) {
    assignmentsModule.submitReassignment(assignmentId);
}

function createNewAssignment() {
    assignmentsModule.createNewAssignment();
}

function saveAssignmentUpdate(assignmentId) {
    assignmentsModule.saveAssignmentUpdate(assignmentId);
}

// Load assignments section when navigated to
function loadAssignmentsSection() {
    assignmentsModule.setupAssignmentsSection();
}