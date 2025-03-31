// Lambda function with MySQL2 support
const mysql = require('mysql2/promise');

// Define standard response headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  'Content-Type': 'application/json'
};

// Default fallback configuration for when database is unavailable
const defaultSiteConfig = {
  image_favicon_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon",
  image_logo_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo",
  image_banner_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner",
  about_title: "Jayant Arora",
  about_subtitle: "Curious Mind. Data Geek. Product Whisperer.",
  about_description: "Ever since I was a kid, I've been that person - the one who asks why, what, and so what? on repeat. Fast forward to today, and not much has changed. I thrive on solving complex problems, breaking down business chaos into structured roadmaps, and turning data into decisions that matter. At AtliQ Technologies, I juggle 10+ projects at once (because why settle for one challenge when you can have ten?), aligning stakeholders, streamlining workflows, and integrating AI to make things smarter, not harder. Before this, I optimized product roadmaps at Unifyed and took a product from 5 users to 10K+ at sGate Tech Solutions. From pre-sales to GTM strategy, AI integration to competitor research - I've done it all, and I'm just getting started. Here's the deal: I obsess over execution, geek out over data, and believe in questioning everything. My approach? Think big, start small, and move fast. If you're looking for someone who can decode business problems, simplify the complex, and actually get things done - let's talk.",
  image_about_profile_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg",
  image_about_photo1_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0138.jpg",
  image_about_photo2_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0915.jpg",
  image_about_photo3_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1461.jpg",
  image_about_photo4_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1627.jpg",
  about_photo1_alt: "Test Photo 1 Alt Text",
  about_photo2_alt: "Test Photo 2 Alt Text",
  about_photo3_alt: "Test Photo 3 Alt Text",
  about_photo4_alt: "Test Photo 4 Alt Text"
};

// Environment variables with updated password
const DB_HOST = process.env.DB_HOST || 'website.ct8aqqkk828w.eu-north-1.rds.amazonaws.com';
const DB_USER = process.env.DB_USER || 'majorjayant';
const DB_PASSWORD = process.env.DB_PASSWORD || 'seemaduhlani'; // Updated password
const DB_NAME = process.env.DB_NAME || 'website';
const DB_PORT = parseInt(process.env.DB_PORT || '3306');
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1';

// Database connection with retry logic
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

// Function to initialize database connection with retry logic
async function initializeDatabase() {
  connectionAttempts++;
  try {
    // Log connection information (for debugging)
    console.log(`Connection attempt: ${connectionAttempts} of ${MAX_CONNECTION_ATTEMPTS}`);
    console.log(`DB_HOST: ${DB_HOST}`);
    console.log(`DB_USER: ${DB_USER}`);
    console.log(`DB_PASSWORD: ********`);
    console.log(`DB_NAME: ${DB_NAME}`);
    console.log(`DB_PORT: ${DB_PORT}`);
    console.log(`AWS_REGION: ${AWS_REGION}`);
    
    // Create connection with timeout
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      connectTimeout: 5000,  // 5 second timeout
      multipleStatements: true  // Allow multiple SQL statements
    });
    
    // Test the connection with a simple query
    await connection.query('SELECT 1 as test');
    console.log('✅ Database connection successful');
    
    // Create site_config table if it doesn't exist
    await createTableIfNotExists(connection);
    
    // Reset counter on success
    connectionAttempts = 0;
    return connection;
  } catch (error) {
    console.error(`❌ Database initialization error (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS}):`, error);
    
    // Retry if we haven't reached the maximum attempts
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      console.log(`Retrying connection in 1 second...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return initializeDatabase(); // Recursive retry
    }
    
    throw error;
  }
}

// Function to create the site_config table if it doesn't exist
async function createTableIfNotExists(connection) {
  try {
    // Check if table exists
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'site_config'
    `);
    
    if (tables.length === 0) {
      console.log('Creating site_config table...');
      
      // Create the table
      await connection.query(`
        CREATE TABLE site_config (
          id INT AUTO_INCREMENT PRIMARY KEY,
          site_title VARCHAR(255),
          site_subtitle VARCHAR(255),
          site_description TEXT,
          logo_url VARCHAR(255),
          banner_url VARCHAR(255),
          contact_email VARCHAR(255),
          image_favicon_url VARCHAR(255),
          image_logo_url VARCHAR(255),
          image_banner_url VARCHAR(255),
          about_title VARCHAR(255),
          about_subtitle VARCHAR(255),
          about_description TEXT,
          image_about_profile_url VARCHAR(255),
          image_about_photo1_url VARCHAR(255),
          image_about_photo2_url VARCHAR(255),
          image_about_photo3_url VARCHAR(255),
          image_about_photo4_url VARCHAR(255),
          about_photo1_alt VARCHAR(255),
          about_photo2_alt VARCHAR(255),
          about_photo3_alt VARCHAR(255),
          about_photo4_alt VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Table created successfully');
      
      // Insert default data
      console.log('Inserting default data...');
      await connection.query(`
        INSERT INTO site_config (
          image_favicon_url,
          image_logo_url,
          image_banner_url,
          about_title,
          about_subtitle,
          about_description,
          image_about_profile_url,
          image_about_photo1_url,
          image_about_photo2_url,
          image_about_photo3_url,
          image_about_photo4_url,
          about_photo1_alt,
          about_photo2_alt,
          about_photo3_alt,
          about_photo4_alt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        defaultSiteConfig.image_favicon_url,
        defaultSiteConfig.image_logo_url,
        defaultSiteConfig.image_banner_url,
        defaultSiteConfig.about_title,
        defaultSiteConfig.about_subtitle,
        defaultSiteConfig.about_description,
        defaultSiteConfig.image_about_profile_url,
        defaultSiteConfig.image_about_photo1_url,
        defaultSiteConfig.image_about_photo2_url,
        defaultSiteConfig.image_about_photo3_url,
        defaultSiteConfig.image_about_photo4_url,
        defaultSiteConfig.about_photo1_alt,
        defaultSiteConfig.about_photo2_alt,
        defaultSiteConfig.about_photo3_alt,
        defaultSiteConfig.about_photo4_alt
      ]);
      
      console.log('Default data inserted successfully');
    } else {
      console.log('site_config table already exists');
    }
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
}

