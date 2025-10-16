// Payments Management JavaScript

let allPayments = [];
let filteredPayments = [];

// Check auth and load data on page load
document.addEventListener('DOMContentLoaded', async function() {
    const isAuthenticated = await checkAuth();
    
    if (!isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }

    loadUserInfo();
    await loadPayments();
    setupMobileMenu();
    setupSearch();
    
    // Check if there's an invoiceId in URL params (coming from invoices page)
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('invoiceId');
    if (invoiceId) {
        filterPaymentsByInvoice(invoiceId);
    }
});

// Load current user info
function loadUserInfo() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = user.role;
        document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
    }
}

// Load all payments
async function loadPayments() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load payments');
        }

        allPayments = await response.json();
        filteredPayments = [...allPayments];
        
        displayPayments();
        updateStats();
        updateTotalCount();

    } catch (error) {
        console.error('Error loading payments:', error);
        showError('Failed to load payments');
        document.getElementById('paymentsTableBody').innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="color: var(--danger); padding: 2rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
                    Failed to load payments
                </td>
            </tr>
        `;
    }
}

// Display payments in table
function displayPayments() {
    const tbody = document.getElementById('paymentsTableBody');

    if (filteredPayments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-credit-card" style="font-size: 2rem; display: block; margin-bottom: 1rem; opacity: 0.5;"></i>
                    No payments found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredPayments.map(payment => `
        <tr>
            <td>
                <strong>#${payment.paymentId.substring(0, 8)}</strong>
            </td>
            <td>
                <a href="invoices.html?invoiceId=${payment.invoiceId}" style="color: var(--accent-primary);">
                                #${payment.invoiceId.substring(0, 8)}
                </a>
            </td>
            <td>${formatDate(payment.paymentDate)}</td>
            <td><strong>${formatCurrency(payment.amount)}</strong></td>
            <td>
                <div class="payment-method-icon">
                    <i class="${getPaymentMethodIcon(payment.paymentMethod)}"></i>
                    <span>${formatPaymentMethod(payment.paymentMethod)}</span>
                </div>
            </td>
            <td>
                <div class="payment-status-badge">
                    <span class="status-dot ${payment.status.toLowerCase()}"></span>
                    <span>${formatPaymentStatus(payment.status)}</span>
                </div>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-secondary btn-icon" 
                            onclick="viewPaymentDetails('${payment.paymentId}')"
                            title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-primary btn-icon" 
                            onclick="openUpdateStatusModal('${payment.paymentId}')"
                            title="Update Status">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${payment.status === 'SUCCESS' ? `
                    <button class="btn btn-sm btn-warning btn-icon" 
                            onclick="processRefund('${payment.paymentId}')"
                            title="Process Refund">
                        <i class="fas fa-undo"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Update payment statistics
function updateStats() {
    const totalAmount = allPayments
        .filter(p => p.status === 'SUCCESS')
        .reduce((sum, payment) => sum + payment.amount, 0);
    
    const successfulCount = allPayments.filter(p => p.status === 'SUCCESS').length;
    const pendingCount = allPayments.filter(p => p.status === 'PENDING').length;
    const failedCount = allPayments.filter(p => p.status === 'FAILED').length;

    document.getElementById('totalPaymentsAmount').textContent = formatCurrency(totalAmount);
    document.getElementById('successfulCount').textContent = successfulCount;
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('failedCount').textContent = failedCount;
}

// Update total count
function updateTotalCount() {
    document.getElementById('totalCount').textContent = filteredPayments.length;
}

// Filter payments based on criteria
function filterPayments() {
    const statusFilter = document.getElementById('statusFilter').value;
    const methodFilter = document.getElementById('methodFilter').value;
    const startDate = document.getElementById('startDateFilter').value;
    const endDate = document.getElementById('endDateFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    filteredPayments = allPayments.filter(payment => {
        const matchesStatus = !statusFilter || payment.status === statusFilter;
        const matchesMethod = !methodFilter || payment.paymentMethod === methodFilter;
        const matchesSearch = !searchQuery || 
            payment.paymentId.toLowerCase().includes(searchQuery) ||
            payment.invoiceId.toLowerCase().includes(searchQuery);
        
        let matchesDate = true;
        if (startDate) {
            const paymentDate = new Date(payment.paymentDate);
            const filterStartDate = new Date(startDate);
            matchesDate = matchesDate && paymentDate >= filterStartDate;
        }
        if (endDate) {
            const paymentDate = new Date(payment.paymentDate);
            const filterEndDate = new Date(endDate);
            filterEndDate.setHours(23, 59, 59, 999); // End of day
            matchesDate = matchesDate && paymentDate <= filterEndDate;
        }
        
        return matchesStatus && matchesMethod && matchesSearch && matchesDate;
    });

    displayPayments();
    updateTotalCount();
}

// Filter payments by specific invoice
function filterPaymentsByInvoice(invoiceId) {
    document.getElementById('searchInput').value = invoiceId;
    filterPayments();
}

// Setup search with debounce
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(filterPayments, 300));
}

// View payment details
async function viewPaymentDetails(paymentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load payment details');
        }

        const payment = await response.json();
        
        const detailsContent = `
            <div class="payment-detail-card">
                <div class="payment-detail-row">
                    <span class="payment-detail-label">Payment ID</span>
                    <span class="payment-detail-value">${payment.paymentId}</span>
                </div>
                <div class="payment-detail-row">
                    <span class="payment-detail-label">Invoice ID</span>
                    <span class="payment-detail-value">
                        <a href="invoices.html?invoiceId=${payment.invoiceId}" style="color: var(--accent-primary);">
                            ${payment.invoiceId}
                        </a>
                    </span>
                </div>
                <div class="payment-detail-row">
                    <span class="payment-detail-label">Amount</span>
                    <span class="payment-detail-value">${formatCurrency(payment.amount)}</span>
                </div>
                <div class="payment-detail-row">
                    <span class="payment-detail-label">Payment Method</span>
                    <span class="payment-detail-value">
                        <div class="payment-method-icon">
                            <i class="${getPaymentMethodIcon(payment.paymentMethod)}"></i>
                            <span>${formatPaymentMethod(payment.paymentMethod)}</span>
                        </div>
                    </span>
                </div>
                <div class="payment-detail-row">
                    <span class="payment-detail-label">Status</span>
                    <span class="payment-detail-value">
                        <div class="payment-status-badge">
                            <span class="status-dot ${payment.status.toLowerCase()}"></span>
                            <span>${formatPaymentStatus(payment.status)}</span>
                        </div>
                    </span>
                </div>
                <div class="payment-detail-row">
                    <span class="payment-detail-label">Payment Date</span>
                    <span class="payment-detail-value">${formatDateTime(payment.paymentDate)}</span>
                </div>
                ${payment.processedDate ? `
                <div class="payment-detail-row">
                    <span class="payment-detail-label">Processed Date</span>
                    <span class="payment-detail-value">${formatDateTime(payment.processedDate)}</span>
                </div>
                ` : ''}
                ${payment.referenceNumber ? `
                <div class="payment-detail-row">
                    <span class="payment-detail-label">Reference Number</span>
                    <span class="payment-detail-value">${payment.referenceNumber}</span>
                </div>
                ` : ''}
                ${payment.notes ? `
                <div class="payment-detail-row">
                    <span class="payment-detail-label">Notes</span>
                    <span class="payment-detail-value">${payment.notes}</span>
                </div>
                ` : ''}
            </div>

            ${payment.transactionHistory && payment.transactionHistory.length > 0 ? `
            <h4 style="margin: 1.5rem 0 1rem 0;">Transaction History</h4>
            <div class="transaction-timeline">
                ${payment.transactionHistory.map(transaction => `
                    <div class="timeline-item">
                        <div class="timeline-content">
                            <div class="timeline-time">${formatDateTime(transaction.timestamp)}</div>
                            <div class="timeline-title">${transaction.action}</div>
                            <div class="timeline-desc">${transaction.description || ''}</div>
                            ${transaction.amount ? `
                            <div class="timeline-desc" style="margin-top: 0.25rem;">
                                <strong>Amount: ${formatCurrency(transaction.amount)}</strong>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        `;

        document.getElementById('paymentDetailsContent').innerHTML = detailsContent;
        document.getElementById('viewPaymentModal').classList.add('show');
    } catch (error) {
        console.error('Error loading payment details:', error);
        showError('Failed to load payment details');
    }
}

// Close view payment modal
function closeViewPaymentModal() {
    document.getElementById('viewPaymentModal').classList.remove('show');
}

// Open update status modal
async function openUpdateStatusModal(paymentId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load payment data');
        }

        const payment = await response.json();
        
        document.getElementById('updatePaymentId').value = payment.paymentId;
        document.getElementById('currentStatus').value = formatPaymentStatus(payment.status);
        
        document.getElementById('updateStatusModal').classList.add('show');
    } catch (error) {
        console.error('Error loading payment:', error);
        showError('Failed to load payment data');
    }
}

