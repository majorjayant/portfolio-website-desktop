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

    // Load work experience, education, and certifications data
    fetchWorkExperienceData();
    fetchEducationData();
    fetchCertificationsData();

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
    console.log('Attempting to load site config from local JSON');
    
    // Use relative path instead of absolute path
    fetch('data/site_config.json')
        .then(response => response.json())
        .then(data => {
            console.log('Successfully loaded site config from local JSON');
            // Extract site_config from the data object since updatePageWithConfig expects
            // an object with a site_config property
            if (data.site_configs) {
                // Create the expected structure for updatePageWithConfig
                const configData = {
                    site_config: data.site_configs,
                    work_experience: data.work_experience
                };
                updatePageWithConfig(configData);
            } else {
                console.error('site_configs property not found in the loaded JSON');
                // Try to create a compatible object anyway
                const configData = {
                    site_config: data
                };
                updatePageWithConfig(configData);
            }
        })
        .catch(error => {
            console.error('Error loading site config from local JSON:', error);
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

// Define the star colors that will be used for the background effect
const starColors = ["#0A4247", "#8C2F0D", "#F2A057", "#F2C185", "#8CB7B8"];
const shootingStarColors = ["#F2C185", "#8CB7B8"];

// Update education section with 3D carousel cards
function updateEducationSection(educationData) {
    console.log("Updating education section with 3D carousel cards:", educationData);
    
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
        const dateA = a.from_date || '';
        const dateB = b.from_date || '';
        return new Date(dateB) - new Date(dateA);
    });
    
    // Define the brown color theme
    const cardColors = [
        '#6c584c', // Dark brown
        '#a38566', // Medium brown
        '#d1b38a', // Light brown
        '#e9dac1'  // Beige
    ];
    
    // Create carousel container
    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'education-carousel';
    
    // Create carousel track
    const carouselTrack = document.createElement('div');
    carouselTrack.className = 'education-carousel-track';
    
    // Create education cards
    educationData.forEach((education, index) => {
        // Format dates
        const fromDate = education.from_date ? new Date(education.from_date) : null;
        const toDate = education.to_date ? new Date(education.to_date) : null;
        const isCurrent = education.is_current || !toDate;
        
        const fromDateStr = fromDate ? `${getMonthName(fromDate.getMonth())} ${fromDate.getFullYear()}` : '';
        const toDateStr = isCurrent ? 'Present' : toDate ? `${getMonthName(toDate.getMonth())} ${toDate.getFullYear()}` : '';
        const dateString = `${fromDateStr} — ${toDateStr}`;
        
        // Determine if this is a dark card (first two colors are darker)
        const colorIndex = index % cardColors.length;
        const isDarkCard = colorIndex <= 1;
        
        // Create card container
        const card = document.createElement('div');
        card.className = `education-card color-${colorIndex + 1}`;
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', `${index * 100}`);
        card.setAttribute('data-aos-duration', '800');
        
        // Add star background container
        const starsContainer = document.createElement('div');
        starsContainer.className = 'education-card-stars-container';
        
        // Create SVG for stars
        const starsSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        starsSvg.setAttribute('class', 'education-card-stars');
        starsSvg.setAttribute('viewBox', '0 0 100 100');
        starsSvg.setAttribute('preserveAspectRatio', 'none');
        
        // Add static stars to SVG
        const numStars = 12 + Math.floor(Math.random() * 8); // 12-20 stars
        for (let i = 0; i < numStars; i++) {
            const starGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const starColor = starColors[Math.floor(Math.random() * starColors.length)];
            
            // Create circle for star
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const radius = Math.random() * 1.5 + 0.5;
            
            circle.setAttribute('class', 'star');
            circle.setAttribute('cx', `${x}%`);
            circle.setAttribute('cy', `${y}%`);
            circle.setAttribute('r', radius);
            circle.setAttribute('fill', starColor);
            
            // Add random animations to stars
            const animationType = Math.random();
            if (animationType < 0.25) {
                circle.classList.add('pulsate');
            } else if (animationType < 0.45) {
                circle.classList.add('rotate');
            } else if (animationType < 0.6) {
                circle.classList.add('sparkle');
            }
            
            // Add delay to animation
            circle.style.animationDelay = `${Math.random() * 4}s`;
            
            starGroup.appendChild(circle);
            
            // Add duplicate stars with offset for more density
            if (Math.random() > 0.5) {
                const twinCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                
                // Apply random animation type for twin circle
                const twinAnimationType = Math.random();
                twinCircle.setAttribute('class', 'star');
                if (twinAnimationType < 0.3) {
                    twinCircle.classList.add('pulsate');
                } else if (twinAnimationType < 0.5) {
                    twinCircle.classList.add('rotate');
                } else if (twinAnimationType < 0.7) {
                    twinCircle.classList.add('sparkle');
                }
                
                twinCircle.setAttribute('cx', `${(x + 30) % 100}%`);
                twinCircle.setAttribute('cy', `${(y + 30) % 100}%`);
                twinCircle.setAttribute('r', radius * 0.8);
                twinCircle.setAttribute('fill', starColor);
                twinCircle.style.animationDelay = `${Math.random() * 4 + 2}s`;
                starGroup.appendChild(twinCircle);
            }
            
            starsSvg.appendChild(starGroup);
        }
        
        // Add shooting star path
        const shootingStarGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        shootingStarGroup.setAttribute('class', 'star');
        
        const shootingStarPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const arcOffset = Math.random() * 40 - 20;
        shootingStarPath.setAttribute('class', 'shootingStar');
        shootingStarPath.setAttribute('d', `M 10 10 q ${80 + arcOffset} ${80 - arcOffset} 80 80`);
        shootingStarPath.setAttribute('stroke', shootingStarColors[Math.floor(Math.random() * shootingStarColors.length)]);
        shootingStarPath.setAttribute('fill', 'transparent');
        shootingStarPath.setAttribute('stroke-dasharray', '227.62');
        shootingStarPath.setAttribute('stroke-dashoffset', '227.62');
        shootingStarPath.setAttribute('stroke-width', '2');
        shootingStarPath.setAttribute('stroke-linecap', 'round');
        
        shootingStarGroup.appendChild(shootingStarPath);
        starsSvg.appendChild(shootingStarGroup);
        
        starsContainer.appendChild(starsSvg);
        card.appendChild(starsContainer);
        
        // Add content to card
        const cardContent = document.createElement('div');
        cardContent.className = 'education-card-content';
        
        // Create date element
        const dateElement = document.createElement('div');
        dateElement.className = 'education-card-date';
        dateElement.textContent = dateString;
        
        // Create degree title
        const degreeTitle = document.createElement('h3');
        degreeTitle.className = 'education-card-title';
        degreeTitle.textContent = education.edu_title || '';
        
        // Create institution
        const institution = document.createElement('p');
        institution.className = 'education-card-institution';
        institution.textContent = education.edu_name || '';
        
        // Create location if available
        const location = document.createElement('p');
        location.className = 'education-card-location';
        location.textContent = education.location || '';
        
        // Create underline
        const underline = document.createElement('div');
        underline.className = 'education-card-underline';
        
        // Assemble card content
        cardContent.appendChild(dateElement);
        cardContent.appendChild(degreeTitle);
        cardContent.appendChild(institution);
        cardContent.appendChild(location);
        cardContent.appendChild(underline);
        card.appendChild(cardContent);
        
        // Add 3D tilt effect on mousemove
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate relative position inside card (0 to 1)
            const relativeX = x / rect.width;
            const relativeY = y / rect.height;
            
            // Calculate rotation values (max 15deg on X-axis, max 10deg on Y-axis)
            const rotateX = 10 - (relativeY * 20); // Top: positive, Bottom: negative
            const rotateY = (relativeX * 20) - 10; // Left: negative, Right: positive
            
            // Apply rotation in 3D space
            this.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            this.style.zIndex = '10';
            this.style.boxShadow = `0 15px 30px rgba(0,0,0,0.2)`;
            
            // Animate stars - make them more visible on hover
            const starsContainer = this.querySelector('.education-card-stars-container');
            if (starsContainer) {
                starsContainer.style.opacity = '0.7';
            }
            
            // Animate shooting star on hover with random delay
            if (Math.random() > 0.7) {
                const shootingStar = this.querySelector('.shootingStar');
                if (shootingStar) {
                    shootingStar.style.animation = 'none';
                    shootingStar.offsetHeight; // Trigger reflow
                    shootingStar.style.animation = 'shoot 0.6s ease-out forwards';
                }
            }
            
            // Animate underline
            const underline = this.querySelector('.education-card-underline');
            if (underline) {
                underline.style.width = '120px';
                underline.style.transition = 'width 0.3s ease';
            }
        });
        
        // Reset on mouseout
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            this.style.zIndex = '1';
            this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            
            // Reset stars opacity
            const starsContainer = this.querySelector('.education-card-stars-container');
            if (starsContainer) {
                starsContainer.style.opacity = '0.4';
            }
            
            // Reset underline
            const underline = this.querySelector('.education-card-underline');
            if (underline) {
                underline.style.width = '40px';
            }
        });
        
        // Add to carousel track
        carouselTrack.appendChild(card);
    });
    
    // Add carousel navigation
    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-nav carousel-prev';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    
    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-nav carousel-next';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    
    // Add the carousel components to the container
    carouselContainer.appendChild(prevButton);
    carouselContainer.appendChild(carouselTrack);
    carouselContainer.appendChild(nextButton);
    
    // Add the carousel to the education container
    educationContainer.appendChild(carouselContainer);
    
    // Initialize the carousel functionality
    initEducationCarousel();
    
    console.log('Education carousel created successfully');
}

