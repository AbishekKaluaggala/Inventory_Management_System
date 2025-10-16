// Users Management JavaScript

let allUsers = [];
let filteredUsers = [];

// Check auth and load users on page load
document.addEventListener('DOMContentLoaded', async function() {
    const isAuthenticated = await checkAuth();
    
    if (!isAuthenticated) {
        window.location.href = 'login.html';
        return;
    }

    loadUserInfo();
    loadUsers();
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

// Load all users
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS_LIST}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load users');
        }

        allUsers = await response.json();
        filteredUsers = [...allUsers];
        
        displayUsers(filteredUsers);
        updateTotalCount();

    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users');
        document.getElementById('usersTableBody').innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="color: var(--danger); padding: 2rem;">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; display: block; margin-bottom: 1rem;"></i>
                    Failed to load users
                </td>
            </tr>
        `;
    }
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-users" style="font-size: 2rem; display: block; margin-bottom: 1rem; opacity: 0.5;"></i>
                    No users found
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="user-avatar" style="width: 36px; height: 36px; font-size: 0.875rem;">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <strong>${user.username}</strong>
                </div>
            </td>
            <td>${getStatusBadge(user.role)}</td>
            <td>
                <div class="toggle-switch ${user.active ? 'active' : ''}" 
                     onclick="toggleUserStatus('${user.userId}', ${user.active})"
                     title="${user.active ? 'Active' : 'Inactive'}">
                </div>
            </td>
            <td>${user.userId ? formatDate(new Date()) : 'N/A'}</td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-sm btn-secondary btn-icon" 
                            onclick="openEditUserModal('${user.userId}', '${user.username}', '${user.role}')"
                            title="Edit Role">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-icon" 
                            onclick="deleteUser('${user.userId}', '${user.username}')"
                            title="Delete User">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Filter users
function filterUsers() {
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();

    filteredUsers = allUsers.filter(user => {
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesStatus = !statusFilter || user.active.toString() === statusFilter;
        const matchesSearch = !searchQuery || user.username.toLowerCase().includes(searchQuery);
        
        return matchesRole && matchesStatus && matchesSearch;
    });

    displayUsers(filteredUsers);
    updateTotalCount();
}

// Update total count
function updateTotalCount() {
    document.getElementById('totalCount').textContent = filteredUsers.length;
}

// Setup search with debounce
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(filterUsers, 300));
}

// Open add user modal
function openAddUserModal() {
    document.getElementById('addUserModal').classList.add('show');
    document.getElementById('addUserForm').reset();
}

// Close add user modal
function closeAddUserModal() {
    document.getElementById('addUserModal').classList.remove('show');
}

// Handle add user form submission
document.getElementById('addUserForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;
    const active = document.getElementById('newActive').checked;

    if (!username || !password || !role) {
        showError('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS_CREATE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username,
                password,
                role,
                active
            })
        });

        if (!response.ok) {
            throw new Error('Failed to create user');
        }

        showSuccess(`User "${username}" created successfully!`);
        closeAddUserModal();
        loadUsers();

    } catch (error) {
        console.error('Error creating user:', error);
        showError('Failed to create user. Username might already exist.');
    }
});

// Open edit user modal
function openEditUserModal(userId, username, role) {
    document.getElementById('editUserId').value = userId;
    document.getElementById('editUsername').value = username;
    document.getElementById('editRole').value = role;
    document.getElementById('editUserModal').classList.add('show');
}

// Close edit user modal
function closeEditUserModal() {
    document.getElementById('editUserModal').classList.remove('show');
}

// Handle edit user form submission
document.getElementById('editUserForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const role = document.getElementById('editRole').value;

    try {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('role', role);

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS_UPDATE_ROLE}`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to update user role');
        }

        showSuccess('User role updated successfully!');
        closeEditUserModal();
        loadUsers();

    } catch (error) {
        console.error('Error updating user:', error);
        showError('Failed to update user role');
    }
});

// Toggle user status (active/inactive)
async function toggleUserStatus(userId, currentStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS_TOGGLE_STATUS}/${userId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to toggle user status');
        }

        const newStatus = !currentStatus;
        showSuccess(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        loadUsers();

    } catch (error) {
        console.error('Error toggling user status:', error);
        showError('Failed to update user status');
    }
}

// Delete user
async function deleteUser(userId, username) {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS_DELETE}/${userId}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        showSuccess(`User "${username}" deleted successfully!`);
        loadUsers();

    } catch (error) {
        console.error('Error deleting user:', error);
        showError('Failed to delete user');
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

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// Close modals on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAddUserModal();
        closeEditUserModal();
    }
});