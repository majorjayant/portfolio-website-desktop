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