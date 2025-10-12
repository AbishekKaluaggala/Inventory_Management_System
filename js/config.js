// API Configuration
const API_BASE_URL = 'http://localhost:8080';

const API_ENDPOINTS = {
    // Auth
    LOGIN: '/login',
    LOGOUT: '/logout',
    
    // Users
    USERS_LIST: '/users/list',
    USERS_ADD: '/users/add',
    USERS_UPDATE_ROLE: '/users/update-role',
    USERS_TOGGLE_STATUS: '/users/toggle-status',
    USERS_DELETE: '/users/delete',
    
    // Products
    PRODUCTS: '/api/products',
    PRODUCTS_LOW_STOCK: '/api/products/low-stock',
    PRODUCTS_SEARCH: '/api/products/search',
    
    // Categories
    CATEGORIES: '/api/categories',
    CATEGORIES_ACTIVE: '/api/categories/active',
    
    // Orders
    ORDERS_LIST: '/orders/api/list',
    ORDERS_CREATE: '/orders/create',
    ORDERS_UPDATE_STATUS: '/orders/update-status',
    
    // Invoices
    INVOICES: '/api/invoices',
    INVOICES_BY_STATUS: '/api/invoices/status',
    INVOICES_OVERDUE: '/api/invoices/overdue',
    
    // Payments
    PAYMENTS: '/api/payments',
    
    // Dashboard
    DASHBOARD_STATS: '/api/dashboard/stats',
    SALES_REPORT: '/api/dashboard/sales-report',
    INVENTORY_REPORT: '/api/dashboard/inventory-report'
};

// User Roles
const USER_ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    EMPLOYEE: 'EMPLOYEE',
    SUPPLIER: 'SUPPLIER'
};

// Order Status
const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

// Invoice Status
const INVOICE_STATUS = {
    PAID: 'PAID',
    UNPAID: 'UNPAID',
    OVERDUE: 'OVERDUE',
    CANCELLED: 'CANCELLED'
};

// Payment Methods
const PAYMENT_METHODS = {
    CASH: 'CASH',
    CARD: 'CARD',
    BANK_TRANSFER: 'BANK_TRANSFER',
    ONLINE: 'ONLINE'
};