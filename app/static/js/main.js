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

    // Initialize experience, education, and certification sections
    initExperienceCards();
    initEducationDrawers();
    initCertificationDrawers();
    
    // Reposition cards on window resize
    window.addEventListener('resize', function() {
        positionCards();
        positionEducationDrawers();
        positionCertificationDrawers();
    });
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
        
        // Check for education data and update
        if (data.education && Array.isArray(data.education)) {
            console.log('Found education data:', data.education);
            updateEducationSection(data.education);
        } else {
            console.warn('No education data found in API response');
            // Try to load from static JSON file as fallback
            loadEducationFromFile();
        }
        
        // Check for certification data and update
        if (data.certifications && Array.isArray(data.certifications)) {
            console.log('Found certification data:', data.certifications);
            updateCertificationsSection(data.certifications);
        } else {
            console.warn('No certification data found in API response');
            // Try to load from static JSON file as fallback
            loadCertificationsFromFile();
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
    console.log('Updating work experience timeline with data:', workExperienceData);
    
    const experienceSection = document.getElementById('experience-section');
    if (!experienceSection) {
        console.error('Experience section not found');
        return;
    }
    
    // Create section title if it doesn't exist
    let sectionTitle = experienceSection.querySelector('.section-title');
    if (!sectionTitle) {
        sectionTitle = document.createElement('h2');
        sectionTitle.className = 'section-title';
        sectionTitle.textContent = 'Career Journey';
        experienceSection.prepend(sectionTitle);
    }
    
    // Find or create container for experience drawers
    let drawersContainer = document.querySelector('.experience-drawers');
    if (!drawersContainer) {
        drawersContainer = document.createElement('div');
        drawersContainer.className = 'experience-drawers';
        experienceSection.appendChild(drawersContainer);
    } else {
        drawersContainer.innerHTML = ''; // Clear existing drawers
    }
    
    if (!workExperienceData || workExperienceData.length === 0) {
        console.log('No work experience data provided');
        return;
    }
    
    // Sort experiences by date (most recent first)
    const sortedExperiences = [...workExperienceData].sort((a, b) => {
        const dateA = new Date(a.start_date);
        const dateB = new Date(b.start_date);
        return dateB - dateA;
    });
    
    console.log('Sorted experiences:', sortedExperiences);
    
    // Color scheme for the cards
    const colors = ['color-1', 'color-2', 'color-3', 'color-4'];
    
    // Create experience drawers
    sortedExperiences.forEach((experience, index) => {
        const drawer = document.createElement('div');
        drawer.className = `experience-drawer ${colors[index % colors.length]}`;
        drawer.setAttribute('data-index', index);
        
        // Format dates
        const startDate = new Date(experience.start_date);
        const startDateFormatted = startDate.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
        });
        
        let endDateFormatted = 'Present';
        if (experience.end_date && experience.end_date !== 'Present') {
            const endDate = new Date(experience.end_date);
            endDateFormatted = endDate.toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
            });
        }
        
        // Create drawer header
        const header = document.createElement('div');
        header.className = 'drawer-header';
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'drawer-date';
        dateSpan.textContent = `${startDateFormatted} - ${endDateFormatted}`;
        
        const titleCompanyDiv = document.createElement('div');
        titleCompanyDiv.className = 'drawer-title-company';
        
        const titleHeading = document.createElement('h3');
        titleHeading.textContent = experience.job_title;
        
        const companyPara = document.createElement('p');
        companyPara.textContent = experience.company;
        
        titleCompanyDiv.appendChild(titleHeading);
        titleCompanyDiv.appendChild(companyPara);
        
        const locationSpan = document.createElement('span');
        locationSpan.className = 'drawer-location';
        locationSpan.textContent = experience.location || '';
        
        header.appendChild(dateSpan);
        header.appendChild(titleCompanyDiv);
        header.appendChild(locationSpan);
        
        // Create drawer description
        const description = document.createElement('div');
        description.className = 'drawer-description';
        description.innerHTML = experience.description || '';
        
        // Create skills container if there are skills
        if (experience.skills && experience.skills.length > 0) {
            const skillsContainer = document.createElement('div');
            skillsContainer.className = 'skills-container';
            
            experience.skills.forEach(skill => {
                const skillTag = document.createElement('span');
                skillTag.className = 'skill-tag';
                skillTag.textContent = skill;
                skillsContainer.appendChild(skillTag);
            });
            
            description.appendChild(skillsContainer);
        }
        
        drawer.appendChild(header);
        drawer.appendChild(description);
        
        // Set initial z-index based on position (higher for elements at the top)
        drawer.style.zIndex = sortedExperiences.length - index;
        
        drawersContainer.appendChild(drawer);
    });
    
    // Variables to track active state
    let activeIndex = -1;
    let isAnyHovered = false;
    
    // Function to update card positions
    function updateCardPositions() {
        const drawers = document.querySelectorAll('.experience-drawer');
        
        drawers.forEach((drawer, idx) => {
            const drawerIndex = parseInt(drawer.getAttribute('data-index'));
            
            if (isAnyHovered) {
                if (drawerIndex === activeIndex) {
                    // Keep the hovered card at its position and apply a slight scale
                    drawer.style.transform = 'scale(1.02)';
                    drawer.style.zIndex = '30';
                    drawer.style.transition = 'all 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
                } else if (drawerIndex < activeIndex) {
                    // Cards above the hovered one - move up slightly
                    drawer.style.transform = 'translateY(-10px)';
                    drawer.style.zIndex = (sortedExperiences.length + 10 - drawerIndex).toString();
                    drawer.style.transition = 'all 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
                } else {
                    // Cards below the hovered one - push down more
                    drawer.style.transform = 'translateY(20px)';
                    drawer.style.zIndex = (sortedExperiences.length - drawerIndex).toString();
                    drawer.style.transition = 'all 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
                }
            } else {
                // Reset all cards when none are hovered
                drawer.style.transform = '';
                drawer.style.zIndex = (sortedExperiences.length - drawerIndex).toString();
                drawer.style.transition = 'all 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
            }
        });
    }
    
    // Add event listeners
    const drawers = document.querySelectorAll('.experience-drawer');
    
    // For the container
    drawersContainer.addEventListener('mouseleave', () => {
        setTimeout(() => {
            isAnyHovered = false;
            activeIndex = -1;
            
            drawers.forEach(drawer => {
                drawer.classList.remove('active');
            });
            
            updateCardPositions();
        }, 250);
    });
    
    // For each drawer
    drawers.forEach(drawer => {
        const index = parseInt(drawer.getAttribute('data-index'));
        
        // Desktop hover
        drawer.addEventListener('mouseenter', () => {
            isAnyHovered = true;
            activeIndex = index;
            drawer.classList.add('active');
            updateCardPositions();
        });
        
        drawer.addEventListener('mouseleave', () => {
            if (!isMobile()) {
                drawer.classList.remove('active');
            }
        });
        
        // Mobile click
        drawer.addEventListener('click', (e) => {
            if (isMobile()) {
                if (drawer.classList.contains('active')) {
                    drawer.classList.remove('active');
                } else {
                    // Close other drawers first
                    drawers.forEach(d => d.classList.remove('active'));
                    drawer.classList.add('active');
                }
                e.stopPropagation();
            }
        });
    });
    
    // Close active drawer when clicking outside on mobile
    if (isMobile()) {
        document.addEventListener('click', () => {
            drawers.forEach(drawer => drawer.classList.remove('active'));
        });
    }
    
    console.log('Drawer UI creation finished');
}

