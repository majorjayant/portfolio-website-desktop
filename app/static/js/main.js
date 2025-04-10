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
    console.log("Updating work experience timeline with data:", workExperienceData);
    
    // Get the experience section
    const experienceSection = document.querySelector('.experience-section');
    if (!experienceSection) {
        console.error('Experience section not found');
        return;
    }
    
    // Get the container for the drawers
    const drawersContainer = document.querySelector('.experience-drawers');
    if (!drawersContainer) {
        console.error('Experience drawers container not found');
        return;
    }
    
    // Clear previous content
    drawersContainer.innerHTML = '';
    
    // Check if there is any work experience data
    if (!workExperienceData || workExperienceData.length === 0) {
        const noExperience = document.createElement('p');
        noExperience.textContent = 'No work experience data available.';
        noExperience.style.color = '#333';
        noExperience.style.textAlign = 'center';
        drawersContainer.appendChild(noExperience);
        return;
    }
    
    // Sort work experience by date (most recent first)
    workExperienceData.sort((a, b) => {
        const dateA = a.start_date || a.from_date;
        const dateB = b.start_date || b.from_date;
        return new Date(dateB) - new Date(dateA);
    });
    
    // Define the custom colors
    const colors = [
        "#6c584c", // dark brown
        "#a38566", // medium brown
        "#d1b38a", // light brown/tan
        "#e9dac1"  // cream/beige
    ];
    
    // Create a drawer for each work experience
    workExperienceData.forEach((experience, index) => {
        // Create a drawer with staggered animation
        const drawer = document.createElement('div');
        drawer.className = `experience-drawer color-${(index % 4) + 1}`;
        drawer.style.opacity = '0';
        drawer.style.transform = 'translateY(20px)';
        drawer.style.transitionDelay = `${index * 0.1}s`;
        drawer.style.borderLeftColor = colors[index % 4];
        
        // Add lighting effect element
        const lightingEffect = document.createElement('div');
        lightingEffect.className = 'lighting-effect';
        drawer.appendChild(lightingEffect);
        
        // Format dates - handle both naming conventions (start_date/from_date and end_date/to_date)
        const startDate = new Date(experience.start_date || experience.from_date || '');
        const endDate = experience.end_date || experience.to_date ? new Date(experience.end_date || experience.to_date) : null;
        const isCurrent = experience.is_current || endDate === null;
        
        const dateString = isCurrent 
            ? `${getMonthName(startDate.getMonth())} ${startDate.getFullYear()} - Present`
            : `${getMonthName(startDate.getMonth())} ${startDate.getFullYear()} - ${getMonthName(endDate.getMonth())} ${endDate.getFullYear()}`;
        
        // Get the correct job title and company fields (handle different naming conventions)
        const jobTitle = experience.job_title || experience.title || '';
        const company = experience.company || experience.company_name || '';
        const location = experience.location || 'Remote';
        const description = experience.description || '';
        
        // Create drawer content with improved structure - remove suitcase icon from date, add to title
        drawer.innerHTML += `
            <div class="drawer-header">
                <div class="drawer-date">${dateString}</div>
                <div class="drawer-title-company">
                    <h3>${jobTitle}</h3>
                    <p>${company}</p>
                </div>
                <div class="drawer-location">${location}</div>
            </div>
            <div class="drawer-description">
                <div class="description-content">${description.replace(/\n/g, '<br>')}</div>
            </div>
        `;
        
        // Extract potential skills from the description
        let skills = extractSkillsFromDescription(description);
        
        // Add skills container if there are skills
        if (skills.length > 0) {
            const skillsContainer = document.createElement('div');
            skillsContainer.className = 'skills-container';
            
            skills.forEach(skill => {
                const skillTag = document.createElement('span');
                skillTag.className = 'skill-tag';
                skillTag.textContent = skill;
                skillsContainer.appendChild(skillTag);
            });
            
            // Append skills after description content
            drawer.querySelector('.description-content').appendChild(skillsContainer);
        }
        
        // Add to container
        drawersContainer.appendChild(drawer);
        
        // Animate after a delay
        setTimeout(() => {
            drawer.style.transition = 'all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
            drawer.style.opacity = '1';
            drawer.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    // Add mouse tracking for lighting effect
    const drawers = document.querySelectorAll('.experience-drawer');
    
    drawers.forEach((drawer, index) => {
        // Set z-index to create stacked effect
        drawer.style.zIndex = drawers.length - index;
        
        const lightingEffect = drawer.querySelector('.lighting-effect');
        
        drawer.addEventListener('mousemove', (e) => {
            // Get position relative to the drawer
            const rect = drawer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate position percentage
            const xPercent = x / rect.width * 100;
            const yPercent = y / rect.height * 100;
            
            // Create radial gradient based on mouse position
            lightingEffect.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 60%)`;
        });
        
        // Handle hover state for card stack effect
        drawer.addEventListener('mouseenter', () => {
            // Move other cards down slightly to create depth
            drawers.forEach((otherDrawer, otherIndex) => {
                if (otherIndex !== index) {
                    otherDrawer.style.transform = 'translateY(5px)';
                    otherDrawer.style.transition = 'all 0.5s ease';
                }
            });
            
            // Move current card up
            drawer.style.transform = 'translateY(-5px) scale(1.02)';
            drawer.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15)';
            drawer.style.zIndex = 100;
        });
        
        drawer.addEventListener('mouseleave', () => {
            // Reset all cards
            drawers.forEach((otherDrawer) => {
                otherDrawer.style.transform = 'translateY(0)';
                otherDrawer.style.boxShadow = '';
            });
            
            // Reset z-index
            drawer.style.zIndex = drawers.length - index;
        });
        
        // Toggle active state on click
        drawer.addEventListener('click', function() {
            // Check if this drawer is currently active
            const wasActive = this.classList.contains('active');
            
            // Close all drawers first
            drawers.forEach(d => {
                d.classList.remove('active');
                const desc = d.querySelector('.drawer-description');
                if (desc) {
                    desc.style.display = 'none';
                }
            });
            
            // If this drawer wasn't active before, make it active
            if (!wasActive) {
                this.classList.add('active');
                const description = this.querySelector('.drawer-description');
                if (description) {
                    description.style.display = 'block';
                    
                    // Force a reflow to ensure the display change takes effect
                    void description.offsetHeight;
                    
                    // Log the state for debugging
                    console.log('Drawer activated, description visible:', 
                                description.style.display, 
                                'Content:', 
                                description.textContent.substring(0, 50) + '...');
                }
            }
        });
    });
    
    console.log("Work experience UI created successfully");
}

// Helper function to extract skills from job description
function extractSkillsFromDescription(description) {
    // List of common tech skills and keywords to look for
    const commonSkills = [
        'JavaScript', 'React', 'Vue', 'Angular', 'Node.js', 'Express', 'MongoDB', 
        'SQL', 'MySQL', 'PostgreSQL', 'PHP', 'Laravel', 'Python', 'Django', 'Flask',
        'Java', 'Spring', 'C#', '.NET', 'Ruby', 'Rails', 'Go', 'AWS', 'Azure', 
        'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'HTML', 'CSS', 
        'SASS', 'LESS', 'Bootstrap', 'Tailwind', 'TypeScript', 'Redux', 'GraphQL',
        'REST API', 'Agile', 'Scrum', 'Jira', 'Project Management', 'Team Lead',
        'Architecture', 'Design Patterns', 'Mobile Development', 'iOS', 'Android',
        'React Native', 'Flutter', 'Swift', 'Kotlin', 'Testing', 'Jest', 'Mocha',
        'Leadership', 'Communication', 'Problem Solving', 'Analytical'
    ];
    
    // Extract skills
    const foundSkills = [];
    
    commonSkills.forEach(skill => {
        // Look for the skill in the description (case insensitive)
        const regex = new RegExp(`\\b${skill}\\b`, 'i');
        if (regex.test(description)) {
            // Add the skill with proper casing
            foundSkills.push(skill);
        }
    });
    
    // Limit to 8 skills maximum
    return foundSkills.slice(0, 8);
}

// Helper function to get month name
function getMonthName(monthIndex) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
}