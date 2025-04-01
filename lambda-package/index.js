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

// Admin credentials - hardcoded for simplicity
// In a production environment, these should be in a database with proper hashing
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Environment variables for database
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = parseInt(process.env.DB_PORT || '3306');
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1';

// Database connection with retry logic
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

// Function to initialize database connection with retry logic
async function initializeDatabase() {
  connectionAttempts++;
  try {
    // Validate environment variables
    if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
      throw new Error('Missing required database environment variables');
    }
    
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
    
    // Check/create table structure
    await ensureTableStructure(connection);
    
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

// Function to check if site_config table exists and create it if needed
async function ensureTableStructure(connection) {
  try {
    // Check which table structure we have
    let tableExists = false;
    
    try {
      // First, check if the table exists
      const [tables] = await connection.query(`SHOW TABLES LIKE 'site_config'`);
      tableExists = tables.length > 0;
    } catch (error) {
      console.error('Error checking table existence:', error);
      tableExists = false;
    }
    
    // If table doesn't exist, create it as a key-value store
    if (!tableExists) {
      console.log('Creating site_config table as key-value store');
      await connection.query(`
        CREATE TABLE site_config (
          id INT AUTO_INCREMENT PRIMARY KEY,
          config_key VARCHAR(255) NOT NULL,
          config_value TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_config_key (config_key)
        )
      `);
      console.log('Table created successfully');
      
      // Insert default data
      console.log('Inserting default key-value data...');
      
      // Create an array of promises for inserting default values
      const insertPromises = [];
      
      for (const [key, value] of Object.entries(defaultSiteConfig)) {
        if (value !== undefined) {
          insertPromises.push(
            connection.query(
              'INSERT INTO site_config (config_key, config_value) VALUES (?, ?)',
              [key, value]
            )
          );
        }
      }
      
      // Execute all insert queries
      await Promise.all(insertPromises);
      console.log('Default data inserted successfully');
    } else {
      console.log('site_config table already exists');
      
      // Check table structure to determine if it's a key-value store or single-row config
      const [columns] = await connection.query('SHOW COLUMNS FROM site_config');
      const columnNames = columns.map(col => col.Field.toLowerCase());
      
      // If it has config_key and config_value columns, it's a key-value store
      const isKeyValueStore = columnNames.includes('config_key') && columnNames.includes('config_value');
      
      console.log(`Table structure type: ${isKeyValueStore ? 'key-value store' : 'single-row config'}`);
    }
  } catch (error) {
    console.error('Error ensuring table structure:', error);
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
    
    // Check if we're using a key-value store table
    const [columns] = await connection.query('SHOW COLUMNS FROM site_config');
    const columnNames = columns.map(col => col.Field.toLowerCase());
    const isKeyValueStore = columnNames.includes('config_key') && columnNames.includes('config_value');
    
    let config = {};
    
    if (isKeyValueStore) {
      // For key-value store, get all rows and convert to a single config object
      console.log('Using key-value query approach');
      const [rows] = await connection.query('SELECT config_key, config_value FROM site_config');
      
      if (rows.length === 0) {
        console.log('No site configuration found in database, using default');
        return defaultSiteConfig;
      }
      
      // Convert rows to a single config object
      for (const row of rows) {
        config[row.config_key] = row.config_value;
      }
    } else {
      // For single row structure, get the latest row
      console.log('Using single-row query approach');
      const [rows] = await connection.query('SELECT * FROM site_config ORDER BY id DESC LIMIT 1');
      
      if (rows.length === 0) {
        console.log('No site configuration found in database, using default');
        return defaultSiteConfig;
      }
      
      config = rows[0];
    }
    
    console.log('Retrieved site configuration from database');
    
    // Fill in any missing configuration values with defaults
    for (const [key, value] of Object.entries(defaultSiteConfig)) {
      if (config[key] === undefined || config[key] === null || config[key] === '') {
        config[key] = value;
      }
    }
    
    return config;
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
async function saveSiteConfig(configData) {
  let connection = null;
  
  try {
    // Initialize database connection
    connection = await initializeDatabase();
    
    console.log('Saving site configuration to database');
    
    // Check if we're using a key-value store table
    const [columns] = await connection.query('SHOW COLUMNS FROM site_config');
    const columnNames = columns.map(col => col.Field.toLowerCase());
    const isKeyValueStore = columnNames.includes('config_key') && columnNames.includes('config_value');
    
    if (isKeyValueStore) {
      // For key-value store, insert or update each key-value pair
      console.log('Using key-value save approach');
      
      // Create an array of promises for upsert operations
      const upsertPromises = [];
      
      for (const [key, value] of Object.entries(configData)) {
        if (value !== undefined) {
          // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both inserts and updates
          upsertPromises.push(
            connection.query(
              'INSERT INTO site_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)',
              [key, value]
            )
          );
        }
      }
      
      // Execute all upsert queries
      await Promise.all(upsertPromises);
      
      console.log('Site configuration saved successfully (key-value approach)');
    } else {
      // For single row structure, insert a new row
      console.log('Using single-row save approach');
      
      // Prepare data for insertion
      const fields = [];
      const placeholders = [];
      const values = [];
      
      // Dynamically build the query based on provided fields
      for (const [key, value] of Object.entries(configData)) {
        if (value !== undefined) {
          fields.push(key);
          placeholders.push('?');
          values.push(value);
        }
      }
      
      // Build and execute the query
      const query = `
        INSERT INTO site_config (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
      `;
      
      const [result] = await connection.query(query, values);
      console.log('Site configuration saved with ID:', result.insertId);
    }
    
    return {
      success: true,
      message: 'Configuration saved successfully'
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

// Function to handle admin login
async function handleLogin(username, password) {
  console.log('Processing login attempt for user:', username);
  
  // Simple authentication check
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    console.log('Login successful for user:', username);
    return {
      success: true,
      message: "Login successful",
      token: "sample-jwt-token-would-be-here", // In production, generate a proper JWT token
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

// Lambda handler
exports.handler = async (event) => {
  console.log('MySQL2 Lambda Function - Version 1.3.0');
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
    
    // Extract query parameters and determine request type
    const queryParams = event.queryStringParameters || {};
    const pathParams = event.pathParameters || {};
    
    // For debugging
    console.log('Query parameters:', JSON.stringify(queryParams));
    console.log('Path parameters:', JSON.stringify(pathParams));
    
    let requestType = queryParams.type || '';
    
    // Handle GET request for site configuration
    if (event.httpMethod === 'GET' && (requestType === 'site_config' || queryParams.type === 'site_config')) {
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
    if (event.httpMethod === 'POST') {
      console.log('Processing POST request');
      
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
      let parsedBody;
      try {
        parsedBody = JSON.parse(event.body);
        console.log('Parsed body:', JSON.stringify(parsedBody));
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
      
      // Check for different request formats and determine action
      let configData;
      let actionType = parsedBody.action || '';
      
      console.log('Action type detected in request:', actionType);
      
      // Handle login action
      if (actionType === 'login') {
        console.log('Processing login request');
        
        const { username, password } = parsedBody;
        if (!username || !password) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'Username and password are required'
            })
          };
        }
        
        const loginResult = await handleLogin(username, password);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(loginResult)
        };
      }
      
      // Format 1: Direct configuration object with type in query params
      if (requestType === 'site_config') {
        configData = parsedBody;
        actionType = 'site_config';
      } 
      // Format 2: Admin panel format with action and site_config fields
      else if (actionType === 'update_site_config' && parsedBody.site_config) {
        configData = parsedBody.site_config;
        actionType = 'site_config';
      }
      // Format 3: Any other action in the body
      else if (actionType.includes('site_config')) {
        actionType = 'site_config';
        configData = parsedBody.site_config || parsedBody;
      }
      
      console.log('Final action type determined:', actionType);
      
      // Handle site configuration updates
      if (actionType === 'site_config') {
        try {
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
      
      // Unknown action type
      return {
        statusCode: 200, // Return 200 to prevent API Gateway 502 errors
        headers,
        body: JSON.stringify({ 
          success: false,
          message: 'Unknown request type. Valid types: site_config, login'
        })
      };
    }
    
    // Default response for unknown routes
    console.log('Unknown request type or missing parameters');
    return {
      statusCode: 200, // Return 200 to prevent API Gateway 502 errors
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Unknown request type. Valid types: site_config, login'
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