// Helper function to detect mobile
function isMobile() {
    return window.innerWidth < 768;
}

// Experience Cards 
function initExperienceCards() {
    const experienceContainer = document.querySelector('.experience-drawers');
    if (!experienceContainer) return;
    
    let cards = document.querySelectorAll('.experience-card');
    
    // If no cards exist yet, fetch them via AJAX
    if (cards.length === 0) {
        fetch('/api/work-experience')
            .then(response => response.json())
            .then(data => {
                renderExperienceCards(data, experienceContainer);
                setupCardEventListeners();
                positionCards();
            })
            .catch(error => {
                console.error('Error fetching experience data:', error);
            });
    } else {
        setupCardEventListeners();
        positionCards();
    }
}

function renderExperienceCards(experiences, container) {
    experiences.forEach((exp, index) => {
        const card = document.createElement('div');
        card.className = 'experience-card';
        card.dataset.index = index;
        
        // Create skills HTML if skills exist
        let skillsHtml = '';
        if (exp.skills && exp.skills.length > 0) {
            skillsHtml = `
                <div class="skills-list">
                    ${exp.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            `;
        }
        
        card.innerHTML = `
            <div class="card-header">
                <div class="company-info">
                    <div class="date-range">${exp.start_date} - ${exp.end_date || 'Present'}</div>
                    <h3 class="company-title">${exp.company}</h3>
                    <p class="job-title">${exp.title}</p>
                </div>
            </div>
            <div class="card-content">
                <div class="experience-description">${exp.description}</div>
                ${skillsHtml}
            </div>
        `;
        
        container.appendChild(card);
    });
}

