/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
    // Define your site configuration
    const siteConfig = {
        image_favicon_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon",
        image_logo_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo",
        image_banner_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner",
        about_title: "J A",
        about_subtitle: "Curious Mind. Data Geek. Product Whisperer.",
        about_description: "Ever since I was a kid, I've been that person - the one who asks why, what, and so what? on repeat. Fast forward to today, and not much has changed. I thrive on solving complex problems, breaking down business chaos into structured roadmaps, and turnin...",
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

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(siteConfig),
    };
}; 