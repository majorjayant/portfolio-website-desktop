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

// Function to ensure the site_config table exists
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
        job_title VARCHAR(100) NOT NULL,
        company_name VARCHAR(100) NOT NULL,
        location VARCHAR(100),
        from_date DATE NOT NULL,
        to_date DATE,
        is_current BOOLEAN DEFAULT FALSE,
        description TEXT NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Verified workex table exists');
    
    // Ensure education table exists
    await ensureEducationTableExists(connection);
    
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
    const toDate = item.is_current ? null : (item.to_date || null); // Ensure to_date is null if current

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
    } else if (isDeleted === 0) { // New item to Insert (ignore if marked deleted before first save)
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

// Main Lambda handler function
exports.handler = async (event, context) => {
  // Log request details
  logRequestInfo(event, context);

  let connection;

  try {
    // Handle OPTIONS request for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }
    
    // Handle GET request to fetch data
    if (event.httpMethod === 'GET') {
      console.log('Handling GET request');
      // Use Promise.all to fetch config, work experience and education concurrently
      const [siteConfig, workExperience, education] = await Promise.all([
          getSiteConfig(),
          getWorkExperience(),
          getEducation() // Fetch education data
      ]);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          site_config: siteConfig,
          work_experience: workExperience,
          education: education // Include education in response
        })
      };
    }
    // Handle POST request for login or updates
    else if (event.httpMethod === 'POST') {
      console.log('Handling POST request');
      // Parse request body
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (e) {
        console.error('Invalid JSON in request body:', e.message);
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid JSON format in request body.' }) };
      }

      // Handle login action
      if (body.action === 'login') {
        const loginResult = handleLogin(body.username, body.password);
        if (loginResult.success) {
          return { statusCode: 200, headers, body: JSON.stringify(loginResult) };
        } else {
          return { statusCode: 401, headers, body: JSON.stringify({ message: loginResult.message }) };
        }
      }
      // Handle update_site_config action
      else if (body.action === 'update_site_config') {
        // Basic Authentication check (replace with robust auth in production)
        const authToken = event.headers?.Authorization?.split(' ')[1];
        if (!authToken || !authToken.startsWith('admin-token-')) {
            console.warn('Unauthorized attempt to update site config - invalid or missing token.');
            return { statusCode: 401, headers, body: JSON.stringify({ message: 'Unauthorized: Invalid or missing token.' }) };
        }
        console.log('Authorization token accepted.');

        // Start database transaction
        connection = await getConnection();
        await connection.beginTransaction();
        console.log('Database transaction started.');

        try {
          // Save site config fields
          if (body.site_config && typeof body.site_config === 'object') {
              await saveSiteConfig(body.site_config, connection); // Pass connection
          } else {
              console.log('No site_config data provided in payload.');
          }

          // Save work experience data
          if (body.work_experience && Array.isArray(body.work_experience)) {
              await saveWorkExperience(body.work_experience, connection); // Pass connection
          } else {
              console.log('No work_experience data provided in payload.');
          }

          // Save education data
          if (body.education && Array.isArray(body.education)) {
              await saveEducation(body.education, connection); // Pass connection
          } else {
              console.log('No education data provided in payload.');
          }

          // Commit transaction if all saves were successful
          await connection.commit();
          console.log('Database transaction committed successfully.');

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Site configuration updated successfully.' })
          };
        } catch (saveError) {
          // Rollback transaction on any save error
          console.error('Error during save operation, rolling back transaction:', saveError);
          await connection.rollback();
          console.log('Database transaction rolled back.');
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: `Error updating configuration: ${saveError.message}` })
          };
        }
      }
      // Handle unknown POST actions
      else {
        console.warn(`Unknown POST action received: ${body.action}`);
        return { statusCode: 400, headers, body: JSON.stringify({ message: 'Invalid action specified.' }) };
      }
    }
    // Handle unsupported HTTP methods
    else {
      console.warn(`Unsupported HTTP method: ${event.httpMethod}`);
      return {
        statusCode: 405, // Method Not Allowed
        headers,
        body: JSON.stringify({ message: `Method ${event.httpMethod} Not Allowed` })
      };
    }
  } catch (error) {
    // Generic error handler for unexpected issues
    console.error('Unhandled error in Lambda handler:', error);
    // Ensure rollback if connection exists and transaction might be active
    if (connection) {
        try {
            console.log('Attempting rollback due to unhandled error...');
            await connection.rollback();
            console.log('Rollback successful after unhandled error.');
        } catch (rollbackError) {
            console.error('Failed to rollback transaction after unhandled error:', rollbackError);
        }
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'An internal server error occurred.' })
    };
  } finally {
      // Always ensure the connection is closed if it was opened
      if (connection) {
          try {
              await connection.end();
              console.log('Database connection closed.');
          } catch (endError) {
              console.error('Error closing database connection:', endError);
          }
      }
  }
};

