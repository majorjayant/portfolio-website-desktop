/**
 * Portfolio Website JavaScript
 * Author: majorjayant
 */

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animation elements
    initAnimations();
    
    // Fade out flash messages after 5 seconds
    setTimeout(function() {
        const flashMessages = document.querySelectorAll('.flash');
        flashMessages.forEach(message => {
            message.style.opacity = '0';
            setTimeout(() => {
                message.remove();
            }, 500);
        });
    }, 5000);

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });

    // Form validation
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            let hasError = false;
            
            // Basic validation
            const name = this.querySelector('#name');
            const email = this.querySelector('#email');
            const message = this.querySelector('#message');
            
            if (name && name.value.trim() === '') {
                showInputError(name, 'Please enter your name');
                hasError = true;
            } else if (name) {
                removeInputError(name);
            }
            
            if (email && email.value.trim() === '') {
                showInputError(email, 'Please enter your email');
                hasError = true;
            } else if (email && !isValidEmail(email.value)) {
                showInputError(email, 'Please enter a valid email address');
                hasError = true;
            } else if (email) {
                removeInputError(email);
            }
            
            if (message && message.value.trim() === '') {
                showInputError(message, 'Please enter your message');
                hasError = true;
            } else if (message) {
                removeInputError(message);
            }
            
            if (hasError) {
                e.preventDefault();
            }
        });
    }

    // Fetch and load work experience data
    fetchWorkExperienceData();
});

// Initialize animations when elements come into view
function initAnimations() {
    const animatedElements = document.querySelectorAll('.animate__animated');
    
    // Create observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Add animation class when element is in view
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated');
                
                // Get animation class (stored in data attribute)
                const animationClass = entry.target.dataset.animation || 'animate__fadeIn';
                entry.target.classList.add(animationClass);
                
                // Remove observer after animation is added
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe elements
    animatedElements.forEach(element => {
        // Store animation class and remove it temporarily
        const animationClass = Array.from(element.classList).find(cls => cls.startsWith('animate__') && cls !== 'animate__animated');
        
        if (animationClass) {
            element.dataset.animation = animationClass;
            element.classList.remove(animationClass);
            element.classList.remove('animate__animated');
        }
        
        observer.observe(element);
    });
}

// Show error message for form inputs
function showInputError(inputElement, message) {
    // Remove existing error message
    removeInputError(inputElement);
    
    // Add error class to input
    inputElement.classList.add('input-error');
    
    // Create error message element
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    
    // Insert error message after input
    inputElement.parentNode.insertBefore(errorMessage, inputElement.nextSibling);
}

// Remove error message from form input
function removeInputError(inputElement) {
    // Remove error class
    inputElement.classList.remove('input-error');
    
    // Remove error message if exists
    const errorMessage = inputElement.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mobile menu toggle
const menuToggle = document.querySelector('.mobile-menu-toggle');
if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

// Fetch work experience data and initialize the timeline
async function fetchWorkExperienceData() {
    console.log('Fetching work experience data');
    
    try {
        // Use the global API URL
        const apiEndpoint = `${window.apiUrl}/website-portfolio?type=work_experience`;
        console.log('Using work experience API URL:', apiEndpoint);
        
        const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });
        
        if (!response.ok) {
            throw new Error(`API response not OK: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Successfully loaded work experience from API:', data);
        
        // Initialize the work experience timeline with the fetched data
        const workExperience = data.work_experience || data;
        if (typeof updateWorkExperienceTimeline === 'function') {
            updateWorkExperienceTimeline(workExperience);
        } else {
            console.error('updateWorkExperienceTimeline function not found');
        }
        
    } catch (apiError) {
        console.error('Error fetching work experience from API:', apiError);
        console.log('Falling back to local JSON file');
        
        // Fallback to local JSON with dynamic URL
        try {
            const localUrl = `${window.staticUrl}/data/experience.json`;
            console.log('Attempting to load from local JSON:', localUrl);
            
            const localResponse = await fetch(localUrl);
            if (!localResponse.ok) {
                throw new Error('Local JSON response not OK');
            }
            
            const localData = await localResponse.json();
            console.log('Successfully loaded work experience from local JSON:', localData);
            if (typeof updateWorkExperienceTimeline === 'function') {
                updateWorkExperienceTimeline(localData);
            } else {
                console.error('updateWorkExperienceTimeline function not found');
            }
        } catch (localError) {
            console.error('Error loading from local JSON:', localError);
            // Show empty state
            if (typeof updateWorkExperienceTimeline === 'function') {
                updateWorkExperienceTimeline([]);
            }
        }
    }
} 