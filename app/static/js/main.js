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
        console.log('Processing configuration data', data);
        
        // Handle nested data structure if present
        let configData = data;
        if (data.site_configs) {
            console.log('Detected nested site_configs structure');
            configData = data.site_configs;
        }
        
        if (data.site_config) {
            console.log('Detected site_config object');
            configData = data.site_config;
        }
        
        console.log('Final config data to apply:', configData);
        
        // Apply configuration to the website
        updateWebsiteElements(configData);
        
        // Check for work experience data and update timeline
        if (data.work_experience && Array.isArray(data.work_experience)) {
            console.log('Found work experience data:', data.work_experience);
            // Call the function to update the work experience timeline
            updateWorkExperienceTimeline(data.work_experience);
        } else {
            console.warn('No work experience data found in API response');
        }
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
    
    // Store config globally for other components to access
    window.siteConfig = config;
    
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
        const banner = document.getElementById('banner-image');
        if (banner) {
            // Function to update banner image based on screen size
            function updateBannerImage() {
                const isMobile = window.innerWidth <= 768;
                const mobileUrl = config.image_mobile_banner_url;
                const desktopUrl = config.image_banner_url;
                
                console.log('Updating banner image. Mobile?', isMobile, 'Mobile URL:', mobileUrl, 'Desktop URL:', desktopUrl);
                
                if (isMobile && mobileUrl) {
                    banner.style.backgroundImage = `url('${mobileUrl}')`;
                    console.log('Set mobile banner URL:', mobileUrl);
                } else if (desktopUrl) {
                    banner.style.backgroundImage = `url('${desktopUrl}')`;
                    console.log('Set desktop banner URL:', desktopUrl);
                }
                
                banner.style.backgroundSize = "cover";
                banner.style.backgroundPosition = "center";
            }
            
            // Update banner immediately and on resize
            updateBannerImage();
            window.addEventListener('resize', updateBannerImage);
            console.log('Banner update complete and resize listener added');
        }
    }
    
    // Update about section
    if (config.about_title) {
        const aboutTitle = document.getElementById('about-title');
        if (aboutTitle) {
            aboutTitle.innerHTML = config.about_title;
            console.log('Updated about title:', config.about_title);
        }
    }
    
    if (config.about_subtitle) {
        const aboutSubtitle = document.getElementById('about-subtitle');
        if (aboutSubtitle) {
            aboutSubtitle.innerHTML = config.about_subtitle;
            console.log('Updated about subtitle:', config.about_subtitle);
        }
    }
    
    if (config.about_description) {
        const aboutDescription = document.getElementById('about-description');
        if (aboutDescription) {
            aboutDescription.innerHTML = config.about_description;
            console.log('Updated about description with HTML formatting');
        }
    }
    
    // Update profile photo
    if (config.image_about_profile_url) {
        const profilePhoto = document.getElementById('profile-image');
        if (profilePhoto) {
            profilePhoto.src = config.image_about_profile_url;
            console.log('Updated profile photo:', config.image_about_profile_url);
        }
    }
    
    // Update gallery photos
    const photos = [
        { url: config.image_about_photo1_url, alt: config.about_photo1_alt },
        { url: config.image_about_photo2_url, alt: config.about_photo2_alt },
        { url: config.image_about_photo3_url, alt: config.about_photo3_alt },
        { url: config.image_about_photo4_url, alt: config.about_photo4_alt }
    ];
    
    // If updateCarousel function exists, call it
    if (typeof updateCarousel === 'function') {
        updateCarousel(photos);
        console.log('Updated photo carousel with gallery photos');
    } else {
        console.warn('updateCarousel function not found');
    }
    
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

/**
 * Update work experience section with a stacked drawer UI
 */
