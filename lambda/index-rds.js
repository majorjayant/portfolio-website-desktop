/**
 * Lambda function for website-portfolio API handling with RDS database
 * Serves site configuration and handles admin login
 */
const mysql = require('mysql2/promise');

// Database configuration from environment variables
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    connectionLimit: 10
};

// Default site configuration (used if database is empty)
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

/**
 * Initialize the database connection and create tables if needed
 */
async function initializeDatabase() {
    let connection;
    
    try {
        // Create database connection
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            port: dbConfig.port
        });
        
        console.log('Connected to database successfully');
        
        // Check if site_config table exists, create it if not
        const [tables] = await connection.execute(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = 'site_config'", 
            [dbConfig.database]
        );
        
        if (tables.length === 0) {
            console.log('Creating site_config table...');
            
            // Create the site_config table
            await connection.execute(`
                CREATE TABLE site_config (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    config_key VARCHAR(255) NOT NULL,
                    config_value TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            
            // Insert default configuration
            await insertDefaultConfig(connection);
        } else {
            console.log('site_config table already exists');
        }
        
        return connection;
    } catch (error) {
        console.error('Database initialization error:', error);
        if (connection) {
            connection.end();
        }
        throw error;
    }
}

/**
 * Insert default configuration into the database
 */
async function insertDefaultConfig(connection) {
    console.log('Inserting default site configuration...');
    
    // Insert each key-value pair from the default config
    const insertPromises = Object.entries(defaultSiteConfig).map(([key, value]) => {
        return connection.execute(
            'INSERT INTO site_config (config_key, config_value) VALUES (?, ?)',
            [key, value]
        );
    });
    
    await Promise.all(insertPromises);
    console.log('Default configuration inserted successfully');
}

/**
 * Get site configuration from the database
 */
async function getSiteConfig(connection) {
    console.log('Fetching site configuration from database...');
    
    const [rows] = await connection.execute('SELECT config_key, config_value FROM site_config');
    
    // Convert rows to an object
    const config = {};
    rows.forEach(row => {
        config[row.config_key] = row.config_value;
    });
    
    console.log('Site configuration fetched successfully');
    return config;
}

/**
 * Update site configuration in the database
 */
async function updateSiteConfig(connection, configUpdates) {
    console.log('Updating site configuration in database...');
    
    // Update each key-value pair
    const updatePromises = Object.entries(configUpdates).map(async ([key, value]) => {
        // Check if the key exists
        const [existingRows] = await connection.execute(
            'SELECT COUNT(*) as count FROM site_config WHERE config_key = ?',
            [key]
        );
        
        if (existingRows[0].count > 0) {
            // Update existing key
            return connection.execute(
                'UPDATE site_config SET config_value = ? WHERE config_key = ?',
                [value, key]
            );
        } else {
            // Insert new key
            return connection.execute(
                'INSERT INTO site_config (config_key, config_value) VALUES (?, ?)',
                [key, value]
            );
        }
    });
    
    await Promise.all(updatePromises);
    console.log('Site configuration updated successfully');
    
    // Return the updated configuration
    return getSiteConfig(connection);
}

/**
 * Main Lambda handler function
 */
exports.handler = async (event) => {
    // Log incoming request for debugging
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Set CORS headers for all responses
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
        'Content-Type': 'application/json'
    };
    
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        console.log('Handling OPTIONS preflight request');
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight request successful' })
        };
    }
    
    let connection;
    
    try {
        // Initialize database connection
        connection = await initializeDatabase();
        
        // Extract query parameters
        const queryParams = event.queryStringParameters || {};
        const type = queryParams.type || '';
        
        // Handle GET requests for site configuration or projects
        if (event.httpMethod === 'GET') {
            console.log('Processing GET request for type:', type);
            
            if (type === 'site_config') {
                // Return site configuration data from database
                const siteConfig = await getSiteConfig(connection);
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(siteConfig)
                };
            } else if (type === 'projects') {
                // Return projects data
                // Note: You can implement a similar database approach for projects
                console.log('Returning projects data (hardcoded for now)');
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify([
                        {
                            id: 1,
                            title: "Project 1",
                            description: "Description for project 1"
                        },
                        {
                            id: 2,
                            title: "Project 2",
                            description: "Description for project 2"
                        }
                    ])
                };
            } else {
                // Return error for unsupported type
                console.log('Unsupported request type:', type);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Unsupported request type' })
                };
            }
        }
        
        // Handle POST requests for login and site config updates
        if (event.httpMethod === 'POST') {
            console.log('Processing POST request');
            
            // Parse request body
            let body;
            try {
                body = JSON.parse(event.body || '{}');
                console.log('Parsed request body:', body);
            } catch (error) {
                console.error('Error parsing request body:', error);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid request body' })
                };
            }
            
            const { action, username, password } = body;
            
            if (action === 'login') {
                console.log('Processing login request');
                
                // Here you could check credentials against the database
                // For now, we'll use hardcoded values for simplicity
                if (username === 'admin' && password === 'admin123') {
                    console.log('Login successful for user:', username);
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: 'Login successful',
                            token: 'sample-jwt-token-for-admin'
                        })
                    };
                } else {
                    console.log('Login failed for user:', username);
                    return {
                        statusCode: 401,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Invalid credentials'
                        })
                    };
                }
            } else if (action === 'update_site_config') {
                console.log('Processing update site configuration request');
                
                // Check for authorization
                const authHeader = event.headers.Authorization || event.headers.authorization || '';
                console.log('Authorization header:', authHeader);
                
                if (!authHeader) {
                    console.log('Unauthorized: No token provided');
                    return {
                        statusCode: 401,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Unauthorized: No token provided'
                        })
                    };
                }
                
                // Extract site configuration from the request body
                const siteConfig = body.site_config || {};
                console.log('Updating site configuration with:', JSON.stringify(siteConfig, null, 2));
                
                // Update the site configuration in the database
                const updatedConfig = await updateSiteConfig(connection, siteConfig);
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Site configuration updated successfully',
                        data: updatedConfig
                    })
                };
            } else {
                // Return error for unsupported action
                console.log('Unsupported action:', action);
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Unsupported action' })
                };
            }
        }
        
        // Return error for unsupported method
        console.log('Unsupported HTTP method:', event.httpMethod);
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    } catch (error) {
        // Log and return error
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    } finally {
        // Close database connection
        if (connection) {
            console.log('Closing database connection');
            await connection.end();
        }
    }
}; 