// Function to initialize the education carousel
function initEducationCarousel() {
    const track = document.querySelector('.education-carousel-track');
    const cards = Array.from(document.querySelectorAll('.education-card'));
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    
    if (!track || !cards.length || !prevButton || !nextButton) {
        console.error('Education carousel elements not found');
        return;
    }
    
    let currentIndex = 0;
    const cardWidth = cards[0].offsetWidth + 24; // Add gap
    
    // Determine number of cards visible based on screen width
    function calculateCardsPerView() {
        const trackWidth = track.parentNode.offsetWidth - 100; // Subtract nav button space
        return Math.max(1, Math.min(Math.floor(trackWidth / cardWidth), 3)); // Clamp between 1-3
    }
    
    let cardsPerView = calculateCardsPerView();
    
    // Initial positioning
    positionCards();
    
    // Update card positions on window resize
    window.addEventListener('resize', () => {
        cardsPerView = calculateCardsPerView();
        positionCards();
    });
    
    // Add click event listeners to navigation buttons
    nextButton.addEventListener('click', () => {
        if (currentIndex < cards.length - cardsPerView) {
            currentIndex++;
            positionCards();
        }
    });
    
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            positionCards();
        }
    });
    
    // Function to position cards
    function positionCards() {
        const offset = -currentIndex * cardWidth;
        track.style.transform = `translateX(${offset}px)`;
        
        // Update button states (disabled when at start/end)
        prevButton.disabled = currentIndex === 0;
        prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
        
        nextButton.disabled = currentIndex >= cards.length - cardsPerView;
        nextButton.style.opacity = currentIndex >= cards.length - cardsPerView ? '0.5' : '1';
    }
    
    // Enable touch swipe for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum pixels to be considered a swipe
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left, go to next
            if (currentIndex < cards.length - cardsPerView) {
                currentIndex++;
                positionCards();
            }
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right, go to previous
            if (currentIndex > 0) {
                currentIndex--;
                positionCards();
            }
        }
    }
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
            const localResponse = await fetch('/data/education.json');
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

