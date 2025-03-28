// Netlify Function to update site content remotely
const { Octokit } = require("@octokit/rest");
const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  
  // Verify authentication token
  const authToken = event.headers.authorization;
  const expectedToken = process.env.UPDATE_CONTENT_TOKEN;
  
  if (!authToken || authToken !== `Bearer ${expectedToken}`) {
    console.error("Authentication failed:", authToken ? "Invalid token" : "No token provided");
    return { 
      statusCode: 401, 
      body: JSON.stringify({ error: "Unauthorized", details: "Invalid or missing authentication token" })
    };
  }
  
  try {
    // Parse the request body
    const payload = JSON.parse(event.body);
    const { title, subtitle, description, profile_image, photos } = payload;
    
    if (!title || !subtitle || !description) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Missing required fields" }) 
      };
    }
    
    // Log environment variables for debugging (don't log secret values in production)
    console.log("Environment variables:", {
      GITHUB_OWNER: process.env.GITHUB_OWNER || "Not set",
      GITHUB_REPO: process.env.GITHUB_REPO || "Not set",
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ? "Present" : "Not set"
    });
    
    // Check if required env vars are set
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Server configuration error", 
          details: "Required environment variables not set" 
        })
      };
    }
    
    // Initialize Octokit with GitHub token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    // Get the current site_config.json
    let fileData;
    try {
      const response = await octokit.repos.getContent({
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        path: "app/static/data/site_config.json",
        ref: "main"
      });
      fileData = response.data;
    } catch (err) {
      console.error("Error getting file from GitHub:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Failed to get current content", 
          details: err.message 
        })
      };
    }
    
    // Decode the file content
    const content = Buffer.from(fileData.content, 'base64').toString();
    const siteConfig = JSON.parse(content);
    
    // Update about content
    siteConfig.about_content = {
      title,
      subtitle,
      description,
      profile_image: profile_image || siteConfig.about_content?.profile_image,
      photos: photos || siteConfig.about_content?.photos
    };
    
    // Update the timestamp
    siteConfig.last_updated = new Date().toISOString();
    siteConfig.update_source = "netlify_function";
    
    // Commit the changes back to GitHub
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
        path: "app/static/data/site_config.json",
        message: "Update about content via Netlify function",
        content: Buffer.from(JSON.stringify(siteConfig, null, 2)).toString('base64'),
        sha: fileData.sha,
        branch: "main"
      });
    } catch (commitErr) {
      console.error("Error committing to GitHub:", commitErr);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Failed to update content on GitHub", 
          details: commitErr.message 
        })
      };
    }
    
    // Trigger a Netlify build if NETLIFY tokens are available
    if (process.env.NETLIFY_AUTH_TOKEN && process.env.NETLIFY_SITE_ID) {
      try {
        const buildResponse = await fetch(`https://api.netlify.com/api/v1/sites/${process.env.NETLIFY_SITE_ID}/builds`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NETLIFY_AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!buildResponse.ok) {
          console.warn("Failed to trigger Netlify build:", await buildResponse.text());
        } else {
          console.log("Netlify build triggered successfully");
        }
      } catch (buildErr) {
        console.warn("Error triggering Netlify build:", buildErr);
        // Continue - don't fail the update just because build trigger failed
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Content updated successfully",
        updated_at: siteConfig.last_updated
      })
    };
    
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update content", details: error.message })
    };
  }
}; 