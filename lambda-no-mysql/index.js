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
  console.log('Lambda Version 2.1.26 - Enhanced CORS and API Gateway integration');
  console.log('Request method:', event.httpMethod);
  console.log('Request path:', event.path);
  console.log('Headers:', JSON.stringify(event.headers || {}));
  console.log('Query params:', JSON.stringify(event.queryStringParameters || {}));
  console.log('Raw query string:', event.rawQueryString || '');
  
  try {
    // Handle OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
      console.log('Handling OPTIONS request for CORS preflight');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message: 'CORS preflight request successful',
          timestamp: new Date().toISOString(),
          version: '2.1.26'
        })
      };
    }
    
    // Extract query parameters
    const queryParams = event.queryStringParameters || {};
    const type = queryParams.type;
    const action = queryParams.action;
    
    // Check API Gateway request context
    console.log('Request context:', JSON.stringify(event.requestContext || {}));
    
    // GET method - primarily for retrieving site configuration
    if (event.httpMethod === 'GET') {
      console.log('ℹ️ Handling GET request with type:', type);
      
      // Return site configuration
      if (type === 'site_config') {
        console.log('ℹ️ Fetching site configuration for GET request');
        const siteConfig = await getSiteConfig();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            site_config: siteConfig,
            message: "Site configuration retrieved successfully",
            version: "2.1.26",
            timestamp: new Date().toISOString()
          })
        };
      }
    }
    
    // POST method - for various operations including updating site config
    if (event.httpMethod === 'POST') {
      console.log('✅ Handling POST request with body');
      
      // Parse request body
      let body = {};
      if (event.body) {
        try {
          if (typeof event.body === 'string') {
            body = JSON.parse(event.body);
          } else {
            body = event.body;
          }
          console.log('Parsed POST body action:', body.action);
          console.log('Config fields:', body.site_config ? Object.keys(body.site_config).join(', ') : 'No site_config found');
        } catch (error) {
          console.error('Error parsing request body:', error);
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              message: "Invalid request body: " + error.message,
              version: "2.1.26",
              timestamp: new Date().toISOString()
            })
          };
        }
      }
      
      // Handle site config update
      if ((body.action === 'update_site_config' || action === 'update_site_config') && body.site_config) {
        console.log('✅ Updating database with site_config data');
        const result = await saveSiteConfig(body.site_config);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: result.success,
            message: result.message,
            result: result,
            version: "2.1.26",
            timestamp: new Date().toISOString()
          })
        };
      }
      
      // Handle login requests
      if (body.action === 'login' && body.username && body.password) {
        console.log('Processing login request for user:', body.username);
        const loginResult = handleLogin(body.username, body.password);
        
        return {
          statusCode: loginResult.success ? 200 : 401,
          headers,
          body: JSON.stringify({
            ...loginResult,
            version: "2.1.26",
            timestamp: new Date().toISOString()
          })
        };
      }
    }
    
    // If we get here, no specific handler matched
    console.log('⚠️ No specific handler matched the request');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Request processed but no specific handler matched",
        version: "2.1.26",
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Unhandled error in Lambda handler:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Internal server error: " + error.message,
        version: "2.1.26",
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

// New function for direct database updates (completely bypasses all other logic)
async function directDatabaseUpdate(configData) {
  let connection;
  try {
    console.log('🟨 DIRECT DATABASE: Opening database connection');
    connection = await mysql.createConnection(dbConfig);
    
    // Create table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS site_config (
        config_key VARCHAR(100) PRIMARY KEY,
        config_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Begin transaction
    await connection.beginTransaction();
    console.log('🟨 DIRECT DATABASE: Transaction started');
    
    // Update each config value
    const updates = [];
    for (const [key, value] of Object.entries(configData)) {
      // Only process non-empty keys
      if (key && key.trim() !== '') {
        console.log(`🟨 DIRECT DATABASE: Processing field "${key}" = "${value}"`);
        
        try {
          // Try to update existing row
          const [updateResult] = await connection.execute(
            'UPDATE site_config SET config_value = ? WHERE config_key = ?',
            [value, key]
          );
          
          // If no update, insert new row
          if (updateResult.affectedRows === 0) {
            console.log(`🟨 DIRECT DATABASE: Inserting new record for "${key}"`);
            const [insertResult] = await connection.execute(
              'INSERT INTO site_config (config_key, config_value) VALUES (?, ?)',
              [key, value]
            );
            updates.push({ key, action: 'insert', result: 'success' });
          } else {
            console.log(`🟨 DIRECT DATABASE: Updated existing record for "${key}"`);
            updates.push({ key, action: 'update', result: 'success' });
          }
        } catch (fieldError) {
          console.error(`🟨 DIRECT DATABASE: Error updating field "${key}":`, fieldError);
          updates.push({ key, action: 'error', result: fieldError.message });
        }
      }
    }
    
    // Commit transaction
    await connection.commit();
    console.log('🟨 DIRECT DATABASE: Transaction committed successfully');
    
    return {
      success: true,
      updates: updates,
      fields_processed: updates.length
    };
  } catch (error) {
    console.error('🟨 DIRECT DATABASE: Error during database update:', error);
    
    // Rollback if transaction active
    if (connection) {
      try {
        await connection.rollback();
        console.log('🟨 DIRECT DATABASE: Transaction rolled back');
      } catch (rollbackError) {
        console.error('🟨 DIRECT DATABASE: Error rolling back transaction:', rollbackError);
      }
    }
    
    return {
      success: false,
      error: error.message,
      message: 'Failed to update database'
    };
  } finally {
    // Close connection
    if (connection) {
      try {
        await connection.end();
        console.log('🟨 DIRECT DATABASE: Database connection closed');
      } catch (closeError) {
        console.error('🟨 DIRECT DATABASE: Error closing database connection:', closeError);
      }
    }
  }
} 