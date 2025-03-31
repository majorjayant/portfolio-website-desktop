exports.handler = async function(event, context) {
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        // Get the content type from query parameters
        const type = event.queryStringParameters?.type;
        
        if (!type) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Content type is required' })
            };
        }

        // Get content from environment variables or database
        let content;
        switch (type) {
            case 'site_config':
                content = {
                    site_name: process.env.SITE_NAME || 'Portfolio Website',
                    site_description: process.env.SITE_DESCRIPTION || 'Welcome to my portfolio',
                    image_favicon_url: process.env.IMAGE_FAVICON_URL || '/static/img/favicon.ico',
                    image_logo_url: process.env.IMAGE_LOGO_URL || '/static/img/logo.png',
                    image_banner_url: process.env.IMAGE_BANNER_URL || '/static/img/banner.jpg',
                    about_title: process.env.ABOUT_TITLE || 'About Me',
                    about_subtitle: process.env.ABOUT_SUBTITLE || 'Get to know me better',
                    about_description: process.env.ABOUT_DESCRIPTION || 'I am a passionate developer...',
                    about_photo1_url: process.env.ABOUT_PHOTO1_URL || '/static/img/about1.jpg',
                    about_photo2_url: process.env.ABOUT_PHOTO2_URL || '/static/img/about2.jpg',
                    about_photo3_url: process.env.ABOUT_PHOTO3_URL || '/static/img/about3.jpg',
                    about_photo4_url: process.env.ABOUT_PHOTO4_URL || '/static/img/about4.jpg',
                    about_photo1_alt: process.env.ABOUT_PHOTO1_ALT || 'About Photo 1',
                    about_photo2_alt: process.env.ABOUT_PHOTO2_ALT || 'About Photo 2',
                    about_photo3_alt: process.env.ABOUT_PHOTO3_ALT || 'About Photo 3',
                    about_photo4_alt: process.env.ABOUT_PHOTO4_ALT || 'About Photo 4'
                };
                break;
            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Invalid content type' })
                };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(content)
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
}; 