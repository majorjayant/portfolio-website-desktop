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
    // This will also load work experience, education, and certification data
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
    console.log("Loading site configuration");
    
    // Try to fetch from API first
    fetch('https://zelbc2vwg2.execute-api.eu-north-1.amazonaws.com/Staging/website-portfolio?type=site_config', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log("Received site config from API:", data);
        
        // Process the retrieved data
        processConfigData(data);
        
        // Update the work experience timeline if data is included
        if (data.work_experience) {
            updateWorkExperienceTimeline(data.work_experience);
        }
        
        // Update the education section if data is included
        if (data.education) {
            updateEducationSection(data.education);
        } else {
            // Fetch education data separately
            fetchEducationData();
        }
        
        // Update the certification section if data is included
        if (data.certification) {
            updateCertificationSection(data.certification);
        } else {
            // Fetch certification data separately
            fetchCertificationData();
        }
    })
    .catch(error => {
        console.error('Error fetching site config:', error);
        
        // Fallback to local JSON file
        console.log("Using local fallback data");
        
        fetch('/data/site_config.json')
            .then(response => response.json())
            .then(data => {
                console.log("Received site config from local JSON:", data);
                processConfigData(data);
                
                // Try to load experience data separately
                fetch('/data/experience.json')
                    .then(response => response.json())
                    .then(expData => {
                        updateWorkExperienceTimeline(expData);
                    })
                    .catch(expError => {
                        console.error('Error loading work experience from local JSON:', expError);
                    });
                
                // Try to load education data separately
                fetch('/static/data/education.json')
                    .then(response => response.json())
                    .then(eduData => {
                        updateEducationSection(eduData);
                    })
                    .catch(eduError => {
                        console.error('Error loading education from local JSON:', eduError);
                    });
                
                // Try to load certification data separately
                fetch('/static/data/certifications.json')
                    .then(response => response.json())
                    .then(certData => {
                        updateCertificationSection(certData);
                    })
                    .catch(certError => {
                        console.error('Error loading certification from local JSON:', certError);
                    });
            })
            .catch(localError => {
                console.error('Error loading from local JSON:', localError);
                showErrorNotification("Failed to load site configuration. Please try again later.");
            });
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
    
    // Load education data if available
    const educationSection = document.querySelector('.education-container');
    if (educationSection && data.education) {
        updateEducationSection(data.education);
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
        
        // Create description content
        const descriptionContent = document.createElement('div');
        descriptionContent.className = 'description-content';
        
        // Create proper HTML for description 
        if (description) {
            // Check if description contains HTML
            if (description.includes('<') && description.includes('>')) {
                // If description already has HTML, use it directly
                descriptionContent.innerHTML = description;
            } else if (description.includes('\n')) {
                // Convert newlines to list items
                const descriptionItems = description.split('\n').filter(item => item.trim() !== '');
                descriptionContent.innerHTML = `
                    <ul>
                        ${descriptionItems.map(item => `<li>${item.trim()}</li>`).join('')}
                    </ul>
                `;
            } else {
                // Set as paragraph if it's just plain text
                descriptionContent.innerHTML = `<p>${description}</p>`;
            }
        } else {
            // If no description, show empty message
            descriptionContent.innerHTML = '<p>No description provided.</p>';
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
        
        // Add click event listener for mobile drawer toggle
        drawer.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Toggle active class for this drawer
            this.classList.toggle('active');
            
            // If this drawer is now active, close all other drawers
            if (this.classList.contains('active')) {
                document.querySelectorAll('.experience-drawer').forEach(otherDrawer => {
                    if (otherDrawer !== this) {
                        otherDrawer.classList.remove('active');
                    }
                });
                
                // Add some visual feedback for mobile
                if (window.innerWidth <= 768) {
                    this.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
                    
                    // Scroll this drawer into view with a small offset
                    const drawerRect = this.getBoundingClientRect();
                    const isPartiallyVisible = (
                        drawerRect.top < window.innerHeight && 
                        drawerRect.bottom >= 0
                    );
                    
                    if (!isPartiallyVisible) {
                        this.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            } else {
                // Reset styles when closed
                if (window.innerWidth <= 768) {
                    this.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                    this.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
                }
            }
        });
        
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

// Update education section
function updateEducationSection(educationData) {
    console.log("Updating education section with data:", educationData);
    
    // Get the education container
    const educationContainer = document.querySelector('.education-container');
    if (!educationContainer) {
        console.error('Education container not found');
        return;
    }
    
    // Clear previous content
    educationContainer.innerHTML = '';
    
    // Check if there is any education data
    if (!educationData || educationData.length === 0) {
        const noEducation = document.createElement('p');
        noEducation.textContent = 'No education data available.';
        noEducation.style.color = '#333';
        noEducation.style.textAlign = 'center';
        educationContainer.appendChild(noEducation);
        return;
    }
    
    // Sort education by date (most recent first)
    educationData.sort((a, b) => {
        const dateA = a.from_date;
        const dateB = b.from_date;
        return new Date(dateB) - new Date(dateA);
    });
    
    // Create an item for each education entry
    educationData.forEach((education) => {
        // Format dates
        const fromDate = new Date(education.from_date);
        const toDate = education.to_date ? new Date(education.to_date) : null;
        const isCurrent = education.is_current;
        
        const dateString = isCurrent 
            ? `${fromDate.getFullYear()} - Present`
            : toDate ? `${fromDate.getFullYear()} - ${toDate.getFullYear()}` : `${fromDate.getFullYear()}`;
        
        // Create education item
        const item = document.createElement('div');
        item.className = 'education-item';
        
        // Create icon
        const icon = document.createElement('div');
        icon.className = 'edu-icon';
        icon.innerHTML = '<i class="fas fa-graduation-cap"></i>';
        
        // Create content
        const content = document.createElement('div');
        content.className = 'edu-content';
        
        // Create title (degree)
        const title = document.createElement('h3');
        title.textContent = education.edu_title;
        
        // Create institution name
        const institution = document.createElement('h4');
        institution.textContent = education.edu_name;
        
        // Create date
        const date = document.createElement('p');
        date.className = 'edu-date';
        date.textContent = dateString;
        
        // Create location if present
        if (education.location) {
            const location = document.createElement('p');
            location.className = 'edu-location';
            location.textContent = education.location;
            content.appendChild(location);
        }
        
        // Assemble the education item
        content.appendChild(title);
        content.appendChild(institution);
        content.appendChild(date);
        
        item.appendChild(icon);
        item.appendChild(content);
        
        // Add to container
        educationContainer.appendChild(item);
    });
}

// Fetch education data
async function fetchEducationData() {
    console.log('Fetching education data');
    
    try {
        // Try to fetch from API first
        const apiEndpoint = 'https://zelbc2vwg2.execute-api.eu-north-1.amazonaws.com/Staging/website-portfolio?type=education';
        
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
        console.log('Successfully loaded education data from API:', data);
        
        // Update the education section with the fetched data
        const educationData = data.education || [];
        updateEducationSection(educationData);
    } catch (error) {
        console.error('Error fetching education data from API:', error);
        console.log('Falling back to local JSON file');
        
        // Fallback to local JSON
        try {
            const localResponse = await fetch('/static/data/education.json');
            const localData = await localResponse.json();
            console.log('Successfully loaded education data from local JSON:', localData);
            updateEducationSection(localData);
        } catch (localError) {
            console.error('Error loading from local JSON:', localError);
            // Show empty state
            updateEducationSection([]);
        }
    }
}

// Function to update the certification section with data
function updateCertificationSection(certificationData) {
    console.log("Updating certification section with data:", certificationData);
    
    // Get the certification container
    const certificationContainer = document.querySelector('.certifications-container');
    if (!certificationContainer) {
        console.error('Certification container not found');
        return;
    }
    
    // Clear previous content
    certificationContainer.innerHTML = '';
    
    // Check if there is any certification data
    if (!certificationData || certificationData.length === 0) {
        const noCertification = document.createElement('p');
        noCertification.textContent = 'No certification data available.';
        noCertification.style.color = '#333';
        noCertification.style.textAlign = 'center';
        certificationContainer.appendChild(noCertification);
        return;
    }
    
    // Sort certifications by date (most recent first)
    certificationData.sort((a, b) => {
        // Handle different field names in local JSON vs API data
        const dateA = a.issued_date || a.issue_date;
        const dateB = b.issued_date || b.issue_date;
        return new Date(dateB) - new Date(dateA);
    });
    
    // Create an item for each certification entry
    certificationData.forEach((certification) => {
        // Format dates - handle different field names in local JSON vs API data
        const issuedDate = new Date(certification.issued_date || certification.issue_date);
        const expiryDate = certification.expiry_date ? new Date(certification.expiry_date) : null;
        
        const issuedDateString = `Issued: ${getMonthName(issuedDate.getMonth()).substring(0, 3)} ${issuedDate.getFullYear()}`;
        const expiryDateString = expiryDate 
            ? `Expires: ${getMonthName(expiryDate.getMonth()).substring(0, 3)} ${expiryDate.getFullYear()}`
            : 'No Expiration';
        
        // Create certification item
        const item = document.createElement('div');
        item.className = 'cert-item';
        
        // Create icon
        const icon = document.createElement('div');
        icon.className = 'cert-icon';
        icon.innerHTML = '<i class="fas fa-certificate"></i>';
        
        // Create content
        const content = document.createElement('div');
        content.className = 'cert-content';
        
        // Create title (certification name) - handle different field names
        const title = document.createElement('h3');
        title.textContent = certification.certification_name || certification.title;
        
        // Create issuer name - handle different field names
        const issuer = document.createElement('h4');
        issuer.textContent = certification.issuer_name || certification.issuer;
        
        // Create dates
        const issuedDateElement = document.createElement('p');
        issuedDateElement.className = 'cert-date';
        issuedDateElement.textContent = issuedDateString;
        
        const expiryDateElement = document.createElement('p');
        expiryDateElement.className = 'cert-expiry';
        expiryDateElement.textContent = expiryDateString;
        
        // Create credential link if available - handle different field names
        if (certification.credential_link || certification.certificate_url) {
            const link = document.createElement('a');
            link.href = certification.credential_link || certification.certificate_url;
            link.target = '_blank';
            link.className = 'cert-link';
            link.textContent = 'View Certificate';
            content.appendChild(link);
        }
        
        // Add credential ID if available
        if (certification.credential_id) {
            const credentialId = document.createElement('p');
            credentialId.className = 'cert-id';
            credentialId.textContent = `Credential ID: ${certification.credential_id}`;
            content.appendChild(credentialId);
        }
        
        // Add description if available
        if (certification.description) {
            const description = document.createElement('p');
            description.className = 'cert-description';
            description.innerHTML = certification.description;
            content.appendChild(description);
        }
        
        // Assemble the certification item
        content.appendChild(title);
        content.appendChild(issuer);
        content.appendChild(issuedDateElement);
        content.appendChild(expiryDateElement);
        
        item.appendChild(icon);
        item.appendChild(content);
        
        // Add to container
        certificationContainer.appendChild(item);
    });
}

// Function to fetch certification data
async function fetchCertificationData() {
    console.log('Fetching certification data');
    
    try {
        // Try to fetch from API first
        const apiEndpoint = 'https://zelbc2vwg2.execute-api.eu-north-1.amazonaws.com/Staging/website-portfolio?type=certification';
        
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
        console.log('Successfully loaded certification data from API:', data);
        
        // Update the certification section with the fetched data
        const certificationData = data.certification || [];
        updateCertificationSection(certificationData);
    } catch (error) {
        console.error('Error fetching certification data from API:', error);
        console.log('Falling back to local JSON file');
        
        // Fallback to local JSON
        try {
            const localResponse = await fetch('/static/data/certifications.json');
            const localData = await localResponse.json();
            console.log('Successfully loaded certification data from local JSON:', localData);
            updateCertificationSection(localData);
        } catch (localError) {
            console.error('Error loading from local JSON:', localError);
            // Show empty state
            updateCertificationSection([]);
        }
    }
}