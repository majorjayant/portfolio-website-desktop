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
        showErrorNotification('Failed to load configuration. Please refresh the page or contact support.');
    });
    
    function processConfigData(data) {
        console.log('Processing configuration data', data);

        if (!data || !data.site_config) {
            console.error('Invalid or missing site_config in API response');
            showErrorNotification('Received invalid configuration data.');
            return;
        }

        // Store data globally for potential use elsewhere (optional)
        window.siteConfig = data.site_config;
        window.workExperienceData = data.work_experience || [];
        window.educationData = data.education || []; // Store education data

        console.log('Stored site config:', window.siteConfig);
        console.log('Stored work experience:', window.workExperienceData);
        console.log('Stored education:', window.educationData);

        // Update the website elements with the fetched data
        updateWebsiteElements(window.siteConfig);
        updateWorkExperienceTimeline(window.workExperienceData);
        updateEducationTimeline(window.educationData); // Call function to update education section
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
 * Update static website elements based on config
 */
function updateWebsiteElements(config) {
    console.log('Updating static website elements with config:', config);

    // Helper function to update element content
    function updateElement(selector, value, isHtml = false) {
        const element = document.querySelector(selector);
        if (element && value !== undefined && value !== null) {
            console.log(`Updating element ${selector} with value: ${value}`);
            if (isHtml) {
                element.innerHTML = value; // Use innerHTML for title/subtitle/description
            } else {
                element.textContent = value;
            }
        } else if (element) {
            console.log(`Element ${selector} found, but no value provided or value is null/undefined. Clearing content.`);
            element.innerHTML = ''; // Clear content if value is missing
        } else {
            console.warn(`Element with selector '${selector}' not found.`);
        }
    }

    // Helper function to update element attribute
    function updateAttribute(selector, attribute, value) {
        const element = document.querySelector(selector);
        if (element && value) {
            console.log(`Updating attribute ${attribute} of element ${selector} with value: ${value}`);
            element.setAttribute(attribute, value);
            if (attribute === 'src') { // If setting src, also set alt if available for images
                const altKey = selector.replace('_url', '_alt').substring(1); // e.g., #image_about_photo1_url -> image_about_photo1_alt
                if (config[altKey]) {
                    element.setAttribute('alt', config[altKey]);
                    console.log(` > Set alt text: ${config[altKey]}`);
                }
            }
        } else if (!element) {
             console.warn(`Element with selector '${selector}' not found for attribute update.`);
        }
    }

    // Update Title and Meta Description (if applicable)
    if (config.about_title) {
        document.title = config.about_title.replace(/<[^>]*>/g, ''); // Set browser title (strip HTML)
    }
    // Could add meta description update here if needed

    // Update Content
    updateElement('.hero-title', config.about_title, true);
    updateElement('.hero-subtitle', config.about_subtitle, true);
    updateElement('#about-description', config.about_description, true);

    // Update Images (check if URL exists before updating)
    updateAttribute('link[rel="icon"]', 'href', config.image_favicon_url);
    updateAttribute('#main-logo', 'src', config.image_logo_url);
    updateAttribute('#profile-image', 'src', config.image_about_profile_url);

    // Update Banner based on screen width
    function updateBannerImage() {
        const bannerElement = document.querySelector('#hero-banner-img');
        if (!bannerElement) return;

        let bannerUrl = config.image_banner_url;
        if (window.innerWidth <= 768 && config.image_mobile_banner_url) {
            bannerUrl = config.image_mobile_banner_url;
        }
        if (bannerUrl) {
            bannerElement.setAttribute('src', bannerUrl);
            bannerElement.setAttribute('alt', 'Hero banner'); // Set a default alt text
        } else {
             console.warn('Banner image URL not found in config.');
             // Optionally hide banner or set a default
        }
    }
    updateBannerImage();
    // Re-check banner on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateBannerImage, 250);
    });

    // Update Gallery Photos
    updateGalleryPhoto('#gallery-photo-1', config.image_about_photo1_url, config.about_photo1_alt);
    updateGalleryPhoto('#gallery-photo-2', config.image_about_photo2_url, config.about_photo2_alt);
    updateGalleryPhoto('#gallery-photo-3', config.image_about_photo3_url, config.about_photo3_alt);
    updateGalleryPhoto('#gallery-photo-4', config.image_about_photo4_url, config.about_photo4_alt);
}

/**
 * Update a single gallery photo element
 */
function updateGalleryPhoto(selector, photoUrl, altText) {
    const imgElement = document.querySelector(selector);
    if (imgElement) {
        if (photoUrl) {
            imgElement.src = photoUrl;
            imgElement.alt = altText || 'Gallery image'; // Use provided alt text or a default
            // Ensure parent or relevant container is visible if image exists
            const parentContainer = imgElement.closest('.gallery-item'); // Assuming structure
            if (parentContainer) parentContainer.style.display = '';
        } else {
            // If no photo URL, hide the image or its container
            imgElement.src = ''; // Clear src
            imgElement.alt = '';
            const parentContainer = imgElement.closest('.gallery-item');
            if (parentContainer) parentContainer.style.display = 'none'; // Hide the item
             console.log(`Hiding gallery item for selector ${selector} due to missing URL.`);
        }
    } else {
        console.warn(`Gallery image element with selector '${selector}' not found.`);
    }
}