function setupCardEventListeners() {
    const cards = document.querySelectorAll('.experience-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const isActive = card.classList.contains('active');
            
            // Close all cards first
            cards.forEach(c => c.classList.remove('active'));
            
            // If the clicked card wasn't active, make it active
            if (!isActive) {
                card.classList.add('active');
            }
            
            // Reposition cards after animation
            setTimeout(positionCards, 50);
        });
    });
}

function positionCards() {
    const cards = document.querySelectorAll('.experience-card');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) return; // Skip positioning for mobile
    
    // Base positioning values
    const activeOffset = 0;
    const cardGap = 20; // Gap between cards
    let zIndex = cards.length + 10;
    
    cards.forEach((card, index) => {
        const isActive = card.classList.contains('active');
        card.style.zIndex = isActive ? zIndex + 10 : zIndex--;
        
        // Calculate top position
        let topPosition;
        const activeCard = document.querySelector('.experience-card.active');
        const activeIndex = activeCard ? parseInt(activeCard.dataset.index) : 0;
        
        if (isActive) {
            topPosition = activeOffset + 'px';
        } else if (activeCard) {
            // Calculate position based on relationship to active card
            const offset = (index - activeIndex) * cardGap + 70;
            topPosition = offset + 'px';
        } else {
            // Default positioning when no card is active
            topPosition = (index * cardGap) + 'px';
        }
        
        card.style.top = topPosition;
    });
}

/**
 * Load education data from a static JSON file as fallback
 */
function loadEducationFromFile() {
    console.log('Loading education data from static file as fallback');
    
    fetch('/static/data/education.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load education data: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Loaded education data from file:', data);
            updateEducationSection(data);
        })
        .catch(error => {
            console.error('Error loading education data from file:', error);
        });
}

/**
 * Load certifications data from a static JSON file as fallback
 */
function loadCertificationsFromFile() {
    console.log('Loading certifications data from static file as fallback');
    
    fetch('/static/data/certifications.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load certifications data: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Loaded certifications data from file:', data);
            updateCertificationsSection(data);
        })
        .catch(error => {
            console.error('Error loading certifications data from file:', error);
        });
}

/**
 * Update education section with drawer UI
 */
