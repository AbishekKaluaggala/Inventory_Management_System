// Products Management JavaScript

let allProducts = [];
let filteredProducts = [];
let allCategories = [];
let currentView = 'grid';

// Check auth and load data on page load
document.addEventListener('DOMContentLoaded', async function() {
    const isAuthenticated = await checkAuth();
    
    if (!isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }

    loadUserInfo();
    await loadCategories();
    await loadProducts();
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

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CATEGORIES}`, {
            credentials: 'include'
        });

        if (response.ok) {
            allCategories = await response.json();
            populateCategoryDropdowns();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Populate category dropdowns
function populateCategoryDropdowns() {
    const filterSelect = document.getElementById('categoryFilter');
    const newSelect = document.getElementById('newProductCategory');
    const editSelect = document.getElementById('editProductCategory');

    const options = allCategories.map(cat => 
        `<option value="${cat.categoryId}">${cat.categoryName}</option>`
    ).join('');

    if (filterSelect) {
        filterSelect.innerHTML += options;
    }
    if (newSelect) {
        newSelect.innerHTML += options;
    }
    if (editSelect) {
        editSelect.innerHTML += options;
    }
}

// Load all products
async function loadProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load products');
        }

        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        displayProducts();
        updateLowStockCount();
        updateTotalCount();

    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products');
        document.getElementById('productsGrid').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--danger);">
                <i class="fas fa-exclamation-circle" style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
                Failed to load products
            </div>
        `;
    }
}

// Display products based on current view
function displayProducts() {
    if (currentView === 'grid') {
        displayProductsGrid();
    } else {
        displayProductsTable();
    }
}