/**
 * Update the work experience timeline
 */
function updateWorkExperienceTimeline(workExperienceData) {
    console.log('Updating work experience timeline with data:', workExperienceData);
    const timelineContainer = document.getElementById('work-experience-timeline'); // Target the container

    if (!timelineContainer) {
        console.error('Work experience timeline container not found (#work-experience-timeline).');
        return;
    }

    // Clear existing timeline items
    timelineContainer.innerHTML = '<h2 class="section-title">Work Experience</h2>'; // Keep title or add dynamically

    if (!workExperienceData || workExperienceData.length === 0) {
        timelineContainer.innerHTML += '<p class="text-center text-gray-500 mt-4">No work experience details available yet.</p>';
        console.log('No work experience data to display.');
        return;
    }

    // Assuming data is sorted by backend (most recent first)
    workExperienceData.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('timeline-item', 'animate-on-scroll');
        // Alternate sides for timeline effect (optional, depends on CSS)
        if (index % 2 === 0) {
            itemElement.classList.add('timeline-item-left');
        } else {
            itemElement.classList.add('timeline-item-right');
        }

        const fromDate = item.from_date ? new Date(item.from_date + 'T00:00:00') : null;
        const toDate = item.is_current ? null : (item.to_date ? new Date(item.to_date + 'T00:00:00') : null);

        const fromYear = fromDate ? fromDate.getFullYear() : 'N/A';
        const toYear = item.is_current ? 'Present' : (toDate ? toDate.getFullYear() : 'N/A');
        const dateString = `${fromYear} - ${toYear}`;

        itemElement.innerHTML = `
            <div class="timeline-content">
                <h3 class="text-lg font-semibold text-gray-800">${item.job_title || 'Job Title'}</h3>
                <h4 class="text-md font-medium text-indigo-600 mb-1">${item.company_name || 'Company Name'}</h4>
                <p class="text-sm text-gray-500 mb-2">
                    <span class="font-semibold">${dateString}</span>
                    ${item.location ? `| <span class="italic">${item.location}</span>` : ''}
                </p>
                <p class="text-sm text-gray-700">${item.description || ''}</p>
            </div>
        `;
        timelineContainer.appendChild(itemElement);
    });

     // Re-initialize scroll animations if new items were added dynamically
     // initScrollAnimations(); // Or handle within the observer logic if needed
     console.log('Work experience timeline updated.');
}

/**
 * Update the education timeline
 */
function updateEducationTimeline(educationData) {
    console.log('Updating education timeline with data:', educationData);
    const timelineContainer = document.getElementById('education-timeline-container'); // Target the container

    if (!timelineContainer) {
        console.error('Education timeline container not found (#education-timeline-container).');
        return;
    }

    // Clear existing timeline items - consider keeping a title if static
    timelineContainer.innerHTML = '<h2 class="section-title">Education</h2>'; // Assuming a static title in HTML or add here

    if (!educationData || educationData.length === 0) {
        timelineContainer.innerHTML += '<p class="text-center text-gray-500 mt-4">No education details available yet.</p>';
        console.log('No education data to display.');
        return;
    }

    // Assuming data is sorted by backend (most recent first)
    educationData.forEach((item, index) => {
        const itemElement = document.createElement('div');
        // Use similar classes for consistent styling, maybe add 'education-timeline-item' if needed
        itemElement.classList.add('timeline-item', 'animate-on-scroll');
        if (index % 2 === 0) {
            itemElement.classList.add('timeline-item-left');
        } else {
            itemElement.classList.add('timeline-item-right');
        }

        const fromDate = item.from_date ? new Date(item.from_date + 'T00:00:00') : null;
        const toDate = item.is_current ? null : (item.to_date ? new Date(item.to_date + 'T00:00:00') : null);

        const fromYear = fromDate ? fromDate.getFullYear() : 'N/A';
        const toYear = item.is_current ? 'Present' : (toDate ? toDate.getFullYear() : 'N/A');
        const dateString = `${fromYear} - ${toYear}`;

        itemElement.innerHTML = `
            <div class="timeline-content">
                <h3 class="text-lg font-semibold text-gray-800">${item.edu_title || 'Degree Name'}</h3>
                <h4 class="text-md font-medium text-indigo-600 mb-1">${item.edu_name || 'Institution Name'}</h4>
                <p class="text-sm text-gray-500 mb-2">
                    <span class="font-semibold">${dateString}</span>
                    ${item.location ? `| <span class="italic">${item.location}</span>` : ''}
                </p>
                <!-- No description field for education in the spec -->
            </div>
        `;
        timelineContainer.appendChild(itemElement);
    });

     // Re-initialize scroll animations if needed
     // initScrollAnimations();
     console.log('Education timeline updated.');
}