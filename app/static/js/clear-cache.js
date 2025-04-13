/**
 * Cache clearing and fixing script for Portfolio Website
 * This script ensures the site is properly displayed with all features working
 */

// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Running cache-clearing and display fix script');
    
    // Clear any browser cache for this page
    if ('caches' in window) {
        caches.keys().then(function(cacheNames) {
            cacheNames.forEach(function(cacheName) {
                console.log('Clearing cache:', cacheName);
                caches.delete(cacheName);
            });
        });
    }
    
    // Fix for "Head > staging" text if it exists
    const allElements = document.querySelectorAll('*');
    allElements.forEach(function(element) {
        if (element.textContent && element.textContent.includes('Head > staging')) {
            console.log('Found and fixing "Head > staging" text');
            element.textContent = element.textContent.replace('Head > staging', '');
        }
    });
    
    // Ensure the about section is visible
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
        console.log('Ensuring about section is visible');
        aboutSection.style.opacity = '1';
        aboutSection.style.display = 'block';
        aboutSection.style.visibility = 'visible';
    }
    
    // Ensure image carousel is visible and functioning
    const photoCarousel = document.querySelector('.photo-carousel-container');
    if (photoCarousel) {
        console.log('Ensuring image carousel is visible');
        photoCarousel.style.opacity = '1';
        photoCarousel.style.display = 'block';
        photoCarousel.style.visibility = 'visible';
    }
    
    // Force refresh API data
    if (typeof loadSiteConfig === 'function') {
        console.log('Forcing refresh of site configuration');
        loadSiteConfig();
    }
    
    console.log('Cache-clearing and display fix script completed');
}); 