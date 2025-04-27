/**
 * Skills Section JavaScript
 * Handles loading, displaying, and animating the skills data
 */

// Initialize skills section when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load skills data from API or local JSON
    loadSkillsData();
    
    // Set up intersection observer for animations
    setupAnimations();
    
    // Set up toolkit tabs
    setupToolkitTabs();
});

/**
 * Load skills data from API or fallback to local JSON
 */
function loadSkillsData() {
    const apiEndpoint = 'https://zelbc2vwg2.execute-api.eu-north-1.amazonaws.com/Staging/website-portfolio?type=site_config';
    
    // Try to get data from the main API endpoint
    fetch(apiEndpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.skills) {
                console.log('Successfully loaded skills data from main API');
                // Process and display the skills data
                updateSkillsSection(data.skills);
            } else {
                // If no skills data in the response, try to fetch from dedicated endpoint
                console.log('No skills data in main API response, trying dedicated skills endpoint');
                return fetch('/api/get_skills');
            }
        })
        .then(response => {
            if (response && !response.ok) {
                throw new Error(`Dedicated skills API request failed with status ${response.status}`);
            }
            return response?.json();
        })
        .then(skillsData => {
            if (skillsData) {
                console.log('Successfully loaded skills data from dedicated API');
                // Process and display the skills data
                updateSkillsSection(skillsData);
            }
        })
        .catch(error => {
            console.error('Error loading skills data from API:', error);
            
            // Fallback to local JSON
            fetch('/data/skills.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Local JSON request failed with status ${response.status}`);
                    }
                    return response.json();
                })
                .then(localData => {
                    console.log('Successfully loaded skills data from local JSON');
                    updateSkillsSection(localData);
                })
                .catch(err => {
                    console.error('Error loading skills from local JSON:', err);
                    // Show empty state or error message
                    showEmptyState();
                });
        });
}

/**
 * Update the skills section with the provided data
 * @param {Object} skillsData - The skills data object
 */
function updateSkillsSection(skillsData) {
    // Update each section if data is available
    if (skillsData.key_metrics && skillsData.key_metrics.length > 0) {
        updateKeyMetrics(skillsData.key_metrics);
    }
    
    if (skillsData.skills_proficiency && skillsData.skills_proficiency.length > 0) {
        updateSkillsProficiency(skillsData.skills_proficiency);
    }
    
    if (skillsData.areas_of_expertise && skillsData.areas_of_expertise.length > 0) {
        updateAreasOfExpertise(skillsData.areas_of_expertise);
    }
    
    if (skillsData.toolkit_categories && skillsData.toolkit_categories.length > 0 && 
        skillsData.toolkit_items && skillsData.toolkit_items.length > 0) {
        updateToolkit(skillsData.toolkit_categories, skillsData.toolkit_items);
    }
    
    if (skillsData.domain_experience && skillsData.domain_experience.length > 0) {
        updateDomainExperience(skillsData.domain_experience);
    }
    
    // Initialize animations after content is loaded
    setTimeout(() => {
        triggerAnimations();
    }, 200);
}

/**
 * Update Key Metrics section
 * @param {Array} keyMetrics - Array of key metric objects
 */
function updateKeyMetrics(keyMetrics) {
    const container = document.querySelector('.key-metrics-grid');
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // Sort by display order
    keyMetrics.sort((a, b) => a.display_order - b.display_order);
    
    // Add each key metric
    keyMetrics.forEach((metric, index) => {
        const metricCard = document.createElement('div');
        metricCard.className = 'key-metric-card animate-on-scroll';
        
        // Create a formatter for numbers if metric value is numeric
        let formattedValue = metric.metric_value;
        if (!isNaN(parseFloat(metric.metric_value)) && isFinite(metric.metric_value)) {
            // Apply number formatting for numeric values
            const numValue = parseFloat(metric.metric_value);
            formattedValue = numValue >= 1000 ? 
                numValue.toLocaleString() : 
                metric.metric_value;
        }
        
        metricCard.innerHTML = `
            <div class="key-metric-value">${formattedValue}</div>
            <div class="key-metric-name">${metric.metric_name}</div>
        `;
        container.appendChild(metricCard);
        
        // Stagger the animation trigger
        setTimeout(() => {
            metricCard.classList.add('visible');
        }, 100 + (index * 150)); // Increasing delay for each card
    });
    
    // Ensure our observer is set up
    setupAnimations();
}

