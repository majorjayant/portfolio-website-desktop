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
    
    // Ensure education table exists
    await ensureEducationTableExists(connection);
    
    // Ensure certification table exists
    await ensureCertificationTableExists(connection);
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Verified education table exists');
  } catch (error) {
    console.error('Error ensuring education table exists:', error);
    throw error;
  }
}

// Function to get education data from the database
async function getEducation() {
  let connection;
  try {
    // Create a connection to the database
    connection = await getConnection();
    
    // Query non-deleted education entries ordered by from_date (most recent first)
    const [rows] = await connection.execute(
      'SELECT * FROM education WHERE is_deleted = 0 ORDER BY from_date DESC'
    );
    console.log(`Retrieved ${rows.length} non-deleted education entries from the database`);
    
    // Debug - log the first row to see what fields are actually present
    if (rows.length > 0) {
      console.log('First raw DB row (education):', JSON.stringify(rows[0]));
    }
    
    // Format the data for response
    const education = rows.map(row => {
      return {
        id: row.id,
        edu_title: row.edu_title || '',
        edu_name: row.edu_name || '',
        location: row.location || '',
        from_date: row.from_date ? row.from_date.toISOString().split('T')[0] : null,
        to_date: row.to_date ? row.to_date.toISOString().split('T')[0] : null,
        is_current: row.is_current === 1,
        is_deleted: false
      };
    });
    
    return education;
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
  console.log('Saving education data:', JSON.stringify(educationData));
  
  // First ensure the education table exists if a connection is not provided
  if (!connection) {
    try {
      const tempConnection = await getConnection();
      await ensureEducationTableExists(tempConnection);
      await tempConnection.end();
    } catch (error) {
      console.error('Error ensuring education table exists for saving:', error);
      throw error;
    }
  }
  
  // Creates a new connection or uses the existing one
  let privateConnection = false;
  let conn = connection;
  
  if (!conn) {
    conn = await getConnection();
    privateConnection = true;
    await conn.beginTransaction();
  }
  
  try {
    // Process each education item
    for (const item of educationData) {
      if (item.id) {
        // Existing item - update or delete
        if (item.is_deleted) {
          // Delete the education entry
          await conn.execute(
            'UPDATE education SET is_deleted = 1 WHERE id = ?',
            [item.id]
          );
          console.log(`Marked education item ${item.id} as deleted`);
        } else {
          // Update the education entry
          const params = [
            item.edu_title,
            item.edu_name,
            item.location,
            item.from_date,
            item.is_current ? null : item.to_date,
            item.is_current ? 1 : 0,
            0, // is_deleted
            item.id
          ];
          
          await conn.execute(
            `UPDATE education 
             SET edu_title = ?, edu_name = ?, location = ?, from_date = ?, 
                 to_date = ?, is_current = ?, is_deleted = ?
             WHERE id = ?`,
            params
          );
          console.log(`Updated education item ${item.id}`);
        }
      } else {
        // New item - insert
        if (!item.is_deleted) {  // Skip inserting items marked for deletion with no ID
          const params = [
            item.edu_title,
            item.edu_name,
            item.location,
            item.from_date,
            item.is_current ? null : item.to_date,
            item.is_current ? 1 : 0
          ];
          
          const [result] = await conn.execute(
            `INSERT INTO education 
             (edu_title, edu_name, location, from_date, to_date, is_current)
             VALUES (?, ?, ?, ?, ?, ?)`,
            params
          );
          console.log(`Inserted new education item with ID ${result.insertId}`);
        }
      }
    }
    
    // If we created our own connection, commit and close it
    if (privateConnection) {
      await conn.commit();
      await conn.end();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving education data:', error);
    
    // If we created our own connection, rollback and close it
    if (privateConnection) {
      try {
        await conn.rollback();
        await conn.end();
      } catch (e) {
        console.error('Error rolling back transaction:', e);
      }
    }
    
    throw error;
  }
}

// Function to ensure the certification table exists
async function ensureCertificationTableExists(connection) {
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS certification (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certification_name VARCHAR(100) NOT NULL,
        issuer_name VARCHAR(100) NOT NULL,
        credential_id VARCHAR(100),
        credential_link VARCHAR(255),
        issued_date DATE NOT NULL,
        expiry_date DATE,
        description TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Verified certification table exists');
  } catch (error) {
    console.error('Error ensuring certification table exists:', error);
    throw error;
  }
}

// Function to get certification data from the database
async function getCertification() {
  let connection;
  try {
    // Create a connection to the database
    connection = await getConnection();
    
    // Query non-deleted certification entries ordered by issued_date (most recent first)
    const [rows] = await connection.execute(
      'SELECT * FROM certification WHERE is_deleted = 0 ORDER BY issued_date DESC'
    );
    console.log(`Retrieved ${rows.length} non-deleted certification entries from the database`);
    
    // Debug - log the first row to see what fields are actually present
    if (rows.length > 0) {
      console.log('First raw DB row (certification):', JSON.stringify(rows[0]));
    }
    
    // Format the data for response
    const certifications = rows.map(row => {
      return {
        id: row.id,
        certification_name: row.certification_name || '',
        issuer_name: row.issuer_name || '',
        credential_id: row.credential_id || '',
        credential_link: row.credential_link || '',
        issued_date: row.issued_date ? row.issued_date.toISOString().split('T')[0] : null,
        expiry_date: row.expiry_date ? row.expiry_date.toISOString().split('T')[0] : null,
        description: row.description || '',
        is_deleted: false
      };
    });
    
    return certifications;
  } catch (error) {
    console.error('Error retrieving certifications from database:', error);
    console.log('Returning empty certification array');
    return [];
  } finally {
    if (connection) await connection.end();
  }
}

// Function to save certification data to the database
async function saveCertification(certificationData, connection) {
  console.log('Saving certification data:', JSON.stringify(certificationData));
  
  // First ensure the certification table exists if a connection is not provided
  if (!connection) {
    try {
      const tempConnection = await getConnection();
      await ensureCertificationTableExists(tempConnection);
      await tempConnection.end();
    } catch (error) {
      console.error('Error ensuring certification table exists for saving:', error);
      throw error;
    }
  }
  
  // Creates a new connection or uses the existing one
  let privateConnection = false;
  let conn = connection;
  
  if (!conn) {
    conn = await getConnection();
    privateConnection = true;
    await conn.beginTransaction();
  }
  
  try {
    // Process each certification item
    for (const item of certificationData) {
      if (item.id) {
        // Existing item - update or delete
        if (item.is_deleted) {
          // Delete the certification entry
          await conn.execute(
            'UPDATE certification SET is_deleted = 1 WHERE id = ?',
            [item.id]
          );
          console.log(`Marked certification item ${item.id} as deleted`);
        } else {
          // Update the certification entry
          const params = [
            item.certification_name,
            item.issuer_name,
            item.credential_id,
            item.credential_link,
            item.issued_date,
            item.expiry_date,
            item.description,
            0, // is_deleted
            item.id
          ];
          
          await conn.execute(
            `UPDATE certification 
             SET certification_name = ?, issuer_name = ?, credential_id = ?, credential_link = ?, 
                 issued_date = ?, expiry_date = ?, description = ?, is_deleted = ?
             WHERE id = ?`,
            params
          );
          console.log(`Updated certification item ${item.id}`);
        }
      } else {
        // New item - insert
        if (!item.is_deleted) {  // Skip inserting items marked for deletion with no ID
          const params = [
            item.certification_name,
            item.issuer_name,
            item.credential_id,
            item.credential_link,
            item.issued_date,
            item.expiry_date,
            item.description
          ];
          
          const [result] = await conn.execute(
            `INSERT INTO certification 
             (certification_name, issuer_name, credential_id, credential_link, issued_date, expiry_date, description)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            params
          );
          console.log(`Inserted new certification item with ID ${result.insertId}`);
        }
      }
    }
    
    // If we created our own connection, commit and close it
    if (privateConnection) {
      await conn.commit();
      await conn.end();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving certification data:', error);
    
    // If we created our own connection, rollback and close it
    if (privateConnection) {
      try {
        await conn.rollback();
        await conn.end();
      } catch (e) {
        console.error('Error rolling back transaction:', e);
      }
    }
    
    throw error;
  }
}

// Lambda handler
exports.handler = async (event, context) => {
  try {
    console.log('Lambda function invoked');
    logRequestInfo(event, context);
    
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'CORS preflight request successful' })
      };
    }
    
    const queryParams = event.queryStringParameters || {};
    const action = queryParams.action || '';
    const type = queryParams.type || '';
    
    // Parse request body if present
    let requestBody = {};
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (error) {
        console.error('Failed to parse request body:', error);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid request body: ' + error.message })
        };
      }
    }
    
    // Handle login request
    if (action === 'login') {
      const { username, password } = requestBody;
      
      if (!username || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Username and password are required' })
        };
      }
      
      const loginResult = handleLogin(username, password);
      return {
        statusCode: loginResult.success ? 200 : 401,
        headers,
        body: JSON.stringify(loginResult)
      };
    }
    
    // Handle get requests for different data types
    if (event.httpMethod === 'GET') {
      // For site config, optionally include work experience and education
      if (type === 'site_config') {
        try {
          const siteConfig = await getSiteConfig();
          const workExperience = await getWorkExperience();
          const education = await getEducation();
          const certification = await getCertification();
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              site_config: siteConfig,
              work_experience: workExperience,
              education: education,
              certification: certification
            })
          };
        } catch (error) {
          console.error('Error getting site config and related data:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error retrieving data: ' + error.message })
          };
        }
      }
      
      // For work experience only
      if (type === 'work_experience') {
        try {
          const workExperience = await getWorkExperience();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ work_experience: workExperience })
          };
        } catch (error) {
          console.error('Error getting work experience:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error retrieving work experience: ' + error.message })
          };
        }
      }
      
      // For education only
      if (type === 'education') {
        try {
          const education = await getEducation();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ education: education })
          };
        } catch (error) {
          console.error('Error getting education:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error retrieving education: ' + error.message })
          };
        }
      }
      
      // For certification only
      if (type === 'certification') {
        try {
          const certification = await getCertification();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ certification: certification })
          };
        } catch (error) {
          console.error('Error getting certification:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error retrieving certification: ' + error.message })
          };
        }
      }
      
      // Default response for GET without recognized type
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request type' })
      };
    }
    
    // Handle update site config (POST request)
    if (event.httpMethod === 'POST' && action === 'update_site_config') {
      try {
        // Get data from the request body
        const siteConfigData = requestBody.site_config || {};
        const workExperienceData = requestBody.work_experience || [];
        const educationData = requestBody.education || [];
        const certificationData = requestBody.certification || [];
        
        // Start a transaction by creating a connection
        const connection = await getConnection();
        await connection.beginTransaction();
        
        try {
          // Save site config
          await saveSiteConfig(siteConfigData);
          
          // Save work experience
          await saveWorkExperience(workExperienceData);
          
          // Save education
          await saveEducation(educationData, connection);
          
          // Save certification
          await saveCertification(certificationData, connection);
          
          // Commit the transaction
          await connection.commit();
          
          console.log('All data saved successfully');
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
              message: 'Data updated successfully',
              success: true
            })
          };
        } catch (error) {
          // Rollback the transaction on error
          await connection.rollback();
          console.error('Transaction failed, rolled back:', error);
          
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Failed to update data: ' + error.message,
              success: false
            })
          };
        } finally {
          // Close the connection
          await connection.end();
        }
      } catch (error) {
        console.error('Error updating site config:', error);
        
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Error updating data: ' + error.message,
            success: false
          })
        };
      }
    }
    
    // Handle fallback for unrecognized routes
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' })
    };
  } catch (error) {
    console.error('Unhandled error in Lambda function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error: ' + error.message,
        success: false
      })
    };
  }
}; 