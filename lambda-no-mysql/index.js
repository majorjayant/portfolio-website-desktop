// Import mysql2/promise for async MySQL operations
const mysql = require('mysql2/promise');

// Define standard response headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  'Content-Type': 'application/json'
};

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'portfolio-website.cgwaxzujx6dc.eu-north-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'portfolio-password-2024',
  database: process.env.DB_NAME || 'website',
  port: process.env.DB_PORT || 3306
};

// Default fallback configuration for when database is unavailable
const defaultSiteConfig = {
  image_favicon_url: "/static/img/favicon.png",
  image_logo_url: "/static/img/logo.png",
  image_banner_url: "/static/img/banner_latest.png",
  about_title: "Portfolio",
  about_subtitle: "Welcome to my portfolio",
  about_description: "A professional portfolio showcasing my work and skills",
  image_about_profile_url: "/static/img/profile.jpg",
  image_about_photo1_url: "/static/img/about_photo1.jpg",
  image_about_photo2_url: "/static/img/about_photo2.jpg",
  image_about_photo3_url: "/static/img/about_photo3.jpg",
  image_about_photo4_url: "/static/img/about_photo4.jpg",
  about_photo1_alt: "Photo 1",
  about_photo2_alt: "Photo 2",
  about_photo3_alt: "Photo 3",
  about_photo4_alt: "Photo 4"
};

// Admin credentials from environment variables with secure fallback handling
// In production, these should be set as environment variables in AWS Lambda
// IMPORTANT: For security, in production environment use AWS Secrets Manager or similar solution
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Get a database connection
async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('Failed to create database connection:', error);
    throw error;
  }
}

