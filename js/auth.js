// Authentication Functions

// Check if user is logged in
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DASHBOARD_STATS}`, {
            credentials: 'include' // Include cookies
        });
        
        if (response.status === 403 || response.status === 401) {
            // Not logged in
            if (window.location.pathname !== '/login.html' && !window.location.pathname.endsWith('login.html')) {
                window.location.href = 'login.html';
            }
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Auth check failed:', error);
        if (window.location.pathname !== '/login.html' && !window.location.pathname.endsWith('login.html')) {
            window.location.href = 'login.html';
        }
        return false;
    }
}

// Login function
async function login(username, password) {
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
            method: 'POST',
            body: formData,
            credentials: 'include',
            redirect: 'manual' // Don't follow redirects automatically
        });
        
        if (response.ok || response.type === 'opaqueredirect') {
            // Login successful, get user info
            const userResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS_LIST}`, {
                credentials: 'include'
            });
            
            if (userResponse.ok) {
                const users = await userResponse.json();
                const currentUser = users.find(u => u.username === username);
                if (currentUser) {
                    saveCurrentUser(currentUser);
                }
            }
            
            return { success: true };
        } else {
            return { success: false, message: 'Invalid credentials' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Login failed. Please try again.' };
    }
}

// Logout function
async function logout() {
    try {
        // Call logout endpoint
        await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
            method: 'GET',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Always clear session and redirect
        clearCurrentUser();
        sessionStorage.clear();
        
        // Force redirect to login
        window.location.replace('login.html');
    }
}