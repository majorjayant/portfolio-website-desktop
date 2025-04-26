/**
 * Admin Utilities
 * Common functions used across admin pages
 */

// API Configuration
const API_ENDPOINT = "https://api.aloompa.com/my-lambda-function";
const LOCAL_STORAGE_KEY = "portfolioAdminData";

// Authentication
function checkAuthentication() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}

// API Requests
async function fetchFromAPI(endpoint, options = {}) {
    try {
        const token = localStorage.getItem('adminToken');
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        
        const response = await fetch(`${API_ENDPOINT}${endpoint}`, {
            ...defaultOptions,
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        showNotification('API request failed: ' + error.message, 'error');
        return null;
    }
}

// UI Helpers
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) {
        const notificationElement = document.createElement('div');
        notificationElement.id = 'notification';
        notificationElement.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg transition-all transform duration-300 z-50 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
        notificationElement.style.opacity = '0';
        notificationElement.style.transform = 'translateY(-20px)';
        notificationElement.textContent = message;
        document.body.appendChild(notificationElement);
        
        setTimeout(() => {
            notificationElement.style.opacity = '1';
            notificationElement.style.transform = 'translateY(0)';
        }, 10);
        
        setTimeout(() => {
            notificationElement.style.opacity = '0';
            notificationElement.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (notificationElement.parentNode) {
                    document.body.removeChild(notificationElement);
                }
            }, 300);
        }, 3000);
    } else {
        notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg transition-all transform duration-300 z-50 ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`;
        notification.textContent = message;
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
        
        clearTimeout(window.notificationTimeout);
        window.notificationTimeout = setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
        }, 3000);
    }
}

function showLoading(show = true) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay && show) {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        overlay.innerHTML = `
            <div class="bg-white p-6 rounded-md shadow-lg">
                <div class="flex items-center space-x-4">
                    <div class="spinner h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p class="text-gray-700">Loading...</p>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    } else if (loadingOverlay && !show) {
        document.body.removeChild(loadingOverlay);
    }
}

// Form Utilities
function validateRequiredFields(formData, requiredFields) {
    for (const field of requiredFields) {
        if (!formData[field] || formData[field].trim() === '') {
            showNotification(`${field.replace(/([A-Z])/g, ' $1').trim()} is required`, 'error');
            return false;
        }
    }
    return true;
}

// Page initialization
function initPage(pageLoadFunction) {
    document.addEventListener('DOMContentLoaded', () => {
        checkAuthentication();
        document.getElementById('logout-btn').addEventListener('click', logout);
        document.getElementById('mobile-logout-btn').addEventListener('click', logout);
        
        if (pageLoadFunction && typeof pageLoadFunction === 'function') {
            pageLoadFunction();
        }
    });
}

// API Configuration
const API_CONFIG_TYPE = 'config';
const API_WORK_TYPE = 'work';
const API_EDUCATION_TYPE = 'education';
const API_CERTIFICATION_TYPE = 'certification';
const API_SKILL_TYPE = 'skill';
const API_TOOLKIT_TYPE = 'toolkit';

