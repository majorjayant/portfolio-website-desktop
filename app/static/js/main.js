// Main JavaScript for Portfolio Website

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application');
    
    // Default configuration with fallback values
    window.defaultConfig = {
        site_title: "Jayant Malik | Portfolio",
        site_subtitle: "Product Manager | Developer",
        image_urls: {
            favicon: "img/favicon.ico",
            logo: "img/logo.png",
            banner: "img/banner.jpg",
            about_profile: "img/profile.jpg"
        },
        api: {
            base_url: "/api"
        }
    };
    
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
            }, 50);
        } else {
            project.style.opacity = '0';
            setTimeout(() => {
                project.style.display = 'none';
            }, 500);
        }
    });
}

// Load site configuration
function loadSiteConfig() {
    console.log('Loading site configuration');
    
    // Check if we already have site config in window object (might be inserted inline in HTML)
    if (window.siteConfig) {
        console.log('Using pre-loaded site configuration');
        processConfigData(window.siteConfig);
        return;
    }
    
    // Try to load from local data file
    fetch('/data/site_config.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch site configuration');
            }
            return response.json();
        })
        .then(data => {
            console.log('Loaded site configuration from file');
            if (data && data.site_configs) {
                processConfigData(data.site_configs);
            } else {
                throw new Error('Invalid site configuration format');
            }
        })
        .catch(error => {
            console.warn('Error loading site configuration:', error);
            console.log('Using default configuration');
            processConfigData(window.defaultConfig);
            // Fix any broken images with fallbacks
            fixBrokenImages();
        });
}

// Process the configuration data
function processConfigData(data) {
    console.log('Processing configuration data');
    
    // Store the configuration globally
    window.siteConfig = data;
    
    // Update website elements with the configuration
    updateWebsiteElements(data);
    
    // Load work experience data if on the homepage or about page
    const workExperienceSection = document.getElementById('experience-timeline');
    if (workExperienceSection && data.work_experience) {
        updateWorkExperienceTimeline(data.work_experience);
    }
}

// Display error notification
function showErrorNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('error-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'error-notification';
        notification.className = 'error-notification';
        document.body.appendChild(notification);
        
        // Style the notification
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#f44336';
        notification.style.color = 'white';
        notification.style.padding = '12px 24px';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.style.zIndex = '1000';
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        notification.style.transition = 'transform 0.3s, opacity 0.3s';
    }
    
    // Set message and show notification
    notification.textContent = message;
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Hide notification after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
    }, 5000);
}

// Fix broken images by using fallbacks
function fixBrokenImages() {
    console.log('Checking for broken images');
    
    // Default image fallbacks
    const fallbacks = window.defaultConfig.image_urls;
    
    // Fix common elements
    const elements = [
        { selector: '.navbar .logo img', attr: 'src', fallback: fallbacks.logo },
        { selector: '.footer-logo img', attr: 'src', fallback: fallbacks.logo },
        { selector: 'link[rel="icon"]', attr: 'href', fallback: fallbacks.favicon },
        { selector: '.banner-image', attr: 'style', fallback: `background-image: url('${fallbacks.banner}')` },
        { selector: '.hero-image img, .about-profile img', attr: 'src', fallback: fallbacks.about_profile }
    ];
    
    elements.forEach(el => {
        const element = document.querySelector(el.selector);
        if (element) {
            if (el.attr === 'style' && (!element.style.backgroundImage || element.style.backgroundImage === 'none')) {
                element.style.backgroundImage = `url('${el.fallback}')`;
            } else if (el.attr !== 'style' && (!element[el.attr] || element.naturalWidth === 0)) {
                element[el.attr] = el.fallback;
            }
            
            // Add error handler for images
            if (element.tagName === 'IMG') {
                element.onerror = function() {
                    this.src = el.fallback;
                };
            }
        }
    });
}

// Update website elements with configuration
function updateWebsiteElements(config) {
    console.log('Updating website elements with configuration');
    
    // Update document title
    if (config.site_title) {
        document.title = config.site_title;
    }
    
    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon && config.image_urls && config.image_urls.favicon) {
        favicon.href = config.image_urls.favicon;
    }
    
    // Update logo
    const logoElements = document.querySelectorAll('.navbar .logo img, .footer-logo img');
    logoElements.forEach(logo => {
        if (config.image_urls && config.image_urls.logo) {
            logo.src = config.image_urls.logo;
        }
    });
    
    // Update banner image if present
    const bannerImage = document.querySelector('.banner-image');
    if (bannerImage && config.image_urls) {
        function updateBannerImage() {
            const isMobile = window.innerWidth <= 768;
            const bannerUrl = isMobile && config.image_urls.mobile_banner 
                ? config.image_urls.mobile_banner 
                : config.image_urls.banner;
            
            if (bannerUrl) {
                bannerImage.style.backgroundImage = `url('${bannerUrl}')`;
            }
        }
        
        // Update on load and window resize
        updateBannerImage();
        window.addEventListener('resize', updateBannerImage);
    }
    
    // Update heading content
    const headingElements = {
        'site-title': config.site_title,
        'site-subtitle': config.site_subtitle,
        'site-description': config.site_description
    };
    
    for (const [id, content] of Object.entries(headingElements)) {
        const element = document.getElementById(id);
        if (element && content) {
            element.innerHTML = content;
        }
    }
    
    // Update profile image
    const profileImage = document.querySelector('.about-profile img, .hero-image img');
    if (profileImage && config.image_urls && config.image_urls.about_profile) {
        profileImage.src = config.image_urls.about_profile;
        profileImage.alt = config.site_title || 'Profile Image';
    }
    
    // Update gallery photos if they exist
    if (config.image_urls) {
        for (let i = 1; i <= 4; i++) {
            const photoUrl = config.image_urls[`about_photo${i}`];
            const photoAlt = config[`about_photo${i}_alt`] || `Gallery Photo ${i}`;
            if (photoUrl) {
                updateGalleryPhoto(`.photo-stack img:nth-child(${i})`, photoUrl, photoAlt);
            }
        }
    }
}

