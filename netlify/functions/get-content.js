// Netlify Function to serve fresh content
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    console.log("Get content function called");
    
    // Path to the static file in the deployed site
    const staticPath = process.env.FUNCTIONS_DIST || path.join(__dirname, '..', '..', 'app', 'static');
    const siteConfigPath = path.join(staticPath, 'data', 'site_config.json');
    
    console.log("Looking for site_config.json at:", siteConfigPath);
    
    // Try multiple sources to get the config
    let siteConfig = null;
    let source = "unknown";
    
    // 1. Try the local file first
    try {
      console.log("Attempting to read from local file");
      const fileContents = fs.readFileSync(siteConfigPath, 'utf8');
      siteConfig = JSON.parse(fileContents);
      source = "file";
      console.log("Loaded from local file successfully");
    } catch (fileErr) {
      console.log("Could not read local file:", fileErr.message);
      
      // 2. Try from GitHub
      if (process.env.GITHUB_OWNER && process.env.GITHUB_REPO) {
        try {
          console.log(`Trying GitHub fallback: ${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`);
          const githubUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/main/app/static/data/site_config.json`;
          const resp = await fetch(githubUrl);
          
          if (!resp.ok) {
            throw new Error(`GitHub API returned ${resp.status}: ${resp.statusText}`);
          }
          
          siteConfig = await resp.json();
          source = "github";
          console.log("Loaded from GitHub successfully");
        } catch (githubErr) {
          console.log("Could not fetch from GitHub:", githubErr.message);
        }
      } else {
        console.log("No GitHub credentials available for fallback");
      }
      
      // 3. Return default content as last resort
      if (!siteConfig) {
        console.log("Creating default fallback content");
        siteConfig = {
          about_content: {
            title: "About Me",
            subtitle: "Portfolio Website Owner",
            description: "This is a default description when no content could be loaded. Please set up your content in the admin interface.",
            profile_image: process.env.IMAGE_ABOUT_PROFILE_URL || "",
            photos: []
          },
          export_source: "netlify_function_fallback",
          exported_at: new Date().toISOString()
        };
        source = "default";
      }
    }
    
    // Get current time in IST
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    // Enrich the response with additional metadata
    const response = {
      ...siteConfig,
      served_by: "netlify_function",
      fetch_source: source,
      timestamp: now.toISOString(),
      timestamp_ist: istTime.toISOString(),
      environment: {
        netlify: !!process.env.NETLIFY,
        github_configured: !!(process.env.GITHUB_OWNER && process.env.GITHUB_REPO)
      }
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
    console.error("Error in get-content function:", error);
    
    // Get error time in IST
    const errorTime = new Date();
    const errorTimeIST = new Date(errorTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        error: "Failed to retrieve content", 
        details: error.message,
        timestamp: errorTime.toISOString(),
        timestamp_ist: errorTimeIST.toISOString(),
        path_attempted: process.env.FUNCTIONS_DIST 
          ? `${process.env.FUNCTIONS_DIST}/data/site_config.json` 
          : "app/static/data/site_config.json"
      })
    };
  }
}; 