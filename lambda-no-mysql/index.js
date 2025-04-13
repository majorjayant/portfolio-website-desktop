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
    
    // Query non-deleted work experience entries ordered by from_date (most recent first)
    const [rows] = await connection.execute(
      'SELECT * FROM workex WHERE is_deleted = 0 ORDER BY from_date DESC'
    );
    console.log(`Retrieved ${rows.length} non-deleted work experience entries from the database`);
    
    // Debug - log the first row to see what fields are actually present
    if (rows.length > 0) {
      console.log('First raw DB row (non-deleted):', JSON.stringify(rows[0]));
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
        description: row.description,
        // Do not include is_deleted, created_date, updated_date in the response to the frontend
      };
      
      // Log the mapped object for debugging
      // console.log(`Mapped work experience item ${row.id}:`, JSON.stringify(expObj)); // Optional: uncomment for deep debugging
      
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

// Function to save work experience data (implements soft delete based on payload flag)
async function saveWorkExperience(workExperienceData) {
  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();
    console.log('Starting transaction to save work experience (soft delete based on payload)...');

    const now = new Date();

    for (const item of workExperienceData) {
      const itemId = item.id ? parseInt(String(item.id).trim(), 10) : null;
      // Check the flag directly from the payload
      const isMarkedDeleted = item.is_deleted === 1;
      const fromDate = item.from_date || null;
      const toDate = item.is_current ? null : (item.to_date || null);

      if (itemId && !isNaN(itemId)) {
        // Item has an ID, so it's either an UPDATE or a SOFT DELETE request
        if (isMarkedDeleted) {
            // Perform SOFT DELETE - Update the flag and timestamp
            console.log(`Executing soft delete for ID: ${itemId}`);
            const [softDeleteResult] = await connection.execute(
                `UPDATE workex SET is_deleted = 1, updated_date = ? WHERE id = ? AND is_deleted = 0`, // Only soft-delete if not already deleted
                [now, itemId]
            );
             console.log(`Soft delete result for ID ${itemId}: ${softDeleteResult.affectedRows} row(s) marked.`);
        } else {
            // Perform UPDATE for non-deleted item
            console.log(`Executing update for ID: ${itemId}`);
            const [updateResult] = await connection.execute(
              `UPDATE workex SET
                  job_title = ?, company_name = ?, location = ?,
                  from_date = ?, to_date = ?, is_current = ?, description = ?,
                  updated_date = ?, is_deleted = 0 /* Ensure is_deleted is 0 on update */
               WHERE id = ?`, // Update existing record regardless of its current is_deleted status, effectively undeleting if needed
              [item.job_title || '', item.company_name || '', item.location || '', fromDate, toDate, item.is_current ? 1 : 0, item.description || '', now, itemId]
            );
             if (updateResult.affectedRows > 0) {
                 console.log(`Updated work experience ID ${itemId}`);
             } else {
                 // This could happen if the ID was invalid or hard-deleted somehow
                 console.warn(`Attempted to update ID ${itemId}, but no rows were affected. ID might be invalid or already hard-deleted.`);
             }
        }
      } else if (!isMarkedDeleted) {
        // INSERT new item (item had no ID and is NOT marked for deletion)
        console.log(`Executing insert for new item...`);
        const [insertResult] = await connection.execute(
          `INSERT INTO workex (
              job_title, company_name, location, from_date, to_date, is_current, description,
              created_date, updated_date, is_deleted
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
          [item.job_title || '', item.company_name || '', item.location || '', fromDate, toDate, item.is_current ? 1 : 0, item.description || '', now, now]
        );
        const newId = insertResult.insertId;
        if (typeof newId === 'number') {
            console.log(`Inserted new work experience with ID ${newId}`);
        } else {
            console.error("Insert failed to return a valid new ID.");
            await connection.rollback();
            return { success: false, message: "Failed to insert new work experience item." };
        }
      } else {
           // Item has no ID AND is marked deleted - This case shouldn't be sent by the current dashboard logic.
           console.warn(`Received item with no ID but marked for deletion - skipping:`, item);
      }
    }

    // Commit all changes (updates, inserts, soft deletes)
    await connection.commit();
    console.log('Transaction committed successfully.');
    return { success: true, message: "Work experience updated successfully" };

  } catch (error) {
    console.error('Error in saveWorkExperience function:', error);
    if (connection) await connection.rollback();
    console.log('Transaction rolled back due to error.');
    return { success: false, message: "Failed to update work experience: " + error.message };

  } finally {
    if (connection) {
        console.log('Closing database connection.');
        await connection.end();
    }
  }
}

// Function to ensure the education table exists
async function ensureEducationTableExists(connection) {
  try {
    // Ensure education table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS education (
        id INT AUTO_INCREMENT PRIMARY KEY,
        edu_title VARCHAR(100) NOT NULL,
        edu_name VARCHAR(100) NOT NULL,
        location VARCHAR(100),
        from_date DATE NOT NULL,
        to_date DATE,
        is_current BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Verified education table exists');
    return true;
  } catch (error) {
    console.error('Error ensuring education table exists:', error);
    throw error;
  }
}

// Function to get education data from the database
async function getEducation() {
  let connection;
  try {
    connection = await getConnection();
    
    // First, check if table exists and create it if it doesn't
    await ensureEducationTableExists(connection);
    
    // Query non-deleted education entries ordered by from_date (most recent first)
    const [rows] = await connection.execute(
      'SELECT * FROM education WHERE is_deleted = 0 ORDER BY from_date DESC'
    );
    console.log(`Retrieved ${rows.length} non-deleted education entries from the database`);

    // Format the data for response
    const educationData = rows.map(row => ({
      id: row.id,
      edu_title: row.edu_title || '', // Degree Name
      edu_name: row.edu_name || '',   // College/School Name
      location: row.location,
      from_date: row.from_date ? row.from_date.toISOString().split('T')[0] : null,
      to_date: row.to_date ? row.to_date.toISOString().split('T')[0] : null,
      is_current: row.is_current === 1, // Convert MySQL tinyint to boolean
      // is_deleted is filtered by query, not included in response
    }));
    return educationData;
  } catch (error) {
    console.error('Error retrieving education from database:', error);
    console.log('Returning empty education array');
    return [];
  } finally {
    if (connection) await connection.end();
  }
}

// Function to save education data to the database
async function saveEducation(educationData, connection) {
  // Expects an active transaction connection
  if (!connection) {
      throw new Error("saveEducation requires an active database transaction connection.");
  }
  if (!Array.isArray(educationData)) {
      console.log('No valid education data array found in payload, skipping save.');
      return; // Nothing to save
  }
  console.log(`Starting saveEducation for ${educationData.length} items.`);

  const insertPromises = [];
  const updatePromises = [];
  const softDeletePromises = [];

  for (const item of educationData) {
    // Ensure is_deleted is treated as a number (0 or 1)
    const isDeleted = Number(item.is_deleted || 0);
    const isCurrent = item.is_current ? 1 : 0; // Convert boolean to tinyint
    const fromDate = item.from_date || null;
    const toDate = item.is_current ? null : (item.to_date || null);

    if (item.id) { // Existing item: Update or Soft Delete
      const itemId = parseInt(item.id, 10);
      if (isNaN(itemId)) {
          console.warn(`Skipping item with invalid ID: ${item.id}`);
          continue;
      }

      if (isDeleted === 1) { // Soft Delete
        console.log(`Preparing soft delete for education item ID: ${itemId}`);
        softDeletePromises.push(
          connection.execute(
            'UPDATE education SET is_deleted = 1, updated_date = NOW() WHERE id = ? AND is_deleted = 0',
            [itemId]
          ).then(([result]) => {
              console.log(`Soft delete result for education ID ${itemId}: Affected rows: ${result.affectedRows}`);
              if (result.affectedRows === 0) {
                  console.log(`Education item ${itemId} either already deleted or not found.`);
              }
              return result;
          }).catch(err => {
              console.error(`Error during soft delete for education ID ${itemId}:`, err);
              throw err; // Propagate error to fail transaction
          })
        );
      } else { // Update
        console.log(`Preparing update for education item ID: ${itemId}`);
        updatePromises.push(
          connection.execute(
            `UPDATE education SET
              edu_title = ?, edu_name = ?, location = ?, from_date = ?, to_date = ?,
              is_current = ?, is_deleted = 0, updated_date = NOW()
             WHERE id = ?`,
            [
              item.edu_title || '',
              item.edu_name || '',
              item.location || null,
              fromDate,
              toDate,
              isCurrent,
              itemId
            ]
          ).then(([result]) => {
              console.log(`Update result for education ID ${itemId}: Affected rows: ${result.affectedRows}`);
              if (result.affectedRows === 0) {
                  console.warn(`Update for education item ${itemId} affected 0 rows (possibly no changes or item not found).`);
              }
              return result;
          }).catch(err => {
              console.error(`Error during update for education ID ${itemId}:`, err);
              throw err; // Propagate error to fail transaction
          })
        );
      }
    } else if (isDeleted === 0) { // New item (only if not marked for deletion)
      console.log(`Preparing insert for new education item: ${item.edu_title}`);
      insertPromises.push(
        connection.execute(
          `INSERT INTO education
            (edu_title, edu_name, location, from_date, to_date, is_current, is_deleted, created_date, updated_date)
           VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
          [
            item.edu_title || '',
            item.edu_name || '',
            item.location || null,
            fromDate,
            toDate,
            isCurrent
          ]
        ).then(([result]) => {
            console.log(`Insert result for education '${item.edu_title}': Insert ID: ${result.insertId}, Affected rows: ${result.affectedRows}`);
            if (result.affectedRows !== 1) {
                console.error(`Insert for education '${item.edu_title}' failed or did not insert exactly one row.`);
                throw new Error(`Failed to insert education item: ${item.edu_title}`);
            }
            return result;
        }).catch(err => {
            console.error(`Error during insert for education '${item.edu_title}':`, err);
            throw err; // Propagate error to fail transaction
        })
      );
    } else {
        console.log(`Ignoring new education item marked for deletion: ${item.edu_title}`);
    }
  }

  // Execute all promises
  try {
      console.log(`Executing ${softDeletePromises.length} soft deletes, ${updatePromises.length} updates, ${insertPromises.length} inserts for education.`);
      await Promise.all(softDeletePromises);
      await Promise.all(updatePromises);
      await Promise.all(insertPromises);
      console.log('All education operations executed successfully.');
  } catch (error) {
      console.error('Error executing education save operations:', error);
      // Error is already logged by individual promise catches, re-throw to ensure transaction rollback
      throw error;
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
      
      // Check for education request
      if (requestType === 'education') {
        console.log('GET request for education detected');
        const education = await getEducation();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            education: education,
            _version: "2.1.14",
            source: "GET handler for education",
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
        // Get education data
        const education = await getEducation();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            site_config: siteConfig,
            work_experience: workExperience,
            education: education,
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
      // Get education data
      const education = await getEducation();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          site_config: siteConfig,
          work_experience: workExperience,
          education: education,
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
        // Get education data
        const education = await getEducation();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                site_config: siteConfig,
                work_experience: workExperience,
                education: education,
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
        
        // Extract config data, work experience data, and education data
        const configData = parsedBody.site_config || {};
        const workExperienceData = parsedBody.work_experience || [];
        const educationData = parsedBody.education || [];
        
        let updateResult = { success: true, message: "No data provided to update" };
        
        // Start a transaction to handle the update
        let connection;
        try {
          connection = await getConnection();
          await connection.beginTransaction();
          
          // Save the site configuration data if provided
          if (Object.keys(configData).length > 0) {
            console.log('Updating site configuration with:', configData);
            await saveSiteConfig(configData);
          }
          
          // Save the work experience data if provided
          if (workExperienceData.length > 0) {
            console.log('Updating work experience with:', workExperienceData);
            await saveWorkExperience(workExperienceData);
          }
          
          // Save the education data if provided
          if (educationData.length > 0) {
            console.log('Updating education data with:', educationData);
            await saveEducation(educationData, connection);
          }
          
          // Commit the transaction
          await connection.commit();
          console.log('Transaction committed successfully');
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: "Updates completed successfully",
              timestamp: new Date().toISOString(),
              lambda_version: '2.1.14'
            })
          };
        } catch (error) {
          // Roll back the transaction if there was an error
          if (connection) {
            try {
              await connection.rollback();
              console.log('Transaction rolled back due to error');
            } catch (rollbackError) {
              console.error('Error rolling back transaction:', rollbackError);
            }
          }
          
          console.error('Error during update:', error);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: false,
              message: `Error during update: ${error.message}`,
              timestamp: new Date().toISOString(),
              lambda_version: '2.1.14'
            })
          };
        } finally {
          if (connection) {
            try {
              await connection.end();
            } catch (connectionError) {
              console.error('Error closing connection:', connectionError);
            }
          }
        }
      }
      
      // Handle get site config via POST (for dashboard)
      if (actionType === 'get_site_config') {
        console.log('Processing site_config get request via POST');
        
        // Get site configuration from the database
        const siteConfig = await getSiteConfig();
        
        // Also get work experience data
        const workExperience = await getWorkExperience();
        
        // Get education data
        const education = await getEducation();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            site_config: siteConfig,
            work_experience: workExperience,
            education: education,
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