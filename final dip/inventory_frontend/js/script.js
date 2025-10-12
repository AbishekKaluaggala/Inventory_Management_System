// API Base URL
const API_BASE = 'http://localhost:8080/api';

// Global variables
let currentUser = null;
let editingProduct = false;
let editingUser = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Product form
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    
    // User form
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);
    
    // Search on Enter key
    document.getElementById('productSearch').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });
}

// ========================
// Authentication Functions
// ========================

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        showAlert('loginAlert', 'Logging in...', 'info');
        
        const response = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data) {
            currentUser = data;
            showAlert('loginAlert', 'Login successful!', 'success');
            setTimeout(() => {
                showMainApp();
            }, 1000);
        } else {
            showAlert('loginAlert', 'Invalid username or password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('loginAlert', 'Connection error. Make sure the server is running on localhost:8080', 'error');
    }
}

function showMainApp() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // Update user info
    document.getElementById('userInfo').textContent = `Welcome, ${currentUser.username} (${currentUser.role})`;
    
    // Hide users tab for non-admin users
    if (currentUser.role !== 'ADMIN') {
        document.getElementById('usersTab').style.display = 'none';
    }
    
    // Load dashboard data
    loadDashboardData();
}

function logout() {
    currentUser = null;
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginForm').reset();
    showAlert('loginAlert', '', '');
}

// ========================
// Navigation Functions
// ========================

function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all nav tabs
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Load data based on tab
    switch(tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadAllProducts();
            break;
        case 'users':
            loadAllUsers();
            break;
    }
}

// ========================
// Dashboard Functions
// ========================

async function loadDashboardData() {
    try {
        const [productsResponse, usersResponse, lowStockResponse] = await Promise.all([
            fetch(`${API_BASE}/products`),
            fetch(`${API_BASE}/users`),
            fetch(`${API_BASE}/products/low-stock`)
        ]);
        
        const products = await productsResponse.json();
        const users = await usersResponse.json();
        const lowStockProducts = await lowStockResponse.json();
        
        // Update stats
        updateDashboardStats(products, users, lowStockProducts);
        
        // Update low stock table
        updateLowStockTable(lowStockProducts);
        
    } catch (error) {
        console.error('Dashboard load error:', error);
        showAlert('loginAlert', 'Error loading dashboard data', 'error');
    }
}

function updateDashboardStats(products, users, lowStockProducts) {
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stockQty), 0);
    
    const statsHTML = `
        <div class="stat-card">
            <div class="stat-number">${products.length}</div>
            <div class="stat-label">Total Products</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${users.length}</div>
            <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${lowStockProducts.length}</div>
            <div class="stat-label">Low Stock Items</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">$${totalValue.toFixed(2)}</div>
            <div class="stat-label">Inventory Value</div>
        </div>
    `;
    
    document.getElementById('statsGrid').innerHTML = statsHTML;
}

function updateLowStockTable(products) {
    const tbody = document.getElementById('lowStockTable');
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No low stock items</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.productId}</td>
            <td>${product.name}</td>
            <td class="low-stock">${product.stockQty}</td>
            <td>${product.minStockLevel}</td>
            <td>
                <button class="btn" onclick="updateStock('${product.productId}')">Update Stock</button>
            </td>
        </tr>
    `).join('');
}

// ========================
// Product Functions
// ========================

async function loadAllProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        const products = await response.json();
        updateProductsTable(products);
    } catch (error) {
        console.error('Products load error:', error);
    }
}

async function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.trim();
    if (!searchTerm) {
        loadAllProducts();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/products/search?name=${encodeURIComponent(searchTerm)}`);
        const products = await response.json();
        updateProductsTable(products);
    } catch (error) {
        console.error('Product search error:', error);
    }
}

function updateProductsTable(products) {
    const tbody = document.getElementById('productsTable');
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.productId}</td>
            <td>${product.name}</td>
            <td>${product.description || 'N/A'}</td>
            <td>$${product.price}</td>
            <td>${product.stockQty}</td>
            <td>${product.minStockLevel}</td>
            <td>${product.maxStockLevel}</td>
            <td>
                <button class="btn" onclick="editProduct('${product.productId}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteProduct('${product.productId}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// ========================
// Product Modal Functions
// ========================

function showAddProductModal() {
    editingProduct = false;
    document.getElementById('productModalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').readOnly = false;
    document.getElementById('productModal').style.display = 'block';
}