// Update gallery photo src and alt
function updateGalleryPhoto(selector, photoUrl, altText) {
    const photoElement = document.querySelector(selector);
    if (photoElement && photoUrl) {
        photoElement.src = photoUrl;
        if (altText) {
            photoElement.alt = altText;
        }
    }
}

// Update work experience timeline
function updateWorkExperienceTimeline(workExperienceData) {
    console.log("Updating work experience timeline with data:", workExperienceData);
    
    // Get the experience section
    const experienceSection = document.querySelector('.experience-section');
    if (!experienceSection) {
        console.error('Experience section not found');
        return;
    }
    
    // Fix background color in case CSS is not applied properly
    experienceSection.style.backgroundColor = '#f8f8f8';
    
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
        
        // Create header content
        const headerContent = document.createElement('div');
        headerContent.className = 'drawer-header';
        headerContent.innerHTML = `
            <div class="drawer-date">${dateString}</div>
            <div class="drawer-title-company">
                <h3>${jobTitle}</h3>
                <p>${company}</p>
            </div>
            <div class="drawer-location">${location}</div>
        `;
        drawer.appendChild(headerContent);
        
        // Create description container with correct initial styling
        const descriptionContainer = document.createElement('div');
        descriptionContainer.className = 'drawer-description';
        
        // Check if we're on mobile or desktop view
        const isMobile = window.innerWidth <= 768;
        
        // Only set display:none on mobile
        if (isMobile) {
            descriptionContainer.style.display = 'none'; // Will be shown on click on mobile
        } else {
            // On desktop, make sure it's visible
            descriptionContainer.style.display = 'block';
        }
        
        // Create description content
        const descriptionContent = document.createElement('div');
        descriptionContent.className = 'description-content';
        
        // Create proper HTML for description - if it contains newlines, convert to list items
        if (description.includes('\n')) {
            // Split by newlines and filter out empty items
            const descriptionItems = description.split('\n').filter(item => item.trim() !== '');
            descriptionContent.innerHTML = `
                <ul>
                    ${descriptionItems.map(item => `<li>${item.trim()}</li>`).join('')}
                </ul>
            `;
        } else {
            // Set innerHTML for description - this preserves HTML formatting
            descriptionContent.innerHTML = description;
        }
        
        // Append content to container
        descriptionContainer.appendChild(descriptionContent);
        drawer.appendChild(descriptionContainer);
        
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
            
            // Append skills directly to description content
            descriptionContent.appendChild(skillsContainer);
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
            // Check if we're on mobile view
            const isMobile = window.innerWidth <= 768;
            
            // Check if this drawer is currently active
            const wasActive = drawer.classList.contains('active');
            
            // Close all drawers first with staggered animation
            drawers.forEach((d, i) => {
                // Remove active class
                d.classList.remove('active');
                
                // Only hide descriptions on mobile
                if (isMobile) {
                    const desc = d.querySelector('.drawer-description');
                    if (desc) {
                        // Add a slight delay between each drawer closing for a smoother effect
                        setTimeout(() => {
                            desc.style.display = 'none';
                        }, i * 50); // 50ms delay between each drawer
                    }
                }
            });
            
            // If this drawer wasn't active before, make it active
            if (!wasActive) {
                // Add a slight delay before showing to ensure animations complete
                setTimeout(() => {
                    drawer.classList.add('active');
                    
                    // Handle description visibility
                    const description = drawer.querySelector('.drawer-description');
                    if (description && isMobile) { // Only toggle visibility on mobile
                        // Force display block style
                        description.style.display = 'block';
                        description.style.visibility = 'visible';
                        description.style.overflow = 'visible';
                        description.style.height = 'auto';
                        description.style.maxHeight = '2000px';
                        
                        // Force repaint to ensure visibility
                        void description.offsetWidth;
                        
                        // Scroll the drawer into view for better UX
                        drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }, 100); // 100ms delay before showing
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