function updateEducationSection(educationData) {
    console.log('Updating education section with data:', educationData);
    
    const educationSection = document.getElementById('education-section');
    if (!educationSection) {
        console.error('Education section not found');
        return;
    }
    
    // Find or create container for education drawers
    let drawersContainer = document.querySelector('.education-drawers');
    if (!drawersContainer) {
        drawersContainer = document.createElement('div');
        drawersContainer.className = 'education-drawers';
        educationSection.appendChild(drawersContainer);
    } else {
        drawersContainer.innerHTML = ''; // Clear existing drawers
    }
    
    if (!educationData || educationData.length === 0) {
        console.log('No education data provided');
        return;
    }
    
    // Sort education by date (most recent first)
    const sortedEducation = [...educationData].sort((a, b) => {
        // Extract years from period strings
        const yearA = a.period.split(' - ')[1] || a.period;
        const yearB = b.period.split(' - ')[1] || b.period;
        return parseInt(yearB) - parseInt(yearA);
    });
    
    console.log('Sorted education:', sortedEducation);
    
    // Color scheme
    const colors = ['education-color-1', 'education-color-2'];
    
    // Create education drawers
    sortedEducation.forEach((education, index) => {
        const drawer = document.createElement('div');
        drawer.className = `education-drawer ${colors[index % colors.length]}`;
        drawer.setAttribute('data-index', index);
        
        // Create drawer header
        const header = document.createElement('div');
        header.className = 'drawer-header';
        
        const periodSpan = document.createElement('span');
        periodSpan.className = 'drawer-period';
        periodSpan.textContent = education.period;
        
        const degreeInstitutionDiv = document.createElement('div');
        degreeInstitutionDiv.className = 'drawer-degree-institution';
        
        const degreeHeading = document.createElement('h3');
        degreeHeading.textContent = education.degree;
        
        const institutionPara = document.createElement('p');
        institutionPara.textContent = education.institution;
        
        degreeInstitutionDiv.appendChild(degreeHeading);
        degreeInstitutionDiv.appendChild(institutionPara);
        
        header.appendChild(periodSpan);
        header.appendChild(degreeInstitutionDiv);
        
        // Create drawer description
        const description = document.createElement('div');
        description.className = 'drawer-description';
        description.textContent = education.description || '';
        
        drawer.appendChild(header);
        drawer.appendChild(description);
        
        // Set initial z-index based on position
        drawer.style.zIndex = sortedEducation.length - index;
        
        drawersContainer.appendChild(drawer);
    });
    
    // Setup event listeners
    initEducationDrawers();
}

/**
 * Update certifications section with drawer UI
 */
function updateCertificationsSection(certificationsData) {
    console.log('Updating certifications section with data:', certificationsData);
    
    const certificationsSection = document.getElementById('certifications-section');
    if (!certificationsSection) {
        console.error('Certifications section not found');
        return;
    }
    
    // Find or create container for certification drawers
    let drawersContainer = document.querySelector('.certifications-drawers');
    if (!drawersContainer) {
        drawersContainer = document.createElement('div');
        drawersContainer.className = 'certifications-drawers';
        certificationsSection.appendChild(drawersContainer);
    } else {
        drawersContainer.innerHTML = ''; // Clear existing drawers
    }
    
    if (!certificationsData || certificationsData.length === 0) {
        console.log('No certification data provided');
        return;
    }
    
    // Sort certifications by date (most recent first)
    const sortedCertifications = [...certificationsData].sort((a, b) => {
        const dateA = new Date(parseDate(a.issue_date));
        const dateB = new Date(parseDate(b.issue_date));
        return dateB - dateA;
    });
    
    console.log('Sorted certifications:', sortedCertifications);
    
    // Color scheme
    const colors = ['cert-color-1', 'cert-color-2', 'cert-color-3'];
    
    // Create certification drawers
    sortedCertifications.forEach((cert, index) => {
        const drawer = document.createElement('div');
        drawer.className = `certification-drawer ${colors[index % colors.length]}`;
        drawer.setAttribute('data-index', index);
        
        // Format expiry date text
        let expiryText = cert.expiry_date ? `Expires: ${cert.expiry_date}` : 'No Expiration';
        
        // Create drawer header
        const header = document.createElement('div');
        header.className = 'drawer-header';
        
        const datesSpan = document.createElement('span');
        datesSpan.className = 'drawer-dates';
        datesSpan.textContent = `Issued: ${cert.issue_date}`;
        
        const titleIssuerDiv = document.createElement('div');
        titleIssuerDiv.className = 'drawer-title-issuer';
        
        const titleHeading = document.createElement('h3');
        titleHeading.textContent = cert.title;
        
        const issuerPara = document.createElement('p');
        issuerPara.textContent = cert.issuer;
        
        titleIssuerDiv.appendChild(titleHeading);
        titleIssuerDiv.appendChild(issuerPara);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'drawer-actions';
        
        const viewCertLink = document.createElement('a');
        viewCertLink.className = 'view-certificate';
        viewCertLink.textContent = 'View Certificate';
        viewCertLink.href = cert.certificate_url || '#';
        viewCertLink.target = '_blank';
        
        actionsDiv.appendChild(viewCertLink);
        
        header.appendChild(datesSpan);
        header.appendChild(titleIssuerDiv);
        header.appendChild(actionsDiv);
        
        drawer.appendChild(header);
        
        // Set initial z-index based on position
        drawer.style.zIndex = sortedCertifications.length - index;
        
        drawersContainer.appendChild(drawer);
    });
    
    // Setup event listeners
    initCertificationDrawers();
}

