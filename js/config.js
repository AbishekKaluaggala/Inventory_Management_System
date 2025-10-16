// API Configuration

// Base API URL - Update this to match your backend server
const API_BASE_URL = 'http://localhost:8080';

// API Endpoints
const API_ENDPOINTS = {
    // Authentication
    LOGIN: '/users/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/users/add',
    
    // Users
    USERS_LIST: '/users/list',
    USERS_CREATE: '/users/add',
    USERS_UPDATE: '/users/update-role',
    USERS_TOGGLE_STATUS: '/users/toggle-status',
    USERS_DELETE: '/users/delete',
    USERS_BY_ID: '/users',
    
    
    // Products
    PRODUCTS: '/api/products',
    PRODUCTS_CREATE: '/api/products',
    PRODUCTS_UPDATE: '/api/products',
    PRODUCTS_DELETE: '/api/products',

    // Categories
    CATEGORIES: '/api/categories',
    CATEGORIES_ACTIVE: '/api/categories/active',
    
    // Orders - FIXED
    ORDERS_LIST: '/orders/api/list',        // Changed from '/api/orders'
    ORDERS_CREATE: '/orders/create',
    ORDERS_BY_ID: '/orders/api',            // Changed from '/api/orders'
    ORDERS_UPDATE_STATUS: '/orders/update-status',
    
    // Invoices - FIXED (after you add the GET method)
    INVOICES_LIST: '/api/invoices',
    INVOICES_BY_ID: '/api/invoices',
    INVOICES_BY_ORDER: '/api/invoices/order',
    INVOICES_GENERATE: '/api/invoices/generate',
    INVOICES_UPDATE_STATUS: '/api/invoices',
    INVOICES_OVERDUE: '/api/invoices/overdue',
    
    // Payments
    PAYMENTS_LIST: '/api/payments',
    PAYMENTS_CREATE: '/api/payments',
    PAYMENTS_BY_ID: '/api/payments',
    PAYMENTS_BY_INVOICE: '/api/payments/invoice',
    PAYMENTS_BY_STATUS: '/api/payments/status',
    PAYMENTS_BY_METHOD: '/api/payments/method',
    PAYMENTS_UPDATE_STATUS: '/api/payments',
    
    // Dashboard/Reports
    DASHBOARD_STATS: '/api/dashboard/stats',
    REPORTS_SALES: '/api/reports/sales',
    REPORTS_REVENUE: '/api/reports/revenue'
};

// Local Storage Keys
const STORAGE_KEYS = {
    USER: 'inventory_user',
    TOKEN: 'inventory_token',
    REMEMBER_ME: 'inventory_remember'
};

// Application Settings
const APP_SETTINGS = {
    APP_NAME: 'Inventory Management System',
    CURRENCY: 'Rs.',
    DATE_FORMAT: 'en-US',
    ITEMS_PER_PAGE: 10,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
    DEBOUNCE_DELAY: 300 // milliseconds
};

// Status Mappings
const STATUS_COLORS = {
    // Order Status
    PENDING: 'warning',
    CONFIRMED: 'info',
    COMPLETED: 'success',
    CANCELLED: 'secondary',
    
    // Invoice Status
    PAID: 'success',
    UNPAID: 'warning',
    OVERDUE: 'danger',
    
    // Payment Status
    SUCCESS: 'success',
    FAILED: 'danger',
    REFUNDED: 'info'
};

// Payment Methods
const PAYMENT_METHODS = {
    CASH: { icon: 'fa-money-bill', label: 'Cash' },
    CARD: { icon: 'fa-credit-card', label: 'Credit/Debit Card' },
    BANK_TRANSFER: { icon: 'fa-university', label: 'Bank Transfer' },
    CHEQUE: { icon: 'fa-money-check', label: 'Cheque' },
    ONLINE: { icon: 'fa-globe', label: 'Online Payment' }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        API_BASE_URL,
        API_ENDPOINTS,
        STORAGE_KEYS,
        APP_SETTINGS,
        STATUS_COLORS,
        PAYMENT_METHODS
    };
}