// API endpoints for fetching data
const API = {
    // Base URL - change this based on environment
    baseUrl: '',
    
    // Helper function to handle API calls
    async fetchData(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}/api/${endpoint}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return null;
        }
    },

    // Get site configuration
    getSiteConfig: async () => API.fetchData('site-config'),

    // Get about section content
    getAbout: async () => API.fetchData('about'),

    // Get projects data
    getProjects: async () => API.fetchData('projects'),

    // Get experience data
    getExperience: async () => API.fetchData('experience'),

    // Get education data
    getEducation: async () => API.fetchData('education'),

    // Get certifications data
    getCertifications: async () => API.fetchData('certifications'),
}; 