// Simple Lambda function without mysql2 dependency
// Use this as a temporary fix until you can deploy with dependencies

// Define standard headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  'Content-Type': 'application/json'
};

// Default fallback configuration for when database is unavailable
const defaultSiteConfig = {
  site_title: "Portfolio Website",
  site_subtitle: "Showcase of My Work and Skills",
  site_description: "A personal portfolio showcasing projects, skills, and achievements.",
  logo_url: "/images/logo.png",
  banner_url: "/images/banner.jpg",
  social_links: {
    github: "https://github.com/majorjayant",
    linkedin: "https://linkedin.com/in/majorjayant",
    twitter: "https://twitter.com/majorjayant"
  },
  contact_email: "contact@example.com",
  _fallback: true,
  timestamp: new Date().toISOString()
};

// Lambda handler
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Lambda function version: 1.0.0-simple');
  
  try {
    // Check for API Gateway test
    if (event.source === 'aws.events') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Scheduled event processed successfully' })
      };
    }
    
    // Handle OPTIONS requests for CORS
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'CORS preflight request successful' })
      };
    }
    
    // Handle GET request for site configuration
    if (event.httpMethod === 'GET' && 
        event.queryStringParameters && 
        event.queryStringParameters.type === 'site_config') {
      
      console.log('Processing GET request for site_config');
      
      // Return hardcoded config to ensure website works
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          // Use the data from your last successful response
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
          about_photo4_alt: "Test Photo 4 Alt Text",
          _hardcoded: true
        })
      };
    }
    
    // Handle POST request to save site configuration
    if (event.httpMethod === 'POST' && 
        event.queryStringParameters && 
        event.queryStringParameters.type === 'site_config') {
      
      console.log('Processing POST request for site_config');
      
      // Return success response without actually saving
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Configuration saved successfully",
          note: "This is a temporary fix - data is not actually being saved to database"
        })
      };
    }
    
    // Default response for unknown routes
    console.log('Unknown request type or missing parameters');
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ 
        error: 'Not Found',
        message: 'The requested resource was not found' 
      })
    };
    
  } catch (error) {
    console.error('Unhandled error in Lambda function:', error);
    
    // For all errors, return a 500 with error details
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: error.message
      })
    };
  }
}; 