const mysql = require('mysql2/promise');
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  'Content-Type': 'application/json'
};

// Environment variables
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT || 3306;

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
  _id: "default-config",
  timestamp: new Date().toISOString()
};

// Database connection
let connection = null;

const initializeDatabase = async () => {
  try {
    console.log(`Connecting to database ${DB_NAME} at ${DB_HOST}:${DB_PORT} as ${DB_USER}`);
    
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: parseInt(DB_PORT)
    });
    
    return connection;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Get site configuration from database
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

// Save site configuration to database
const saveSiteConfig = async (config) => {
  try {
    if (!connection) {
      await initializeDatabase();
    }
    
    const { 
      site_title, 
      site_subtitle, 
      site_description, 
      logo_url, 
      banner_url, 
      contact_email 
    } = config;
    
    const [result] = await connection.query(
      'INSERT INTO site_config (site_title, site_subtitle, site_description, logo_url, banner_url, contact_email) VALUES (?, ?, ?, ?, ?, ?)',
      [site_title, site_subtitle, site_description, logo_url, banner_url, contact_email]
    );
    
    return { success: true, id: result.insertId };
  } catch (error) {
    console.error('Error saving site config:', error);
    throw error;
  }
};

// Lambda handler
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // Check if it's a GET request for site configuration
    if (event.httpMethod === 'GET' && 
        event.queryStringParameters && 
        event.queryStringParameters.type === 'site_config') {
      
      try {
        const config = await getSiteConfig();
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(config)
        };
      } catch (dbError) {
        console.error('Database error when getting site config:', dbError);
        // Return the default config on database error
        return {
          statusCode: 200, // Return 200 with fallback data instead of error
          headers,
          body: JSON.stringify({
            ...defaultSiteConfig,
            _fallback: true, // Indicate this is fallback data
            _error: dbError.message
          })
        };
      }
    }
    
    // Check if it's a POST request to save site configuration
    if (event.httpMethod === 'POST' && 
        event.queryStringParameters && 
        event.queryStringParameters.type === 'site_config') {
      
      const body = JSON.parse(event.body || '{}');
      
      try {
        const result = await saveSiteConfig(body);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result)
        };
      } catch (dbError) {
        console.error('Database error when saving site config:', dbError);
        // Return a specific error for saving
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Database error',
            message: 'Could not save configuration to database',
            details: dbError.message,
            fallbackAvailable: true // Indicate that GET requests will still work with fallback
          })
        };
      }
    }
    
    // Default response for unknown routes
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not Found' })
    };
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Check if it's a site_config request and return fallback data
    if (event.queryStringParameters?.type === 'site_config' && event.httpMethod === 'GET') {
      return {
        statusCode: 200, // Return 200 with fallback data
        headers,
        body: JSON.stringify({
          ...defaultSiteConfig,
          _fallback: true,
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