/**
 * Helper function to parse dates in different formats
 */
function parseDate(dateStr) {
    if (!dateStr) return new Date(0);
    
    // Handle format like "Mar 2018" or "Jun 2019"
    const monthNames = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const parts = dateStr.split(' ');
    if (parts.length === 2 && monthNames[parts[0]]) {
        return new Date(parseInt(parts[1]), monthNames[parts[0]], 1);
    }
    
    // Fallback to standard date parsing
    return new Date(dateStr);
}

/**
 * Initialize education drawers interactivity
 */
function initEducationDrawers() {
    const drawers = document.querySelectorAll('.education-drawer');
    if (!drawers.length) return;
    
    // Variables to track active state
    let activeIndex = -1;
    let isAnyHovered = false;
    
    // For the container
    const container = document.querySelector('.education-drawers');
    if (container) {
        container.addEventListener('mouseleave', () => {
            setTimeout(() => {
                isAnyHovered = false;
                activeIndex = -1;
                
                drawers.forEach(drawer => {
                    drawer.classList.remove('active');
                });
                
                positionEducationDrawers();
            }, 250);
        });
    }
    
    // For each drawer
    drawers.forEach(drawer => {
        const index = parseInt(drawer.getAttribute('data-index'));
        
        // Desktop hover
        drawer.addEventListener('mouseenter', () => {
            isAnyHovered = true;
            activeIndex = index;
            drawer.classList.add('active');
            positionEducationDrawers();
        });
        
        drawer.addEventListener('mouseleave', () => {
            if (!isMobile()) {
                drawer.classList.remove('active');
            }
        });
        
        // Mobile click
        drawer.addEventListener('click', (e) => {
            if (isMobile()) {
                if (drawer.classList.contains('active')) {
                    drawer.classList.remove('active');
                } else {
                    // Close other drawers first
                    drawers.forEach(d => d.classList.remove('active'));
                    drawer.classList.add('active');
                }
                e.stopPropagation();
            }
        });
    });
    
    // Close active drawer when clicking outside on mobile
    if (isMobile()) {
        document.addEventListener('click', () => {
            drawers.forEach(drawer => drawer.classList.remove('active'));
        });
    }
    
    // Initial positioning
    positionEducationDrawers();
}

/**
 * Position education drawers for stacked effect
 */
