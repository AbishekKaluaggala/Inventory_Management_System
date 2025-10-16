// Orders Management JavaScript

let allOrders = [];
let filteredOrders = [];
let allProducts = [];
let selectedOrderProducts = [];
let currentStep = 1;

// Check auth and load data on page load
document.addEventListener('DOMContentLoaded', async function() {
    const isAuthenticated = await checkAuth();
    
    if (!isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }

    loadUserInfo();
    await loadProducts();
    await loadOrders();
    setupMobileMenu();
    setupSearch();
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

// Load products for order creation
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`, {
            credentials: 'include'
        });

        if (response.ok) {
            allProducts = await response.json();
            populateProductSelect();
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Populate product select dropdown
function populateProductSelect() {
    const select = document.getElementById('productSelect');
    
    const options = allProducts
        .filter(p => p.stockQty > 0) // Only show products in stock
        .map(product => `
            <option value="${product.productId}" 
                    data-name="${product.name}" 
                    data-price="${product.price}" 
                    data-stock="${product.stockQty}">
                ${product.name} - ${formatCurrency(product.price)} (Stock: ${product.stockQty})
            </option>
        `).join('');
    
    select.innerHTML = '<option value="">Choose a product...</option>' + options;
}

// Load all orders
async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS_LIST}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load orders');
        }

        allOrders = await response.json();
        filteredOrders = [...allOrders];
        
        displayOrders();
        updateTotalCount();

    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Failed to load orders');
        document.getElementById('ordersTableBody').innerHTML = `
            <tr>
                <td colspan="6" class="text-center" style="color: var(--danger); padding: 2rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
                    Failed to load orders
                </td>
            </tr>
        `;
    }
}

// Display orders in table
function displayOrders() {
    const tbody = document.getElementById('ordersTableBody');

    if (filteredOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-shopping-cart" style="font-size: 2rem; display: block; margin-bottom: 1rem; opacity: 0.5;"></i>
                    No orders found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td>
                <strong>#${order.orderId.substring(0, 8)}</strong>
            </td>
            <td>${order.customerName || 'N/A'}</td>
            <td>${formatDateTime(order.orderDate)}</td>
            <td><strong>${formatCurrency(order.totalAmount)}</strong></td>
            <td>
                <div class="order-status-badge">
                    <span class="status-dot ${order.status.toLowerCase()}"></span>
                    ${getStatusBadge(order.status)}
                </div>
            </td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-secondary btn-icon" 
                            onclick="viewOrderDetails('${order.orderId}')"
                            title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <select class="form-control" style="width: auto; padding: 0.375rem 0.5rem; font-size: 0.8125rem;"
                            onchange="updateOrderStatus('${order.orderId}', this.value)">
                        <option value="">Change Status</option>
                        <option value="PENDING" ${order.status === 'PENDING' ? 'selected' : ''}>Pending</option>
                        <option value="CONFIRMED" ${order.status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
                        <option value="COMPLETED" ${order.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                        <option value="CANCELLED" ${order.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter orders
function filterOrders() {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    filteredOrders = allOrders.filter(order => {
        const matchesStatus = !statusFilter || order.status === statusFilter;
        const matchesSearch = !searchQuery || 
            order.orderId.toLowerCase().includes(searchQuery) ||
            (order.customerName && order.customerName.toLowerCase().includes(searchQuery));
        
        return matchesStatus && matchesSearch;
    });

    displayOrders();
    updateTotalCount();
}

// Update total count
function updateTotalCount() {
    document.getElementById('totalCount').textContent = filteredOrders.length;
}

// Setup search with debounce
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(filterOrders, 300));
}

// Open create order modal
function openCreateOrderModal() {
    selectedOrderProducts = [];
    currentStep = 1;
    document.getElementById('createOrderModal').classList.add('show');
    document.getElementById('productSelect').value = '';
    document.getElementById('selectedProducts').innerHTML = '';
    showStep(1);
}

// Close create order modal
function closeCreateOrderModal() {
    document.getElementById('createOrderModal').classList.remove('show');
}

// Handle product selection
document.getElementById('productSelect').addEventListener('change', function() {
    const productId = this.value;
    if (!productId) return;

    const option = this.options[this.selectedIndex];
    const productName = option.dataset.name;
    const productPrice = parseFloat(option.dataset.price);
    const productStock = parseInt(option.dataset.stock);

    // Check if product already selected
    if (selectedOrderProducts.find(p => p.productId === productId)) {
        showError('Product already added to order');
        this.value = '';
        return;
    }

    // Add product
    selectedOrderProducts.push({
        productId,
        name: productName,
        price: productPrice,
        maxStock: productStock,
        quantity: 1
    });

    displaySelectedProducts();
    this.value = '';
});

// Display selected products
function displaySelectedProducts() {
    const container = document.getElementById('selectedProducts');

    if (selectedOrderProducts.length === 0) {
        container.innerHTML = '<p class="text-secondary">No products selected yet. Choose products from the dropdown above.</p>';
        document.getElementById('nextStep1').disabled = true;
        return;
    }

    document.getElementById('nextStep1').disabled = false;

    container.innerHTML = selectedOrderProducts.map((product, index) => `
        <div class="product-item">
            <div class="product-item-info">
                <div class="product-item-name">${product.name}</div>
                <div class="product-item-price">${formatCurrency(product.price)} each</div>
            </div>
            <input type="number" 
                   class="form-control quantity-input" 
                   value="${product.quantity}" 
                   min="1" 
                   max="${product.maxStock}"
                   onchange="updateProductQuantity(${index}, this.value)">
            <button class="remove-item-btn" onclick="removeProduct(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Update product quantity
function updateProductQuantity(index, quantity) {
    const qty = parseInt(quantity);
    const product = selectedOrderProducts[index];

    if (qty < 1) {
        showError('Quantity must be at least 1');
        return;
    }

    if (qty > product.maxStock) {
        showError(`Only ${product.maxStock} units available in stock`);
        return;
    }

    selectedOrderProducts[index].quantity = qty;
    displaySelectedProducts();
}

// Remove product from order
function removeProduct(index) {
    selectedOrderProducts.splice(index, 1);
    displaySelectedProducts();
}

// Navigate to next step
function nextStep(step) {
    if (step === 2) {
        if (selectedOrderProducts.length === 0) {
            showError('Please add at least one product');
            return;
        }
    }

    if (step === 3) {
        const customerName = document.getElementById('customerName').value.trim();
        const shippingAddress = document.getElementById('shippingAddress').value.trim();

        if (!customerName || !shippingAddress) {
            showError('Please fill in customer information');
            return;
        }

        // Populate review step
        populateReviewStep();
    }

    showStep(step);
}

// Navigate to previous step
function previousStep(step) {
    showStep(step);
}

// Show specific step
function showStep(step) {
    currentStep = step;

    // Hide all steps
    for (let i = 1; i <= 3; i++) {
        document.getElementById(`stepContent${i}`).style.display = 'none';
        document.getElementById(`step${i}`).classList.remove('active', 'completed');
    }

    // Show current step
    document.getElementById(`stepContent${step}`).style.display = 'block';
    document.getElementById(`step${step}`).classList.add('active');

    // Mark previous steps as completed
    for (let i = 1; i < step; i++) {
        document.getElementById(`step${i}`).classList.add('completed');
    }
}

// Populate review step
function populateReviewStep() {
    const customerName = document.getElementById('customerName').value.trim();
    const shippingAddress = document.getElementById('shippingAddress').value.trim();

    document.getElementById('reviewCustomerName').textContent = customerName;
    document.getElementById('reviewShippingAddress').textContent = shippingAddress;

    // Calculate totals
    let subtotal = 0;
    const reviewProducts = document.getElementById('reviewProducts');
    
    reviewProducts.innerHTML = selectedOrderProducts.map(product => {
        const itemTotal = product.price * product.quantity;
        subtotal += itemTotal;
        
        return `
            <div class="product-item" style="background: var(--bg-secondary);">
                <div class="product-item-info">
                    <div class="product-item-name">${product.name}</div>
                    <div class="product-item-price">
                        ${formatCurrency(product.price)} × ${product.quantity} = ${formatCurrency(itemTotal)}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const tax = subtotal * 0.10; // 10% tax
    const total = subtotal + tax;

    document.getElementById('reviewSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('reviewTax').textContent = formatCurrency(tax);
    document.getElementById('reviewTotal').textContent = formatCurrency(total);
}

// Submit order
async function submitOrder() {
    const customerName = document.getElementById('customerName').value.trim();
    const shippingAddress = document.getElementById('shippingAddress').value.trim();

    // Prepare form data
    const formData = new FormData();
    formData.append('customerName', customerName);
    formData.append('shippingAddress', shippingAddress);
    formData.append('status', 'PENDING');
    
    // Add userId - THIS IS THE ONLY NEW CODE
    const user = getCurrentUser();
    if (user && user.username) {
        formData.append('userId', user.username);  // or use user.userId if it exists
    } else {
        formData.append('userId', 'GUEST');
    }

    // Add product IDs and quantities as arrays
    selectedOrderProducts.forEach(product => {
        formData.append('productIds', product.productId);
        formData.append('quantities', product.quantity);
    });

    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS_CREATE}`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to create order');
        }

        showSuccess('Order created successfully! Invoice generated automatically.');
        closeCreateOrderModal();
        loadOrders();

    } catch (error) {
        console.error('Error creating order:', error);
        showError(error.message || 'Failed to create order. Please check stock availability.');
    }
}

// View order details
async function viewOrderDetails(orderId) {
    document.getElementById('viewOrderModal').classList.add('show');
    document.getElementById('orderDetailsContent').innerHTML = '<div class="loading-container"><div class="spinner"></div></div>';

    try {
        // Get order details
        const orderResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS_LIST}`, {
            credentials: 'include'
        });

        if (!orderResponse.ok) {
            throw new Error('Failed to load order details');
        }

        const orders = await orderResponse.json();
        const order = orders.find(o => o.orderId === orderId);

        if (!order) {
            throw new Error('Order not found');
        }

        // Get order items (you'll need to implement this endpoint)
        // For now, we'll show basic order info
        
        const detailsHTML = `
            <div class="order-detail-section">
                <div class="order-detail-header">
                    <h4 class="order-detail-title">Order #${order.orderId.substring(0, 8)}</h4>
                    ${getStatusBadge(order.status)}
                </div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Customer Name</span>
                        <span class="detail-value">${order.customerName || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Order Date</span>
                        <span class="detail-value">${formatDateTime(order.orderDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Shipping Address</span>
                        <span class="detail-value">${order.shippingAddress || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Total Amount</span>
                        <span class="detail-value" style="color: var(--accent-primary); font-size: 1.25rem;">
                            ${formatCurrency(order.totalAmount)}
                        </span>
                    </div>
                </div>
            </div>

            <div class="order-detail-section">
                <h4 class="order-detail-title">Actions</h4>
                <div class="d-flex gap-2">
                    <a href="invoices.html?orderId=${order.orderId}" class="btn btn-primary">
                        <i class="fas fa-file-invoice"></i>
                        View Invoice
                    </a>
                    <button class="btn btn-secondary" onclick="window.print()">
                        <i class="fas fa-print"></i>
                        Print Order
                    </button>
                </div>
            </div>
        `;

        document.getElementById('orderDetailsContent').innerHTML = detailsHTML;

    } catch (error) {
        console.error('Error loading order details:', error);
        document.getElementById('orderDetailsContent').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--danger);">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
                Failed to load order details
            </div>
        `;
    }
}



// Close view order modal
function closeViewOrderModal() {
    document.getElementById('viewOrderModal').classList.remove('show');
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    if (!newStatus) return;

    try {
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('status', newStatus);

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS_UPDATE_STATUS}`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to update order status');
        }

        showSuccess(`Order status updated to ${newStatus}`);
        loadOrders();

    } catch (error) {
        console.error('Error updating order status:', error);
        showError('Failed to update order status');
        loadOrders(); // Reload to reset dropdown
    }
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

// Close modals on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCreateOrderModal();
        closeViewOrderModal();
    }
});