/**
 * Update Skills Proficiency section
 * @param {Array} skillsProficiency - Array of skill proficiency objects
 */
function updateSkillsProficiency(skillsProficiency) {
    const container = document.querySelector('.skills-proficiency-grid');
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // Sort by display order
    skillsProficiency.sort((a, b) => a.display_order - b.display_order);
    
    // Add each skill proficiency item
    skillsProficiency.forEach(skill => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-proficiency-item animate-on-scroll';
        skillItem.innerHTML = `
            <div class="skill-proficiency-header">
                <div class="skill-name">${skill.skill_name}</div>
                <div class="skill-percentage">${skill.proficiency_level}%</div>
            </div>
            <div class="skill-progress-bar">
                <div class="skill-progress" style="width: 0%"></div>
            </div>
        `;
        container.appendChild(skillItem);
        
        // Animate the progress bar after a short delay
        setTimeout(() => {
            const progressBar = skillItem.querySelector('.skill-progress');
            progressBar.style.width = `${skill.proficiency_level}%`;
        }, 300);
    });
}

/**
 * Update Areas of Expertise section
 * @param {Array} areasOfExpertise - Array of expertise objects
 */
function updateAreasOfExpertise(areasOfExpertise) {
    const container = document.querySelector('.expertise-container');
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // Group items by category
    const categorizedExpertise = {};
    areasOfExpertise.forEach(expertise => {
        if (!categorizedExpertise[expertise.expertise_category]) {
            categorizedExpertise[expertise.expertise_category] = {
                items: [],
                display_order: expertise.category_display_order
            };
        }
        categorizedExpertise[expertise.expertise_category].items.push(expertise);
    });
    
    // Sort categories by display order
    const sortedCategories = Object.keys(categorizedExpertise).sort((a, b) => {
        return categorizedExpertise[a].display_order - categorizedExpertise[b].display_order;
    });
    
    // Add each category and its items
    sortedCategories.forEach(category => {
        const categoryItems = categorizedExpertise[category].items;
        
        // Sort items by display order
        categoryItems.sort((a, b) => a.display_order - b.display_order);
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'expertise-category animate-on-scroll';
        
        // Create category title
        const categoryTitle = document.createElement('h3');
        categoryTitle.className = 'expertise-category-title';
        categoryTitle.textContent = category;
        categoryDiv.appendChild(categoryTitle);
        
        // Create items grid
        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'expertise-items';
        
        // Add each expertise item
        categoryItems.forEach(item => {
            const expertiseItem = document.createElement('div');
            expertiseItem.className = 'expertise-item';
            expertiseItem.textContent = item.expertise_item;
            itemsGrid.appendChild(expertiseItem);
        });
        
        categoryDiv.appendChild(itemsGrid);
        container.appendChild(categoryDiv);
    });
}

/**
 * Update Toolkit section
 * @param {Array} toolkitCategories - Array of toolkit category objects
 * @param {Array} toolkitItems - Array of toolkit item objects
 */
function updateToolkit(toolkitCategories, toolkitItems) {
    const tabsContainer = document.querySelector('.toolkit-tabs');
    const contentsContainer = document.querySelector('.toolkit-contents');
    
    if (!tabsContainer || !contentsContainer) return;
    
    // Clear the containers
    tabsContainer.innerHTML = '';
    contentsContainer.innerHTML = '';
    
    // Sort categories by display order
    toolkitCategories.sort((a, b) => a.display_order - b.display_order);
    
    // Add each category as a tab and its items as content
    toolkitCategories.forEach((category, index) => {
        // Create tab
        const tab = document.createElement('div');
        tab.className = `toolkit-tab ${index === 0 ? 'active' : ''}`;
        tab.setAttribute('data-tab', category.toolkit_category_id);
        tab.textContent = category.toolkit_category_name;
        tabsContainer.appendChild(tab);
        
        // Create content section
        const content = document.createElement('div');
        content.className = `toolkit-content ${index === 0 ? 'active' : ''}`;
        content.setAttribute('data-tab', category.toolkit_category_id);
        
        // Create items grid
        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'toolkit-items';
        
        // Filter items for this category and sort by display order
        const categoryItems = toolkitItems
            .filter(item => item.toolkit_category_id == category.toolkit_category_id)
            .sort((a, b) => a.display_order - b.display_order);
        
        // Add each toolkit item
        categoryItems.forEach(item => {
            const toolkitItem = document.createElement('div');
            toolkitItem.className = 'toolkit-item animate-on-scroll';
            toolkitItem.innerHTML = `
                <div class="toolkit-item-name">${item.toolkit_item_name}</div>
            `;
            itemsGrid.appendChild(toolkitItem);
        });
        
        content.appendChild(itemsGrid);
        contentsContainer.appendChild(content);
    });
}