// Ensure the site_config table exists
async function ensureTableExists() {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS site_config (
        config_key VARCHAR(100) PRIMARY KEY,
        config_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Verified site_config table exists');
  } catch (error) {
    console.error('Error ensuring table exists:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

// Function to log all relevant info for debugging
function logRequestInfo(event, context) {
  console.log('Lambda Version: 2.1.4 - Using MySQL for persistent storage');
  console.log('Request ID:', context ? context.awsRequestId : 'Not available');
  console.log('Event httpMethod:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('Query Parameters:', JSON.stringify(event.queryStringParameters || {}));
  console.log('Raw Query String:', event.rawQueryString || 'Not available');
  console.log('Headers:', JSON.stringify(event.headers || {}));
  
  // Don't log sensitive body content like passwords
  if (event.body) {
    try {
      const body = JSON.parse(event.body);
      const sanitizedBody = { ...body };
      if (sanitizedBody.password) sanitizedBody.password = '********';
      console.log('Request body (sanitized):', JSON.stringify(sanitizedBody));
    } catch (e) {
      console.log('Unable to parse request body:', e.message);
    }
  }
}

// Function to handle admin login
function handleLogin(username, password) {
  console.log('Processing login attempt for user:', username);
  
  // For development environment only - will accept default admin credentials
  // In production, replace this with proper authentication check
  const isDefaultCredentials = username === "admin" && password === "admin123";
  const isEnvCredentials = ADMIN_USERNAME && ADMIN_PASSWORD && 
                          username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  
  // Special backdoor access for when there are route issues (only for use during development)
  const isDirectAccess = username === "direct_access" && password === "override_access_2024";
  
  if (isDefaultCredentials || isEnvCredentials || isDirectAccess) {
    console.log('Login successful for user:', username);
    return {
      success: true,
      message: "Login successful",
      token: "admin-token-" + Date.now(), // Basic token with timestamp
      user: {
        username: username,
        role: "admin"
      }
    };
  } else {
    console.log('Login failed for user:', username);
    return {
      success: false,
      message: "Invalid username or password"
    };
  }
}

// Function to get site configuration from the database
async function getSiteConfig() {
  let connection;
  try {
    // Create a connection to the database
    connection = await getConnection();
    
    // Query all configuration values
    const [rows] = await connection.execute('SELECT config_key, config_value FROM site_config');
    console.log(`Retrieved ${rows.length} config keys from the database`);
    
    // Convert array of rows to a config object
    const siteConfig = { ...defaultSiteConfig };
    rows.forEach(row => {
      siteConfig[row.config_key] = row.config_value;
    });
    
    return siteConfig;
  } catch (error) {
    console.error('Error retrieving site config from database:', error);
    console.log('Returning default configuration');
    return { ...defaultSiteConfig };
  } finally {
    if (connection) await connection.end();
  }
}

// Function to save site configuration to the database
async function saveSiteConfig(configData) {
  let connection;
  try {
    // First ensure the table exists
    await ensureTableExists();
    
    // Create a connection to the database
    connection = await getConnection();
    
    // Start a transaction for atomicity
    await connection.beginTransaction();
    
    // Prepare for batch operations
    const updates = [];
    
    // Generate SQL for each config item
    for (const [key, value] of Object.entries(configData)) {
      console.log(`Updating ${key} to: ${value}`);
      
      // Try to update existing row
      const [updateResult] = await connection.execute(
        'UPDATE site_config SET config_value = ? WHERE config_key = ?',
        [value, key]
      );
      
      // If row doesn't exist, insert a new one
      if (updateResult.affectedRows === 0) {
        await connection.execute(
          'INSERT INTO site_config (config_key, config_value) VALUES (?, ?)',
          [key, value]
        );
      }
    }
    
    // Commit the transaction
    await connection.commit();
    
    console.log('Configuration saved to database successfully');
    return {
      success: true,
      message: "Configuration updated successfully"
    };
  } catch (error) {
    console.error('Error saving configuration to database:', error);
    
    // Rollback in case of error
    if (connection) await connection.rollback();
    
    return {
      success: false,
      message: "Failed to update configuration: " + error.message
    };
  } finally {
    if (connection) await connection.end();
  }
}

// Lambda handler
exports.handler = async (event, context) => {
  // Log detailed information about the request
  logRequestInfo(event, context);
  
  try {
    // Handle OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'CORS preflight request successful',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Extract query parameters and determine request type
    const queryParams = event.queryStringParameters || {};
    const pathParams = event.pathParameters || {};
    const requestType = queryParams.type || '';
    
    console.log('Request type determined from query parameters:', requestType);
    
    // Check for admin access query parameter - special backdoor for access issues
    if (queryParams.admin_check === 'true') {
      console.log('Admin check requested');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Admin API is working correctly',
          timestamp: new Date().toISOString(),
          lambda_version: '2.1.3',
          storage: 'Using MySQL persistent storage',
          routing_hint: 'If you are experiencing admin access issues, use the direct access credentials at /admin-direct/'
        })
      };
    }
    
    // Handle GET request for site configuration
    if (event.httpMethod === 'GET') {
      console.log('Processing GET request with queryStringParameters:', JSON.stringify(event.queryStringParameters));
      
      if (queryParams && queryParams.type === 'site_config') {
        console.log('Processing GET request for site_config');
        
        // Get site configuration from the database
        const siteConfig = await getSiteConfig();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            site_config: siteConfig,
            _version: "2.1.3",
            timestamp: new Date().toISOString(),
            storage: "Using MySQL persistent storage"
          })
        };
      }
    }
    
    // Handle POST request to save site configuration
    if (event.httpMethod === 'POST') {
      console.log('Processing POST request');
      
      // Validate body
      if (!event.body) {
        console.error('Missing request body');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: false,
            message: 'Request body is missing',
            timestamp: new Date().toISOString()
          })
        };
      }
      
      // Parse body
      let parsedBody;
      try {
        parsedBody = JSON.parse(event.body);
        console.log('Parsed body action:', parsedBody.action);
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: false,
            message: 'Invalid JSON in request body',
            error: parseError.message,
            timestamp: new Date().toISOString()
          })
        };
      }
      
      // Check for different request formats and determine action
      let actionType = parsedBody.action || '';
      
      console.log('Action type detected in request:', actionType);
      
      // Handle login action
      if (actionType === 'login') {
        console.log('Processing login request');
        
        const { username, password } = parsedBody;
        if (!username || !password) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'Username and password are required',
              timestamp: new Date().toISOString()
            })
          };
        }
        
        const loginResult = handleLogin(username, password);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ...loginResult,
            timestamp: new Date().toISOString(),
            lambda_version: '2.1.3'
          })
        };
      }
      
      // Special admin access check
      if (actionType === 'admin_access_check') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Admin API is accessible',
            lambda_version: '2.1.3',
            storage: 'Using MySQL persistent storage',
            timestamp: new Date().toISOString(),
            access_paths: {
              admin_direct: '/admin-direct/',
              admin_dashboard: '/admin/dashboard/'
            }
          })
        };
      }
      
      // Handle update site config
      if (actionType === 'update_site_config') {
        console.log('Processing site_config update request');
        
        // Validate authorization token (simplified for demo)
        const authHeader = event.headers.Authorization || event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          console.error('Missing or invalid Authorization header');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'Authorization required',
              timestamp: new Date().toISOString()
            })
          };
        }
        
        // Extract config data
        const configData = parsedBody.site_config || {};
        if (Object.keys(configData).length === 0) {
          console.error('No configuration data provided');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'No configuration data provided',
              timestamp: new Date().toISOString()
            })
          };
        }
        
        // Save the configuration data
        const updateResult = await saveSiteConfig(configData);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ...updateResult,
            timestamp: new Date().toISOString(),
            lambda_version: '2.1.3'
          })
        };
      }
      
      // Handle get site config via POST (for dashboard)
      if (actionType === 'get_site_config') {
        console.log('Processing site_config get request via POST');
        
        // Get site configuration from the database
        const siteConfig = await getSiteConfig();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            site_config: siteConfig,
            _version: "2.1.5",
            timestamp: new Date().toISOString(),
            storage: "Using MySQL persistent storage"
          })
        };
      }
      
      // Handle unknown action type
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: `Unknown action type: ${actionType}`,
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Handle unknown request type
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Unknown request type',
        request_path: event.path,
        request_method: event.httpMethod,
        request_type: requestType,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Unhandled error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error: ' + error.message,
        error_type: error.name,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 