function positionEducationDrawers() {
    const drawers = document.querySelectorAll('.education-drawer');
    if (!drawers.length) return;
    
    let activeIndex = -1;
    let isAnyHovered = false;
    
    // Find active drawer if any
    drawers.forEach((drawer, idx) => {
        if (drawer.classList.contains('active')) {
            activeIndex = parseInt(drawer.getAttribute('data-index'));
            isAnyHovered = true;
        }
    });
    
    // Update positions
    drawers.forEach(drawer => {
        const drawerIndex = parseInt(drawer.getAttribute('data-index'));
        
        if (isAnyHovered) {
            if (drawerIndex === activeIndex) {
                drawer.style.transform = 'scale(1.02)';
                drawer.style.zIndex = '30';
            } else if (drawerIndex < activeIndex) {
                drawer.style.transform = 'translateY(-10px)';
                drawer.style.zIndex = (drawers.length + 10 - drawerIndex).toString();
            } else {
                drawer.style.transform = 'translateY(20px)';
                drawer.style.zIndex = (drawers.length - drawerIndex).toString();
            }
        } else {
            drawer.style.transform = '';
            drawer.style.zIndex = (drawers.length - drawerIndex).toString();
        }
    });
}

/**
 * Initialize certification drawers interactivity
 */
function initCertificationDrawers() {
    const drawers = document.querySelectorAll('.certification-drawer');
    if (!drawers.length) return;
    
    // Variables to track active state
    let activeIndex = -1;
    let isAnyHovered = false;
    
    // For the container
    const container = document.querySelector('.certifications-drawers');
    if (container) {
        container.addEventListener('mouseleave', () => {
            setTimeout(() => {
                isAnyHovered = false;
                activeIndex = -1;
                
                drawers.forEach(drawer => {
                    drawer.classList.remove('active');
                });
                
                positionCertificationDrawers();
            }, 250);
        });
    }
    
    // For each drawer
    drawers.forEach(drawer => {
        const index = parseInt(drawer.getAttribute('data-index'));
        
        // Desktop hover
        drawer.addEventListener('mouseenter', () => {
            isAnyHovered = true;
            activeIndex = index;
            drawer.classList.add('active');
            positionCertificationDrawers();
        });
        
        drawer.addEventListener('mouseleave', () => {
            if (!isMobile()) {
                drawer.classList.remove('active');
            }
        });
        
        // Mobile click
        drawer.addEventListener('click', (e) => {
            if (isMobile()) {
                if (drawer.classList.contains('active')) {
                    drawer.classList.remove('active');
                } else {
                    // Close other drawers first
                    drawers.forEach(d => d.classList.remove('active'));
                    drawer.classList.add('active');
                }
                e.stopPropagation();
            }
        });
    });
    
    // Close active drawer when clicking outside on mobile
    if (isMobile()) {
        document.addEventListener('click', () => {
            drawers.forEach(drawer => drawer.classList.remove('active'));
        });
    }
    
    // Initial positioning
    positionCertificationDrawers();
}

/**
 * Position certification drawers for stacked effect
 */
function positionCertificationDrawers() {
    const drawers = document.querySelectorAll('.certification-drawer');
    if (!drawers.length) return;
    
    let activeIndex = -1;
    let isAnyHovered = false;
    
    // Find active drawer if any
    drawers.forEach((drawer, idx) => {
        if (drawer.classList.contains('active')) {
            activeIndex = parseInt(drawer.getAttribute('data-index'));
            isAnyHovered = true;
        }
    });
    
    // Update positions
    drawers.forEach(drawer => {
        const drawerIndex = parseInt(drawer.getAttribute('data-index'));
        
        if (isAnyHovered) {
            if (drawerIndex === activeIndex) {
                drawer.style.transform = 'scale(1.02)';
                drawer.style.zIndex = '30';
            } else if (drawerIndex < activeIndex) {
                drawer.style.transform = 'translateY(-10px)';
                drawer.style.zIndex = (drawers.length + 10 - drawerIndex).toString();
            } else {
                drawer.style.transform = 'translateY(20px)';
                drawer.style.zIndex = (drawers.length - drawerIndex).toString();
            }
        } else {
            drawer.style.transform = '';
            drawer.style.zIndex = (drawers.length - drawerIndex).toString();
        }
    });
}