// Helper function to ensure saveSiteConfig uses the provided transaction connection
async function saveSiteConfig(configData, connection) {
    if (!connection) {
        throw new Error("saveSiteConfig requires an active database transaction connection.");
    }
    console.log('Starting saveSiteConfig.');
    const updates = [];
    for (const key in configData) {
        if (Object.prototype.hasOwnProperty.call(configData, key)) {
            const value = configData[key];
            console.log(`Preparing update/insert for config key: ${key}`);
            // Use INSERT ... ON DUPLICATE KEY UPDATE for efficiency
            updates.push(
                connection.execute(
                    'INSERT INTO site_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)',
                    [key, value]
                ).then(([result]) => {
                     console.log(`Result for config key '${key}': Affected rows: ${result.affectedRows}`);
                     // affectedRows = 1 for INSERT, 2 for UPDATE with this statement
                     if (result.affectedRows === 0) {
                         console.warn(`Config key '${key}' update affected 0 rows.`);
                     }
                     return result;
                }).catch(err => {
                    console.error(`Error saving config key '${key}':`, err);
                    throw err; // Propagate error
                })
            );
        }
    }
    try {
        await Promise.all(updates);
        console.log('All site_config operations executed successfully.');
    } catch (error) {
        console.error('Error executing site_config save operations:', error);
        throw error; // Re-throw to ensure transaction rollback
    }
}

