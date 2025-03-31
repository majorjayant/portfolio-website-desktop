// Main JavaScript for Portfolio Website

document.addEventListener('DOMContentLoaded', function() {
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

// Find and update any profile image URL references
// Example:
// From: profileImage.src = "https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg";
// To: profileImage.src = "/static/img/profile-photo.svg";

// Function to load site configuration
async function loadSiteConfig() {
    try {
        // The API Gateway endpoint URL - replace with your actual API Gateway URL
        const API_ENDPOINT = 'https://hoywk0os0c.execute-api.eu-north-1.amazonaws.com/staging/get-content';
        
        // Try to load from the API endpoint
        let response = await fetch(`${API_ENDPOINT}?type=site_config`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        // If API call fails, try the static JSON file
        if (!response.ok) {
            console.log('API endpoint not available, falling back to static file');
            response = await fetch('/data/site_config.json');
            
            if (!response.ok) {
                console.log('Static file not available, using hardcoded defaults');
                // Return hardcoded defaults if both API and static file fail
                return {
                    image_favicon_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon",
                    image_logo_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo",
                    image_banner_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner",
                    about_title: "J A",
                    about_subtitle: "Curious Mind. Data Geek. Product Whisperer.",
                    about_description: "Ever since I was a kid, I've been that person - the one who asks why, what, and so what? on repeat. Fast forward to today, and not much has changed. I thrive on solving complex problems, breaking down business chaos into structured roadmaps, and turning data into decisions that matter.",
                    image_about_profile_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg",
                    image_about_photo1_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0138.jpg",
                    image_about_photo2_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0915.jpg",
                    image_about_photo3_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1461.jpg",
                    image_about_photo4_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1627.jpg",
                    about_photo1_alt: "Test Photo 1 Alt Text",
                    about_photo2_alt: "Test Photo 2 Alt Text",
                    about_photo3_alt: "Test Photo 3 Alt Text",
                    about_photo4_alt: "Test Photo 4 Alt Text"
                };
            }
        }
        
        const data = await response.json();
        console.log('Raw data loaded:', data);
        
        // Handle different possible structures of the JSON response
        let siteConfig;
        
        if (data.site_configs) {
            // If data is nested under site_configs key
            siteConfig = data.site_configs;
            console.log('Using nested site_configs data');
        } else if (data.image_favicon_url) {
            // If data is at the root level
            siteConfig = data;
            console.log('Using root level data');
        } else {
            console.log('Unexpected data structure, using defaults');
            // Default values if structure is unexpected
            siteConfig = {
                image_favicon_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon",
                image_logo_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo",
                image_banner_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner",
                about_title: "J A",
                about_subtitle: "Curious Mind. Data Geek. Product Whisperer.",
                about_description: "Ever since I was a kid, I've been that person - the one who asks why, what, and so what? on repeat. Fast forward to today, and not much has changed. I thrive on solving complex problems, breaking down business chaos into structured roadmaps, and turning data into decisions that matter.",
                image_about_profile_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg",
                image_about_photo1_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0138.jpg",
                image_about_photo2_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0915.jpg",
                image_about_photo3_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1461.jpg",
                image_about_photo4_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1627.jpg",
                about_photo1_alt: "Test Photo 1 Alt Text",
                about_photo2_alt: "Test Photo 2 Alt Text",
                about_photo3_alt: "Test Photo 3 Alt Text",
                about_photo4_alt: "Test Photo 4 Alt Text"
            };
        }
        
        console.log('Processed site config:', siteConfig);
        return siteConfig;
    } catch (error) {
        console.error('Error loading site configuration:', error);
        // Return hardcoded defaults if everything fails
        return {
            image_favicon_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon",
            image_logo_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo",
            image_banner_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner",
            about_title: "J A",
            about_subtitle: "Curious Mind. Data Geek. Product Whisperer.",
            about_description: "Ever since I was a kid, I've been that person - the one who asks why, what, and so what? on repeat. Fast forward to today, and not much has changed. I thrive on solving complex problems, breaking down business chaos into structured roadmaps, and turning data into decisions that matter.",
            image_about_profile_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg",
            image_about_photo1_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0138.jpg",
            image_about_photo2_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0915.jpg",
            image_about_photo3_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1461.jpg",
            image_about_photo4_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1627.jpg",
            about_photo1_alt: "Test Photo 1 Alt Text",
            about_photo2_alt: "Test Photo 2 Alt Text",
            about_photo3_alt: "Test Photo 3 Alt Text",
            about_photo4_alt: "Test Photo 4 Alt Text"
        };
    }
}

// Function to update UI with site config
async function updateUIWithSiteConfig() {
    const siteConfig = await loadSiteConfig();
    
    // Update page title
    document.title = siteConfig.about_title || 'Portfolio Website';
    
    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = siteConfig.image_favicon_url;
    if (!document.querySelector('link[rel="icon"]')) {
        document.head.appendChild(favicon);
    }
    
    // Update logo
    const logo = document.querySelector('.logo img');
    if (logo) {
        logo.src = siteConfig.image_logo_url;
    }
    
    // Update banner image
    const banner = document.querySelector('.banner-image');
    if (banner) {
        banner.src = siteConfig.image_banner_url;
    }
    
    // Update about section
    const aboutTitle = document.querySelector('.about-title');
    if (aboutTitle) {
        aboutTitle.textContent = siteConfig.about_title;
    }
    
    const aboutSubtitle = document.querySelector('.about-subtitle');
    if (aboutSubtitle) {
        aboutSubtitle.textContent = siteConfig.about_subtitle;
    }
    
    const aboutDescription = document.querySelector('.about-description');
    if (aboutDescription) {
        aboutDescription.textContent = siteConfig.about_description;
    }
    
    // Update profile image
    const profileImage = document.querySelector('.profile-image');
    if (profileImage) {
        profileImage.src = siteConfig.image_about_profile_url;
    }
    
    // Update about photos
    const aboutPhotos = document.querySelectorAll('.about-photo');
    aboutPhotos.forEach((photo, index) => {
        const photoNumber = index + 1;
        photo.src = siteConfig[`image_about_photo${photoNumber}_url`];
        photo.alt = siteConfig[`about_photo${photoNumber}_alt`];
    });
}

// Load site configuration when the page loads
document.addEventListener('DOMContentLoaded', updateUIWithSiteConfig); 