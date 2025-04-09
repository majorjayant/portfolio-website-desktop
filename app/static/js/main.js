// Main JavaScript for Portfolio Website

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application');
    // Load the site configuration
    loadSiteConfig();

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Chatbot functionality
    initChatbot();

    // Initialize visitor count from localStorage or set default
    initVisitorCount();

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize animations for elements when they come into view
    initScrollAnimations();
});

// Initialize chatbot functionality
function initChatbot() {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const closeButton = document.getElementById('close-chatbot');
    const chatbotWidget = document.getElementById('chatbot-widget');
    const messagesContainer = document.getElementById('chatbot-messages');
    const inputField = document.getElementById('chatbot-input-field');
    const sendButton = document.getElementById('send-message');

    // If any elements don't exist, exit the function
    if (!chatbotToggle || !closeButton || !chatbotWidget || 
        !messagesContainer || !inputField || !sendButton) {
        return;
    }

    // Toggle chatbot visibility
    chatbotToggle.addEventListener('click', function() {
        chatbotWidget.classList.toggle('hidden');
        if (!chatbotWidget.classList.contains('hidden')) {
            inputField.focus();
        }
    });

    closeButton.addEventListener('click', function() {
        chatbotWidget.classList.add('hidden');
    });

    // Send message function
    function sendMessage() {
        const message = inputField.value.trim();
        if (message) {
            // Add user message
            addMessage(message, 'user');
            inputField.value = '';

            // Simulate bot response after a short delay
            setTimeout(() => {
                const botResponse = getBotResponse(message);
                addMessage(botResponse, 'bot');
            }, 800);
        }
    }

    // Add message to chat
    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Simple bot responses
    function getBotResponse(message) {
        message = message.toLowerCase();
        
        if (message.includes('hello') || message.includes('hi')) {
            return "Hello! How can I help you today?";
        } else if (message.includes('project') || message.includes('work')) {
            return "You can check out my projects on the Projects page. Would you like me to tell you about a specific project?";
        } else if (message.includes('contact') || message.includes('reach')) {
            return "You can reach me through the Contact page or directly at contact@jayant.com";
        } else if (message.includes('skill') || message.includes('technology')) {
            return "I work with various technologies including Python, JavaScript, React, Flask, and cloud services. Is there a specific technology you'd like to know more about?";
        } else if (message.includes('image') || message.includes('generator')) {
            return "My portfolio includes an AI image generator tool. It uses stable diffusion to create images from text descriptions.";
        } else if (message.includes('experience') || message.includes('background')) {
            return "I have experience in full-stack development, cloud solutions, and AI integration. Check out my portfolio for more details!";
        } else {
            return "Thanks for your message. Is there anything specific about my portfolio you'd like to know?";
        }
    }

    // Event listeners for sending messages
    sendButton.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Initialize visitor count
function initVisitorCount() {
    const visitorCountElement = document.getElementById('visitor-number');
    if (!visitorCountElement) return;

    // Check if we have a count in localStorage
    let count = localStorage.getItem('visitor-count');
    
    // If no count exists, set a default
    if (!count) {
        // Generate a random number between 1000 and 2000
        count = Math.floor(Math.random() * 1000) + 1000;
        localStorage.setItem('visitor-count', count);
    }
    
    // Display the count
    visitorCountElement.textContent = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    // Increment count for this session if not already done
    if (!sessionStorage.getItem('counted')) {
        count = parseInt(count) + 1;
        localStorage.setItem('visitor-count', count);
        sessionStorage.setItem('counted', 'true');
    }
}

// Initialize animations for elements when they come into view
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (!animatedElements.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// Project filter functionality (for projects page)
function filterProjects(category) {
    const projects = document.querySelectorAll('.project-card');
    if (!projects.length) return;
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // Update active filter button
    filterButtons.forEach(btn => {
        if (btn.getAttribute('data-filter') === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Filter projects
    projects.forEach(project => {
        if (category === 'all' || project.classList.contains(category)) {
            project.style.display = 'block';
            setTimeout(() => {
                project.style.opacity = '1';
                project.style.transform = 'translateY(0)';
            }, 50);
        } else {
            project.style.opacity = '0';
            project.style.transform = 'translateY(20px)';
            setTimeout(() => {
                project.style.display = 'none';
            }, 300);
        }
    });
}

/**
 * Load site configuration from API
 */
function loadSiteConfig() {
    console.log('Starting to load site configuration');
    
    // Use the confirmed working API endpoint
    const apiEndpoint = 'https://zelbc2vwg2.execute-api.eu-north-1.amazonaws.com/Staging/website-portfolio?type=site_config';
    
    console.log('Fetching from API endpoint:', apiEndpoint);
    
    fetch(apiEndpoint, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
        }
    })
    .then(response => {
        console.log('API response status:', response.status);
        if (!response.ok) {
            throw new Error(`API response not OK: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Successfully loaded from API:', data);
        processConfigData(data);
    })
    .catch(error => {
        console.error('Failed to load from API:', error);
        // Show error notification on the page
        showErrorNotification('Failed to load configuration. Please refresh the page or contact support.');
    });
    
    function processConfigData(data) {
        console.log('Processing configuration data');
        
        // Handle nested data structure if present
        let configData = data;
        if (data.site_configs) {
            console.log('Detected nested site_configs structure');
            configData = data.site_configs;
        }
        
        console.log('Final config data to apply:', configData);
        
        // Apply configuration to the website
        updateWebsiteElements(configData);
    }
}

/**
 * Show error notification on the page
 */
function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.style.position = 'fixed';
    notification.style.top = '1rem';
    notification.style.right = '1rem';
    notification.style.backgroundColor = '#f44336';
    notification.style.color = 'white';
    notification.style.padding = '1rem';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '300px';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
}

/**
 * Update website elements with configuration data
 */
function updateWebsiteElements(config) {
    console.log('Updating website elements with config data');
    
    // Update favicon
    if (config.image_favicon_url) {
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            favicon.href = config.image_favicon_url;
            console.log('Updated favicon:', config.image_favicon_url);
        }
    }
    
    // Update logo
    if (config.image_logo_url) {
        const logoImg = document.querySelector('.logo img');
        if (logoImg) {
            logoImg.src = config.image_logo_url;
            console.log('Updated logo:', config.image_logo_url);
        }
    }
    
    // Update banner
    if (config.image_banner_url) {
        const banner = document.querySelector('.banner-image');
        if (banner) {
            banner.style.backgroundImage = `url('${config.image_banner_url}')`;
            console.log('Updated banner:', config.image_banner_url);
        }
    }
    
    // Update about section
    if (config.about_title) {
        const aboutTitle = document.querySelector('.about-title');
        if (aboutTitle) {
            aboutTitle.textContent = config.about_title;
            console.log('Updated about title:', config.about_title);
        }
    }
    
    if (config.about_subtitle) {
        const aboutSubtitle = document.querySelector('.about-subtitle');
        if (aboutSubtitle) {
            aboutSubtitle.textContent = config.about_subtitle;
            console.log('Updated about subtitle:', config.about_subtitle);
        }
    }
    
    if (config.about_description) {
        const aboutDescription = document.querySelector('.about-description');
        if (aboutDescription) {
            aboutDescription.textContent = config.about_description;
            console.log('Updated about description');
        }
    }
    
    // Update profile photo
    if (config.image_about_profile_url) {
        const profilePhoto = document.querySelector('.profile-photo img');
        if (profilePhoto) {
            profilePhoto.src = config.image_about_profile_url;
            console.log('Updated profile photo:', config.image_about_profile_url);
        }
    }
    
    // Update gallery photos
    updateGalleryPhoto('.gallery-photo-1', config.image_about_photo1_url, config.about_photo1_alt);
    updateGalleryPhoto('.gallery-photo-2', config.image_about_photo2_url, config.about_photo2_alt);
    updateGalleryPhoto('.gallery-photo-3', config.image_about_photo3_url, config.about_photo3_alt);
    updateGalleryPhoto('.gallery-photo-4', config.image_about_photo4_url, config.about_photo4_alt);
    
    console.log('Website elements updated successfully');
}

/**
 * Update a gallery photo with the given URL and alt text
 */
function updateGalleryPhoto(selector, photoUrl, altText) {
    if (photoUrl) {
        const photo = document.querySelector(`${selector} img`);
        if (photo) {
            photo.src = photoUrl;
            if (altText) {
                photo.alt = altText;
            }
            console.log(`Updated ${selector}:`, photoUrl);
        }
    }
} 