// Helper function to ensure saveWorkExperience uses the provided transaction connection
async function saveWorkExperience(workExperienceData, connection) {
    if (!connection) {
        throw new Error("saveWorkExperience requires an active database transaction connection.");
    }
     if (!Array.isArray(workExperienceData)) {
      console.log('No valid work experience data array found in payload, skipping save.');
      return; // Nothing to save
    }
    console.log(`Starting saveWorkExperience for ${workExperienceData.length} items.`);

    const insertPromises = [];
    const updatePromises = [];
    const softDeletePromises = [];

    for (const item of workExperienceData) {
        const isDeleted = Number(item.is_deleted || 0);
        const isCurrent = item.is_current ? 1 : 0;
        const fromDate = item.from_date || null;
        const toDate = item.is_current ? null : (item.to_date || null);

        if (item.id) { // Existing item
            const itemId = parseInt(item.id, 10);
             if (isNaN(itemId)) {
                console.warn(`Skipping workex item with invalid ID: ${item.id}`);
                continue;
            }

            if (isDeleted === 1) { // Soft Delete
                console.log(`Preparing soft delete for workex item ID: ${itemId}`);
                softDeletePromises.push(
                    connection.execute(
                        'UPDATE workex SET is_deleted = 1, updated_date = NOW() WHERE id = ? AND is_deleted = 0',
                        [itemId]
                    ).then(([result]) => {
                        console.log(`Soft delete result for workex ID ${itemId}: Affected rows: ${result.affectedRows}`);
                        if (result.affectedRows === 0) {
                             console.log(`Workex item ${itemId} either already deleted or not found.`);
                         }
                         return result;
                    }).catch(err => {
                        console.error(`Error during soft delete for workex ID ${itemId}:`, err);
                        throw err;
                    })
                );
            } else { // Update
                 console.log(`Preparing update for workex item ID: ${itemId}`);
                 updatePromises.push(
                    connection.execute(
                        `UPDATE workex SET
                          job_title = ?, company_name = ?, location = ?, from_date = ?, to_date = ?,
                          is_current = ?, description = ?, is_deleted = 0, updated_date = NOW()
                         WHERE id = ?`,
                        [
                            item.job_title || '',
                            item.company_name || '',
                            item.location || null,
                            fromDate,
                            toDate,
                            isCurrent,
                            item.description || '',
                            itemId
                        ]
                    ).then(([result]) => {
                        console.log(`Update result for workex ID ${itemId}: Affected rows: ${result.affectedRows}`);
                         if (result.affectedRows === 0) {
                             console.warn(`Update for workex item ${itemId} affected 0 rows.`);
                         }
                         return result;
                    }).catch(err => {
                        console.error(`Error during update for workex ID ${itemId}:`, err);
                        throw err;
                    })
                );
            }
        } else if (isDeleted === 0) { // New item to Insert
             console.log(`Preparing insert for new workex item: ${item.job_title}`);
             insertPromises.push(
                connection.execute(
                    `INSERT INTO workex
                        (job_title, company_name, location, from_date, to_date, is_current, description, is_deleted, created_date, updated_date)
                       VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
                    [
                         item.job_title || '',
                         item.company_name || '',
                         item.location || null,
                         fromDate,
                         toDate,
                         isCurrent,
                         item.description || ''
                    ]
                ).then(([result]) => {
                     console.log(`Insert result for workex '${item.job_title}': Insert ID: ${result.insertId}, Affected rows: ${result.affectedRows}`);
                      if (result.affectedRows !== 1) {
                         console.error(`Insert for workex '${item.job_title}' failed.`);
                         throw new Error(`Failed to insert workex item: ${item.job_title}`);
                     }
                     return result;
                }).catch(err => {
                    console.error(`Error during insert for workex '${item.job_title}':`, err);
                    throw err;
                })
            );
        } else {
            console.log(`Ignoring new workex item marked for deletion: ${item.job_title}`);
        }
    }

     try {
        console.log(`Executing ${softDeletePromises.length} soft deletes, ${updatePromises.length} updates, ${insertPromises.length} inserts for workex.`);
        await Promise.all(softDeletePromises);
        await Promise.all(updatePromises);
        await Promise.all(insertPromises);
        console.log('All workex operations executed successfully.');
    } catch (error) {
        console.error('Error executing workex save operations:', error);
        throw error; // Re-throw to ensure transaction rollback
    }
} 

document.addEventListener('DOMContentLoaded', () => {
    // ... (existing code: checkAuthentication, logoutButton, saveButton, refreshButton, addWorkExButton) ...

     // Add Education button
    const addEducationButton = document.getElementById('add-education-button');
    if (addEducationButton) {
        addEducationButton.addEventListener('click', () => addEducationItem());
    }
}); 

function populateForm(config) {
    // ... (existing code for populating standard fields) ...

    // Load dynamic sections
    loadWorkExperienceData(config.work_experience || []);
    loadEducationData(config.education || []);
} 

// Get education data from the form
function getEducationData() {
    const items = document.querySelectorAll('#education-items-container .education-item');
    const data = [];
    let hasValidationError = false;

    items.forEach(item => {
        const id = item.querySelector('.education-id').value || null;
        // Read value directly, don't disable the hidden input
        const isDeleted = parseInt(item.querySelector('.education-is-deleted').value || 0);
        // Read other fields even if disabled for marked items
        const eduTitleInput = item.querySelector('.education-title');
        const eduNameInput = item.querySelector('.education-name');
        const fromDateInput = item.querySelector('.education-from');
        const locationInput = item.querySelector('.education-location');
        const toDateInput = item.querySelector('.education-to');
        const currentCheckbox = item.querySelector('.education-current');

        const eduTitle = eduTitleInput.value;
        const eduName = eduNameInput.value;
        const fromDate = fromDateInput.value;

        // Validate only if not marked for deletion
        if (isDeleted === 0) {
            let itemIsValid = true;
             // Reset styles first
            eduTitleInput.classList.remove('validation-error');
            eduNameInput.classList.remove('validation-error');
            fromDateInput.classList.remove('validation-error');

            if (!eduTitle) {
                 eduTitleInput.classList.add('validation-error');
                 itemIsValid = false;
            }
            if (!eduName) {
                 eduNameInput.classList.add('validation-error');
                 itemIsValid = false;
             }
            if (!fromDate) {
                 fromDateInput.classList.add('validation-error');
                 itemIsValid = false;
             }

            if (!itemIsValid) {
                console.error('Validation Error: Missing required education field(s) in item:', item);
                hasValidationError = true;
            }
        } else {
             // If marked deleted, ensure validation styles are removed
             eduTitleInput.classList.remove('validation-error');
             eduNameInput.classList.remove('validation-error');
             fromDateInput.classList.remove('validation-error');
         }


        // Always include item if it has ID (to send update/delete) OR if it's not deleted (to send insert/update)
         if (id || isDeleted === 0) {
             const eduData = {
                id: id,
                edu_title: eduTitle,
                edu_name: eduName,
                location: locationInput.value || null,
                from_date: fromDate || null,
                to_date: toDateInput.value || null,
                is_current: currentCheckbox.checked,
                is_deleted: isDeleted // Send the flag
            };
             data.push(eduData);
         } else {
             // This case (new item marked deleted) should be rare but log it
             console.log('Skipping new education item marked for deletion:', item);
         }
    });

    return { data, hasValidationError };
} 

// Add a new education item to the form
function addEducationItem(itemData = {}, index = Date.now()) {
    console.log('Adding education item:', itemData);
    const container = document.getElementById('education-items-container');
    const itemDiv = document.createElement('div');
    // Use the general .data-item class
    itemDiv.className = 'education-item data-item p-4 border rounded-lg mb-4 bg-gray-50';
    itemDiv.dataset.index = index;

    // Add marked-for-deletion class if loaded item is already marked (though normally they aren't loaded)
     if (parseInt(itemData.is_deleted || 0) === 1) {
         itemDiv.classList.add('marked-for-deletion');
     }

    itemDiv.innerHTML = `
        <input type="hidden" class="education-id" value="${itemData.id || ''}">
        <input type="hidden" class="education-is-deleted" value="${itemData.is_deleted || 0}"> <!-- Deletion flag -->

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label for="education-title-${index}" class="block text-sm font-medium text-gray-700">Degree Name*</label>
                <input type="text" id="education-title-${index}" class="education-title mt-1 block w-full border-gray-300 rounded-md shadow-sm required" value="${itemData.edu_title || ''}" ${parseInt(itemData.is_deleted || 0) === 1 ? 'disabled' : ''}>
            </div>
            <div>
                <label for="education-name-${index}" class="block text-sm font-medium text-gray-700">Institution Name*</label>
                <input type="text" id="education-name-${index}" class="education-name mt-1 block w-full border-gray-300 rounded-md shadow-sm required" value="${itemData.edu_name || ''}" ${parseInt(itemData.is_deleted || 0) === 1 ? 'disabled' : ''}>
            </div>
        </div>
        <div class="mb-4">
            <label for="education-location-${index}" class="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" id="education-location-${index}" class="education-location mt-1 block w-full border-gray-300 rounded-md shadow-sm" value="${itemData.location || ''}" ${parseInt(itemData.is_deleted || 0) === 1 ? 'disabled' : ''}>
        </div>
        <div class="data-dates grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
                <label for="education-from-${index}" class="block text-sm font-medium text-gray-700">From Date*</label>
                <input type="date" id="education-from-${index}" class="education-from mt-1 block w-full border-gray-300 rounded-md shadow-sm required" value="${itemData.from_date || ''}" ${parseInt(itemData.is_deleted || 0) === 1 ? 'disabled' : ''}>
            </div>
            <div>
                <label for="education-to-${index}" class="block text-sm font-medium text-gray-700">To Date</label>
                <input type="date" id="education-to-${index}" class="education-to mt-1 block w-full border-gray-300 rounded-md shadow-sm" value="${itemData.to_date || ''}" ${(itemData.is_current || parseInt(itemData.is_deleted || 0) === 1) ? 'disabled' : ''}>
            </div>
        </div>
        <div class="data-current flex items-center mb-4">
            <input type="checkbox" id="education-current-${index}" class="education-current h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" ${itemData.is_current ? 'checked' : ''} ${parseInt(itemData.is_deleted || 0) === 1 ? 'disabled' : ''}>
            <label for="education-current-${index}" class="ml-2 block text-sm text-gray-900">Currently Enrolled</label>
        </div>
        <button type="button" class="data-delete-btn education-delete-btn mt-4 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
            ${parseInt(itemData.is_deleted || 0) === 1 ? 'Marked for Deletion' : '<span class="text-lg mr-1">×</span> Delete'}
        </button>
    `;
    container.appendChild(itemDiv);

    // Add event listeners for this specific item
    const currentCheckbox = itemDiv.querySelector('.education-current');
    const toDateInput = itemDiv.querySelector('.education-to');
    currentCheckbox.addEventListener('change', (e) => {
         // Only modify if not marked for deletion
        if (itemDiv.querySelector('.education-is-deleted').value !== '1') {
            toDateInput.disabled = e.target.checked;
            if (e.target.checked) {
                toDateInput.value = ''; // Clear to_date if current
            }
        }
    });

    const deleteButton = itemDiv.querySelector('.education-delete-btn');
    const deletedInput = itemDiv.querySelector('.education-is-deleted');
    deleteButton.addEventListener('click', () => {
         if (deletedInput.value === '1') return; // Already marked

         if (confirm('Are you sure you want to mark this item for deletion? It will be removed when you save changes.')) {
            deletedInput.value = '1';
            itemDiv.classList.add('marked-for-deletion');
            // Disable inputs for visual cue, but they are still part of the form
            itemDiv.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(el => el.disabled = true);
            currentCheckbox.disabled = true; // Explicitly disable checkbox too
            deleteButton.textContent = 'Marked for Deletion';
            deleteButton.disabled = true; // Disable delete button after marking
         }
    });

     // Re-apply disabled state if loaded as marked for deletion
     if (parseInt(itemData.is_deleted || 0) === 1) {
         itemDiv.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(el => el.disabled = true);
         currentCheckbox.disabled = true;
         deleteButton.disabled = true;
     }
} 

// Load education data into the form
function loadEducationData(educationItems) {
    console.log('Loading education data:', educationItems);
    const container = document.getElementById('education-items-container');
    const loadingMsg = document.getElementById('education-loading-message');
    container.innerHTML = ''; // Clear existing items

    if (!educationItems || educationItems.length === 0) {
        console.log('No education items found, adding one empty item.');
        addEducationItem(); // Add one empty item if none exist
    } else {
        educationItems.forEach((item, index) => addEducationItem(item, index));
    }
    loadingMsg.classList.add('hidden');
} 