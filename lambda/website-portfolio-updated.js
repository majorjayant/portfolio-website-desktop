// Lambda function to serve portfolio website content
exports.handler = async (event) => {
    console.log('Event received:', JSON.stringify(event));
    
    // Set up CORS headers for all responses
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Content-Type': 'application/json'
    };
    
    // Handle OPTIONS requests for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight successful' })
        };
    }
    
    try {
        // Extract query parameters and determine request type
        const queryParams = event.queryStringParameters || {};
        const pathParams = event.pathParameters || {};
        const contentType = queryParams.type || pathParams.type || 'site_config';
        const method = event.httpMethod;
        
        // Handle different HTTP methods
        if (method === 'GET') {
            // GET requests for content
            if (contentType === 'site_config') {
                // Return site configuration data
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        image_favicon_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon",
                        image_logo_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo",
                        image_banner_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner",
                        about_title: "J A",
                        about_subtitle: "Curious Mind. Data Geek. Product Whisperer.",
                        about_description: "Ever since I was a kid, I've been that person - the one who asks why, what, and so what? on repeat. Fast forward to today, and not much has changed. I thrive on solving complex problems, breaking down business chaos into structured roadmaps, and turning data into decisions that matter.",
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
            } else if (contentType === 'projects') {
                // Return projects data
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        projects: [
                            {
                                id: 1,
                                title: "AI Image Generator",
                                description: "A tool that uses AI to generate images from text descriptions",
                                image_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/project1.jpg",
                                technologies: ["Python", "TensorFlow", "React"],
                                link: "/image_generator_tool.html"
                            },
                            {
                                id: 2,
                                title: "Data Analytics Dashboard",
                                description: "Interactive dashboard for business analytics",
                                image_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/project2.jpg",
                                technologies: ["D3.js", "Node.js", "MongoDB"],
                                link: "#"
                            }
                        ]
                    })
                };
            } else {
                // Unknown content type
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: `Unknown content type: ${contentType}` })
                };
            }
        } else if (method === 'POST') {
            // Parse the body
            let body = {};
            try {
                body = JSON.parse(event.body || '{}');
            } catch (error) {
                console.error('Error parsing body:', error);
            }
            
            const action = body.action || '';
            
            if (action === 'login') {
                // Handle login request
                const { username, password } = body;
                if (username === 'admin' && password === 'admin123') {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: 'Login successful',
                            token: 'sample-token-12345'
                        })
                    };
                } else {
                    return {
                        statusCode: 401,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            message: 'Invalid username or password'
                        })
                    };
                }
            } else {
                // Unknown action
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: `Unknown action: ${action}` })
                };
            }
        } else {
            // Unsupported HTTP method
            return {
                statusCode: 405,
                headers,
                body: JSON.stringify({ error: `Method not allowed: ${method}` })
            };
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    }
}; 