// Display products in grid view
function displayProductsGrid() {
    const container = document.getElementById('productsGrid');

    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-box-open" style="font-size: 3rem; display: block; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No products found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredProducts.map(product => {
        const isLowStock = product.stockQty < product.minStockLevel;
        const stockClass = isLowStock ? 'low' : 'normal';
        
        return `
            <div class="product-card">
                <div class="product-header">
                    <span class="product-id">${product.productId}</span>
                    <div class="product-actions">
                        <button class="btn btn-sm btn-secondary btn-icon" 
                                onclick="openEditProductModal('${product.productId}')"
                                title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-icon" 
                                onclick="deleteProduct('${product.productId}', '${product.name}')"
                                title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>

                <div class="product-image">
                    <i class="fas fa-box"></i>
                </div>

                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>

                <div class="product-price">${formatCurrency(product.price)}</div>

                <div class="product-footer">
                    <div class="stock-info">
                        <span class="stock-label">Stock</span>
                        <span class="stock-value ${stockClass}">
                            ${product.stockQty} ${isLowStock ? '⚠️' : ''}
                        </span>
                    </div>
                    ${isLowStock ? `
                        <span class="badge badge-warning">Low Stock</span>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Display products in table view
function displayProductsTable() {
    const tbody = document.getElementById('productsTableBody');

    if (filteredProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-box-open" style="font-size: 2rem; display: block; margin-bottom: 1rem; opacity: 0.5;"></i>
                    No products found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredProducts.map(product => {
        const isLowStock = product.stockQty < product.minStockLevel;
        const isOutOfStock = product.stockQty === 0;
        
        let statusBadge = '';
        if (isOutOfStock) {
            statusBadge = '<span class="badge badge-danger">Out of Stock</span>';
        } else if (isLowStock) {
            statusBadge = '<span class="badge badge-warning">Low Stock</span>';
        } else {
            statusBadge = '<span class="badge badge-success">In Stock</span>';
        }
        
        return `
            <tr>
                <td><strong>${product.productId}</strong></td>
                <td>${product.name}</td>
                <td>${getCategoryName(product.categoryId)}</td>
                <td>${formatCurrency(product.price)}</td>
                <td><strong>${product.stockQty}</strong> / ${product.maxStockLevel}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-sm btn-secondary btn-icon" 
                                onclick="openEditProductModal('${product.productId}')"
                                title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger btn-icon" 
                                onclick="deleteProduct('${product.productId}', '${product.name}')"
                                title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Get category name by ID
function getCategoryName(categoryId) {
    if (!categoryId) return 'Uncategorized';
    const category = allCategories.find(c => c.categoryId === categoryId);
    return category ? category.categoryName : 'Unknown';
}

// Switch between grid and table view
function switchView(view) {
    currentView = view;
    
    const gridView = document.getElementById('productsGrid');
    const tableView = document.getElementById('productsTable');
    const buttons = document.querySelectorAll('.view-toggle button');
    
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (view === 'grid') {
        gridView.style.display = 'grid';
        tableView.style.display = 'none';
        buttons[0].classList.add('active');
    } else {
        gridView.style.display = 'none';
        tableView.style.display = 'block';
        buttons[1].classList.add('active');
    }
    
    displayProducts();
}

// Filter products
function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const stockFilter = document.getElementById('stockFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    filteredProducts = allProducts.filter(product => {
        const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
        const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery);
        
        let matchesStock = true;
        if (stockFilter === 'low') {
            matchesStock = product.stockQty < product.minStockLevel && product.stockQty > 0;
        } else if (stockFilter === 'out') {
            matchesStock = product.stockQty === 0;
        } else if (stockFilter === 'normal') {
            matchesStock = product.stockQty >= product.minStockLevel;
        }
        
        return matchesCategory && matchesStock && matchesSearch;
    });

    displayProducts();
    updateTotalCount();
}

// Show only low stock products
function showLowStockProducts() {
    document.getElementById('stockFilter').value = 'low';
    filterProducts();
}

// Update low stock count
function updateLowStockCount() {
    const lowStockCount = allProducts.filter(p => p.stockQty < p.minStockLevel).length;
    document.getElementById('lowStockCount').textContent = lowStockCount;
}

// Update total count
function updateTotalCount() {
    document.getElementById('totalCount').textContent = filteredProducts.length;
}

// Setup search with debounce
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(filterProducts, 300));
}

// Open add product modal
function openAddProductModal() {
    document.getElementById('addProductModal').classList.add('show');
    document.getElementById('addProductForm').reset();
}

// Close add product modal
function closeAddProductModal() {
    document.getElementById('addProductModal').classList.remove('show');
}

// Handle add product form submission
document.getElementById('addProductForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const product = {
        productId: document.getElementById('newProductId').value.trim(),
        name: document.getElementById('newProductName').value.trim(),
        description: document.getElementById('newProductDescription').value.trim(),
        price: parseFloat(document.getElementById('newProductPrice').value),
        stockQty: parseInt(document.getElementById('newProductStock').value),
        minStockLevel: parseInt(document.getElementById('newProductMinStock').value),
        maxStockLevel: parseInt(document.getElementById('newProductMaxStock').value),
        categoryId: document.getElementById('newProductCategory').value || null
    };

    // Validation
    if (product.stockQty > product.maxStockLevel) {
        showError('Stock quantity cannot exceed max stock level');
        return;
            }

    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(product)
        });

        if (response.ok) {
            showSuccess('Product created successfully');
            closeAddProductModal();
            await loadProducts();
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create product');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        showError(error.message || 'Failed to create product');
    }
});

// Open edit product modal
async function openEditProductModal(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}/${productId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load product data');
        }

        const product = await response.json();
        
        // Populate form fields
        document.getElementById('editProductId').value = product.productId;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductDescription').value = product.description;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductStock').value = product.stockQty;
        document.getElementById('editProductMinStock').value = product.minStockLevel;
        document.getElementById('editProductMaxStock').value = product.maxStockLevel;
        document.getElementById('editProductCategory').value = product.categoryId || '';

        document.getElementById('editProductModal').classList.add('show');
    } catch (error) {
        console.error('Error loading product:', error);
        showError('Failed to load product data');
    }
}

// Close edit product modal
function closeEditProductModal() {
    document.getElementById('editProductModal').classList.remove('show');
}

// Handle edit product form submission
document.getElementById('editProductForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const productId = document.getElementById('editProductId').value;
    const product = {
        name: document.getElementById('editProductName').value.trim(),
        description: document.getElementById('editProductDescription').value.trim(),
        price: parseFloat(document.getElementById('editProductPrice').value),
        stockQty: parseInt(document.getElementById('editProductStock').value),
        minStockLevel: parseInt(document.getElementById('editProductMinStock').value),
        maxStockLevel: parseInt(document.getElementById('editProductMaxStock').value),
        categoryId: document.getElementById('editProductCategory').value || null
    };

    // Validation
    if (product.stockQty > product.maxStockLevel) {
        showError('Stock quantity cannot exceed max stock level');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(product)
        });

        if (response.ok) {
            showSuccess('Product updated successfully');
            closeEditProductModal();
            await loadProducts();
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update product');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        showError(error.message || 'Failed to update product');
    }
});

// Delete product with confirmation
async function deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete product "${productName}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS}/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            showSuccess('Product deleted successfully');
            await loadProducts();
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showError(error.message || 'Failed to delete product');
    }
}

// Setup mobile menu toggle
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        logout();
        window.location.href = 'login.html';
    }
}

// Utility function to format currency
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

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    const addModal = document.getElementById('addProductModal');
    const editModal = document.getElementById('editProductModal');
    
    if (e.target === addModal) {
        closeAddProductModal();
    }
    if (e.target === editModal) {
        closeEditProductModal();
    }
});

// Close modals with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAddProductModal();
        closeEditProductModal();
    }
});

// Handle page refresh confirmation
window.addEventListener('beforeunload', function(e) {
    const addModal = document.getElementById('addProductModal');
    const editModal = document.getElementById('editProductModal');
    
    if (addModal.classList.contains('show') || editModal.classList.contains('show')) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
});