// Inline Lambda function for AWS Lambda console
exports.handler = async (event) => {
    console.log('Inline Lambda - Version 1.0.0');
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
    
    try {
        // CORS preflight request
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ message: 'CORS preflight successful' })
            };
        }
        
        // GET request handling
        if (event.httpMethod === 'GET') {
            const queryParams = event.queryStringParameters || {};
            
            // Handle site_config request
            if (queryParams.type === 'site_config') {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(defaultConfig)
                };
            }
        }
        
        // POST request handling
        if (event.httpMethod === 'POST') {
            try {
                const body = JSON.parse(event.body || '{}');
                
                // Handle login request
                if (body.action === 'login') {
                    const username = body.username;
                    const password = body.password;
                    
                    // Simple auth check
                    if (username === 'admin' && password === 'admin123') {
                        return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({
                                success: true,
                                message: 'Login successful',
                                token: 'admin-token-' + Date.now()
                            })
                        };
                    } else {
                        return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({
                                success: false,
                                message: 'Invalid credentials'
                            })
                        };
                    }
                }
                
                // Handle site_config updates
                if (body.action && body.action.includes('site_config')) {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: 'Configuration processed'
                        })
                    };
                }
            } catch (parseError) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        message: 'Invalid JSON in request body'
                    })
                };
            }
        }
        
        // Default response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Unknown request or route'
            })
        };
    } catch (error) {
        console.error('Error:', error);
        
        // Always return 200 to prevent API Gateway 502 errors
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'An error occurred',
                fallback_config: event.httpMethod === 'GET' ? defaultConfig : undefined
            })
        };
    }
}; 