// Lambda function using DynamoDB for persistence instead of MySQL
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Define standard response headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
  'Content-Type': 'application/json'
};

// Define static site configuration data (fallback)
const defaultSiteConfig = {
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

// DynamoDB table name to use
const SITE_CONFIG_TABLE = 'website-portfolio-config';

// Function to get site config from DynamoDB
async function getSiteConfigFromDynamoDB() {
  try {
    const params = {
      TableName: SITE_CONFIG_TABLE,
      Key: {
        id: 'site_config'
      }
    };
    
    console.log('Fetching config from DynamoDB');
    const result = await dynamodb.get(params).promise();
    
    if (result.Item) {
      console.log('Config found in DynamoDB');
      return result.Item.data;
    } else {
      console.log('No config found in DynamoDB, using default');
      return defaultSiteConfig;
    }
  } catch (error) {
    console.error('Error fetching from DynamoDB:', error);
    console.log('Using default config due to DynamoDB error');
    return defaultSiteConfig;
  }
}

// Function to save site config to DynamoDB
async function saveSiteConfigToDynamoDB(config) {
  try {
    const timestamp = new Date().toISOString();
    
    const params = {
      TableName: SITE_CONFIG_TABLE,
      Item: {
        id: 'site_config',
        data: config,
        updatedAt: timestamp
      }
    };
    
    console.log('Saving config to DynamoDB');
    await dynamodb.put(params).promise();
    console.log('Config saved to DynamoDB successfully');
    
    return {
      success: true,
      timestamp: timestamp
    };
  } catch (error) {
    console.error('Error saving to DynamoDB:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to create the DynamoDB table if it doesn't exist
async function ensureTableExists() {
  const dynamodbClient = new AWS.DynamoDB();
  
  try {
    // Check if table exists
    await dynamodbClient.describeTable({ TableName: SITE_CONFIG_TABLE }).promise();
    console.log('Table already exists');
    return true;
  } catch (error) {
    if (error.code === 'ResourceNotFoundException') {
      try {
        // Create table
        const params = {
          TableName: SITE_CONFIG_TABLE,
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        };
        
        console.log('Creating DynamoDB table');
        await dynamodbClient.createTable(params).promise();
        
        // Wait for table to be created
        console.log('Waiting for table to be created');
        await dynamodbClient.waitFor('tableExists', { TableName: SITE_CONFIG_TABLE }).promise();
        
        console.log('Table created successfully');
        return true;
      } catch (createError) {
        console.error('Error creating table:', createError);
        return false;
      }
    } else {
      console.error('Error checking if table exists:', error);
      return false;
    }
  }
}

// Lambda handler
exports.handler = async (event) => {
  console.log('DynamoDB Solution - Version 1.0.0');
  console.log('Received event:', JSON.stringify(event, null, 2));
  
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
    
    // Try to create table if it doesn't exist
    await ensureTableExists();
    
    // Get site configuration from DynamoDB (or default if not found)
    const config = await getSiteConfigFromDynamoDB();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(config)
    };
  } else if (event.httpMethod === 'POST' && 
             event.queryStringParameters && 
             event.queryStringParameters.type === 'site_config') {
    
    // Ensure table exists
    const tableExists = await ensureTableExists();
    if (!tableExists) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Could not create DynamoDB table'
        })
      };
    }
    
    // Parse request body
    let configData;
    try {
      configData = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid JSON in request body'
        })
      };
    }
    
    // Save configuration to DynamoDB
    const result = await saveSiteConfigToDynamoDB(configData);
    
    return {
      statusCode: result.success ? 200 : 500,
      headers,
      body: JSON.stringify(result)
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