function updateWorkExperienceTimeline(workExperienceData) {
    console.log('Creating drawer UI for work experience:', workExperienceData);
    
    const container = document.getElementById('experience-drawers-container');
    if (!container) {
        console.error('Experience drawers container (#experience-drawers-container) not found.');
        return;
    }
    
    // Check if a section title already exists
    const existingTitle = container.parentNode.querySelector('.section-title');
    
    // Only create a new title if one doesn't already exist
    if (!existingTitle) {
        const headerElement = document.createElement('h2');
        headerElement.className = 'section-title text-center mb-6';
        headerElement.textContent = 'Career Journey';
        container.parentNode.insertBefore(headerElement, container);
        console.log('Added "Career Journey" header above container');
    } else {
        console.log('Using existing section title:', existingTitle.textContent);
        // Make sure the existing title is visible
        existingTitle.style.display = 'block';
        existingTitle.style.position = 'relative';
        existingTitle.style.zIndex = '5';
        existingTitle.style.marginBottom = '2rem';
    }
    
    container.innerHTML = ''; // Clear previous content (e.g., old timeline)
    
    if (!workExperienceData || !Array.isArray(workExperienceData) || workExperienceData.length === 0) {
        console.warn('No work experience data provided. Displaying placeholder.');
        container.innerHTML = '<p>No work experience details available at this time.</p>'; 
        return;
    }
    
    // Sort by date (most recent first)
    const sortedExperience = [...workExperienceData].sort((a, b) => {
        const dateA = new Date(a.from_date || '1970-01-01');
        const dateB = new Date(b.from_date || '1970-01-01');
        return dateB - dateA;
    });

    const totalItems = sortedExperience.length;
    const colorSchemes = [
        'color-1',    // #6c584c
        'color-2',    // #a38566
        'color-3',    // #d1b38a
        'color-4'     // #e9dac1
    ];

    // Create drawers
    sortedExperience.forEach((exp, index) => {
        const drawer = document.createElement('div');
        drawer.classList.add('experience-drawer', colorSchemes[index % colorSchemes.length]);
        drawer.setAttribute('data-index', index);
        
        // Set initial position based on index (stacked effect)
        drawer.style.zIndex = totalItems - index;
        drawer.style.transform = `translateY(${index * 20}px)`;
        
        // Format dates
        let dateString = 'Date N/A';
        if (exp.from_date) {
            const fromDate = new Date(exp.from_date);
            const fromMonth = fromDate.toLocaleString('default', { month: 'short' });
            const fromYear = fromDate.getFullYear();
            
            if (exp.is_current) {
                dateString = `${fromMonth} ${fromYear} - Present`;
            } else if (exp.to_date) {
                const toDate = new Date(exp.to_date);
                const toMonth = toDate.toLocaleString('default', { month: 'short' });
                const toYear = toDate.getFullYear();
                dateString = `${fromMonth} ${fromYear} - ${toMonth} ${toYear}`;
            } else {
                dateString = `${fromMonth} ${fromYear} - Date N/A`;
            }
        }
        
        // Create description list (assuming description is newline-separated)
        let descriptionHtml = '';
        if (exp.description) {
            const descriptionItems = exp.description.split('\n').filter(item => item.trim() !== '');
            descriptionHtml = `<ul>${descriptionItems.map(item => `<li>${item.trim()}</li>`).join('')}</ul>`;
        }

        drawer.innerHTML = `
            <div class="drawer-header">
                <div class="drawer-date">${dateString}</div>
                <div class="drawer-title-company">
                    <h3>${exp.job_title || 'N/A'}</h3>
                    <p>${exp.company_name || 'N/A'}</p>
                </div>
                <div class="drawer-location">${exp.location || 'Remote'}</div>
            </div>
            <div class="drawer-description">
                ${descriptionHtml}
            </div>
        `;
        
        container.appendChild(drawer);
    });
    
    // Handle drawer interactions
    const drawers = container.querySelectorAll('.experience-drawer');
    let activeIndex = -1;
    let isAnyHovered = false;
    
    // Function to update all cards based on hover state
    function updateCardPositions(hoveredIndex) {
        drawers.forEach((d, i) => {
            // Base transform
            let yOffset = i * 20;
            
            if (hoveredIndex !== null) {
                // If a card is hovered, adjust positions
                if (hoveredIndex === i) {
                    // Keep the hovered card at its position
                    d.style.zIndex = 30;
                    d.style.transform = `translateY(${yOffset}px) scale(1.02)`;
                } else if (hoveredIndex < i) {
                    // Push down cards below the hovered one
                    d.style.zIndex = totalItems - i;
                    d.style.transform = `translateY(${yOffset + 20}px)`;
                } else {
                    // Pull up cards above the hovered one
                    d.style.zIndex = totalItems - i;
                    d.style.transform = `translateY(${yOffset - 10}px)`;
                }
            } else {
                // Reset to original position when nothing is hovered
                d.style.zIndex = totalItems - i;
                d.style.transform = `translateY(${yOffset}px)`;
            }
        });
    }
    
    // Add event listeners to each drawer
    drawers.forEach((drawer, index) => {
        drawer.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) {
                activeIndex = index;
                isAnyHovered = true;
                drawer.classList.add('active');
                updateCardPositions(index);
            }
        });
        
        drawer.addEventListener('mouseleave', () => {
            if (window.innerWidth > 768) {
                drawer.classList.remove('active');
                // Only reset if we're not entering another card
                setTimeout(() => {
                    if (!isAnyHovered) {
                        activeIndex = -1;
                        updateCardPositions(null);
                    }
                }, 100);
            }
        });
        
        drawer.addEventListener('click', (event) => {
            // Mobile handling
            if (window.innerWidth <= 768) {
                if (drawer.classList.contains('active')) {
                    drawer.classList.remove('active');
                    activeIndex = -1;
                } else {
                    // Deactivate all drawers
                    drawers.forEach(d => d.classList.remove('active'));
                    // Activate this drawer
                    drawer.classList.add('active');
                    activeIndex = index;
                }
                event.stopPropagation();
            }
        });
    });
    
    // Handle container mouse leave
    container.addEventListener('mouseleave', () => {
        isAnyHovered = false;
        setTimeout(() => {
            if (!isAnyHovered) {
                activeIndex = -1;
                updateCardPositions(null);
                drawers.forEach(d => d.classList.remove('active'));
            }
        }, 100);
    });
    
    // Close drawers when clicking outside
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768) {
            const isClickInsideDrawer = event.target.closest('.experience-drawer');
            
            if (!isClickInsideDrawer && activeIndex !== -1) {
                drawers.forEach(d => d.classList.remove('active'));
                activeIndex = -1;
            }
        }
    });

    console.log('Finished creating drawer UI.');
}