async function editProduct(productId) {
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`);
        const product = await response.json();
        
        editingProduct = true;
        document.getElementById('productModalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.productId;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('stockQty').value = product.stockQty;
        document.getElementById('minStockLevel').value = product.minStockLevel;
        document.getElementById('maxStockLevel').value = product.maxStockLevel;
        document.getElementById('productId').readOnly = true;
        document.getElementById('productModal').style.display = 'block';
    } catch (error) {
        console.error('Edit product error:', error);
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData.entries());
    
    // Convert numeric fields
    productData.price = parseFloat(productData.price);
    productData.stockQty = parseInt(productData.stockQty);
    productData.minStockLevel = parseInt(productData.minStockLevel);
    productData.maxStockLevel = parseInt(productData.maxStockLevel);
    
    try {
        const url = editingProduct ? `${API_BASE}/products/${productData.productId}` : `${API_BASE}/products`;
        const method = editingProduct ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            closeProductModal();
            loadAllProducts();
        } else {
            alert('Error saving product');
        }
    } catch (error) {
        console.error('Product save error:', error);
        alert('Error saving product');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadAllProducts();
        } else {
            alert('Error deleting product');
        }
    } catch (error) {
        console.error('Delete product error:', error);
        alert('Error deleting product');
    }
}

async function updateStock(productId) {
    const newStock = prompt('Enter new stock quantity:');
    if (newStock === null || newStock === '') return;
    
    const stockQty = parseInt(newStock);
    if (isNaN(stockQty) || stockQty < 0) {
        alert('Please enter a valid stock quantity');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/products/${productId}/stock`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stockQty })
        });
        
        if (response.ok) {
            loadDashboardData();
        } else {
            alert('Error updating stock');
        }
    } catch (error) {
        console.error('Update stock error:', error);
        alert('Error updating stock');
    }
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// ========================
// User Functions
// ========================

async function loadAllUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();
        updateUsersTable(users);
    } catch (error) {
        console.error('Users load error:', error);
    }
}

async function filterByRole() {
    const role = document.getElementById('roleFilter').value;
    if (!role) {
        loadAllUsers();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/users/role/${role}`);
        const users = await response.json();
        updateUsersTable(users);
    } catch (error) {
        console.error('Filter users error:', error);
    }
}

function updateUsersTable(users) {
    const tbody = document.getElementById('usersTable');
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.userID}</td>
            <td>${user.username}</td>
            <td>${user.role}</td>
            <td>
                <button class="btn" onclick="editUser('${user.userID}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteUser('${user.userID}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// ========================
// User Modal Functions
// ========================

function showAddUserModal() {
    editingUser = false;
    document.getElementById('userModalTitle').textContent = 'Add User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').readOnly = false;
    document.getElementById('userModal').style.display = 'block';
}

async function editUser(userId) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`);
        const user = await response.json();
        
        editingUser = true;
        document.getElementById('userModalTitle').textContent = 'Edit User';
        document.getElementById('userId').value = user.userID;
        document.getElementById('userName').value = user.username;
        document.getElementById('userPassword').value = ''; // Don't show existing password
        document.getElementById('userRole').value = user.role;
        document.getElementById('userId').readOnly = true;
        document.getElementById('userModal').style.display = 'block';
    } catch (error) {
        console.error('Edit user error:', error);
    }
}

async function handleUserSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());
    
    try {
        const url = editingUser ? `${API_BASE}/users/${userData.userID}` : `${API_BASE}/users`;
        const method = editingUser ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            closeUserModal();
            loadAllUsers();
        } else {
            alert('Error saving user');
        }
    } catch (error) {
        console.error('User save error:', error);
        alert('Error saving user');
    }
}

async function deleteUser(userId) {
    if (currentUser.userID === userId) {
        alert('Cannot delete your own account');
        return;
    }
    
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadAllUsers();
        } else {
            alert('Error deleting user');
        }
    } catch (error) {
        console.error('Delete user error:', error);
        alert('Error deleting user');
    }
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

// ========================
// Utility Functions
// ========================

function showAlert(elementId, message, type) {
    const alertDiv = document.getElementById(elementId);
    if (!message) {
        alertDiv.innerHTML = '';
        return;
    }
    
    const alertClass = type === 'success' ? 'alert-success' : 
                      type === 'error' ? 'alert-error' : 
                      'alert-success';
    
    alertDiv.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
}

// Close modals when clicking outside
window.onclick = function(event) {
    const productModal = document.getElementById('productModal');
    const userModal = document.getElementById('userModal');
    
    if (event.target === productModal) {
        closeProductModal();
    }
    if (event.target === userModal) {
        closeUserModal();
    }
}