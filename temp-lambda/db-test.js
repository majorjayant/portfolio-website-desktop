const mysql = require('mysql2/promise');

// Lambda handler focused solely on testing database connection
exports.handler = async (event) => {
  console.log('DB Connection Test - Version 1.0.0');
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // Define standard response headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
    'Content-Type': 'application/json'
  };

  // Set the environment variables (with defaults if not provided)
  const DB_HOST = process.env.DB_HOST || 'website.ct8aqqkk828w.eu-north-1.rds.amazonaws.com';
  const DB_USER = process.env.DB_USER || 'majorjayant';
  const DB_PASSWORD = process.env.DB_PASSWORD || 'seemaduhlani';
  const DB_NAME = process.env.DB_NAME || 'website';
  const DB_PORT = parseInt(process.env.DB_PORT || '3306');
  
  // Log environment variables (for debugging only)
  console.log('Connection parameters:');
  console.log(`DB_HOST: ${DB_HOST}`);
  console.log(`DB_USER: ${DB_USER}`);
  console.log(`DB_PASSWORD: ********`);
  console.log(`DB_NAME: ${DB_NAME}`);
  console.log(`DB_PORT: ${DB_PORT}`);
  
  let connection = null;
  
  try {
    // Step 1: Attempt to create a connection
    console.log(`Attempting to connect to ${DB_NAME} database at ${DB_HOST}:${DB_PORT} as ${DB_USER}`);
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      connectTimeout: 10000  // 10 second timeout
    });
    
    console.log('✅ MySQL connection established successfully');
    
    // Step 2: Test the connection with a simple query
    console.log('Testing connection with a simple query: SELECT 1');
    const [rows] = await connection.query('SELECT 1 as test');
    console.log('Query result:', JSON.stringify(rows));
    console.log('✅ Query executed successfully');
    
    // Step 3: Check if site_config table exists
    console.log('Checking if site_config table exists');
    const [tables] = await connection.query('SHOW TABLES LIKE "site_config"');
    
    if (tables.length > 0) {
      console.log('✅ site_config table exists');
      
      // Step 4: Get row count from table
      const [count] = await connection.query('SELECT COUNT(*) as count FROM site_config');
      console.log(`✅ site_config table contains ${count[0].count} rows`);
      
      // Step 5: Get sample row if available
      if (count[0].count > 0) {
        const [sample] = await connection.query('SELECT * FROM site_config LIMIT 1');
        console.log('Sample row:', JSON.stringify(sample[0], null, 2));
      }
    } else {
      console.log('⚠️ site_config table does not exist');
      
      // Step 6: Create the table
      console.log('Creating site_config table');
      await connection.query(`
        CREATE TABLE site_config (
          id INT AUTO_INCREMENT PRIMARY KEY,
          site_title VARCHAR(255),
          site_subtitle VARCHAR(255),
          site_description TEXT,
          logo_url VARCHAR(255),
          banner_url VARCHAR(255),
          contact_email VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ site_config table created successfully');
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Database connection test successful',
        details: {
          connected: true,
          database: DB_NAME,
          host: DB_HOST,
          user: DB_USER
        }
      })
    };
  } catch (error) {
    console.error('❌ Database connection error:', error);
    
    // Determine error type for better diagnosis
    let errorType = 'UNKNOWN';
    let suggestion = '';
    
    if (error.code === 'ECONNREFUSED') {
      errorType = 'CONNECTION_REFUSED';
      suggestion = 'Check if the database server is running and if security groups allow connections from Lambda';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorType = 'ACCESS_DENIED';
      suggestion = 'Username or password is incorrect';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorType = 'DATABASE_NOT_FOUND';
      suggestion = 'The specified database does not exist';
    } else if (error.code === 'ETIMEDOUT') {
      errorType = 'CONNECTION_TIMEOUT';
      suggestion = 'Network connectivity issue or security group blocking connection';
    } else if (error.code === 'ENOTFOUND') {
      errorType = 'HOST_NOT_FOUND';
      suggestion = 'The hostname could not be resolved';
    }
    
    return {
      statusCode: 200, // Use 200 to prevent API Gateway 502 errors
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Database connection test failed',
        error: error.message,
        errorCode: error.code,
        errorType: errorType,
        suggestion: suggestion,
        details: {
          connected: false,
          database: DB_NAME,
          host: DB_HOST,
          user: DB_USER
        }
      })
    };
  } finally {
    // Close the connection if it was established
    if (connection) {
      try {
        await connection.end();
        console.log('MySQL connection closed');
      } catch (err) {
        console.error('Error closing MySQL connection:', err);
      }
    }
  }
}; 