// Helper function to format date (e.g., Jan 2023)
function formatCertDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-US', options);
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return dateString; // Fallback to original string
    }
}

// Helper function to generate a simple logo based on issuer name
function getLogoFromName(issuerName) {
    if (!issuerName) return '?';
    const words = issuerName.split(' ');
    if (words.length > 1) {
        return (words[0][0] + words[1][0]).toUpperCase();
    } else {
        return issuerName.substring(0, 2).toUpperCase();
    }
}

// Updated function to create certification cards with enhanced 3D effects
function updateCertificationsSection(certificationsData) {
    console.log("Updating certifications section with enhanced 3D cards:");
    
    const gridContainer = document.querySelector('.certifications-grid');
    
    if (!gridContainer) {
        console.error('Certifications grid container not found');
        return;
    }
    
    gridContainer.innerHTML = ''; // Clear previous content
    
    if (!certificationsData || certificationsData.length === 0) {
        gridContainer.innerHTML = '<p class="loading-message">No certification data available.</p>';
        return;
    }
    
    const colors = ["color-1", "color-2", "color-3", "color-4"];
    
    certificationsData.sort((a, b) => {
        const dateA = a.issued_date ? new Date(a.issued_date) : new Date(0);
        const dateB = b.issued_date ? new Date(b.issued_date) : new Date(0);
        return dateB - dateA;
    });
    
    certificationsData.forEach((cert, index) => {
        const card = document.createElement('div');
        const colorClass = colors[index % colors.length];
        card.className = `cert-card ${colorClass}`;
        
        // Add enhanced animations and 3D effects with AOS
        card.setAttribute('data-aos', 'fade-up'); 
        card.setAttribute('data-aos-delay', `${(index % 3) * 100}`);
        card.setAttribute('data-aos-duration', '800');
        card.setAttribute('data-aos-easing', 'ease-out-cubic');
        
        // Add 3D tilt effect with mouse movement
        card.addEventListener('mousemove', (e) => {
            const cardRect = card.getBoundingClientRect();
            const centerX = cardRect.left + cardRect.width / 2;
            const centerY = cardRect.top + cardRect.height / 2;
            const posX = e.clientX - centerX;
            const posY = e.clientY - centerY;
            
            // Calculate tilt angle based on mouse position (max 10 degrees)
            const tiltX = (posY / cardRect.height) * 10;
            const tiltY = -(posX / cardRect.width) * 10;
            
            // Apply the 3D transformation
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.03, 1.03, 1.03)`;
            
            // Add dynamic shadow based on tilt
            card.style.boxShadow = `
                ${-tiltY/3}px ${tiltX/3}px 20px rgba(0,0,0,0.2),
                0 10px 20px rgba(0,0,0,0.15)
            `;
            
            // Show lighting effect based on mouse position
            const glare = card.querySelector('.card-glare');
            if (glare) {
                const glareX = (posX / cardRect.width) * 100 + 50;
                const glareY = (posY / cardRect.height) * 100 + 50;
                glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 80%)`;
                glare.style.opacity = '1';
            }
        });
        
        // Reset card on mouse leave
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            
            const glare = card.querySelector('.card-glare');
            if (glare) {
                glare.style.opacity = '0';
            }
        });

        // Simple skill extraction
        let skills = [];
        if (cert.description) {
            const commonSkills = [
                'AWS', 'Azure', 'GCP', 'Cloud', 'Scrum', 'Agile', 'Kubernetes', 
                'Docker', 'Security', 'Networking', 'Java', 'Python', 'JavaScript',
                'React', 'Node.js', 'MongoDB', 'SQL', 'Architecture', 'Leadership',
                'Management', 'Planning', 'Development', 'Testing', 'DevOps',
                'Orchestration', 'Database', 'Modeling', 'Analytics', 'Visualization'
            ];
            commonSkills.forEach(skill => {
                if (new RegExp(`\\b${skill}\\b`, 'i').test(cert.description)) {
                    skills.push(skill);
                }
            });
            if (skills.length === 0) {
                skills = cert.description.split(/[\n,;•\-]/)
                    .map(s => s.trim())
                    .filter(s => s.length > 2 && s.length < 25)
                    .slice(0, 5);
            }
        }
        skills = skills.slice(0, 5); 

        const formattedDate = formatCertDate(cert.issued_date);
        const logoText = getLogoFromName(cert.issuer_name);
        
        // Prepare View Certificate link HTML (if exists)
        const viewCertLinkHTML = cert.credential_link 
            ? `<a href="${cert.credential_link}" target="_blank" rel="noopener noreferrer" class="cert-view-link" onclick="event.stopPropagation();">
                   <i class="fas fa-external-link-alt"></i>
               </a>` 
            : '';

        card.innerHTML = `
            <div class="mandala-background"></div>
            <div class="card-glare"></div>
            <div class="cert-card-top">
                <div class="cert-logo">${logoText}</div>
                <div class="cert-date">
                    <i class="fas fa-calendar-alt"></i>&nbsp;${formattedDate}
                </div>
                ${viewCertLinkHTML}
            </div>
            <div class="cert-card-content">
                <h3 class="cert-title">${cert.certification_name}</h3>
                <p class="cert-issuer">${cert.issuer_name}</p>
                ${cert.credential_id ? `<p class="cert-id">ID: ${cert.credential_id}</p>` : ''}
                <div class="cert-skills">
                    ${skills.map(skill => `<span>${skill}</span>`).join('')}
                </div>
            </div>
            <div class="card-gradient-overlay"></div>
        `;
        
        gridContainer.appendChild(card);
    });
    
    // Re-initialize AOS after adding new elements
    if (window.AOS) {
        AOS.refresh();
    }
}

