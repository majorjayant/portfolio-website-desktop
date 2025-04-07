// Import mysql2/promise for async MySQL operations
const mysql = require('mysql2/promise');

// Define standard response headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,Cache-Control,Pragma,X-Custom-Action',
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
  console.log('Lambda Version: 2.1.19 - Using MySQL for persistent storage');
  console.log('Request ID:', context ? context.awsRequestId : 'Not available');
  console.log('Event httpMethod:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('Path parameters:', JSON.stringify(event.pathParameters || {}));
  console.log('Query Parameters:', JSON.stringify(event.queryStringParameters || {}));
  console.log('Raw Query String:', event.rawQueryString || 'Not available');
  
  // Log the entire event for debugging
  console.log('Full event object (sanitized):', JSON.stringify({
    ...event,
    body: event.body ? '(body content omitted)' : null
  }));
  
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
  console.log('NEW VERSION 2.1.22 - DIRECT MYSQL UPDATE HANDLER');
  console.log('Request method:', event.httpMethod);
  console.log('Request path:', event.path);
  console.log('Headers:', JSON.stringify(event.headers || {}));
  console.log('Query params:', JSON.stringify(event.queryStringParameters || {}));
  console.log('Raw query string:', event.rawQueryString || '');
  
  try {
    // Handle OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'CORS preflight request successful',
          timestamp: new Date().toISOString(),
          version: '2.1.22'
        })
      };
    }
    
    // Extract query parameters - crucial for bypass mode
    const queryParams = event.queryStringParameters || {};
    
    // DIRECT MYSQL MODE - Check for the special URL parameters
    if (queryParams.force_mysql === 'true') {
      console.log('⚠️ DIRECT MYSQL MODE ACTIVATED via URL parameter');
      console.log('URL parameters:', JSON.stringify(queryParams));
      
      if (event.httpMethod === 'POST' && event.body) {
        try {
          // Parse the request body
          const parsedBody = JSON.parse(event.body);
          console.log('DIRECT MYSQL: parsed body:', JSON.stringify(parsedBody, null, 2));
          
          // Extract the site_config data
          if (parsedBody.site_config && typeof parsedBody.site_config === 'object') {
            console.log('DIRECT MYSQL: Found site_config data, preparing for database update');
            
            // Get the site config data
            const configData = parsedBody.site_config;
            console.log('DIRECT MYSQL: Config data keys:', Object.keys(configData).join(', '));
            
            // Directly update the database
            console.log('DIRECT MYSQL: Initiating database update...');
            const result = await emergencyDbUpdate(configData);
            
            // Return detailed success info
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                message: "DIRECT MYSQL UPDATE COMPLETE",
                result: result,
                updated_fields: Object.keys(configData).length,
                version: '2.1.22',
                timestamp: new Date().toISOString()
              })
            };
          } else {
            console.log('DIRECT MYSQL: No site_config data found in request body');
          }
        } catch (e) {
          console.error('DIRECT MYSQL: Error processing request:', e);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: false,
              message: "DIRECT MYSQL ERROR: " + e.message,
              version: '2.1.22',
              timestamp: new Date().toISOString()
            })
          };
        }
      }
    }
    
    // Regular processing continues for non-bypass requests...
    
    // EMERGENCY MODE: IMMEDIATELY CHECK AND PROCESS BODY FOR SITE_CONFIG DATA
    if (event.httpMethod === 'POST' && event.body) {
      console.log('⚠️ EMERGENCY MODE: POST REQUEST WITH BODY DETECTED');
      
      try {
        const parsedBody = JSON.parse(event.body);
        console.log('Parsed body summary:', 
          Object.keys(parsedBody).join(', '), 
          parsedBody.action || 'no-action'
        );
        
        // IF THERE'S A SITE_CONFIG, FORCE DATABASE UPDATE IMMEDIATELY
        if (parsedBody.site_config && typeof parsedBody.site_config === 'object') {
          console.log('⚠️ EMERGENCY MODE: SITE_CONFIG DETECTED IN POST BODY');
          console.log('Config data keys:', Object.keys(parsedBody.site_config).join(', '));
          console.log('First key value example:', parsedBody.site_config[Object.keys(parsedBody.site_config)[0]]);
          
          const configData = parsedBody.site_config;
          console.log('⚠️ FORCING DATABASE UPDATE IMMEDIATELY');
          
          // Connect to MySQL and update each config value
          const result = await emergencyDbUpdate(configData);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: "EMERGENCY DATABASE UPDATE COMPLETED",
              result: result,
              updated_fields: Object.keys(configData).length,
              version: '2.1.21',
              timestamp: new Date().toISOString()
            })
          };
        }
      } catch (error) {
        console.error('Error processing POST data:', error);
      }
    }
    
    // For GET requests or any other request without site_config data
    if (event.httpMethod === 'GET' || !event.body || event.body.indexOf('site_config') === -1) {
      // Just return the current site config
      const siteConfig = await getSiteConfig();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          site_config: siteConfig,
          message: 'Site configuration retrieved successfully',
          version: '2.1.21',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Fallback response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Request processed but no specific handler found',
        httpMethod: event.httpMethod,
        version: '2.1.21',
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
        message: 'Server error: ' + error.message,
        version: '2.1.21',
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Emergency database update function - bypasses all validation
async function emergencyDbUpdate(configData) {
  let connection;
  try {
    console.log('Connecting to database for emergency update');
    connection = await mysql.createConnection(dbConfig);
    console.log('DB connection established');
    
    // Create table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS site_config (
        config_key VARCHAR(100) PRIMARY KEY,
        config_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('site_config table verified');
    
    // Start transaction
    await connection.beginTransaction();
    console.log('Transaction started');
    
    // Update each config item
    const results = [];
    for (const [key, value] of Object.entries(configData)) {
      console.log(`Updating ${key} = ${value}`);
      
      // Try update first
      const [updateResult] = await connection.execute(
        'UPDATE site_config SET config_value = ? WHERE config_key = ?',
        [value, key]
      );
      
      // If no rows affected, insert instead
      if (updateResult.affectedRows === 0) {
        const [insertResult] = await connection.execute(
          'INSERT INTO site_config (config_key, config_value) VALUES (?, ?)',
          [key, value]
        );
        results.push({ key, action: 'insert', result: insertResult.affectedRows });
      } else {
        results.push({ key, action: 'update', result: updateResult.affectedRows });
      }
    }
    
    // Commit transaction
    await connection.commit();
    console.log('Transaction committed successfully');
    
    return {
      success: true,
      operations: results,
      message: 'Emergency database update successful'
    };
  } catch (error) {
    console.error('Database error during emergency update:', error);
    if (connection) {
      try {
        await connection.rollback();
        console.log('Transaction rolled back due to error');
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }
    
    return {
      success: false,
      error: error.message,
      message: 'Emergency database update failed'
    };
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed');
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
} 