// Close update status modal
function closeUpdateStatusModal() {
    document.getElementById('updateStatusModal').classList.remove('show');
    document.getElementById('updateStatusForm').reset();
}

// Handle update status form submission
document.getElementById('updateStatusForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const paymentId = document.getElementById('updatePaymentId').value;
    const newStatus = document.getElementById('newStatus').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            showSuccess('Payment status updated successfully');
            closeUpdateStatusModal();
            await loadPayments(); // Reload to get updated data
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update payment status');
        }
    } catch (error) {
        console.error('Error updating payment status:', error);
        showError(error.message || 'Failed to update payment status');
    }
});

// Process refund
async function processRefund(paymentId) {
    if (!confirm('Are you sure you want to process a refund for this payment?')) {
        return;
    }

    const refundAmount = prompt('Enter refund amount:');
    if (!refundAmount || isNaN(refundAmount) || parseFloat(refundAmount) <= 0) {
        showError('Please enter a valid refund amount');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/refund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ amount: parseFloat(refundAmount) })
        });

        if (response.ok) {
            showSuccess('Refund processed successfully');
            await loadPayments(); // Reload to get updated data
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to process refund');
        }
    } catch (error) {
        console.error('Error processing refund:', error);
        showError(error.message || 'Failed to process refund');
    }
}

