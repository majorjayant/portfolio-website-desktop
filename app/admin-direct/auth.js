/**
 * Authentication module for portfolio admin dashboard
 * Provides centralized authentication functions and token management
 */

const Auth = {
    // Storage keys
    TOKEN_KEY: 'admin_token',
    USER_KEY: 'admin_user',
    
    // Token expiration (4 hours in milliseconds)
    TOKEN_EXPIRY: 4 * 60 * 60 * 1000,
    
    /**
     * Initialize the authentication module
     */
    init() {
        // Check token expiration on page load
        this.checkTokenExpiration();
        
        // Set up event listeners for auth-related elements
        document.addEventListener('DOMContentLoaded', () => {
            // Handle login form submission
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            }
            
            // Handle logout button clicks
            const logoutBtn = document.getElementById('logout-btn') || document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => this.logout());
            }
        });
    },
    
    /**
     * Check if the user is authenticated
     * @returns {boolean} True if authenticated, false otherwise
     */
    isAuthenticated() {
        const token = localStorage.getItem(this.TOKEN_KEY);
        const user = localStorage.getItem(this.USER_KEY);
        
        if (!token || !user) {
            return false;
        }
        
        // Check token expiration
        try {
            const userData = JSON.parse(user);
            if (userData.expiresAt && new Date(userData.expiresAt) < new Date()) {
                this.clearAuth();
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return false;
        }
    },
    
    /**
     * Get the current user data
     * @returns {Object|null} User data or null if not authenticated
     */
    getUser() {
        if (!this.isAuthenticated()) {
            return null;
        }
        
        try {
            return JSON.parse(localStorage.getItem(this.USER_KEY));
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },
    
    /**
     * Get the authentication token
     * @returns {string|null} The token or null if not authenticated
     */
    getToken() {
        return this.isAuthenticated() ? localStorage.getItem(this.TOKEN_KEY) : null;
    },
    
    /**
     * Handle login form submission
     * @param {Event} event The form submission event
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorElement = document.getElementById('login-error');
        
        if (!usernameInput || !passwordInput) {
            console.error('Login form inputs not found');
            return;
        }
        
        const username = usernameInput.value;
        const password = passwordInput.value;
        
        // Reset any previous error messages
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        try {
            // Show loading state
            this.setLoginLoading(true);
            
            // Make API request to login endpoint
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success && data.token) {
                // Calculate expiration time (current time + TOKEN_EXPIRY)
                const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY).toISOString();
                
                // Prepare user data with expiration
                const userData = {
                    ...data.user,
                    expiresAt
                };
                
                // Store auth data
                localStorage.setItem(this.TOKEN_KEY, data.token);
                localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
                
                // Redirect or update UI
                this.handleAuthSuccess();
            } else {
                this.handleAuthError(data.message || 'Authentication failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.handleAuthError('Connection error. Please try again later.');
        } finally {
            this.setLoginLoading(false);
        }
    },
    
    /**
     * Handle successful authentication
     */
    handleAuthSuccess() {
        // Check which admin page we're on and update UI accordingly
        const loginSection = document.getElementById('login-section');
        const dashboardSection = document.getElementById('dashboard-section');
        const authOverlay = document.getElementById('auth-overlay');
        
        if (loginSection && dashboardSection) {
            // Work experience/education style layout
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            
            // Load page-specific data if function exists
            if (typeof loadWorkExperienceData === 'function') {
                loadWorkExperienceData();
            } else if (typeof loadEducation === 'function') {
                loadEducation();
            }
        } else if (authOverlay) {
            // Dashboard style layout with overlay
            authOverlay.style.display = 'none';
            
            // Set user info if elements exist
            const userData = this.getUser();
            if (userData) {
                const userNameElement = document.getElementById('userName');
                const userRoleElement = document.getElementById('userRole');
                
                if (userNameElement) {
                    userNameElement.textContent = userData.username || 'Admin User';
                }
                
                if (userRoleElement) {
                    userRoleElement.textContent = userData.role || 'Administrator';
                }
            }
        } else {
            // If we can't find specific elements, just reload the page
            window.location.reload();
        }
    },
    
    /**
     * Handle authentication error
     * @param {string} message Error message to display
     */
    handleAuthError(message) {
        const errorElement = document.getElementById('login-error');
        const authStatus = document.getElementById('authStatus');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        } else if (authStatus) {
            authStatus.innerHTML = `<div class="alert alert-danger">${message}</div>`;
        } else {
            alert(message); // Fallback if no error element found
        }
    },
    
    /**
     * Set login form loading state
     * @param {boolean} isLoading Whether the form is in loading state
     */
    setLoginLoading(isLoading) {
        const submitButton = document.querySelector('#login-form button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = isLoading;
            submitButton.innerHTML = isLoading ? 
                '<i class="fas fa-spinner fa-spin"></i> Logging in...' : 
                'Login';
        }
    },
    
    /**
     * Check token expiration and handle expired tokens
     */
    checkTokenExpiration() {
        const user = localStorage.getItem(this.USER_KEY);
        
        if (user) {
            try {
                const userData = JSON.parse(user);
                if (userData.expiresAt && new Date(userData.expiresAt) < new Date()) {
                    // Token expired, clear auth data
                    this.clearAuth();
                    
                    // Show expired session message if on admin page
                    const isAdminPage = window.location.href.includes('/admin/');
                    if (isAdminPage) {
                        alert('Your session has expired. Please log in again.');
                        this.redirectToLogin();
                    }
                }
            } catch (error) {
                console.error('Error checking token expiration:', error);
                this.clearAuth();
            }
        }
    },
    
    /**
     * Clear authentication data
     */
    clearAuth() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    },
    
    /**
     * Log out the current user
     */
    logout() {
        this.clearAuth();
        this.redirectToLogin();
    },
    
    /**
     * Redirect to the login page
     */
    redirectToLogin() {
        // Get the right path based on current URL
        if (window.location.href.includes('/admin-direct/')) {
            window.location.href = '/admin-direct/';
        } else {
            window.location.href = '/admin-direct';
        }
    },
    
    /**
     * Check authentication and update UI
     * Replacement for the old checkAuth and checkAuthentication functions
     * @returns {boolean} True if authenticated, false otherwise
     */
    checkAuth() {
        const isAuth = this.isAuthenticated();
        const loginSection = document.getElementById('login-section');
        const dashboardSection = document.getElementById('dashboard-section');
        const authOverlay = document.getElementById('auth-overlay');
        
        if (isAuth) {
            // User is authenticated, show dashboard
            const userData = this.getUser();
            
            if (loginSection && dashboardSection) {
                // Work experience/education style layout
                loginSection.style.display = 'none';
                dashboardSection.style.display = 'block';
            } else if (authOverlay) {
                // Dashboard style layout with overlay
                authOverlay.style.display = 'none';
                
                // Set user info
                if (userData) {
                    const userNameElement = document.getElementById('userName');
                    const userRoleElement = document.getElementById('userRole');
                    
                    if (userNameElement) {
                        userNameElement.textContent = userData.username || 'Admin User';
                    }
                    
                    if (userRoleElement) {
                        userRoleElement.textContent = userData.role || 'Administrator';
                    }
                }
            }
        } else {
            // User is not authenticated, show login screen
            if (loginSection && dashboardSection) {
                loginSection.style.display = 'block';
                dashboardSection.style.display = 'none';
            } else if (authOverlay) {
                authOverlay.style.display = 'flex';
                
                const authStatus = document.getElementById('authStatus');
                if (authStatus) {
                    authStatus.innerHTML = '<div class="alert alert-danger">No authentication found. Please log in.</div>';
                }
            } else {
                // If we can't find specific elements, redirect to login
                this.redirectToLogin();
            }
        }
        
        return isAuth;
    }
};

// Initialize the auth module
Auth.init();

// Export for use in other scripts
window.Auth = Auth; 