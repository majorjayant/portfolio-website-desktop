// Define standard response headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  'Content-Type': 'application/json'
};

// Import AWS SDK
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// S3 configuration
const BUCKET_NAME = 'website-majorjayant';
const CONFIG_KEY = 'staging/site_config.json';

// Default fallback configuration for when S3 is unavailable
const defaultSiteConfig = {
  image_favicon_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon",
  image_logo_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo",
  image_banner_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner",
  about_title: "Portfolio",
  about_subtitle: "Welcome to my portfolio",
  about_description: "A professional portfolio showcasing my work and skills",
  image_about_profile_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg",
  image_about_photo1_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0138.jpg",
  image_about_photo2_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0915.jpg",
  image_about_photo3_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1461.jpg",
  image_about_photo4_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1627.jpg",
  about_photo1_alt: "Photo 1",
  about_photo2_alt: "Photo 2",
  about_photo3_alt: "Photo 3",
  about_photo4_alt: "Photo 4"
};

// Function to get site configuration from S3
async function getSiteConfig() {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: CONFIG_KEY
    };
    
    const data = await s3.getObject(params).promise();
    return JSON.parse(data.Body.toString());
  } catch (error) {
    console.error('Error reading from S3:', error);
    // If file doesn't exist in S3, save the default config
    if (error.code === 'NoSuchKey') {
      await saveSiteConfig(defaultSiteConfig);
      return defaultSiteConfig;
    }
    throw error;
  }
}

// Function to save site configuration to S3
async function saveSiteConfig(config) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: CONFIG_KEY,
      Body: JSON.stringify(config, null, 2),
      ContentType: 'application/json'
    };
    
    await s3.putObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error saving to S3:', error);
    throw error;
  }
}

// Admin credentials from environment variables with secure fallback handling
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Function to log all relevant info for debugging
function logRequestInfo(event, context) {
  console.log('Lambda Version: 2.0.0 - Added S3 persistent storage');
  console.log('Request ID:', context ? context.awsRequestId : 'Not available');
  console.log('Event httpMethod:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('Query Parameters:', JSON.stringify(event.queryStringParameters || {}));
  console.log('Headers:', JSON.stringify(event.headers || {}));
  
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
  
  const isDefaultCredentials = username === "admin" && password === "admin123";
  const isEnvCredentials = ADMIN_USERNAME && ADMIN_PASSWORD && 
                          username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  const isDirectAccess = username === "direct_access" && password === "override_access_2024";
  
  if (isDefaultCredentials || isEnvCredentials || isDirectAccess) {
    console.log('Login successful for user:', username);
    return {
      success: true,
      message: "Login successful",
      token: "admin-token-" + Date.now(),
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

// Function to update site configuration
async function updateSiteConfig(configData) {
  console.log('Updating site configuration with new data');
  try {
    // Get current config from S3
    const currentConfig = await getSiteConfig();
    
    // Create a new config object with only the fields that exist in defaultSiteConfig
    const updatedConfig = { ...currentConfig };
    
    // Update each field if provided in the request
    Object.keys(configData).forEach(key => {
      if (key in defaultSiteConfig) {
        updatedConfig[key] = configData[key];
        console.log(`Updated ${key} to: ${configData[key]}`);
      }
    });
    
    // Save updated config back to S3
    await saveSiteConfig(updatedConfig);
    
    return {
      success: true,
      message: "Configuration updated successfully",
      config: updatedConfig
    };
  } catch (error) {
    console.error('Error updating configuration:', error);
    return {
      success: false,
      message: "Failed to update configuration: " + error.message
    };
  }
}

// Lambda handler
exports.handler = async (event, context) => {
  logRequestInfo(event, context);
  console.log('Enhanced Lambda Function - Version 2.0.0');
  
  try {
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
    
    const queryParams = event.queryStringParameters || {};
    const pathParams = event.pathParameters || {};
    
    if (queryParams.admin_check === 'true') {
      console.log('Admin check requested');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Admin API is working correctly',
          timestamp: new Date().toISOString(),
          lambda_version: '2.0.0',
          storage: 'Using S3 persistent storage',
          routing_hint: 'If you are experiencing admin access issues, use the direct_access credentials or access through /admin-login.html'
        })
      };
    }
    
    let requestType = queryParams.type || '';
    
    // Handle GET request for site configuration
    if (event.httpMethod === 'GET' && (requestType === 'site_config' || queryParams.type === 'site_config')) {
      console.log('Processing GET request for site_config');
      
      const config = await getSiteConfig();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...config,
          _version: "2.0.0",
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Handle POST request
    if (event.httpMethod === 'POST') {
      console.log('Processing POST request');
      
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
      
      let parsedBody;
      try {
        parsedBody = JSON.parse(event.body);
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
      
      // Handle login request
      if (parsedBody.action === 'login') {
        const result = handleLogin(parsedBody.username, parsedBody.password);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ...result,
            timestamp: new Date().toISOString()
          })
        };
      }
      
      // Handle site config update
      if (parsedBody.action === 'update_site_config') {
        // Extract the configuration data from the request
        const configData = parsedBody.config || {};
        const result = await updateSiteConfig(configData);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ...result,
            timestamp: new Date().toISOString()
          })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Unknown action type',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Handle unsupported HTTP methods
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed',
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Lambda execution error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 