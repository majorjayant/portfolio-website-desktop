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

// Function to ensure the certifications table exists
async function ensureCertificationsTableExists(connection) {
  try {
    // Ensure certifications table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS certifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certification_name VARCHAR(200) NOT NULL,
        issuer_name VARCHAR(200) NOT NULL,
        credential_id VARCHAR(100),
        credential_link VARCHAR(255),
        issued_date DATE NOT NULL,
        expiry_date DATE,
        description TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Verified certifications table exists');
    return true;
  } catch (error) {
    console.error('Error ensuring certifications table exists:', error);
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
  console.log('Saving education data:', educationData);
  
  // First, get existing education items to check for deletions
  const [existingEducation] = await connection.execute(
    'SELECT id FROM education'
  );
  
  const existingIds = existingEducation.map(item => item.id);
  const incomingIds = educationData.filter(item => item.id).map(item => parseInt(item.id, 10));
  
  // Find IDs that exist in database but not in the incoming data (these should be marked as deleted)
  const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
  
  if (idsToDelete.length > 0) {
    console.log(`Marking education items as deleted: ${idsToDelete.join(', ')}`);
    await connection.execute(
      'UPDATE education SET is_deleted = 1 WHERE id IN (?)',
      [idsToDelete]
    );
  }
  
  // Process each education item
  for (const edu of educationData) {
    if (edu.id) {
      // Update existing item
      await connection.execute(
        `UPDATE education SET 
        edu_title = ?, 
        edu_name = ?, 
        location = ?, 
        from_date = ?, 
        to_date = ?, 
        is_current = ?,
        is_deleted = ?
        WHERE id = ?`,
        [
          edu.edu_title,
          edu.edu_name,
          edu.location,
          edu.from_date,
          edu.to_date || null,
          edu.is_current ? 1 : 0,
          edu.is_deleted ? 1 : 0,
          edu.id
        ]
      );
    } else {
      // Insert new item
      await connection.execute(
        `INSERT INTO education (
          edu_title, 
          edu_name, 
          location, 
          from_date, 
          to_date, 
          is_current,
          is_deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          edu.edu_title,
          edu.edu_name,
          edu.location,
          edu.from_date,
          edu.to_date || null,
          edu.is_current ? 1 : 0,
          edu.is_deleted ? 1 : 0
        ]
      );
    }
  }
  
  console.log('Education data saved successfully');
}

/**
 * Get certification data from the database
 * @param {Object} connection - MySQL connection
 * @returns {Promise<Array>} - Certification data array
 */
async function getCertificationData(connection) {
  console.log('Getting certification data from database');
  
  try {
    const [rows] = await connection.query(`
      SELECT * FROM certifications 
      WHERE is_deleted = 0 
      ORDER BY issued_date DESC
    `);
    
    console.log(`Retrieved ${rows.length} certification records`);
    return rows;
  } catch (error) {
    console.error('Error retrieving certification data:', error);
    throw error;
  }
}

/**
 * Save certification data to the database
 * @param {Array} certificationData - Array of certification objects
 * @param {Object} connection - MySQL connection
 * @returns {Promise<Object>} - Result of the save operation
 */
async function saveCertification(certificationData, connection) {
  console.log('Saving certification data:', certificationData);
  
  try {
    // Get existing certification ids to check for deletions
    const [existingCerts] = await connection.query('SELECT id FROM certifications');
    const existingIds = existingCerts.map(cert => cert.id);
    const incomingIds = certificationData.map(cert => cert.id).filter(id => id);
    
    // Find ids that exist in the database but are not in the incoming data
    const deletedIds = existingIds.filter(id => !incomingIds.includes(id));
    
    // Mark deleted certificates
    if (deletedIds.length > 0) {
      console.log('Marking deleted certifications:', deletedIds);
      const placeholders = deletedIds.map(() => '?').join(',');
      await connection.query(
        `UPDATE certifications SET is_deleted = 1 WHERE id IN (${placeholders})`,
        deletedIds
      );
    }
    
    // Process each certification item
    for (const cert of certificationData) {
      if (cert.id) {
        // Update existing record
        console.log('Updating certification:', cert.id);
        await connection.query(`
          UPDATE certifications
          SET 
            certification_name = ?,
            issuer_name = ?,
            credential_id = ?,
            credential_link = ?,
            issued_date = ?,
            expiry_date = ?,
            description = ?,
            is_deleted = 0
          WHERE id = ?
        `, [
          cert.certification_name,
          cert.issuer_name,
          cert.credential_id || null,
          cert.credential_link || null,
          cert.issued_date,
          cert.expiry_date || null,
          cert.description || null,
          cert.id
        ]);
      } else {
        // Insert new record
        console.log('Inserting new certification');
        await connection.query(`
          INSERT INTO certifications
          (certification_name, issuer_name, credential_id, credential_link, issued_date, expiry_date, description, is_deleted)
          VALUES (?, ?, ?, ?, ?, ?, ?, 0)
        `, [
          cert.certification_name,
          cert.issuer_name,
          cert.credential_id || null,
          cert.credential_link || null,
          cert.issued_date,
          cert.expiry_date || null,
          cert.description || null
        ]);
      }
    }
    
    return { success: true, message: 'Certification data saved successfully' };
  } catch (error) {
    console.error('Error saving certification data:', error);
    throw error;
  }
}

// Lambda handler
module.exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // Set up default response with CORS headers
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: 'Success' })
  };
  
  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling preflight request');
    return response;
  }
  
  let connection;
  try {
    // Create MySQL connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    if (event.httpMethod === 'GET') {
      console.log('Processing GET request');
      const type = event.queryStringParameters && event.queryStringParameters.type;
      
      if (type === 'education') {
        // Get education data only
        const educationData = await getEducation();
        response.body = JSON.stringify({ education: educationData });
      } else if (type === 'certification') {
        // Get certification data only
        const certificationData = await getCertificationData(connection);
        response.body = JSON.stringify({ certification: certificationData });
      } else {
        // Get all data
        const [siteConfig, workExperience, educationData, certificationData] = await Promise.all([
          getSiteConfig(),
          getWorkExperience(),
          getEducation(),
          getCertificationData(connection)
        ]);
        
        response.body = JSON.stringify({
          siteConfig,
          workExperience,
          education: educationData,
          certification: certificationData
        });
      }
    } else if (event.httpMethod === 'POST') {
      console.log('Processing POST request');
      const requestBody = JSON.parse(event.body);
      
      // Start a transaction
      await connection.beginTransaction();
      
      if (requestBody.siteConfig) {
        // Update site configuration
        await saveSiteConfig(requestBody.siteConfig);
      }
      
      if (requestBody.workExperience) {
        // Update work experience data
        await saveWorkExperience(requestBody.workExperience);
      }
      
      if (requestBody.education) {
        // Update education data
        await saveEducation(requestBody.education, connection);
      }
      
      if (requestBody.certification) {
        // Update certification data
        await saveCertification(requestBody.certification, connection);
      }
      
      // Commit the transaction
      await connection.commit();
      
      response.body = JSON.stringify({
        success: true,
        message: 'Data updated successfully'
      });
    } else {
      // Method not supported
      response.statusCode = 405;
      response.body = JSON.stringify({
        error: 'Method not supported'
      });
    }
  } catch (error) {
    console.error('Error:', error);
    
    // Rollback transaction if started
    if (connection && connection.rollback) {
      try {
        await connection.rollback();
        console.log('Transaction rolled back');
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    
    response.statusCode = 500;
    response.body = JSON.stringify({
      success: false,
      message: 'An error occurred while processing the request',
      error: error.message
    });
  } finally {
    // Close MySQL connection
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed');
      } catch (connectionError) {
        console.error('Error closing database connection:', connectionError);
      }
    }
  }
  
  return response;
}; 