/**
 * Update Domain Experience section
 * @param {Array} domainExperience - Array of domain experience objects
 */
function updateDomainExperience(domainExperience) {
    const container = document.querySelector('.domain-experience-grid');
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // Sort by display order
    domainExperience.sort((a, b) => a.display_order - b.display_order);
    
    // Add each domain experience item
    domainExperience.forEach(domain => {
        const domainItem = document.createElement('div');
        domainItem.className = 'domain-item animate-on-scroll';
        domainItem.innerHTML = `
            <div class="domain-name">${domain.domain_name}</div>
            <div class="domain-progress-bar">
                <div class="domain-progress" style="width: 0%"></div>
            </div>
            <div class="domain-percentage">${domain.experience_percentage}%</div>
        `;
        container.appendChild(domainItem);
        
        // Animate the progress bar after a short delay
        setTimeout(() => {
            const progressBar = domainItem.querySelector('.domain-progress');
            progressBar.style.width = `${domain.experience_percentage}%`;
        }, 300);
    });
}

/**
 * Show empty state when no skills data is available
 */
function showEmptyState() {
    const sections = [
        '.key-metrics-grid',
        '.skills-proficiency-grid',
        '.expertise-container',
        '.toolkit-contents',
        '.domain-experience-grid'
    ];
    
    sections.forEach(selector => {
        const container = document.querySelector(selector);
        if (container) {
            container.innerHTML = '<div class="empty-state">No data available</div>';
        }
    });
}

/**
 * Set up intersection observer for scroll animations
 */
function setupAnimations() {
    // Check if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px', // Start animations slightly before elements enter viewport
            threshold: 0.15
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // For key metrics, we already handle animation in updateKeyMetrics
                    if (!entry.target.classList.contains('key-metric-card')) {
                        entry.target.classList.add('visible');
                    }
                    
                    // Only unobserve non-key-metric elements or visible key metrics
                    if (!entry.target.classList.contains('key-metric-card') || 
                        entry.target.classList.contains('visible')) {
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, observerOptions);
        
        // Observe all elements with the animate-on-scroll class
        document.querySelectorAll('.animate-on-scroll:not(.key-metric-card.visible)').forEach(el => {
            observer.observe(el);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            el.classList.add('visible');
        });
    }
    
    // Add scroll event listener for subtle parallax effect on key metric cards
    window.addEventListener('scroll', () => {
        const metricsContainer = document.querySelector('.key-metrics-grid');
        if (!metricsContainer) return;
        
        const scrollY = window.scrollY;
        const cards = metricsContainer.querySelectorAll('.key-metric-card');
        
        // Apply subtle parallax effect to visible cards
        cards.forEach((card, index) => {
            if (card.classList.contains('visible')) {
                const offset = scrollY * 0.05 * (index % 3 + 1) * 0.1;
                card.style.transform = `translateY(${offset}px) scale(${1 + offset * 0.001})`;
            }
        });
    }, { passive: true }); // Use passive listener for better performance
}

/**
 * Set up toolkit tabs for switching between categories
 */
function setupToolkitTabs() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('toolkit-tab')) {
            const tabId = e.target.getAttribute('data-tab');
            
            // Update active tab
            document.querySelectorAll('.toolkit-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.toolkit-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelector(`.toolkit-content[data-tab="${tabId}"]`).classList.add('active');
            
            // Trigger animations for newly visible content
            document.querySelectorAll(`.toolkit-content[data-tab="${tabId}"] .animate-on-scroll`).forEach(el => {
                el.classList.add('visible');
            });
        }
    });
}

/**
 * Trigger animations for all visible elements
 */
function triggerAnimations() {
    document.querySelectorAll('.animate-on-scroll').forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('visible');
        }, index * 100); // Stagger the animations
    });
} 