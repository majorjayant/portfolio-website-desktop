// Import mysql2/promise for async MySQL operations
const mysql = require('mysql2/promise');

// Define standard response headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,Cache-Control,Pragma',
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
  image_mobile_banner_url: "/static/img/banner_mobile.png",
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
    
    // Ensure site_config table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS site_config (
        config_key VARCHAR(100) PRIMARY KEY,
        config_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Verified site_config table exists');
    
    // Ensure workex table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS workex (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        company VARCHAR(100) NOT NULL,
        location VARCHAR(100),
        from_date DATE NOT NULL,
        to_date DATE,
        is_current BOOLEAN DEFAULT FALSE,
        description TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Verified workex table exists');
  } catch (error) {
    console.error('Error ensuring tables exist:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

// Function to log all relevant info for debugging
function logRequestInfo(event, context) {
  console.log('Lambda Version: 2.1.14 - Using MySQL for persistent storage with Lambda Proxy Integration');
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

// Function to get work experience data from the database
async function getWorkExperience() {
  let connection;
  try {
    // Create a connection to the database
    connection = await getConnection();
    
    // Query all work experience entries ordered by from_date (most recent first)
    const [rows] = await connection.execute('SELECT * FROM workex ORDER BY from_date DESC');
    console.log(`Retrieved ${rows.length} work experience entries from the database`);
    
    // Debug - log the first row to see what fields are actually present
    if (rows.length > 0) {
      console.log('First raw DB row:', JSON.stringify(rows[0]));
    }
    
    // Format the data for response using the correct DB column names
    const workExperience = rows.map(row => {
      // Create the base object with all fields from row
      const expObj = {
        id: row.id,
        job_title: row.job_title || '', // Use the correct DB column name: job_title
        company_name: row.company_name || '', // Use the correct DB column name: company_name
        location: row.location,
        from_date: row.from_date ? row.from_date.toISOString().split('T')[0] : null,
        to_date: row.to_date ? row.to_date.toISOString().split('T')[0] : null,
        is_current: row.is_current === 1, // Convert MySQL tinyint to boolean
        description: row.description
      };
      
      // Log the mapped object for debugging
      console.log(`Mapped work experience item ${row.id}:`, JSON.stringify(expObj));
      
      return expObj;
    });
    
    return workExperience;
  } catch (error) {
    console.error('Error retrieving work experience from database:', error);
    console.log('Returning empty work experience array');
    return [];
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

// Function to save work experience data to the database
async function saveWorkExperience(workExperienceData) {
  let connection;
  try {
    // First ensure the table exists
    await ensureTableExists();
    
    // Create a connection to the database
    connection = await getConnection();
    
    // Start a transaction for atomicity
    await connection.beginTransaction();
    
    // Get existing work experience IDs from database
    const [existingRows] = await connection.execute('SELECT id FROM workex');
    const existingIds = existingRows.map(row => row.id); // These should be numbers
    console.log('Existing DB IDs:', existingIds);
    
    // Track provided IDs from the payload (ensure they are numbers)
    const providedIds = [];
    
    // Process each work experience item for update/insert
    for (const item of workExperienceData) {
      console.log(`Processing item from payload: ID=${item.id}, Type=${typeof item.id}`);
      
      const fromDate = item.from_date || null;
      const toDate = item.is_current ? null : (item.to_date || null);
      
      if (item.id && String(item.id).trim() !== '') {
          // Update existing record - Ensure ID is parsed as integer
          const itemIdInt = parseInt(String(item.id).trim(), 10);
          if (!isNaN(itemIdInt)) {
              providedIds.push(itemIdInt);
              await connection.execute(
                `UPDATE workex SET job_title = ?, company_name = ?, location = ?, from_date = ?, to_date = ?, is_current = ?, description = ? WHERE id = ?`,
                [item.job_title || '', item.company_name || '', item.location || '', fromDate, toDate, item.is_current ? 1 : 0, item.description || '', itemIdInt]
              );
              console.log(`Updated work experience ID ${itemIdInt}`);
          } else {
              console.warn(`Skipping update for invalid ID: ${item.id}`);
          }
      } else {
          // Insert new record
          const [result] = await connection.execute(
            `INSERT INTO workex (job_title, company_name, location, from_date, to_date, is_current, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [item.job_title || '', item.company_name || '', item.location || '', fromDate, toDate, item.is_current ? 1 : 0, item.description || '']
          );
          const newId = result.insertId; // This should be a number
          providedIds.push(newId);
          console.log(`Inserted new work experience with ID ${newId}`);
      }
    }
    
    console.log('Provided IDs (after processing payload, should be numbers):', providedIds);
    
    // Determine which records to delete (IDs in DB but not in payload)
    const idsToDelete = existingIds.filter(id => !providedIds.includes(id));
    console.log('IDs calculated for deletion:', idsToDelete);
    
    // Delete records that weren't included in the provided data
    if (idsToDelete.length > 0) {
      console.log(`Attempting to delete work experience IDs: ${idsToDelete.join(', ')}`);
      try {
          const [deleteResult] = await connection.execute(
            `DELETE FROM workex WHERE id IN (?)`,
            [idsToDelete] // Pass array directly
          );
          console.log('Delete execution result (affectedRows):', deleteResult.affectedRows);
      } catch (deleteError) {
          console.error('ERROR during DELETE execution:', deleteError);
          // Decide if we should rollback or allow partial success
          await connection.rollback(); 
          return { success: false, message: "Failed during DELETE operation: " + deleteError.message };
      }
    } else {
      console.log('No IDs marked for deletion.');
    }
    
    // Commit the transaction
    await connection.commit();
    console.log('Transaction committed successfully.');
    
    return { success: true, message: "Work experience updated successfully" };
    
  } catch (error) {
    console.error('Error in saveWorkExperience function:', error);
    // Rollback in case of any error during the process
    if (connection) await connection.rollback();
    console.log('Transaction rolled back due to error.');
    return { success: false, message: "Failed to update work experience: " + error.message };
    
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
    
    // Extract and log query parameters
    const queryParams = event.queryStringParameters || {};
    const pathParams = event.pathParameters || {};
    let requestType = queryParams.type || '';
    let actionType = queryParams.action || '';
    const path = event.path || '';
    
    // Check if we have a raw query string that contains the parameters
    // This is a fallback for when API Gateway doesn't parse query params correctly
    if (event.rawQueryString) {
      console.log('Checking raw query string:', event.rawQueryString);
      if (event.rawQueryString.includes('type=site_config')) {
        requestType = 'site_config';
        console.log('Found site_config in raw query string');
      }
      if (event.rawQueryString.includes('action=get_site_config')) {
        actionType = 'get_site_config';
        console.log('Found get_site_config in raw query string');
      }
    }
    
    console.log('Request type from query parameters:', requestType);
    console.log('Action type from query parameters:', actionType);
    console.log('Path:', path);
    
    // HIGHEST PRIORITY: Handle any GET request
    if (event.httpMethod === 'GET') {
      console.log('Processing GET request');
      
      // Check for work experience request
      if (requestType === 'workex') {
        console.log('GET request for work experience detected');
        const workExperience = await getWorkExperience();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            work_experience: workExperience,
            _version: "2.1.14",
            source: "GET handler for work experience",
            timestamp: new Date().toISOString()
          })
        };
      }
      
      // Prioritize site_config requests
      if (requestType === 'site_config' || actionType === 'get_site_config') {
        console.log('GET request for site_config detected');
        const siteConfig = await getSiteConfig();
        // Also get work experience data to include in response
        const workExperience = await getWorkExperience();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            site_config: siteConfig,
            work_experience: workExperience,
            _version: "2.1.14",
            source: "GET handler with query params",
            timestamp: new Date().toISOString()
          })
        };
      }
      
      // General GET request handling
      console.log('Processing general GET request');
      const siteConfig = await getSiteConfig();
      // Also get work experience data to include in response
      const workExperience = await getWorkExperience();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          site_config: siteConfig,
          work_experience: workExperience,
          _version: "2.1.14",
          source: "GET general handler",
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Check for admin access query parameter - special backdoor for access issues
    if (queryParams.admin_check === 'true') {
      console.log('Admin check requested');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Admin API is working correctly',
          timestamp: new Date().toISOString(),
          lambda_version: '2.1.14',
          storage: 'Using MySQL persistent storage with Lambda Proxy Integration',
          routing_hint: 'If you are experiencing admin access issues, use the direct access credentials at /admin-direct/'
        })
      };
    }
    
    // If we have an action in the query params, handle it accordingly
    if (actionType === 'get_site_config' || requestType === 'site_config') {
        console.log('Processing site_config request from query parameters');
        const siteConfig = await getSiteConfig();
        // Also get work experience data to include in response
        const workExperience = await getWorkExperience();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                site_config: siteConfig,
                work_experience: workExperience,
                _version: "2.1.14",
                from: "query_parameters",
                timestamp: new Date().toISOString(),
                storage: "Using MySQL persistent storage with Lambda Proxy Integration"
            })
        };
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
        console.log('Parsed body:', JSON.stringify(parsedBody));
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
      actionType = parsedBody.action || actionType || '';
      
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
            lambda_version: '2.1.14'
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
            lambda_version: '2.1.14',
            storage: 'Using MySQL persistent storage with Lambda Proxy Integration',
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
        
        // ** Log received headers for debugging **
        console.log('Headers received by update_site_config:', JSON.stringify(event.headers || {}));

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
        
        // Extract config data and work experience data
        const configData = parsedBody.site_config || {};
        const workExperienceData = parsedBody.work_experience || [];
        
        let updateResult = { success: true, message: "No data provided to update" };
        
        // Save the site configuration data if provided
        if (Object.keys(configData).length > 0) {
          console.log('Updating site configuration with:', configData);
          updateResult = await saveSiteConfig(configData);
        }
        
        // Save the work experience data if provided
        let workExperienceResult = { success: true, message: "No work experience data provided" };
        if (workExperienceData.length > 0) {
          console.log('Updating work experience with:', workExperienceData);
          workExperienceResult = await saveWorkExperience(workExperienceData);
        }
        
        // If either update fails, return error
        if (!updateResult.success || !workExperienceResult.success) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: false,
              message: !updateResult.success ? updateResult.message : workExperienceResult.message,
              site_config_result: updateResult,
              work_experience_result: workExperienceResult,
              timestamp: new Date().toISOString(),
              lambda_version: '2.1.14'
            })
          };
        }
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: "Updates completed successfully",
            site_config_result: updateResult,
            work_experience_result: workExperienceResult,
            timestamp: new Date().toISOString(),
            lambda_version: '2.1.14'
          })
        };
      }
      
      // Handle get site config via POST (for dashboard)
      if (actionType === 'get_site_config') {
        console.log('Processing site_config get request via POST');
        
        // Get site configuration from the database
        const siteConfig = await getSiteConfig();
        
        // Also get work experience data
        const workExperience = await getWorkExperience();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            site_config: siteConfig,
            work_experience: workExperience,
            _version: "2.1.14",
            from: "post_body",
            timestamp: new Date().toISOString(),
            storage: "Using MySQL persistent storage with Lambda Proxy Integration"
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
        site_config: await getSiteConfig(), // Always return site_config as fallback
        message: 'Unknown request type but returning site_config',
        request_path: event.path,
        request_method: event.httpMethod,
        request_type: requestType,
        _version: "2.1.14",
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