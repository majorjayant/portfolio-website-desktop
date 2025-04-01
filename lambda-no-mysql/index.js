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

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Function to handle admin login
function handleLogin(username, password) {
  console.log('Processing login attempt for user:', username);
  
  // Simple authentication check
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
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

// Lambda handler
exports.handler = async (event) => {
  console.log('Simplified Lambda Function - Version 1.7.0');
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
      
      // Since this is the simplified version without MySQL, always return the default config
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...defaultSiteConfig,
          _static: true,
          _info: "Using static configuration data"
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
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: false,
            message: 'Invalid JSON in request body' 
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
              message: 'Username and password are required'
            })
          };
        }
        
        const loginResult = handleLogin(username, password);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(loginResult)
        };
      }
      
      // For site configuration updates (simplified version without database storage)
      if (actionType.includes('site_config') || parsedBody.site_config || requestType === 'site_config') {
        // In the simplified version, we acknowledge the request but don't actually save anything
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Configuration processed (static version without storage)',
            temporary: true
          })
        };
      }
      
      // Unknown action type
      return {
        statusCode: 200,
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
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: false,
        message: 'Unknown request type. Valid types: site_config, login'
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
        fallback_config: event.httpMethod === 'GET' ? defaultSiteConfig : undefined
      })
    };
  }
}; 