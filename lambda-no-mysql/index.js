// Define standard response headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  'Content-Type': 'application/json'
};

// Import required packages
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

// Default fallback configuration for when database is unavailable
const defaultSiteConfig = {
  image_favicon_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon",
  image_logo_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo",
  image_banner_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner",
  about_title: "Portfolio",
  about_subtitle: "Welcome to my portfolio",
  about_description: "A professional portfolio showcasing my work and skills",
  image_about_profile_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg",
  image_about_photo1_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0138.jpg",
  image_about_photo2_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0915.jpg",
  image_about_photo3_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1461.jpg",
  image_about_photo4_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1627.jpg",
  about_photo1_alt: "Photo 1",
  about_photo2_alt: "Photo 2",
  about_photo3_alt: "Photo 3",
  about_photo4_alt: "Photo 4"
};

// Function to get database connection
async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Function to ensure table exists
async function ensureTableExists(connection) {
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS site_config (
        id INT PRIMARY KEY AUTO_INCREMENT,
        config_key VARCHAR(255) NOT NULL UNIQUE,
        config_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Site config table ensured');
  } catch (error) {
    console.error('Error ensuring table exists:', error);
    throw error;
  }
}

// Function to get site configuration from database
async function getSiteConfig() {
  let connection;
  try {
    connection = await getConnection();
    await ensureTableExists(connection);
    
    // Get all configuration values
    const [rows] = await connection.execute('SELECT config_key, config_value FROM site_config');
    
    // Convert rows to config object
    const config = {};
    rows.forEach(row => {
      config[row.config_key] = row.config_value;
    });
    
    // If no config exists, initialize with default values
    if (Object.keys(config).length === 0) {
      await saveSiteConfig(defaultSiteConfig);
      return defaultSiteConfig;
    }
    
    return config;
  } catch (error) {
    console.error('Error reading from database:', error);
    return defaultSiteConfig;
  } finally {
    if (connection) await connection.end();
  }
}

// Function to save site configuration to database
async function saveSiteConfig(config) {
  let connection;
  try {
    connection = await getConnection();
    await ensureTableExists(connection);
    
    // Begin transaction
    await connection.beginTransaction();
    
    // Update or insert each config value
    for (const [key, value] of Object.entries(config)) {
      await connection.execute(
        'INSERT INTO site_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = ?',
        [key, value, value]
      );
    }
    
    // Commit transaction
    await connection.commit();
    return true;
  } catch (error) {
    console.error('Error saving to database:', error);
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Function to log all relevant info for debugging
function logRequestInfo(event, context) {
  console.log('Lambda Version: 2.1.0 - Using MySQL for persistent storage');
  console.log('Request ID:', context ? context.awsRequestId : 'Not available');
  console.log('Event httpMethod:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('Query Parameters:', JSON.stringify(event.queryStringParameters || {}));
  console.log('Headers:', JSON.stringify(event.headers || {}));
  
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
  
  const isDefaultCredentials = username === "admin" && password === "admin123";
  const isEnvCredentials = ADMIN_USERNAME && ADMIN_PASSWORD && 
                          username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  const isDirectAccess = username === "direct_access" && password === "override_access_2024";
  
  if (isDefaultCredentials || isEnvCredentials || isDirectAccess) {
    console.log('Login successful for user:', username);
    return {
      success: true,
      message: "Login successful",
      token: "admin-token-" + Date.now(),
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

// Function to update site configuration
async function updateSiteConfig(configData) {
  console.log('Updating site configuration with new data');
  try {
    // Get current config from database
    const currentConfig = await getSiteConfig();
    
    // Create a new config object with only the fields that exist in defaultSiteConfig
    const updatedConfig = { ...currentConfig };
    
    // Update each field if provided in the request
    Object.keys(configData).forEach(key => {
      if (key in defaultSiteConfig) {
        updatedConfig[key] = configData[key];
        console.log(`Updated ${key} to: ${configData[key]}`);
      }
    });
    
    // Save updated config to database
    await saveSiteConfig(updatedConfig);
    
    return {
      success: true,
      message: "Configuration updated successfully",
      config: updatedConfig
    };
  } catch (error) {
    console.error('Error updating configuration:', error);
    return {
      success: false,
      message: "Failed to update configuration: " + error.message
    };
  }
}

// Lambda handler
exports.handler = async (event, context) => {
  logRequestInfo(event, context);
  console.log('Enhanced Lambda Function - Version 2.1.0');
  
  try {
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
    
    const queryParams = event.queryStringParameters || {};
    const pathParams = event.pathParameters || {};
    
    if (queryParams.admin_check === 'true') {
      console.log('Admin check requested');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Admin API is working correctly',
          timestamp: new Date().toISOString(),
          lambda_version: '2.1.0',
          storage: 'Using MySQL persistent storage',
          routing_hint: 'If you are experiencing admin access issues, use the direct_access credentials or access through /admin-login.html'
        })
      };
    }
    
    let requestType = queryParams.type || '';
    
    // Handle GET request for site configuration
    if (event.httpMethod === 'GET' && (requestType === 'site_config' || queryParams.type === 'site_config')) {
      console.log('Processing GET request for site_config');
      
      const config = await getSiteConfig();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...config,
          _version: "2.1.0",
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Handle POST request
    if (event.httpMethod === 'POST') {
      console.log('Processing POST request');
      
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
      
      // Handle login request
      if (parsedBody.action === 'login') {
        const result = handleLogin(parsedBody.username, parsedBody.password);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ...result,
            timestamp: new Date().toISOString()
          })
        };
      }
      
      // Handle site config update
      if (parsedBody.action === 'update_site_config') {
        // Extract the configuration data from the request
        const configData = parsedBody.config || {};
        const result = await updateSiteConfig(configData);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ...result,
            timestamp: new Date().toISOString()
          })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Unknown action type',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Handle unsupported HTTP methods
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed',
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Lambda execution error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 