const mysql = require('mysql2/promise');

// Define CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  'Content-Type': 'application/json'
};

// Environment variables
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT || 3306;

// Default fallback configuration
const defaultSiteConfig = {
  site_title: "Portfolio Website",
  site_subtitle: "Showcase of My Work and Skills",
  site_description: "A personal portfolio showcasing projects, skills, and achievements.",
  logo_url: "/images/logo.png",
  banner_url: "/images/banner.jpg",
  _fallback: true,
  timestamp: new Date().toISOString()
};

// Database connection
let connection = null;

const initializeDatabase = async () => {
  try {
    console.log(`Connecting to database ${DB_NAME} at ${DB_HOST}:${DB_PORT} as ${DB_USER}`);
    
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: parseInt(DB_PORT),
      connectTimeout: 5000  // 5 second timeout
    });
    
    console.log('Successfully connected to database');
    return connection;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Lambda handler with improved error handling
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  // Handle OPTIONS requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight handled successfully' })
    };
  }
  
  try {
    // Handle GET requests
    if (event.httpMethod === 'GET') {
      try {
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
                _error: "Database connection timed out"
              })
            });
          }, 3000);
        });
        
        // Create the actual database query promise
        const dbQueryPromise = (async () => {
          try {
            if (!connection) {
              await initializeDatabase();
            }
            
            // Query the database for site config
            console.log('Querying database for site configuration');
            const [rows] = await connection.query('SELECT * FROM site_config ORDER BY id DESC LIMIT 1');
            
            if (rows.length === 0) {
              console.log('No site configuration found in database, using default');
              return {
                statusCode: 200,
                headers,
                body: JSON.stringify(defaultSiteConfig)
              };
            }
            
            console.log('Retrieved site configuration from database');
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify(rows[0])
            };
          } catch (dbError) {
            console.error('Database error:', dbError);
            // Return 200 with fallback data instead of 500
            return {
              statusCode: 200,
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
      } catch (error) {
        console.error('Error handling GET request:', error);
        return {
          statusCode: 200, // Still return 200 with fallback
          headers,
          body: JSON.stringify({
            ...defaultSiteConfig,
            _fallback: true,
            _error: error.message
          })
        };
      }
    }
    
    // Handle POST requests with better error handling
    if (event.httpMethod === 'POST') {
      try {
        console.log('Processing POST request');
        
        // Parse request body safely
        let requestBody;
        try {
          requestBody = JSON.parse(event.body || '{}');
          console.log('Parsed request body:', requestBody);
        } catch (parseError) {
          console.error('Error parsing request body:', parseError);
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Invalid request format',
              message: 'Could not parse request body as JSON'
            })
          };
        }
        
        // Handle site config update
        if (requestBody.action === 'update_site_config') {
          console.log('Handling site_config update with data:', requestBody.site_config);
          
          if (!requestBody.site_config) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'Missing data',
                message: 'site_config data is required'
              })
            };
          }
          
          try {
            // Initialize database connection
            if (!connection) {
              await initializeDatabase();
            }
            
            // Extract values from site_config
            const config = requestBody.site_config;
            
            // Create columns and values for insertion
            const columns = Object.keys(config).join(', ');
            const placeholders = Object.keys(config).map(() => '?').join(', ');
            const values = Object.values(config);
            
            console.log('Inserting data with columns:', columns);
            console.log('Values:', values);
            
            // Using parameterized query to prevent SQL injection
            const query = `INSERT INTO site_config (${columns}) VALUES (${placeholders})`;
            console.log('Executing query:', query);
            
            // Execute the insert
            const [result] = await connection.query(query, values);
            console.log('Insert result:', result);
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                message: 'Configuration saved successfully',
                id: result.insertId
              })
            };
          } catch (dbError) {
            console.error('Database error during POST processing:', dbError);
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({
                success: false,
                error: 'Database error',
                message: dbError.message,
                code: dbError.code
              })
            };
          }
        } else {
          console.log('Unknown action:', requestBody.action);
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              error: 'Invalid action',
              message: `Unsupported action: ${requestBody.action}`
            })
          };
        }
      } catch (postError) {
        console.error('Error handling POST request:', postError);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Server error',
            message: postError.message
          })
        };
      }
    }
    
    // Default response for unhandled methods
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: 'Method not allowed',
        message: `HTTP method ${event.httpMethod} is not supported`
      })
    };
    
  } catch (error) {
    // Catch-all error handler
    console.error('Unhandled error in Lambda function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Server error',
        message: error.message
      })
    };
  } finally {
    // Close database connection if it exists
    if (connection) {
      try {
        console.log('Closing database connection');
        await connection.end();
        console.log('Database connection closed');
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
}; 