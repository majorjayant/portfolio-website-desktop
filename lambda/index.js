/**
 * Lambda function for website-portfolio API handling
 * Serves site configuration and handles admin login
 */
exports.handler = async (event) => {
    // Log incoming request for debugging
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Set CORS headers for all responses
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
        'Content-Type': 'application/json'
    };
    
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight request successful' })
        };
    }
    
    try {
        // Extract query parameters
        const queryParams = event.queryStringParameters || {};
        const type = queryParams.type || '';
        
        // Handle GET requests for site configuration or projects
        if (event.httpMethod === 'GET') {
            console.log('Processing GET request for type:', type);
            
            if (type === 'site_config') {
                // Return site configuration data
                console.log('Returning site configuration data');
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        image_favicon_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon",
                        image_logo_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo",
                        image_banner_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner",
                        about_title: "J A",
                        about_subtitle: "Curious Mind. Data Geek. Product Whisperer.",
                        about_description: "Ever since I was a kid, I've been that person - the one who asks why, what, and so what? on repeat.",
                        image_about_profile_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg",
                        image_about_photo1_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0138.jpg",
                        image_about_photo2_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_0915.jpg",
                        image_about_photo3_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1461.jpg",
                        image_about_photo4_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/IMG_1627.jpg",
                        about_photo1_alt: "Test Photo 1 Alt Text",
                        about_photo2_alt: "Test Photo 2 Alt Text",
                        about_photo3_alt: "Test Photo 3 Alt Text",
                        about_photo4_alt: "Test Photo 4 Alt Text"
                    })
                };
            } else if (type === 'projects') {
                // Return projects data
                console.log('Returning projects data');
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
        
        // Handle POST requests for login
        if (event.httpMethod === 'POST') {
            console.log('Processing POST request');
            
            // Parse request body
            let body;
            try {
                body = JSON.parse(event.body || '{}');
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
                
                // Check credentials
                if (username === 'admin' && password === 'admin123') {
                    // Return successful login response
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
                    // Return failed login response
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
    }
}; 