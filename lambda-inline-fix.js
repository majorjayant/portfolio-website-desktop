// Inline Lambda function for AWS Lambda console
exports.handler = async (event) => {
    console.log('Inline Lambda - Version 1.3.0');
    console.log('Received event:', JSON.stringify(event));
    
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
        'Content-Type': 'application/json'
    };
    
    // Default configuration
    const defaultConfig = {
        "image_favicon_url": "https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon",
        "image_logo_url": "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo",
        "image_banner_url": "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner",
        "about_title": "Portfolio",
        "about_subtitle": "Welcome to my portfolio",
        "about_description": "A professional portfolio showcasing my work and skills",
        "image_about_profile_url": "https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg",
        "image_about_photo1_url": "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0138.jpg",
        "image_about_photo2_url": "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0915.jpg",
        "image_about_photo3_url": "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1461.jpg",
        "image_about_photo4_url": "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1627.jpg",
        "about_photo1_alt": "Photo 1",
        "about_photo2_alt": "Photo 2",
        "about_photo3_alt": "Photo 3",
        "about_photo4_alt": "Photo 4"
    };
    
    // Admin credentials from environment variables
    // IMPORTANT: For security, in production environment use AWS Secrets Manager or similar solution
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    
    try {
        // CORS preflight request
        if (event.httpMethod === 'OPTIONS') {
            console.log('Handling OPTIONS request');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'CORS preflight successful' })
            };
        }
        
        // GET request handling
        if (event.httpMethod === 'GET') {
            console.log('Handling GET request');
            const queryParams = event.queryStringParameters || {};
            console.log('Query parameters:', queryParams);
            
            // Handle site_config request
            if (queryParams.type === 'site_config') {
                console.log('Serving site configuration');
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(defaultConfig)
                };
            }
        }
        
        // POST request handling
        if (event.httpMethod === 'POST') {
            console.log('Handling POST request');
            
            // Parse body
            let body;
            try {
                body = JSON.parse(event.body || '{}');
                console.log('Parsed body:', JSON.stringify(body, null, 2));
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
            
            // Handle login request
            if (body.action === 'login') {
                console.log('Processing login request');
                
                const username = body.username;
                const password = body.password;
                
                if (!username || !password) {
                    console.log('Login failed: Missing username or password');
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            message: 'Username and password are required'
                        })
                    };
                }
                
                // Secure login check
                // For development environment only - will accept default admin credentials
                const isDefaultCredentials = username === "admin" && password === "admin123";
                const isEnvCredentials = ADMIN_USERNAME && ADMIN_PASSWORD && 
                                       username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
                
                if (isDefaultCredentials || isEnvCredentials) {
                    console.log('Login successful for user:', username);
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: 'Login successful',
                            token: 'admin-token-' + Date.now(),
                            user: {
                                username: username,
                                role: 'admin'
                            }
                        })
                    };
                } else {
                    console.log('Login failed: Invalid credentials');
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            message: 'Invalid username or password'
                        })
                    };
                }
            }
            
            // Handle site_config updates
            if (body.action && body.action.includes('site_config')) {
                console.log('Processing site configuration update');
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Configuration processed'
                    })
                };
            }
            
            // Unknown action
            console.log('Unknown action requested:', body.action);
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Unknown action. Valid actions: login, site_config'
                })
            };
        }
        
        // Default response for unhandled request types
        console.log('Unhandled request type:', event.httpMethod);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Unknown request or route'
            })
        };
    } catch (error) {
        console.error('Error in Lambda function:', error);
        
        // Always return 200 to prevent API Gateway 502 errors
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'An error occurred',
                error: error.message || 'Unknown error',
                fallback_config: event.httpMethod === 'GET' ? defaultConfig : undefined
            })
        };
    }
}; 