// Authentication Functions
function checkAuthentication() {
    const authtoken = localStorage.getItem('authtoken');
    
    if (!authtoken) {
        // No auth token, show not authenticated message
        document.getElementById('auth-loading').classList.add('hidden');
        document.getElementById('not-authenticated').classList.remove('hidden');
        return false;
    }
    
    // Verify token with the server
    fetch(`${API_ENDPOINT}auth&action=verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authtoken })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('auth-loading').classList.add('hidden');
        
        if (data.success) {
            // Token is valid, show dashboard content
            document.getElementById('dashboard-content').classList.remove('hidden');
        } else {
            // Token is invalid, show not authenticated message
            document.getElementById('not-authenticated').classList.remove('hidden');
            localStorage.removeItem('authtoken');
        }
    })
    .catch(error => {
        console.error('Authentication verification error:', error);
        document.getElementById('auth-loading').classList.add('hidden');
        document.getElementById('not-authenticated').classList.remove('hidden');
    });
}

function logout() {
    localStorage.removeItem('authtoken');
    window.location.href = '/admin/login';
}

// UI Helper Functions
function showLoading(elementId, message = 'Loading...') {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
        
        // If element has a paragraph, update the message
        const paragraph = element.querySelector('p');
        if (paragraph) {
            paragraph.textContent = message;
        }
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
    }
}

function showApiError(message) {
    const errorElement = document.getElementById('api-error');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    
    // Hide the error message after 5 seconds
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 5000);
}

function showSuccess(message) {
    // Create success message element if it doesn't exist
    let successElement = document.getElementById('success-message');
    if (!successElement) {
        successElement = document.createElement('div');
        successElement.id = 'success-message';
        successElement.className = 'fixed top-4 right-4 p-4 bg-green-100 text-green-700 rounded-md shadow-md z-40';
        document.body.appendChild(successElement);
    }
    
    successElement.textContent = message;
    successElement.classList.remove('hidden');
    
    // Hide the success message after 3 seconds
    setTimeout(() => {
        successElement.classList.add('hidden');
    }, 3000);
}

function setupImageUploadHandler(input) {
    // Add placeholder text for image URLs
    input.placeholder = "Enter image URL or upload below";
    
    // Create upload button
    const uploadButton = document.createElement('button');
    uploadButton.type = 'button';
    uploadButton.classList.add('mt-2', 'inline-flex', 'items-center', 'px-3', 'py-1', 'border', 'border-indigo-300', 'text-xs', 'font-medium', 'rounded', 'text-indigo-700', 'bg-indigo-50', 'hover:bg-indigo-100', 'focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-indigo-500');
    uploadButton.innerHTML = '<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"></path></svg> Upload Image';

    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', function(event) {
        if (event.target.files && event.target.files[0]) {
            uploadImage(event.target.files[0], input);
        }
    });
    
    // Add click handler to upload button
    uploadButton.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Add elements after the input field
    input.parentNode.appendChild(fileInput);
    input.parentNode.appendChild(uploadButton);
}

// Image upload function
async function uploadImage(file, inputElement) {
    // Create form data
    const formData = new FormData();
    formData.append('image', file);
    
    // Show loading state
    inputElement.disabled = true;
    const originalValue = inputElement.value;
    inputElement.value = 'Uploading...';
    
    try {
        // TODO: Implement actual image upload to your preferred storage
        // This is a placeholder that would simulate an upload
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For this example, we'll just use a fake URL
        // In a real implementation, you would:
        // 1. Upload to S3, Cloudinary, or your preferred storage
        // 2. Get the URL from the response
        // 3. Set that URL as the input value
        const fakeUrl = `https://example.com/uploads/${file.name}`;
        
        inputElement.value = fakeUrl;
        showSuccess('Image uploaded successfully!');
    } catch (error) {
        console.error('Error uploading image:', error);
        inputElement.value = originalValue;
        showApiError('Failed to upload image. Please try again or enter URL manually.');
    } finally {
        inputElement.disabled = false;
    }
}

// Common API Functions
async function fetchFromAPI(url) {
    try {
        const authtoken = localStorage.getItem('authtoken');
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authtoken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching from API:', error);
        throw error;
    }
}

