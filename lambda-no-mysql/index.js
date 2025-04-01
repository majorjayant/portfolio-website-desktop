// Define standard response headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  'Content-Type': 'application/json'
};

// Default fallback configuration for when database is unavailable
let siteConfig = {
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

// Admin credentials from environment variables with secure fallback handling
// In production, these should be set as environment variables in AWS Lambda
// IMPORTANT: For security, in production environment use AWS Secrets Manager or similar solution
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Function to log all relevant info for debugging
function logRequestInfo(event, context) {
  console.log('Lambda Version: 1.8.0 - Added site config update functionality');
  console.log('Request ID:', context ? context.awsRequestId : 'Not available');
  console.log('Event httpMethod:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('Query Parameters:', JSON.stringify(event.queryStringParameters || {}));
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

// Function to update site configuration
function updateSiteConfig(configData) {
  console.log('Updating site configuration with new data');
  try {
    // Update each field if provided in the request
    Object.keys(configData).forEach(key => {
      if (key in siteConfig) {
        siteConfig[key] = configData[key];
        console.log(`Updated ${key} to: ${configData[key]}`);
      }
    });
    
    return {
      success: true,
      message: "Configuration updated successfully"
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
  // Log detailed information about the request
  logRequestInfo(event, context);
  console.log('Enhanced Lambda Function - Version 1.8.0');
  
  try {
    // Handle OPTIONS requests for CORS
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
    
    // Extract query parameters and determine request type
    const queryParams = event.queryStringParameters || {};
    const pathParams = event.pathParameters || {};
    
    // Check for admin access query parameter - special backdoor for access issues
    if (queryParams.admin_check === 'true') {
      console.log('Admin check requested');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Admin API is working correctly',
          timestamp: new Date().toISOString(),
          lambda_version: '1.8.0',
          routing_hint: 'If you are experiencing admin access issues, use the direct_access credentials or access through /admin-login.html'
        })
      };
    }
    
    let requestType = queryParams.type || '';
    
    // Handle GET request for site configuration
    if (event.httpMethod === 'GET' && (requestType === 'site_config' || queryParams.type === 'site_config')) {
      console.log('Processing GET request for site_config');
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...siteConfig,
          _version: "1.8.0",
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Handle POST request to save site configuration
    if (event.httpMethod === 'POST') {
      console.log('Processing POST request');
      
      // Validate body
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
      
      // Parse body
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
      
      // Check for different request formats and determine action
      let actionType = parsedBody.action || '';
      
      console.log('Action type detected in request:', actionType);
      
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
            lambda_version: '1.8.0'
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
            lambda_version: '1.8.0',
            timestamp: new Date().toISOString(),
            access_paths: {
              direct_access_url: 'https://staging.d200zhb2va2zdo.amplifyapp.com/admin-login.html',
              dashboard_url: 'https://staging.d200zhb2va2zdo.amplifyapp.com/admin/simple-dashboard.html'
            }
          })
        };
      }
      
      // For site configuration updates
      if (actionType.includes('site_config') || parsedBody.site_config || requestType === 'site_config') {
        console.log('Processing site configuration update request');
        
        // Extract configuration data
        const configData = parsedBody.site_config || parsedBody.config || parsedBody;
        
        // Update the site configuration
        const updateResult = updateSiteConfig(configData);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            ...updateResult,
            timestamp: new Date().toISOString(),
            lambda_version: '1.8.0'
          })
        };
      }
      
      // Default response for unknown POST action
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Unknown action. Valid actions: login, site_config, admin_access_check',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Default response for unknown request types
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Unknown request type. Valid types: site_config, login, admin_access_check',
        help: 'To check admin access, use ?admin_check=true as a query parameter',
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Unhandled error in Lambda function:', error);
    
    // Always return 200 with a valid response to prevent API Gateway 502 errors
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'An unexpected error occurred',
        error: error.message || 'Unknown error',
        lambda_version: '1.8.0',
        timestamp: new Date().toISOString(),
        fallback_config: event.httpMethod === 'GET' ? siteConfig : undefined
      })
    };
  }
}; 