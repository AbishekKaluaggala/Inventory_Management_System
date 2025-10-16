// Authentication Functions

// Check if user is authenticated
async function checkAuth() {
    const user = getCurrentUser();
    
    if (!user) {
        return false;
    }
    
    // Check if session is expired
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
        const now = new Date().getTime();
        const timeDiff = now - parseInt(lastActivity);
        
        // Session timeout: 30 minutes
        if (timeDiff > 30 * 60 * 1000) {
            await logout();
            return false;
        }
    }
    
    // Update last activity
    updateLastActivity();
    
    return true;
}

// Get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    
    try {
        return JSON.parse(userStr);
    } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
    }
}

// Save user to localStorage
function saveUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    updateLastActivity();
}

// Update last activity timestamp
function updateLastActivity() {
    localStorage.setItem('lastActivity', new Date().getTime().toString());
}

// Login function
async function login(username, password, rememberMe = false) {
    try {
        // Your backend expects FormData (@RequestParam)
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }
        
        const data = await response.json();
        
        // Create user object from response
        const user = {
            username: data.username,
            role: data.role
        };
        
        // Save user data
        saveUser(user);
        
        // Save remember me preference
        if (rememberMe) {
            localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        } else {
            localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
        }
        
        return { success: true, user };
        
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
}

// Logout function
async function logout() {
    try {
        // Call logout endpoint if exists
        await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Clear local storage
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem('lastActivity');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }
}

// Register function
async function register(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Registration failed');
        }
        
        const user = await response.json();
        return { success: true, user };
        
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
}

// Check if user has specific role
function hasRole(role) {
    const user = getCurrentUser();
    if (!user) return false;
    
    return user.role === role;
}

// Check if user is admin
function isAdmin() {
    return hasRole('ADMIN') || hasRole('Administrator');
}

// Get user's role
function getUserRole() {
    const user = getCurrentUser();
    return user ? user.role : null;
}

// Get user's ID
function getUserId() {
    const user = getCurrentUser();
    return user ? user.userId : null;
}

// Get user's username
function getUsername() {
    const user = getCurrentUser();
    return user ? user.username : null;
}

// Update user profile
async function updateProfile(userData) {
    try {
        const userId = getUserId();
        if (!userId) {
            throw new Error('User not authenticated');
        }
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS_UPDATE}/${userId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Profile update failed');
        }
        
        const updatedUser = await response.json();
        saveUser(updatedUser);
        
        return { success: true, user: updatedUser };
        
    } catch (error) {
        console.error('Profile update error:', error);
        return { success: false, error: error.message };
    }
}

// Change password
async function changePassword(currentPassword, newPassword) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Password change failed');
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('Password change error:', error);
        return { success: false, error: error.message };
    }
}

// Session timeout handler
let sessionTimeoutTimer = null;

function startSessionTimeout() {
    // Clear existing timer
    if (sessionTimeoutTimer) {
        clearTimeout(sessionTimeoutTimer);
    }
    
    // Set new timer (30 minutes)
    sessionTimeoutTimer = setTimeout(async () => {
        showError('Session expired. Please login again.');
        await logout();
    }, 30 * 60 * 1000);
}

// Reset session timeout on user activity
function resetSessionTimeout() {
    updateLastActivity();
    startSessionTimeout();
}

// Initialize session timeout on page load
if (getCurrentUser()) {
    startSessionTimeout();
    
    // Reset timeout on user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, debounce(resetSessionTimeout, 1000), true);
    });
}

// Redirect if not authenticated
function requireAuth() {
    if (!getCurrentUser()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Redirect if authenticated (for login/register pages)
function redirectIfAuthenticated() {
    if (getCurrentUser()) {
        window.location.href = 'dashboard.html';
        return true;
    }
    return false;
}