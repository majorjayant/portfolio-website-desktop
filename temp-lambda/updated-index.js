const mysql = require('mysql2/promise');
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  'Content-Type': 'application/json'
};

// Updated Environment variables with new password and region
const DB_HOST = process.env.DB_HOST; // This should be the RDS endpoint in AWS console
const DB_USER = process.env.DB_USER || 'majorjayant';
const DB_PASSWORD = process.env.DB_PASSWORD || 'komalduhlani'; // Updated password
const DB_NAME = process.env.DB_NAME || 'website';
const DB_PORT = process.env.DB_PORT || 3306;
const AWS_REGION = 'eu-north-1'; // Updated region

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

// Database connection with proper timeout
let connection = null;

const initializeDatabase = async () => {
  try {
    console.log(`Connecting to database ${DB_NAME} at ${DB_HOST}:${DB_PORT} as ${DB_USER} in region ${AWS_REGION}`);
    
    // Add connection timeout and retry logic
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: parseInt(DB_PORT),
      connectTimeout: 5000  // 5 second timeout
    });
    
    console.log('Successfully connected to database');
    return connection;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Get site configuration with fallback
const getSiteConfig = async () => {
  try {
    if (!connection) {
      await initializeDatabase();
    }
    
    console.log('Querying database for site configuration');
    const [rows] = await connection.query('SELECT * FROM site_config ORDER BY id DESC LIMIT 1');
    
    if (rows.length === 0) {
      console.log('No site configuration found in database, using default');
      return defaultSiteConfig;
    }
    
    console.log('Retrieved site configuration from database');
    return rows[0];
  } catch (error) {
    console.error('Error getting site config:', error);
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
    
    console.log('Saving site configuration to database');
    const [result] = await connection.query(
      'INSERT INTO site_config (site_title, site_subtitle, site_description, logo_url, banner_url, contact_email) VALUES (?, ?, ?, ?, ?, ?)',
      [site_title, site_subtitle, site_description, logo_url, banner_url, contact_email]
    );
    
    console.log('Site configuration saved to database');
    return { success: true, id: result.insertId };
  } catch (error) {
    console.error('Error saving site config:', error);
    throw error;
  }
};

// Lambda handler with race condition to prevent timeouts
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // For GET site_config requests, use race pattern
    if (event.httpMethod === 'GET' && 
        event.queryStringParameters && 
        event.queryStringParameters.type === 'site_config') {
      
      // Create a promise that resolves with default data after 3 seconds
      const timeoutPromise = new Promise(resolve => {
        setTimeout(() => {
          console.log('Database connection timed out, using fallback data');
          resolve({
            statusCode: 200,
            headers,
            body: JSON.stringify({
              ...defaultSiteConfig,
              _fallback: true,
              _error: "Database connection timed out"
            })
          });
        }, 3000); // 3 second timeout for faster response
      });
      
      // Create the actual database query promise
      const dbQueryPromise = (async () => {
        try {
          const config = await getSiteConfig();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(config)
          };
        } catch (dbError) {
          console.error('Database query error:', dbError);
          return {
            statusCode: 200, // Still return 200 but with fallback data
            headers,
            body: JSON.stringify({
              ...defaultSiteConfig,
              _fallback: true,
              _error: dbError.message
            })
          };
        }
      })();
      
      // Return whichever promise resolves first
      return Promise.race([timeoutPromise, dbQueryPromise]);
    }
    
    // Handle POST requests
    if (event.httpMethod === 'POST' && 
        event.queryStringParameters && 
        event.queryStringParameters.type === 'site_config') {
        
      try {
        const body = JSON.parse(event.body || '{}');
        const result = await saveSiteConfig(body);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result)
        };
      } catch (dbError) {
        console.error('Error saving site config:', dbError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Database error',
            message: 'Could not save configuration to database',
            details: dbError.message
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
    
    // For site_config requests, return fallback
    if (event.queryStringParameters?.type === 'site_config' && event.httpMethod === 'GET') {
      return {
        statusCode: 200,
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