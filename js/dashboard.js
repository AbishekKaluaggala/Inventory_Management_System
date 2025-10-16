// Dashboard JavaScript

let salesChart = null;
let inventoryChart = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    const isAuthenticated = await checkAuth();
    
    if (!isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }

    // Load user info
    loadUserInfo();
    
    // Load dashboard data
    loadDashboardStats();
    loadRecentOrders();
    initCharts();
    
    // Setup mobile menu
    setupMobileMenu();
});

// Load user information
function loadUserInfo() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = user.role;
        document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DASHBOARD_STATS}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load dashboard stats');
        }

        const stats = await response.json();

        // Update stat cards
        document.getElementById('totalProducts').textContent = stats.totalProducts || 0;
        document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
        document.getElementById('lowStockProducts').textContent = stats.lowStockProducts || 0;
        document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue || 0);

        // Update notification count
        const alertCount = (stats.lowStockProducts || 0) + (stats.unpaidInvoices || 0);
        document.getElementById('notificationCount').textContent = alertCount;

        // Animate numbers
        animateValue('totalProducts', 0, stats.totalProducts || 0, 1000);
        animateValue('totalOrders', 0, stats.totalOrders || 0, 1000);
        animateValue('lowStockProducts', 0, stats.lowStockProducts || 0, 1000);

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showError('Failed to load dashboard statistics');
    }
}

// Load recent orders
async function loadRecentOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ORDERS_LIST}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load orders');
        }

        const orders = await response.json();
        
        // Get last 5 orders
        const recentOrders = orders.slice(0, 5);
        
        const tableBody = document.getElementById('recentOrdersTable');
        
        if (recentOrders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <p style="padding: 2rem; color: var(--text-secondary);">
                            <i class="fas fa-inbox" style="font-size: 2rem; display: block; margin-bottom: 1rem; opacity: 0.5;"></i>
                            No orders yet
                        </p>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = recentOrders.map(order => `
            <tr>
                <td><strong>#${order.orderId.substring(0, 8)}</strong></td>
                <td>${order.customerName || 'N/A'}</td>
                <td>${formatDate(order.orderDate)}</td>
                <td>${formatCurrency(order.totalAmount)}</td>
                <td>${getStatusBadge(order.status)}</td>
                <td>
                    <a href="orders.html?id=${order.orderId}" class="btn btn-sm btn-secondary">
                        <i class="fas fa-eye"></i>
                        View
                    </a>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading recent orders:', error);
        document.getElementById('recentOrdersTable').innerHTML = `
            <tr>
                <td colspan="6" class="text-center" style="color: var(--danger);">
                    Failed to load orders
                </td>
            </tr>
        `;
    }
}

// Initialize charts
function initCharts() {
    initSalesChart();
    initInventoryChart();
}

// Initialize sales chart
function initSalesChart() {
    const ctx = document.getElementById('salesChart');
    
    // Check if canvas element exists
    if (!ctx) {
        console.warn('Sales chart canvas not found');
        return;
    }
    
    const context = ctx.getContext('2d');
    
    // Your chart initialization code here...
}

// Initialize charts
function initCharts() {
    initSalesChart();
    // Add null checks for other charts too
}

// Initialize inventory chart
function initInventoryChart() {
const ctx = document.getElementById('inventoryChart').getContext('2d');
inventoryChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['In Stock', 'Low Stock', 'Out of Stock'],
        datasets: [{
            data: [65, 25, 10],
            backgroundColor: [
                '#10b981',
                '#f59e0b',
                '#ef4444'
            ],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#9ca3af',
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            }
        }
    }
});
}

// Animate number counting
function animateValue(id, start, end, duration) {
const element = document.getElementById(id);
if (!element) return;
const range = end - start;
const increment = range / (duration / 16);
let current = start;

const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
    }
    element.textContent = Math.floor(current);
}, 16);
}
// Handle logout
async function handleLogout() {
if (confirm('Are you sure you want to logout?')) {
await logout();
}
}
// Setup mobile menu toggle
function setupMobileMenu() {
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});
}
// Toggle user dropdown (placeholder)
function toggleUserDropdown() {
showInfo('User dropdown coming soon!');
}
// Refresh dashboard data every 30 seconds
setInterval(() => {
loadDashboardStats();
loadRecentOrders();
}, 30000);