// Function to get site configuration
async function getSiteConfig() {
  let connection = null;
  
  try {
    // Initialize database connection
    connection = await initializeDatabase();
    
    // Query for site configuration
    console.log('Querying database for site configuration');
    const [rows] = await connection.query('SELECT * FROM site_config ORDER BY id DESC LIMIT 1');
    
    if (rows.length === 0) {
      console.log('No site configuration found in database, using default');
      return defaultSiteConfig;
    }
    
    console.log('Retrieved site configuration from database');
    return rows[0];
  } catch (error) {
    console.error('Error getting site config:', error);
    console.log('Returning default site config due to database error');
    return {
      ...defaultSiteConfig,
      _error: error.message
    };
  } finally {
    // Close connection to avoid resource leaks
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
}

// Function to save site configuration
async function saveSiteConfig(config) {
  let connection = null;
  
  try {
    // Initialize database connection
    connection = await initializeDatabase();
    
    // Prepare data for insertion
    const fields = [];
    const placeholders = [];
    const values = [];
    
    // Dynamically build the query based on provided fields
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined) {
        fields.push(key);
        placeholders.push('?');
        values.push(value);
      }
    }
    
    // Build and execute the query
    console.log('Saving site configuration to database');
    const query = `
      INSERT INTO site_config (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
    `;
    
    const [result] = await connection.query(query, values);
    
    console.log('Site configuration saved with ID:', result.insertId);
    return {
      success: true,
      id: result.insertId
    };
  } catch (error) {
    console.error('Error saving site config:', error);
    throw error;
  } finally {
    // Close connection to avoid resource leaks
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
    }
  }
}

// Lambda handler
exports.handler = async (event) => {
  console.log('MySQL2 Lambda Function - Version 1.0.0');
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // Handle OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'CORS preflight request successful' })
      };
    }
    
    // Handle GET request for site configuration with race pattern
    if (event.httpMethod === 'GET' && 
        event.queryStringParameters && 
        event.queryStringParameters.type === 'site_config') {
      
      console.log('Processing GET request for site_config');
      
      // Create a promise that resolves with default data after 3 seconds
      const timeoutPromise = new Promise(resolve => {
        setTimeout(() => {
          console.log('Database connection timed out, using fallback data');
          resolve({
            statusCode: 200,
            headers,
            body: JSON.stringify({
              ...defaultSiteConfig,
              _fallback: true,
              _timeout: true,
              _error: "Database connection timed out"
            })
          });
        }, 3000); // 3 second timeout for faster response
      });
      
      // Create the actual database query promise
      const dbQueryPromise = (async () => {
        try {
          const config = await getSiteConfig();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(config)
          };
        } catch (dbError) {
          console.error('Database query error:', dbError);
          return {
            statusCode: 200, // Return 200 to prevent API Gateway 502 errors
            headers,
            body: JSON.stringify({
              ...defaultSiteConfig,
              _fallback: true,
              _error: dbError.message
            })
          };
        }
      })();
      
      // Return whichever promise resolves first
      return Promise.race([timeoutPromise, dbQueryPromise]);
    }
    
    // Handle POST request to save site configuration
    if (event.httpMethod === 'POST' && 
        event.queryStringParameters && 
        event.queryStringParameters.type === 'site_config') {
      
      console.log('Processing POST request for site_config');
      
      try {
        // Validate body
        if (!event.body) {
          console.error('Missing request body');
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              success: false,
              message: 'Request body is missing' 
            })
          };
        }
        
        // Parse body
        let configData;
        try {
          configData = JSON.parse(event.body);
        } catch (parseError) {
          console.error('Error parsing request body:', parseError);
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              success: false,
              message: 'Invalid JSON in request body' 
            })
          };
        }
        
        // Save configuration
        const result = await saveSiteConfig(configData);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(result)
        };
      } catch (dbError) {
        console.error('Error saving site config:', dbError);
        return {
          statusCode: 200, // Return 200 to prevent API Gateway 502 errors
          headers,
          body: JSON.stringify({ 
            success: false,
            message: 'Could not save configuration to database',
            error: dbError.message
          })
        };
      }
    }
    
    // Default response for unknown routes
    console.log('Unknown request type or missing parameters');
    return {
      statusCode: 200, // Return 200 to prevent API Gateway 502 errors
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Unknown request type. Valid types: site_config'
      })
    };
    
  } catch (error) {
    console.error('Unhandled error in Lambda function:', error);
    
    // Always return 200 to prevent API Gateway 502 errors
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'An unexpected error occurred',
        error: error.message,
        _fallback: event.httpMethod === 'GET' ? defaultSiteConfig : undefined
      })
    };
  }
}; 