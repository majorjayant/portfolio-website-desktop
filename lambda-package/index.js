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

    // Ensure certifications table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS certifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certification_name VARCHAR(255) NOT NULL,
        issuer_name VARCHAR(255) NOT NULL,
        credential_id VARCHAR(255),
        credential_link VARCHAR(255),
        issued_date DATE NOT NULL,
        expiry_date DATE,
        description TEXT,
        is_deleted TINYINT(1) DEFAULT 0,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Verified certifications table exists');

    // Ensure key_metrics table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS key_metrics (
        metric_id INT AUTO_INCREMENT PRIMARY KEY,
        metric_name VARCHAR(255) NOT NULL,
        metric_value VARCHAR(255) NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Verified key_metrics table exists');

    // Ensure skills_proficiency table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS skills_proficiency (
        skill_id INT AUTO_INCREMENT PRIMARY KEY,
        skill_name VARCHAR(255) NOT NULL,
        proficiency_level INT NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Verified skills_proficiency table exists');

    // Ensure areas_of_expertise table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS areas_of_expertise (
        expertise_id INT AUTO_INCREMENT PRIMARY KEY,
        expertise_category VARCHAR(255) NOT NULL,
        expertise_item VARCHAR(255) NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        category_display_order INT NOT NULL DEFAULT 0,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Verified areas_of_expertise table exists');

    // Ensure toolkit_categories table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS toolkit_categories (
        toolkit_category_id INT AUTO_INCREMENT PRIMARY KEY,
        toolkit_category_name VARCHAR(255) NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Verified toolkit_categories table exists');

    // Ensure toolkit_items table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS toolkit_items (
        toolkit_item_id INT AUTO_INCREMENT PRIMARY KEY,
        toolkit_category_id INT NOT NULL,
        toolkit_item_name VARCHAR(255) NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (toolkit_category_id) REFERENCES toolkit_categories(toolkit_category_id)
      )
    `);
    console.log('Verified toolkit_items table exists');

    // Ensure domain_experience table exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS domain_experience (
        domain_id INT AUTO_INCREMENT PRIMARY KEY,
        domain_name VARCHAR(255) NOT NULL,
        experience_percentage INT NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Verified domain_experience table exists');

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
    // Create the education table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS education (
        id INT AUTO_INCREMENT PRIMARY KEY,
        edu_title VARCHAR(255) NOT NULL,
        edu_name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        from_date DATE NOT NULL,
        to_date DATE,
        is_current BOOLEAN DEFAULT FALSE,
        is_deleted TINYINT(1) DEFAULT 0,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    // Create the certifications table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS certifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        certification_name VARCHAR(255) NOT NULL,
        issuer_name VARCHAR(255) NOT NULL,
        credential_id VARCHAR(255),
        credential_link VARCHAR(255),
        issued_date DATE NOT NULL,
        expiry_date DATE,
        description TEXT,
        is_deleted TINYINT(1) DEFAULT 0,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

// Function to get certifications data from the database
async function getCertifications() {
  let connection;
  try {
    // Create a connection to the database
    connection = await getConnection();
    
    // First, check if table exists and create it if it doesn't
    await ensureCertificationsTableExists(connection);
    
    // Query non-deleted certification entries ordered by issued_date (most recent first)
    const [rows] = await connection.execute(
      'SELECT * FROM certifications WHERE is_deleted = 0 ORDER BY issued_date DESC'
    );
    console.log(`Retrieved ${rows.length} non-deleted certification entries from the database`);
    
    // Debug - log the first row to see what fields are actually present
    if (rows.length > 0) {
      console.log('First certification DB row (non-deleted):', JSON.stringify(rows[0]));
    }
    
    // Format the data for response
    const certifications = rows.map(row => {
      const certObj = {
        id: row.id,
        certification_name: row.certification_name || '',
        issuer_name: row.issuer_name || '',
        credential_id: row.credential_id || null,
        credential_link: row.credential_link || null,
        issued_date: row.issued_date ? row.issued_date.toISOString().split('T')[0] : null,
        expiry_date: row.expiry_date ? row.expiry_date.toISOString().split('T')[0] : null,
        description: row.description || null,
        is_deleted: row.is_deleted === 1
      };
      
      return certObj;
    });
    
    return certifications;
  } catch (error) {
    console.error('Error retrieving certifications from database:', error);
    console.log('Returning empty certifications array');
    return [];
  } finally {
    if (connection) await connection.end();
  }
}

// Function to save certification data
async function saveCertifications(certificationsData, connection) {
  console.log('Saving certifications data:', certificationsData);
  
  // Check if the data is an array
  if (!Array.isArray(certificationsData)) {
    console.error('certificationsData is not an array');
    throw new Error('Certification data must be an array');
  }
  
  // Prepare our operation promises
  const softDeletePromises = [];
  const updatePromises = [];
  const insertPromises = [];
  
  // Process each certification item
  for (const item of certificationsData) {
    console.log(`Processing certification item:`, item);
    
    // Extract ID and deletion status
    const itemId = item.id || null;
    const isDeleted = parseInt(item.is_deleted || 0);
    
    // Format dates correctly
    const issuedDate = item.issued_date || null;
    const expiryDate = item.expiry_date || null;
    
    // For existing item with ID
    if (itemId) {
      if (isDeleted === 1) {
        console.log(`Preparing soft delete for certification ID ${itemId}`);
        // Soft delete - mark as deleted in DB
        softDeletePromises.push(
          connection.execute(
            'UPDATE certifications SET is_deleted = 1, updated_date = NOW() WHERE id = ?',
            [itemId]
          ).then(([result]) => {
            console.log(`Soft delete result for certification ID ${itemId}: Affected rows: ${result.affectedRows}`);
            return result;
          }).catch(err => {
            console.error(`Error during soft delete for certification ID ${itemId}:`, err);
            throw err; // Propagate error to fail transaction
          })
        );
      } else {
        console.log(`Preparing update for certification ID ${itemId}: ${item.certification_name}`);
        // Update existing record
        updatePromises.push(
          connection.execute(
            `UPDATE certifications SET 
              certification_name = ?,
              issuer_name = ?,
              credential_id = ?,
              credential_link = ?,
              issued_date = ?,
              expiry_date = ?,
              description = ?,
              is_deleted = 0,
              updated_date = NOW()
             WHERE id = ?`,
            [
              item.certification_name || '',
              item.issuer_name || '',
              item.credential_id || null,
              item.credential_link || null,
              issuedDate,
              expiryDate,
              item.description || null,
              itemId
            ]
          ).then(([result]) => {
            console.log(`Update result for certification ID ${itemId}: Affected rows: ${result.affectedRows}`);
            if (result.affectedRows === 0) {
              console.warn(`Update for certification item ${itemId} affected 0 rows (possibly no changes or item not found).`);
            }
            return result;
          }).catch(err => {
            console.error(`Error during update for certification ID ${itemId}:`, err);
            throw err; // Propagate error to fail transaction
          })
        );
      }
    } else if (isDeleted === 0) { // New item (only if not marked for deletion)
      console.log(`Preparing insert for new certification item: ${item.certification_name}`);
      insertPromises.push(
        connection.execute(
          `INSERT INTO certifications
            (certification_name, issuer_name, credential_id, credential_link, issued_date, expiry_date, description, is_deleted, created_date, updated_date)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
          [
            item.certification_name || '',
            item.issuer_name || '',
            item.credential_id || null,
            item.credential_link || null,
            issuedDate,
            expiryDate,
            item.description || null
          ]
        ).then(([result]) => {
          console.log(`Insert result for certification '${item.certification_name}': Insert ID: ${result.insertId}, Affected rows: ${result.affectedRows}`);
          if (result.affectedRows !== 1) {
            console.error(`Insert for certification '${item.certification_name}' failed or did not insert exactly one row.`);
            throw new Error(`Failed to insert certification item: ${item.certification_name}`);
          }
          return result;
        }).catch(err => {
          console.error(`Error during insert for certification '${item.certification_name}':`, err);
          throw err; // Propagate error to fail transaction
        })
      );
    } else {
      console.log(`Ignoring new certification item marked for deletion: ${item.certification_name}`);
    }
  }

  // Execute all promises
  try {
    console.log(`Executing ${softDeletePromises.length} soft deletes, ${updatePromises.length} updates, ${insertPromises.length} inserts for certifications.`);
    await Promise.all(softDeletePromises);
    await Promise.all(updatePromises);
    await Promise.all(insertPromises);
    console.log('All certification operations executed successfully.');
  } catch (error) {
    console.error('Error executing certification save operations:', error);
    // Error is already logged by individual promise catches, re-throw to ensure transaction rollback
    throw error;
  }
}