// Fetch certifications data
async function fetchCertificationsData() {
    console.log('Fetching certifications data');
    
    try {
        // Try to fetch from API first
        const apiEndpoint = 'https://zelbc2vwg2.execute-api.eu-north-1.amazonaws.com/Staging/website-portfolio?type=certifications';
        
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
        console.log('Successfully loaded certifications data from API:', data);
        
        // Update the certifications section with the fetched data
        const certificationsData = data.certifications || [];
        updateCertificationsSection(certificationsData);
    } catch (error) {
        console.error('Error fetching certifications data from API:', error);
        console.log('Falling back to local JSON file');
        
        // Fallback to local JSON
        try {
            const localResponse = await fetch('data/certifications.json');
            const localData = await localResponse.json();
            console.log('Successfully loaded certifications data from local JSON:', localData);
            
            // Map the local data fields to match what updateCertificationsSection expects
            const mappedData = localData.map(cert => ({
                certification_name: cert.title,
                issuer_name: cert.issuer,
                issued_date: cert.issue_date,
                credential_id: cert.id?.toString() || '',
                credential_link: cert.certificate_url !== '#' ? cert.certificate_url : '',
                description: cert.description || ''
            }));
            
            updateCertificationsSection(mappedData);
        } catch (localError) {
            console.error('Error loading from local JSON:', localError);
            // Show empty state
            updateCertificationsSection([]);
        }
    }
}