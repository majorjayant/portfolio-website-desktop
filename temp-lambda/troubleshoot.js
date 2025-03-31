const mysql = require('mysql2/promise');

// Define standard headers for all responses
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  'Content-Type': 'application/json'
};

// Default fallback configuration for when database is unavailable
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

// Environment variables
let DB_HOST = process.env.DB_HOST;
let DB_USER = process.env.DB_USER || 'majorjayant';
let DB_PASSWORD = process.env.DB_PASSWORD || 'komalduhlani';
let DB_NAME = process.env.DB_NAME || 'website';
let DB_PORT = process.env.DB_PORT || 3306;
const AWS_REGION = 'eu-north-1';

// Database connection
let connection = null;

// Function to initialize database connection
const initializeDatabase = async () => {
  try {
    // Log all environment variables for debugging (redact password)
    console.log(`DB_HOST: ${DB_HOST}`);
    console.log(`DB_USER: ${DB_USER}`);
    console.log(`DB_PASSWORD: ********`);
    console.log(`DB_NAME: ${DB_NAME}`);
    console.log(`DB_PORT: ${DB_PORT}`);
    console.log(`AWS_REGION: ${AWS_REGION}`);
    
    // Log connection attempt
    console.log(`Connecting to database ${DB_NAME} at ${DB_HOST}:${DB_PORT} as ${DB_USER} in region ${AWS_REGION}`);
    
    // Create connection with timeout
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

// Function to get site configuration
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
    return {
      ...defaultSiteConfig,
      _error: error.message
    };
  } finally {
    if (connection) {
      try {
        // Close connection to avoid resource leaks
        await connection.end();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
};

// Function to save site configuration
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
    
    console.log('Saving site configuration to database:', JSON.stringify(config, null, 2));
    const [result] = await connection.query(
      'INSERT INTO site_config (site_title, site_subtitle, site_description, logo_url, banner_url, contact_email) VALUES (?, ?, ?, ?, ?, ?)',
      [site_title, site_subtitle, site_description, logo_url, banner_url, contact_email]
    );
    
    console.log('Site configuration saved to database with ID:', result.insertId);
    return { success: true, id: result.insertId };
  } catch (error) {
    console.error('Error saving site config:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        // Close connection to avoid resource leaks
        await connection.end();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
};

// Lambda handler
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Lambda function version: 1.0.1-troubleshooting');
  
  try {
    // Check for API Gateway test
    if (event.source === 'aws.events') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Scheduled event processed successfully' })
      };
    }
    
    // Handle OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'CORS preflight request successful' })
      };
    }
    
    // Handle GET request for site configuration with fallback mechanism
    if (event.httpMethod === 'GET' && 
        event.queryStringParameters && 
        event.queryStringParameters.type === 'site_config') {
      
      console.log('Processing GET request for site_config');
      
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
              _timeout: true,
              _error: "Database connection timed out"
            })
          });
        }, 3000);
      });
      
      // Create the actual database query promise
      const dbQueryPromise = (async () => {
        try {
          console.log('Attempting to get site configuration from database');
          const config = await getSiteConfig();
          console.log('Successfully retrieved configuration');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(config)
          };
        } catch (dbError) {
          console.error('Database query error:', dbError);
          // Return fallback data with 200 status code to prevent 502 errors
          return {
            statusCode: 200,
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
    
    // Handle POST request to save site configuration
    if (event.httpMethod === 'POST' && 
        event.queryStringParameters && 
        event.queryStringParameters.type === 'site_config') {
      
      console.log('Processing POST request for site_config');
      
      try {
        // Validate body exists and is properly formatted
        if (!event.body) {
          console.error('Missing request body');
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              error: 'Bad Request',
              message: 'Request body is missing' 
            })
          };
        }
        
        // Parse body safely
        let body;
        try {
          body = JSON.parse(event.body);
        } catch (parseError) {
          console.error('Error parsing request body:', parseError);
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              error: 'Bad Request',
              message: 'Invalid JSON in request body' 
            })
          };
        }
        
        // Save configuration to database
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
    console.log('Unknown request type or missing parameters');
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        error: 'Not Found',
        message: 'The requested resource was not found' 
      })
    };
    
  } catch (error) {
    console.error('Unhandled error in Lambda function:', error);
    
    // For site_config requests, return fallback data with 200 status code
    if (event.queryStringParameters?.type === 'site_config' && event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...defaultSiteConfig,
          _fallback: true,
          _unhandled_error: true,
          _error: error.message
        })
      };
    }
    
    // For all other unhandled errors, return a 500 with error details
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: error.message
      })
    };
  }
}; 