// Function to ensure contacts table exists
async function ensureContactsTableExists(connection) {
  try {
    // Create contacts table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        message TEXT NOT NULL,
        is_anonymous BOOLEAN DEFAULT FALSE,
        ip_address VARCHAR(50),
        country VARCHAR(100),
        city VARCHAR(100),
        region VARCHAR(100),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Verified contacts table exists');
    return true;
  } catch (error) {
    console.error('Error ensuring contacts table exists:', error);
    throw error;
  }
}

// Function to save contact form submission
async function saveContactSubmission(contactData) {
  let connection;
  try {
    // Get a database connection
    connection = await getConnection();
    
    // Ensure the contacts table exists
    await ensureContactsTableExists(connection);
    
    // Extract data from the request
    const {
      name, 
      email, 
      phone, 
      message, 
      isAnonymous,
      ip_address,
      location
    } = contactData;
    
    // Prepare location data
    const country = location?.country || 'Unknown';
    const city = location?.city || 'Unknown';
    const region = location?.region || 'Unknown';
    const latitude = location?.latitude || null;
    const longitude = location?.longitude || null;
    
    // Insert the contact form submission into the database
    const [result] = await connection.execute(
      `INSERT INTO contacts 
      (name, email, phone, message, is_anonymous, ip_address, country, city, region, latitude, longitude, submission_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        isAnonymous ? null : (name || null),
        isAnonymous ? null : (email || null),
        isAnonymous ? null : (phone || null),
        message,
        isAnonymous ? 1 : 0,
        ip_address || null,
        country,
        city,
        region,
        latitude,
        longitude
      ]
    );
    
    console.log(`Contact form submission saved. Insert ID: ${result.insertId}`);
    return {
      success: true,
      message: "Contact form submission saved successfully",
      id: result.insertId
    };
  } catch (error) {
    console.error('Error saving contact form submission:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

// Function to get all contact form submissions
async function getContactSubmissions() {
  let connection;
  try {
    // Get a database connection
    connection = await getConnection();
    
    // Ensure the contacts table exists
    await ensureContactsTableExists(connection);
    
    // Query non-deleted contact submissions ordered by submission date (most recent first)
    const [rows] = await connection.execute(
      'SELECT * FROM contacts WHERE is_deleted = 0 ORDER BY submission_date DESC'
    );
    
    console.log(`Retrieved ${rows.length} contact form submissions from the database`);
    return rows;
  } catch (error) {
    console.error('Error retrieving contact submissions:', error);
    return [];
  } finally {
    if (connection) await connection.end();
  }
}

// Function to ensure the skills tables exist
async function ensureSkillsTablesExist(connection) {
  try {
    // Create the key_metrics table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS key_metrics (
        metric_id INT AUTO_INCREMENT PRIMARY KEY,
        metric_name VARCHAR(255) NOT NULL,
        metric_value VARCHAR(255) NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Verified key_metrics table exists');

    // Create the skills_proficiency table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS skills_proficiency (
        skill_id INT AUTO_INCREMENT PRIMARY KEY,
        skill_name VARCHAR(255) NOT NULL,
        proficiency_level INT NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Verified skills_proficiency table exists');

    // Create the areas_of_expertise table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS areas_of_expertise (
        expertise_id INT AUTO_INCREMENT PRIMARY KEY,
        expertise_category VARCHAR(255) NOT NULL,
        expertise_item VARCHAR(255) NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        category_display_order INT NOT NULL DEFAULT 0,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Verified areas_of_expertise table exists');

    // Create the toolkit_categories table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS toolkit_categories (
        toolkit_category_id INT AUTO_INCREMENT PRIMARY KEY,
        toolkit_category_name VARCHAR(255) NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Verified toolkit_categories table exists');

    // Create the toolkit_items table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS toolkit_items (
        toolkit_item_id INT AUTO_INCREMENT PRIMARY KEY,
        toolkit_category_id INT NOT NULL,
        toolkit_item_name VARCHAR(255) NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (toolkit_category_id) REFERENCES toolkit_categories(toolkit_category_id)
      )
    `);
    console.log('Verified toolkit_items table exists');

    // Create the domain_experience table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS domain_experience (
        domain_id INT AUTO_INCREMENT PRIMARY KEY,
        domain_name VARCHAR(255) NOT NULL,
        experience_percentage INT NOT NULL,
        display_order INT NOT NULL DEFAULT 0,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE
      )
    `);
    console.log('Verified domain_experience table exists');
    
    return true;
  } catch (error) {
    console.error('Error ensuring skills tables exist:', error);
    throw error;
  }
}

// Function to get skills data from the database
async function getSkillsData() {
  let connection;
  try {
    connection = await getConnection();
    
    // First, check if tables exist and create them if they don't
    await ensureSkillsTablesExist(connection);
    
    // Initialize the skills data structure
    const skillsData = {
      key_metrics: [],
      skills_proficiency: [],
      areas_of_expertise: [],
      toolkit_categories: [],
      toolkit_items: [],
      domain_experience: []
    };
    
    // Query key_metrics
    const [keyMetricsRows] = await connection.execute(
      'SELECT * FROM key_metrics WHERE is_deleted = 0 ORDER BY display_order ASC'
    );
    skillsData.key_metrics = keyMetricsRows.map(row => ({
      metric_id: row.metric_id,
      metric_name: row.metric_name || '',
      metric_value: row.metric_value || '',
      display_order: row.display_order || 0,
      is_deleted: row.is_deleted === 1
    }));
    console.log(`Retrieved ${skillsData.key_metrics.length} key metrics`);
    
    // Query skills_proficiency
    const [skillsProficiencyRows] = await connection.execute(
      'SELECT * FROM skills_proficiency WHERE is_deleted = 0 ORDER BY display_order ASC'
    );
    skillsData.skills_proficiency = skillsProficiencyRows.map(row => ({
      skill_id: row.skill_id,
      skill_name: row.skill_name || '',
      proficiency_level: row.proficiency_level || 0,
      display_order: row.display_order || 0,
      is_deleted: row.is_deleted === 1
    }));
    console.log(`Retrieved ${skillsData.skills_proficiency.length} skill proficiencies`);
    
    // Query areas_of_expertise
    const [areasOfExpertiseRows] = await connection.execute(
      'SELECT * FROM areas_of_expertise WHERE is_deleted = 0 ORDER BY category_display_order ASC, display_order ASC'
    );
    skillsData.areas_of_expertise = areasOfExpertiseRows.map(row => ({
      expertise_id: row.expertise_id,
      expertise_category: row.expertise_category || '',
      expertise_item: row.expertise_item || '',
      display_order: row.display_order || 0,
      category_display_order: row.category_display_order || 0,
      is_deleted: row.is_deleted === 1
    }));
    console.log(`Retrieved ${skillsData.areas_of_expertise.length} expertise items`);
    
    // Query toolkit_categories
    const [toolkitCategoriesRows] = await connection.execute(
      'SELECT * FROM toolkit_categories WHERE is_deleted = 0 ORDER BY display_order ASC'
    );
    skillsData.toolkit_categories = toolkitCategoriesRows.map(row => ({
      toolkit_category_id: row.toolkit_category_id,
      toolkit_category_name: row.toolkit_category_name || '',
      display_order: row.display_order || 0,
      is_deleted: row.is_deleted === 1
    }));
    console.log(`Retrieved ${skillsData.toolkit_categories.length} toolkit categories`);
    
    // Query toolkit_items
    const [toolkitItemsRows] = await connection.execute(
      'SELECT * FROM toolkit_items WHERE is_deleted = 0 ORDER BY toolkit_category_id ASC, display_order ASC'
    );
    skillsData.toolkit_items = toolkitItemsRows.map(row => ({
      toolkit_item_id: row.toolkit_item_id,
      toolkit_category_id: row.toolkit_category_id,
      toolkit_item_name: row.toolkit_item_name || '',
      display_order: row.display_order || 0,
      is_deleted: row.is_deleted === 1
    }));
    console.log(`Retrieved ${skillsData.toolkit_items.length} toolkit items`);
    
    // Query domain_experience
    const [domainExperienceRows] = await connection.execute(
      'SELECT * FROM domain_experience WHERE is_deleted = 0 ORDER BY display_order ASC'
    );
    skillsData.domain_experience = domainExperienceRows.map(row => ({
      domain_id: row.domain_id,
      domain_name: row.domain_name || '',
      experience_percentage: row.experience_percentage || 0,
      display_order: row.display_order || 0,
      is_deleted: row.is_deleted === 1
    }));
    console.log(`Retrieved ${skillsData.domain_experience.length} domain experience items`);
    
    return skillsData;
  } catch (error) {
    console.error('Error retrieving skills data from database:', error);
    console.log('Returning empty skills data object');
    return {
      key_metrics: [],
      skills_proficiency: [],
      areas_of_expertise: [],
      toolkit_categories: [],
      toolkit_items: [],
      domain_experience: []
    };
  } finally {
    if (connection) await connection.end();
  }
}

// Function to save skills data
async function saveSkillsData(skillsData, connection) {
  console.log('Saving skills data:', skillsData);
  
  // Check if connection is provided
  if (!connection) {
    throw new Error('Connection is required for saveSkillsData');
  }
  
  try {
    // Save Key Metrics
    if (Array.isArray(skillsData.key_metrics)) {
      await saveKeyMetrics(skillsData.key_metrics, connection);
    }
    
    // Save Skills Proficiency
    if (Array.isArray(skillsData.skills_proficiency)) {
      await saveSkillsProficiency(skillsData.skills_proficiency, connection);
    }
    
    // Save Areas of Expertise
    if (Array.isArray(skillsData.areas_of_expertise)) {
      await saveAreasOfExpertise(skillsData.areas_of_expertise, connection);
    }
    
    // Save Toolkit Categories
    if (Array.isArray(skillsData.toolkit_categories)) {
      await saveToolkitCategories(skillsData.toolkit_categories, connection);
    }
    
    // Save Toolkit Items
    if (Array.isArray(skillsData.toolkit_items)) {
      await saveToolkitItems(skillsData.toolkit_items, connection);
    }
    
    // Save Domain Experience
    if (Array.isArray(skillsData.domain_experience)) {
      await saveDomainExperience(skillsData.domain_experience, connection);
    }
    
    console.log('All skills data saved successfully');
    
  } catch (error) {
    console.error('Error saving skills data:', error);
    throw error;
  }
}

// Function to save key metrics
async function saveKeyMetrics(metrics, connection) {
  console.log('Saving key metrics:', metrics);
  
  // Prepare operations
  const softDeletePromises = [];
  const updatePromises = [];
  const insertPromises = [];
  
  for (const item of metrics) {
    const itemId = item.metric_id || null;
    const isDeleted = parseInt(item.is_deleted || 0);
    
    // For existing item with ID
    if (itemId) {
      if (isDeleted === 1) {
        console.log(`Preparing soft delete for metric ID ${itemId}`);
        softDeletePromises.push(
          connection.execute(
            'UPDATE key_metrics SET is_deleted = 1, updated_date = NOW() WHERE metric_id = ?',
            [itemId]
          )
        );
      } else {
        console.log(`Preparing update for metric ID ${itemId}: ${item.metric_name}`);
        updatePromises.push(
          connection.execute(
            `UPDATE key_metrics SET 
              metric_name = ?,
              metric_value = ?,
              display_order = ?,
              is_deleted = 0,
              updated_date = NOW()
             WHERE metric_id = ?`,
            [
              item.metric_name || '',
              item.metric_value || '',
              item.display_order || 0,
              itemId
            ]
          )
        );
      }
    } else if (isDeleted !== 1) {
      console.log(`Preparing insert for new metric: ${item.metric_name}`);
      insertPromises.push(
        connection.execute(
          `INSERT INTO key_metrics
            (metric_name, metric_value, display_order, created_date, updated_date, is_deleted)
           VALUES (?, ?, ?, NOW(), NOW(), 0)`,
          [
            item.metric_name || '',
            item.metric_value || '',
            item.display_order || 0
          ]
        )
      );
    }
  }
  
  // Execute all promises
  await Promise.all(softDeletePromises);
  await Promise.all(updatePromises);
  await Promise.all(insertPromises);
  console.log('All key metrics operations executed successfully.');
}

// Function to save skills proficiency
async function saveSkillsProficiency(skills, connection) {
  console.log('Saving skills proficiency:', skills);
  
  // Prepare operations
  const softDeletePromises = [];
  const updatePromises = [];
  const insertPromises = [];
  
  for (const item of skills) {
    const itemId = item.skill_id || null;
    const isDeleted = parseInt(item.is_deleted || 0);
    
    // For existing item with ID
    if (itemId) {
      if (isDeleted === 1) {
        console.log(`Preparing soft delete for skill ID ${itemId}`);
        softDeletePromises.push(
          connection.execute(
            'UPDATE skills_proficiency SET is_deleted = 1, updated_date = NOW() WHERE skill_id = ?',
            [itemId]
          )
        );
      } else {
        console.log(`Preparing update for skill ID ${itemId}: ${item.skill_name}`);
        updatePromises.push(
          connection.execute(
            `UPDATE skills_proficiency SET 
              skill_name = ?,
              proficiency_level = ?,
              display_order = ?,
              is_deleted = 0,
              updated_date = NOW()
             WHERE skill_id = ?`,
            [
              item.skill_name || '',
              item.proficiency_level || 0,
              item.display_order || 0,
              itemId
            ]
          )
        );
      }
    } else if (isDeleted !== 1) {
      console.log(`Preparing insert for new skill: ${item.skill_name}`);
      insertPromises.push(
        connection.execute(
          `INSERT INTO skills_proficiency
            (skill_name, proficiency_level, display_order, created_date, updated_date, is_deleted)
           VALUES (?, ?, ?, NOW(), NOW(), 0)`,
          [
            item.skill_name || '',
            item.proficiency_level || 0,
            item.display_order || 0
          ]
        )
      );
    }
  }
  
  // Execute all promises
  await Promise.all(softDeletePromises);
  await Promise.all(updatePromises);
  await Promise.all(insertPromises);
  console.log('All skills proficiency operations executed successfully.');
}

// Function to save areas of expertise
async function saveAreasOfExpertise(expertiseItems, connection) {
  console.log('Saving areas of expertise:', expertiseItems);
  
  // Prepare operations
  const softDeletePromises = [];
  const updatePromises = [];
  const insertPromises = [];
  
  for (const item of expertiseItems) {
    const itemId = item.expertise_id || null;
    const isDeleted = parseInt(item.is_deleted || 0);
    
    // For existing item with ID
    if (itemId) {
      if (isDeleted === 1) {
        console.log(`Preparing soft delete for expertise ID ${itemId}`);
        softDeletePromises.push(
          connection.execute(
            'UPDATE areas_of_expertise SET is_deleted = 1, updated_date = NOW() WHERE expertise_id = ?',
            [itemId]
          )
        );
      } else {
        console.log(`Preparing update for expertise ID ${itemId}: ${item.expertise_item}`);
        updatePromises.push(
          connection.execute(
            `UPDATE areas_of_expertise SET 
              expertise_category = ?,
              expertise_item = ?,
              display_order = ?,
              category_display_order = ?,
              is_deleted = 0,
              updated_date = NOW()
             WHERE expertise_id = ?`,
            [
              item.expertise_category || '',
              item.expertise_item || '',
              item.display_order || 0,
              item.category_display_order || 0,
              itemId
            ]
          )
        );
      }
    } else if (isDeleted !== 1) {
      console.log(`Preparing insert for new expertise item: ${item.expertise_item}`);
      insertPromises.push(
        connection.execute(
          `INSERT INTO areas_of_expertise
            (expertise_category, expertise_item, display_order, category_display_order, created_date, updated_date, is_deleted)
           VALUES (?, ?, ?, ?, NOW(), NOW(), 0)`,
          [
            item.expertise_category || '',
            item.expertise_item || '',
            item.display_order || 0,
            item.category_display_order || 0
          ]
        )
      );
    }
  }
  
  // Execute all promises
  await Promise.all(softDeletePromises);
  await Promise.all(updatePromises);
  await Promise.all(insertPromises);
  console.log('All areas of expertise operations executed successfully.');
}

// Function to save toolkit categories
async function saveToolkitCategories(categories, connection) {
  console.log('Saving toolkit categories:', categories);
  
  // Prepare operations
  const softDeletePromises = [];
  const updatePromises = [];
  const insertPromises = [];
  
  for (const item of categories) {
    const itemId = item.toolkit_category_id || null;
    const isDeleted = parseInt(item.is_deleted || 0);
    
    // For existing item with ID
    if (itemId) {
      if (isDeleted === 1) {
        console.log(`Preparing soft delete for toolkit category ID ${itemId}`);
        softDeletePromises.push(
          connection.execute(
            'UPDATE toolkit_categories SET is_deleted = 1, updated_date = NOW() WHERE toolkit_category_id = ?',
            [itemId]
          )
        );
      } else {
        console.log(`Preparing update for toolkit category ID ${itemId}: ${item.toolkit_category_name}`);
        updatePromises.push(
          connection.execute(
            `UPDATE toolkit_categories SET 
              toolkit_category_name = ?,
              display_order = ?,
              is_deleted = 0,
              updated_date = NOW()
             WHERE toolkit_category_id = ?`,
            [
              item.toolkit_category_name || '',
              item.display_order || 0,
              itemId
            ]
          )
        );
      }
    } else if (isDeleted !== 1) {
      console.log(`Preparing insert for new toolkit category: ${item.toolkit_category_name}`);
      insertPromises.push(
        connection.execute(
          `INSERT INTO toolkit_categories
            (toolkit_category_name, display_order, created_date, updated_date, is_deleted)
           VALUES (?, ?, NOW(), NOW(), 0)`,
          [
            item.toolkit_category_name || '',
            item.display_order || 0
          ]
        )
      );
    }
  }
  
  // Execute all promises
  await Promise.all(softDeletePromises);
  await Promise.all(updatePromises);
  await Promise.all(insertPromises);
  console.log('All toolkit categories operations executed successfully.');
}

// Function to save toolkit items
async function saveToolkitItems(items, connection) {
  console.log('Saving toolkit items:', items);
  
  // Prepare operations
  const softDeletePromises = [];
  const updatePromises = [];
  const insertPromises = [];
  
  for (const item of items) {
    const itemId = item.toolkit_item_id || null;
    const isDeleted = parseInt(item.is_deleted || 0);
    
    // For existing item with ID
    if (itemId) {
      if (isDeleted === 1) {
        console.log(`Preparing soft delete for toolkit item ID ${itemId}`);
        softDeletePromises.push(
          connection.execute(
            'UPDATE toolkit_items SET is_deleted = 1, updated_date = NOW() WHERE toolkit_item_id = ?',
            [itemId]
          )
        );
      } else {
        console.log(`Preparing update for toolkit item ID ${itemId}: ${item.toolkit_item_name}`);
        updatePromises.push(
          connection.execute(
            `UPDATE toolkit_items SET 
              toolkit_category_id = ?,
              toolkit_item_name = ?,
              display_order = ?,
              is_deleted = 0,
              updated_date = NOW()
             WHERE toolkit_item_id = ?`,
            [
              item.toolkit_category_id || 0,
              item.toolkit_item_name || '',
              item.display_order || 0,
              itemId
            ]
          )
        );
      }
    } else if (isDeleted !== 1) {
      console.log(`Preparing insert for new toolkit item: ${item.toolkit_item_name}`);
      insertPromises.push(
        connection.execute(
          `INSERT INTO toolkit_items
            (toolkit_category_id, toolkit_item_name, display_order, created_date, updated_date, is_deleted)
           VALUES (?, ?, ?, NOW(), NOW(), 0)`,
          [
            item.toolkit_category_id || 0,
            item.toolkit_item_name || '',
            item.display_order || 0
          ]
        )
      );
    }
  }
  
  // Execute all promises
  await Promise.all(softDeletePromises);
  await Promise.all(updatePromises);
  await Promise.all(insertPromises);
  console.log('All toolkit items operations executed successfully.');
}

// Function to save domain experience
async function saveDomainExperience(domains, connection) {
  console.log('Saving domain experience:', domains);
  
  // Prepare operations
  const softDeletePromises = [];
  const updatePromises = [];
  const insertPromises = [];
  
  for (const item of domains) {
    const itemId = item.domain_id || null;
    const isDeleted = parseInt(item.is_deleted || 0);
    
    // For existing item with ID
    if (itemId) {
      if (isDeleted === 1) {
        console.log(`Preparing soft delete for domain ID ${itemId}`);
        softDeletePromises.push(
          connection.execute(
            'UPDATE domain_experience SET is_deleted = 1, updated_date = NOW() WHERE domain_id = ?',
            [itemId]
          )
        );
      } else {
        console.log(`Preparing update for domain ID ${itemId}: ${item.domain_name}`);
        updatePromises.push(
          connection.execute(
            `UPDATE domain_experience SET 
              domain_name = ?,
              experience_percentage = ?,
              display_order = ?,
              is_deleted = 0,
              updated_date = NOW()
             WHERE domain_id = ?`,
            [
              item.domain_name || '',
              item.experience_percentage || 0,
              item.display_order || 0,
              itemId
            ]
          )
        );
      }
    } else if (isDeleted !== 1) {
      console.log(`Preparing insert for new domain: ${item.domain_name}`);
      insertPromises.push(
        connection.execute(
          `INSERT INTO domain_experience
            (domain_name, experience_percentage, display_order, created_date, updated_date, is_deleted)
           VALUES (?, ?, ?, NOW(), NOW(), 0)`,
          [
            item.domain_name || '',
            item.experience_percentage || 0,
            item.display_order || 0
          ]
        )
      );
    }
  }
  
  // Execute all promises
  await Promise.all(softDeletePromises);
  await Promise.all(updatePromises);
  await Promise.all(insertPromises);
  console.log('All domain experience operations executed successfully.');
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
        body: ''
      };
    }
    
    // Extract query parameters and path parameters
    const queryParams = event.queryStringParameters || {};
    const pathParams = event.pathParameters || {};
    const actionType = queryParams.action || '';
    const requestType = queryParams.type || '';
    
    console.log('Action Type:', actionType);
    console.log('Request Type:', requestType);
    
    // Extract and log query parameters
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
      
      // Check for certifications request
      if (requestType === 'certifications') {
        console.log('GET request for certifications detected');
        const certifications = await getCertifications();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            certifications: certifications,
            _version: "2.1.14",
            source: "GET handler for certifications",
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
        // Get certifications data
        const certifications = await getCertifications();
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            site_config: siteConfig,
            work_experience: workExperience,
            education: education,
            certifications: certifications,
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
      // Get certifications data
      const certifications = await getCertifications();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          site_config: siteConfig,
          work_experience: workExperience,
          education: education,
          certifications: certifications,
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
        // Get certifications data
        const certifications = await getCertifications();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                site_config: siteConfig,
                work_experience: workExperience,
                education: education,
                certifications: certifications,
                _version: "2.1.14",
                from: "query_parameters",
                timestamp: new Date().toISOString(),
                storage: "Using MySQL persistent storage with Lambda Proxy Integration"
            })
        };
    }
    
    // If this is a POST request, process the body
    if (event.httpMethod === 'POST') {
      if (!event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Missing request body',
            timestamp: new Date().toISOString()
          })
        };
      }
      
      // Parse the request body
      let parsedBody;
      try {
        parsedBody = JSON.parse(event.body);
        console.log('Parsed request body successfully');
      } catch (error) {
        console.error('Error parsing request body:', error);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Invalid JSON in request body',
            timestamp: new Date().toISOString()
          })
        };
      }
      
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
          
          // Ensure tables exist (reusing connection)
          await ensureEducationTableExists(connection);
          await ensureCertificationsTableExists(connection);
          
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
          
          // Save the certifications data if provided
          const certificationsData = parsedBody.certifications || [];
          if (certificationsData.length > 0) {
            console.log('Updating certifications data with:', certificationsData);
            await saveCertifications(certificationsData, connection);
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
      
      // Handle contact form submission
      if (actionType === 'submit_contact' || requestType === 'contacts' || event.path.includes('/contacts')) {
        console.log('Processing contact form submission');
        
        try {
          // Save the contact form submission
          const result = await saveContactSubmission(parsedBody);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: "Contact submission saved successfully",
              timestamp: new Date().toISOString(),
              id: result.id
            })
          };
        } catch (error) {
          console.error('Error saving contact submission:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'Error saving contact submission',
              error: error.message,
              timestamp: new Date().toISOString()
            })
          };
        }
      }
      
      // Handle retrieving contact submissions (admin only)
      if (actionType === 'get_contacts') {
        console.log('Processing get contacts request');
        
        // Check for admin authentication token
        const authToken = event.headers.Authorization || '';
        if (!authToken.includes('admin-token-')) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'Unauthorized. Admin access required.',
              timestamp: new Date().toISOString()
            })
          };
        }
        
        try {
          // Get all contact submissions
          const contactSubmissions = await getContactSubmissions();
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              contacts: contactSubmissions,
              count: contactSubmissions.length,
              timestamp: new Date().toISOString()
            })
          };
        } catch (error) {
          console.error('Error retrieving contact submissions:', error);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'Error retrieving contact submissions',
              error: error.message,
              timestamp: new Date().toISOString()
            })
          };
        }
      }
      
      // Process save_config_all request with contact functionality
      if (actionType === 'save_config_all') {
        console.log('Processing save_config_all request');
        
        // Extract data from the request body
        const configData = parsedBody.site_config || {};
        const workExperienceData = parsedBody.work_experience || [];
        const educationData = parsedBody.education || [];
        let connection;
        
        try {
          connection = await getConnection();
          await connection.beginTransaction();
          
          // Ensure tables exist (reusing connection)
          await ensureEducationTableExists(connection);
          await ensureCertificationsTableExists(connection);
          await ensureContactsTableExists(connection);
          
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
          
          // Save the certifications data if provided
          const certificationsData = parsedBody.certifications || [];
          if (certificationsData.length > 0) {
            console.log('Updating certifications data with:', certificationsData);
            await saveCertifications(certificationsData, connection);
          }
          
          // Save skills data if provided
          const skillsData = parsedBody.skills || {};
          if (Object.keys(skillsData).length > 0) {
            console.log('Updating skills data');
            await saveSkillsData(skillsData, connection);
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
              lambda_version: '2.1.15'
            })
          };
        }
        catch (error) {
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