/**
 * Lambda function to serve portfolio website content
 */
exports.handler = async (event) => {
    console.log('Event received:', JSON.stringify(event));
    
    // Extract the path parameter or query string to determine what content to return
    const path = event.path || '';
    const queryParams = event.queryStringParameters || {};
    const contentType = queryParams.type || 'site_config';
    
    // Define response headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,OPTIONS'
    };
    
    // Return OPTIONS response for preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    try {
        // Get the appropriate content based on the content type
        let content;
        
        switch (contentType) {
            case 'site_config':
                content = {
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
                };
                break;
                
            case 'projects':
                content = {
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
                };
                break;
                
            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid content type requested' })
                };
        }
        
        // Return the content
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(content)
        };
        
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}; 