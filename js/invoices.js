// Invoices Management JavaScript

let allInvoices = [];
let filteredInvoices = [];
let allOrders = [];
let currentInvoice = null;

// Check auth and load data on page load
document.addEventListener('DOMContentLoaded', async function() {
    const isAuthenticated = await checkAuth();
    
    if (!isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }

    loadUserInfo();
    await loadInvoices();
    setupMobileMenu();
    setupSearch();
    
    // Check if there's an orderId in URL params (coming from orders page)
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    if (orderId) {
        viewInvoiceByOrderId(orderId);
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

// Load all invoices
async function loadInvoices() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/invoices`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load invoices');
        }

        allInvoices = await response.json();
        
        // Check for overdue invoices
        allInvoices = allInvoices.map(invoice => {
            if (invoice.status === 'UNPAID' && new Date(invoice.dueDate) < new Date()) {
                invoice.status = 'OVERDUE';
            }
            return invoice;
        });
        
        filteredInvoices = [...allInvoices];
        
        displayInvoices();
        updateTotalCount();

    } catch (error) {
        console.error('Error loading invoices:', error);
        showError('Failed to load invoices');
        document.getElementById('invoicesTableBody').innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="color: var(--danger); padding: 2rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
                    Failed to load invoices
                </td>
            </tr>
        `;
    }
}

// Display invoices in table
function displayInvoices() {
    const tbody = document.getElementById('invoicesTableBody');

    if (filteredInvoices.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-file-invoice" style="font-size: 2rem; display: block; margin-bottom: 1rem; opacity: 0.5;"></i>
                    No invoices found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredInvoices.map(invoice => `
        <tr>
            <td>
                <strong>#${invoice.invoiceId.substring(0, 8)}</strong>
            </td>
            <td>#${invoice.orderId.substring(0, 8)}</td>
            <td>${formatDateTime(invoice.invoiceDate)}</td>
            <td>${formatDateTime(invoice.dueDate)}</td>
            <td><strong>${formatCurrency(invoice.finalAmount)}</strong></td>
            <td>
                <div class="invoice-status-badge">
                    <span class="status-dot ${invoice.status.toLowerCase()}"></span>
                    ${getStatusBadge(invoice.status)}
                </div>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-secondary btn-icon" 
                            onclick="viewInvoiceDetails('${invoice.invoiceId}')"
                            title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${invoice.status === 'UNPAID' || invoice.status === 'OVERDUE' ? `
                        <button class="btn btn-sm btn-success btn-icon" 
                                onclick="openRecordPaymentModal('${invoice.invoiceId}', ${invoice.finalAmount})"
                                title="Record Payment">
                            <i class="fas fa-dollar-sign"></i>
                        </button>
                    ` : ''}
                    ${invoice.status !== 'CANCELLED' ? `
                        <select class="form-control" style="width: auto; padding: 0.375rem 0.5rem; font-size: 0.8125rem;"
                                onchange="updateInvoiceStatus('${invoice.invoiceId}', this.value)">
                            <option value="">Update Status</option>
                            <option value="PAID" ${invoice.status === 'PAID' ? 'selected' : ''}>Paid</option>
                            <option value="UNPAID" ${invoice.status === 'UNPAID' ? 'selected' : ''}>Unpaid</option>
                            <option value="CANCELLED">Cancel</option>
                        </select>
                    ` : '<span class="badge badge-secondary">Cancelled</span>'}
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter invoices
function filterInvoices() {
    const statusFilter = document.getElementById('statusFilter').value;
    const startDate = document.getElementById('startDateFilter').value;
    const endDate = document.getElementById('endDateFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    filteredInvoices = allInvoices.filter(invoice => {
        const matchesStatus = !statusFilter || invoice.status === statusFilter;
        
        const invoiceDate = new Date(invoice.invoiceDate);
        const matchesStartDate = !startDate || invoiceDate >= new Date(startDate);
        const matchesEndDate = !endDate || invoiceDate <= new Date(endDate);
        
        const matchesSearch = !searchQuery || 
            invoice.invoiceId.toLowerCase().includes(searchQuery) ||
            invoice.orderId.toLowerCase().includes(searchQuery);
        
        return matchesStatus && matchesStartDate && matchesEndDate && matchesSearch;
    });

    displayInvoices();
    updateTotalCount();
}

// Update total count
function updateTotalCount() {
    document.getElementById('totalCount').textContent = filteredInvoices.length;
}

// Setup search with debounce
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(filterInvoices, 300));
}

// Open generate invoice modal
async function openGenerateInvoiceModal() {
    console.log('Opening generate invoice modal...'); // Debug log
    document.getElementById('generateInvoiceModal').classList.add('show');
    document.getElementById('ordersListContainer').innerHTML = '<div class="loading-container"><div class="spinner"></div></div>';
    await loadOrdersForInvoice();
}

// Close generate invoice modal
function closeGenerateInvoiceModal() {
    document.getElementById('generateInvoiceModal').classList.remove('show');
}

// Load orders for invoice generation
async function loadOrdersForInvoice() {
    const container = document.getElementById('ordersListContainer');
    
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS_LIST}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load orders');
        }

        allOrders = await response.json();
        
        // Filter orders that don't have invoices yet
        const ordersWithoutInvoices = [];
        for (const order of allOrders) {
            const hasInvoice = allInvoices.some(inv => inv.orderId === order.orderId);
            if (!hasInvoice && order.status !== 'CANCELLED') {
                ordersWithoutInvoices.push(order);
            }
        }
        
        displayOrdersList(ordersWithoutInvoices);

    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--danger);">
                Failed to load orders
            </div>
        `;
    }
}

// Display orders list
function displayOrdersList(orders) {
    const container = document.getElementById('ordersListContainer');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-check-circle" style="font-size: 2rem; display: block; margin-bottom: 1rem; opacity: 0.5;"></i>
                All orders have invoices generated
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-select-item" onclick="generateInvoiceFromOrder('${order.orderId}')">
            <div class="order-info">
                <h4>#${order.orderId.substring(0, 8)} - ${order.customerName || 'N/A'}</h4>
                <p>${formatDateTime(order.orderDate)} • ${formatCurrency(order.totalAmount)}</p>
            </div>
            <button class="btn btn-primary btn-sm">
                <i class="fas fa-file-invoice"></i>
                Generate
            </button>
        </div>
    `).join('');
}

// Setup order search
document.getElementById('orderSearchInput')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const ordersWithoutInvoices = allOrders.filter(order => {
        const hasInvoice = allInvoices.some(inv => inv.orderId === order.orderId);
        const matchesSearch = order.orderId.toLowerCase().includes(searchTerm) ||
                            (order.customerName && order.customerName.toLowerCase().includes(searchTerm));
        return !hasInvoice && order.status !== 'CANCELLED' && matchesSearch;
    });
    displayOrdersList(ordersWithoutInvoices);
});

// Generate invoice from order
async function generateInvoiceFromOrder(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/invoices/generate/${orderId}`, {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to generate invoice');
        }

        const invoice = await response.json();
        showSuccess('Invoice generated successfully!');
        closeGenerateInvoiceModal();
        await loadInvoices();
        viewInvoiceDetails(invoice.invoiceId);

    } catch (error) {
        console.error('Error generating invoice:', error);
        showError(error.message || 'Failed to generate invoice');
    }
}

// View invoice details
async function viewInvoiceDetails(invoiceId) {
    document.getElementById('viewInvoiceModal').classList.add('show');
    document.getElementById('invoiceDetailsContent').innerHTML = '<div class="loading-container"><div class="spinner"></div></div>';
    currentInvoice = null;

    try {
        // Get invoice details
        const invoiceResponse = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}`, {
            credentials: 'include'
        });

        if (!invoiceResponse.ok) {
            throw new Error('Failed to load invoice details');
        }

        const invoice = currentInvoice = await invoiceResponse.json();

        // Get order details
        const orderResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS_BY_ID}/${invoice.orderId}`, {
            credentials: 'include'
        });

        let orderDetails = null;
        if (orderResponse.ok) {
            orderDetails = await orderResponse.json();
        }

        // Get payments for this invoice
        const paymentsResponse = await fetch(`${API_BASE_URL}/api/payments/invoice/${invoiceId}`, {
            credentials: 'include'
        });

        let payments = [];
        if (paymentsResponse.ok) {
            payments = await paymentsResponse.json();
        }

        // Calculate remaining balance
        const totalPaid = payments
            .filter(p => p.status === 'SUCCESS')
            .reduce((sum, p) => sum + p.amount, 0);
        const remainingBalance = invoice.finalAmount - totalPaid;

        // Build invoice HTML
        const detailsHTML = `
            <div class="invoice-header">
                <div class="invoice-company">
                    <div class="company-name">
                        <i class="fas fa-boxes"></i> Inventory MS
                    </div>
                    <div class="company-details">
                        123 Business Street<br>
                        City, State 12345<br>
                        Phone: (555) 123-4567<br>
                        Email: info@inventoryms.com
                    </div>
                </div>
                <div class="invoice-meta">
                    <div class="invoice-number">
                        INVOICE #${invoice.invoiceId.substring(0, 8).toUpperCase()}
                    </div>
                    <div class="invoice-dates">
                        <strong>Invoice Date:</strong> ${formatDate(invoice.invoiceDate)}<br>
                        <strong>Due Date:</strong> ${formatDate(invoice.dueDate)}<br>
                        <strong>Order ID:</strong> #${invoice.orderId.substring(0, 8)}
                    </div>
                    <div style="margin-top: 1rem;">
                        ${getStatusBadge(invoice.status)}
                    </div>
                </div>
            </div>

            ${orderDetails ? `
            <div class="order-detail-section">
                <h4 class="order-detail-title">Bill To</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Customer Name</span>
                        <span class="detail-value">${orderDetails.customerName || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Shipping Address</span>
                        <span class="detail-value">${orderDetails.shippingAddress || 'N/A'}</span>
                    </div>
                </div>
            </div>
            ` : ''}

            <div class="invoice-table">
                <h4 class="order-detail-title">Invoice Items</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Order #${invoice.orderId.substring(0, 8)}</td>
                            <td style="text-align: right;">${formatCurrency(invoice.totalAmount)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="invoice-totals">
                <div class="totals-section">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <strong>${formatCurrency(invoice.totalAmount)}</strong>
                    </div>
                    <div class="total-row">
                        <span>Tax (10%):</span>
                        <strong>${formatCurrency(invoice.taxAmount || 0)}</strong>
                    </div>
                    ${invoice.discountAmount > 0 ? `
                    <div class="total-row">
                        <span>Discount:</span>
                        <strong style="color: var(--success);">-${formatCurrency(invoice.discountAmount)}</strong>
                    </div>
                    ` : ''}
                    <div class="total-row final">
                        <span>Total Amount:</span>
                        <strong>${formatCurrency(invoice.finalAmount)}</strong>
                    </div>
                </div>
            </div>

            ${payments.length > 0 ? `
            <div class="payment-summary">
                <h4 class="order-detail-title">Payment History</h4>
                ${payments.map(payment => `
                    <div class="payment-item">
                        <div class="payment-info">
                            <div class="payment-method">
                                <i class="fas fa-credit-card"></i> ${payment.paymentMethod}
                            </div>
                            <div class="payment-date">
                                ${formatDateTime(payment.paymentDate)} • ${getStatusBadge(payment.status)}
                            </div>
                        </div>
                        <div class="payment-amount">${formatCurrency(payment.amount)}</div>
                    </div>
                `).join('')}
                <div class="total-row" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <span>Total Paid:</span>
                    <strong style="color: var(--success);">${formatCurrency(totalPaid)}</strong>
                </div>
                ${remainingBalance > 0 ? `
                <div class="total-row">
                    <span>Remaining Balance:</span>
                    <strong style="color: var(--warning);">${formatCurrency(remainingBalance)}</strong>
                </div>
                ` : ''}
            </div>
            ` : ''}

            ${invoice.notes ? `
            <div class="order-detail-section">
                <h4 class="order-detail-title">Notes</h4>
                <p>${invoice.notes}</p>
            </div>
            ` : ''}

            <div class="order-detail-section">
                <h4 class="order-detail-title">Actions</h4>
                <div class="d-flex gap-2">
                    ${invoice.status === 'UNPAID' || invoice.status === 'OVERDUE' ? `
                        <button class="btn btn-success" onclick="openRecordPaymentModal('${invoice.invoiceId}', ${remainingBalance})">
                            <i class="fas fa-dollar-sign"></i>
                            Record Payment
                        </button>
                    ` : ''}
                    <a href="payments.html?invoiceId=${invoice.invoiceId}" class="btn btn-secondary">
                        <i class="fas fa-credit-card"></i>
                        View Payments
                    </a>
                    <button class="btn btn-secondary" onclick="printInvoice()">
                        <i class="fas fa-print"></i>
                        Print
                    </button>
                    <button class="btn btn-secondary" onclick="downloadInvoicePDF()">
                        <i class="fas fa-download"></i>
                        Download PDF
                    </button>
                </div>
            </div>
        `;

        document.getElementById('invoiceDetailsContent').innerHTML = detailsHTML;

    } catch (error) {
        console.error('Error loading invoice details:', error);
        document.getElementById('invoiceDetailsContent').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--danger);">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
                Failed to load invoice details
            </div>
        `;
    }
}

// View invoice by order ID
async function viewInvoiceByOrderId(orderId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/invoices/order/${orderId}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const invoice = await response.json();
            viewInvoiceDetails(invoice.invoiceId);
        } else {
            showError('No invoice found for this order');
        }
    } catch (error) {
        console.error('Error loading invoice:', error);
        showError('Failed to load invoice');
    }
}

// Close view invoice modal
function closeViewInvoiceModal() {
    document.getElementById('viewInvoiceModal').classList.remove('show');
    currentInvoice = null;
}

// Update invoice status
async function updateInvoiceStatus(invoiceId, newStatus) {
    if (!newStatus) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/status?status=${newStatus}`, {
            method: 'PATCH',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to update invoice status');
        }

        showSuccess(`Invoice status updated to ${newStatus}`);
        loadInvoices();

    } catch (error) {
        console.error('Error updating invoice status:', error);
        showError('Failed to update invoice status');
        loadInvoices();
    }
}

