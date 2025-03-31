// Add this code to the top of your Lambda function, after your imports
// but before your handler function

// Default fallback configuration
const defaultSiteConfig = {
  site_title: "Portfolio Website",
  site_subtitle: "Showcase of My Work and Skills",
  site_description: "A personal portfolio showcasing projects, skills, and achievements.",
  logo_url: "/images/logo.png",
  banner_url: "/images/banner.jpg",
  social_links: {
    github: "https://github.com/majorjayant",
    linkedin: "https://linkedin.com/in/majorjayant",
    twitter: "https://twitter.com/majorjayant"
  },
  contact_email: "contact@example.com",
  _fallback: true,
  timestamp: new Date().toISOString()
};

// Replace your getSiteConfig function with this version
const getSiteConfig = async () => {
  try {
    if (!connection) {
      await initializeDatabase();
    }
    
    const [rows] = await connection.query('SELECT * FROM site_config ORDER BY id DESC LIMIT 1');
    
    if (rows.length === 0) {
      return defaultSiteConfig;
    }
    
    return rows[0];
  } catch (error) {
    console.error('Error getting site config:', error);
    // Return the default config if database access fails
    console.log('Returning default site config due to database error');
    return defaultSiteConfig;
  }
};

// Modify your Lambda handler to use this code in the catch block:
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // Your existing code here
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Return fallback data for site_config requests
    if (event.queryStringParameters?.type === 'site_config' && event.httpMethod === 'GET') {
      return {
        statusCode: 200, // Return 200 with fallback data
        headers,
        body: JSON.stringify({
          ...defaultSiteConfig,
          _error: error.message
        })
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
}; 