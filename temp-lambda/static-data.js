// Simple Lambda function that returns static data without database connection
exports.handler = async (event) => {
  console.log('Static Data Function - Version 1.0.0');
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // Define standard response headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
    'Content-Type': 'application/json'
  };

  // Define static site configuration data
  const staticSiteConfig = {
    image_favicon_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon",
    image_logo_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo",
    image_banner_url: "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner",
    about_title: "Jayant Arora",
    about_subtitle: "Curious Mind. Data Geek. Product Whisperer.",
    about_description: "Ever since I was a kid, I've been that person - the one who asks why, what, and so what? on repeat. Fast forward to today, and not much has changed. I thrive on solving complex problems, breaking down business chaos into structured roadmaps, and turning data into decisions that matter. At AtliQ Technologies, I juggle 10+ projects at once (because why settle for one challenge when you can have ten?), aligning stakeholders, streamlining workflows, and integrating AI to make things smarter, not harder. Before this, I optimized product roadmaps at Unifyed and took a product from 5 users to 10K+ at sGate Tech Solutions. From pre-sales to GTM strategy, AI integration to competitor research - I've done it all, and I'm just getting started. Here's the deal: I obsess over execution, geek out over data, and believe in questioning everything. My approach? Think big, start small, and move fast. If you're looking for someone who can decode business problems, simplify the complex, and actually get things done - let's talk.",
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

  // Handle different request types
  if (event.httpMethod === 'OPTIONS') {
    // Handle CORS preflight request
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight request successful' })
    };
  } else if (event.httpMethod === 'GET' && 
             event.queryStringParameters && 
             event.queryStringParameters.type === 'site_config') {
    // Return static site configuration
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(staticSiteConfig)
    };
  } else if (event.httpMethod === 'POST' && 
             event.queryStringParameters && 
             event.queryStringParameters.type === 'site_config') {
    // Simulate successful save
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Configuration saved successfully (simulated)',
        id: Math.floor(Math.random() * 1000) // Random ID to simulate database insert
      })
    };
  } else {
    // Handle unknown request type
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Unknown request type. Valid types: site_config',
        requestDetails: {
          method: event.httpMethod,
          queryParams: event.queryStringParameters
        }
      })
    };
  }
}; 