// Open record payment modal
function openRecordPaymentModal(invoiceId, amountDue) {
    document.getElementById('recordPaymentModal').classList.add('show');
    document.getElementById('paymentInvoiceId').value = invoiceId;
    document.getElementById('amountDue').value = formatCurrency(amountDue);
    document.getElementById('paymentAmount').value = amountDue.toFixed(2);
    document.getElementById('paymentForm').reset();
    document.getElementById('paymentAmount').value = amountDue.toFixed(2);
}

// Close record payment modal
function closeRecordPaymentModal() {
    document.getElementById('recordPaymentModal').classList.remove('show');
}

// Handle payment form submission
document.getElementById('paymentForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const invoiceId = document.getElementById('paymentInvoiceId').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const transactionId = document.getElementById('transactionId').value;
    const notes = document.getElementById('paymentNotes').value;

    const paymentData = {
        invoiceId: invoiceId,
        amount: amount,
        paymentMethod: paymentMethod,
        transactionId: transactionId || null,
        notes: notes || null,
        status: 'SUCCESS'
    };

    try {
        const response = await fetch(`${API_BASE_URL}/api/payments`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
            throw new Error('Failed to record payment');
        }

        showSuccess('Payment recorded successfully!');
        closeRecordPaymentModal();
        await loadInvoices();
        
        // Refresh invoice details if it's open
        if (currentInvoice) {
            viewInvoiceDetails(currentInvoice.invoiceId);
        }

    } catch (error) {
        console.error('Error recording payment:', error);
        showError('Failed to record payment');
    }
});

// Print invoice
function printInvoice() {
    window.print();
}

// Download invoice as PDF (placeholder - requires backend implementation)
function downloadInvoicePDF() {
    showError('PDF download feature coming soon!');
    // TODO: Implement PDF generation
}

// Format date (without time)
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Handle logout
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        await logout();
    }
}

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