async function saveToAPI(url, data) {
    try {
        const authtoken = localStorage.getItem('authtoken');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authtoken}`
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error saving to API:', error);
        throw error;
    }
}

// Data Fetching Functions
async function fetchSiteConfig() {
    const data = await fetchFromAPI(`${API_ENDPOINT}${API_CONFIG_TYPE}&action=get_site_config`);
    return data.config || {};
}

async function fetchWorkExperience() {
    const data = await fetchFromAPI(`${API_ENDPOINT}${API_WORK_TYPE}&action=get_work_experience`);
    return data.workExperience || [];
}

async function fetchEducation() {
    const data = await fetchFromAPI(`${API_ENDPOINT}${API_EDUCATION_TYPE}&action=get_education`);
    return data.education || [];
}

async function fetchCertifications() {
    const data = await fetchFromAPI(`${API_ENDPOINT}${API_CERTIFICATION_TYPE}&action=get_certifications`);
    return data.certifications || [];
}

async function fetchSkills() {
    const data = await fetchFromAPI(`${API_ENDPOINT}${API_SKILL_TYPE}&action=get_skills`);
    return data.skills || [];
}

async function fetchToolkitCategories() {
    const data = await fetchFromAPI(`${API_ENDPOINT}${API_TOOLKIT_TYPE}&action=get_toolkit_categories`);
    return data.toolkitCategories || [];
}

async function fetchToolkitItems() {
    const data = await fetchFromAPI(`${API_ENDPOINT}${API_TOOLKIT_TYPE}&action=get_toolkit_items`);
    return data.toolkitItems || [];
}

// Helper to create a unique ID for new items
function createUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Validation helper
function validateRequiredField(value, fieldName) {
    if (!value || value.trim() === '') {
        throw new Error(`${fieldName} is required`);
    }
    return true;
}

// Function to validate date format (MM/YYYY)
function validateDateFormat(dateStr) {
    if (!dateStr) return true; // Optional field
    
    const dateRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;
    return dateRegex.test(dateStr);
}

// HTML sanitization helper (basic)
function sanitizeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Format a date to YYYY-MM-DD for input fields
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

/**
 * Add rich text editor functionality to a textarea
 * @param {HTMLElement} container - Container element for the rich text editor
 */
function setupRichTextEditor(container) {
    if (!container) return;
    
    const textarea = container.querySelector('textarea');
    if (!textarea) return;
    
    // Create toolbar if it doesn't exist
    let toolbar = container.querySelector('.rich-text-toolbar');
    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.className = 'rich-text-toolbar';
        toolbar.innerHTML = `
            <button type="button" data-command="bold" title="Bold" class="tooltip">B</button>
            <button type="button" data-command="italic" title="Italic" class="tooltip"><i>I</i></button>
            <button type="button" data-command="underline" title="Underline" class="tooltip"><u>U</u></button>
            <button type="button" data-command="insertUnorderedList" title="Bullet List" class="tooltip">• List</button>
            <button type="button" data-command="insertOrderedList" title="Numbered List" class="tooltip">1. List</button>
            <button type="button" data-command="createLink" title="Insert Link" class="tooltip">🔗</button>
        `;
        
        textarea.parentNode.insertBefore(toolbar, textarea);
    }
    
    // Add event listeners to toolbar buttons
    toolbar.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            const command = this.dataset.command;
            
            if (command === 'createLink') {
                const url = prompt('Enter the link URL:');
                if (url) {
                    // Simple URL validation
                    if (!/^https?:\/\//i.test(url)) {
                        alert('Please enter a valid URL starting with http:// or https://');
                        return;
                    }
                    
                    // Get selected text
                    const selectedText = textarea.value.substring(
                        textarea.selectionStart, 
                        textarea.selectionEnd
                    );
                    
                    // Create link markup
                    const linkMarkup = `<a href="${url}" target="_blank">${selectedText || url}</a>`;
                    
                    // Insert at cursor position
                    const startPos = textarea.selectionStart;
                    const endPos = textarea.selectionEnd;
                    
                    textarea.value = 
                        textarea.value.substring(0, startPos) + 
                        linkMarkup + 
                        textarea.value.substring(endPos);
                    
                    // Update cursor position
                    textarea.selectionStart = startPos + linkMarkup.length;
                    textarea.selectionEnd = startPos + linkMarkup.length;
                }
            } else {
                // For other formatting commands
                const tag = getHtmlTag(command);
                if (!tag) return;
                
                // Get selected text
                const selectedText = textarea.value.substring(
                    textarea.selectionStart, 
                    textarea.selectionEnd
                );
                
                // Create tagged markup
                const markup = `<${tag}>${selectedText}</${tag}>`;
                
                // Insert at cursor position
                const startPos = textarea.selectionStart;
                const endPos = textarea.selectionEnd;
                
                textarea.value = 
                    textarea.value.substring(0, startPos) + 
                    markup + 
                    textarea.value.substring(endPos);
                
                // Update cursor position
                textarea.selectionStart = startPos + markup.length;
                textarea.selectionEnd = startPos + markup.length;
            }
            
            // Focus back on textarea
            textarea.focus();
        });
    });
}

/**
 * Get HTML tag based on command
 * @param {string} command - Command name
 * @returns {string} - Corresponding HTML tag
 */
function getHtmlTag(command) {
    switch (command) {
        case 'bold': return 'strong';
        case 'italic': return 'em';
        case 'underline': return 'u';
        case 'insertUnorderedList': return 'ul';
        case 'insertOrderedList': return 'ol';
        default: return '';
    }
}

// Admin Utilities JavaScript

// API Constants
const LOCAL_STORAGE_ADMIN_TOKEN_KEY = "adminToken";

// Common HTTP Headers
const getHeaders = () => {
    const token = localStorage.getItem(LOCAL_STORAGE_ADMIN_TOKEN_KEY);
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Authentication Functions
function checkAuth() {
    const token = localStorage.getItem(LOCAL_STORAGE_ADMIN_TOKEN_KEY);
    if (!token) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem(LOCAL_STORAGE_ADMIN_TOKEN_KEY);
    window.location.href = "login.html";
}

// UI Helper Functions
function showLoadingOverlay() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoadingOverlay() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

function showSuccessMessage(message = "Operation completed successfully!") {
    const successElement = document.getElementById('success-message');
    document.getElementById('success-message-text').textContent = message;
    
    successElement.classList.remove('hidden');
    successElement.classList.remove('translate-y-full', 'opacity-0');
    
    setTimeout(() => {
        successElement.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            successElement.classList.add('hidden');
        }, 300);
    }, 3000);
}

function showErrorMessage(message = "An error occurred. Please try again.", title = "Error") {
    const errorElement = document.getElementById('error-message');
    document.getElementById('error-message-title').textContent = title;
    document.getElementById('error-message-text').textContent = message;
    
    errorElement.classList.remove('hidden');
    errorElement.classList.remove('translate-y-full', 'opacity-0');
    
    setTimeout(() => {
        errorElement.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 300);
    }, 5000);
}

// API Helper Functions
async function fetchFromAPI(endpoint, method = 'GET', body = null) {
    showLoadingOverlay();
    
    try {
        const options = {
            method,
            headers: getHeaders()
        };
        
        if (body && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(`${API_ENDPOINT}${endpoint}`, options);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        showErrorMessage(error.message);
        throw error;
    } finally {
        hideLoadingOverlay();
    }
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}

function insertTemplate(elementId, templatePath) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    fetch(templatePath)
        .then(response => response.text())
        .then(html => {
            element.innerHTML = html;
            // Execute any scripts in the loaded HTML
            const scripts = element.querySelectorAll('script');
            scripts.forEach(script => {
                const newScript = document.createElement('script');
                Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                newScript.textContent = script.textContent;
                script.parentNode.replaceChild(newScript, script);
            });
        })
        .catch(error => {
            console.error(`Failed to load template ${templatePath}:`, error);
            element.innerHTML = `<div class="p-4 bg-red-100 text-red-800">Failed to load component</div>`;
        });
}

// Load Components on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuth()) return;
    
    // Insert header and footer templates
    insertTemplate('header-container', './components/header.html');
    insertTemplate('footer-container', './components/footer.html');
    
    // Setup the logout button event listener once the header is loaded
    setTimeout(() => {
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', logout);
        }
    }, 500);
}); 