// Utility functions
function formatPaymentStatus(status) {
    const statusMap = {
        'SUCCESS': 'Success',
        'PENDING': 'Pending',
        'FAILED': 'Failed',
        'REFUNDED': 'Refunded'
    };
    return statusMap[status] || status;
}

function formatPaymentMethod(method) {
    const methodMap = {
        'CASH': 'Cash',
        'CARD': 'Card',
        'BANK_TRANSFER': 'Bank Transfer',
        'CHEQUE': 'Cheque',
        'ONLINE': 'Online'
    };
    return methodMap[method] || method;
}

function getPaymentMethodIcon(method) {
    const iconMap = {
        'CASH': 'fas fa-money-bill-wave',
        'CARD': 'fas fa-credit-card',
        'BANK_TRANSFER': 'fas fa-university',
        'CHEQUE': 'fas fa-money-check',
        'ONLINE': 'fas fa-globe'
    };
    return iconMap[method] || 'fas fa-credit-card';
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-LK');
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('en-LK');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR'
    }).format(amount);
}

// Utility function for debouncing
function debounce(func, wait) {
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

// Show success message
function showSuccess(message) {
    // You can implement a toast notification system here
    alert('Success: ' + message);
}

// Show error message
function showError(message) {
    // You can implement a toast notification system here
    alert('Error: ' + message);
}



// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        logout();
        window.location.href = 'login.html';
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    const viewModal = document.getElementById('viewPaymentModal');
    const updateModal = document.getElementById('updateStatusModal');
    
    if (e.target === viewModal) {
        closeViewPaymentModal();
    }
    if (e.target === updateModal) {
        closeUpdateStatusModal();
    }
});

// Setup mobile menu
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }  
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});