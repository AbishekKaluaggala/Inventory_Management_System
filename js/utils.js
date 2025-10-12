// Utility Functions

// Format currency (Sri Lankan Rupees)
function formatCurrency(amount) {
    return `Rs. ${parseFloat(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show loading spinner
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="spinner"></div>';
    }
}

// Show success message
function showSuccess(message) {
    showToast(message, 'success');
}

// Show error message
function showError(message) {
    showToast(message, 'error');
}

// Show info message
function showInfo(message) {
    showToast(message, 'info');
}

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Confirm dialog
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusColors = {
        'PENDING': 'warning',
        'CONFIRMED': 'info',
        'COMPLETED': 'success',
        'CANCELLED': 'danger',
        'PAID': 'success',
        'UNPAID': 'warning',
        'OVERDUE': 'danger',
        'SUCCESS': 'success',
        'FAILED': 'danger'
    };
    
    const color = statusColors[status] || 'secondary';
    return `<span class="badge badge-${color}">${status}</span>`;
}

// Debounce function (for search inputs)
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Get current user from session storage
function getCurrentUser() {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Save current user to session storage
function saveCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

// Clear current user
function clearCurrentUser() {
    sessionStorage.removeItem('currentUser');
}

// Check if user has role
function hasRole(role) {
    const user = getCurrentUser();
    return user && user.role === role;
}

// Check if user is admin
function isAdmin() {
    return hasRole(USER_ROLES.ADMIN);
}

// Check if user is manager or admin
function isManagerOrAdmin() {
    return hasRole(USER_ROLES.ADMIN) || hasRole(USER_ROLES.MANAGER);
}