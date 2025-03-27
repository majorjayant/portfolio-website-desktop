// Netlify Function to serve fresh content
const fs = require("fs");
const path = require("path");

exports.handler = async function(event, context) {
  try {
    // Path to the static file in the deployed site
    const siteConfigPath = path.join(process.env.FUNCTIONS_DIST || path.join(__dirname, '..', '..', 'app', 'static'), 'data', 'site_config.json');
    
    // Check if file exists
    let siteConfig;
    try {
      // Try reading the deployed file first
      const fileContents = fs.readFileSync(siteConfigPath, 'utf8');
      siteConfig = JSON.parse(fileContents);
    } catch (err) {
      // Fallback - read from GitHub if file doesn't exist locally
      const fetch = require('node-fetch');
      const resp = await fetch(`https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/main/app/static/data/site_config.json`);
      siteConfig = await resp.json();
    }
    
    // Enrich the response with additional metadata
    const response = {
      ...siteConfig,
      served_by: "netlify_function",
      timestamp: new Date().toISOString()
    };
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to retrieve content", details: error.message })
    };
  }
}; 