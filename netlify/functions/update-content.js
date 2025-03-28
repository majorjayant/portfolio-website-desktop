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
    const missingVars = [];
    if (!process.env.GITHUB_TOKEN) missingVars.push("GITHUB_TOKEN");
    if (!process.env.GITHUB_OWNER) missingVars.push("GITHUB_OWNER");
    if (!process.env.GITHUB_REPO) missingVars.push("GITHUB_REPO");
    
    console.log("Environment variables status:", {
      GITHUB_OWNER: process.env.GITHUB_OWNER || "Not set",
      GITHUB_REPO: process.env.GITHUB_REPO || "Not set",
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ? "Present" : "Not set",
      missingVars: missingVars.length > 0 ? missingVars : "None"
    });
    
    // Check if required env vars are set
    if (missingVars.length > 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Server configuration error", 
          details: `Required environment variables not set: ${missingVars.join(", ")}. Please add these in your Netlify environment variables settings.` 
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
      
      // Provide more specific error message based on the error
      let errorDetails = err.message;
      if (err.status === 404) {
        errorDetails = `File not found at app/static/data/site_config.json in ${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}. Make sure the file exists and the path is correct.`;
      } else if (err.status === 401 || err.status === 403) {
        errorDetails = `GitHub authentication failed. Check that your GITHUB_TOKEN has the correct permissions (needs 'repo' scope).`;
      }
      
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Failed to get current content", 
          details: errorDetails
        })
      };
    }
    
    // Decode the file content
    let content, siteConfig;
    try {
      content = Buffer.from(fileData.content, 'base64').toString();
      siteConfig = JSON.parse(content);
    } catch (parseErr) {
      console.error("Error parsing site config JSON:", parseErr);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Failed to parse content file", 
          details: `The site_config.json file could not be parsed: ${parseErr.message}`
        })
      };
    }
    
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
      
      // Provide more specific error message based on the error
      let errorDetails = commitErr.message;
      if (commitErr.status === 404) {
        errorDetails = `Repository ${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO} not found. Check your GITHUB_OWNER and GITHUB_REPO environment variables.`;
      } else if (commitErr.status === 401 || commitErr.status === 403) {
        errorDetails = `GitHub authentication failed. Your GITHUB_TOKEN doesn't have write access to the repository.`;
      } else if (commitErr.status === 422) {
        errorDetails = `GitHub validation error. The file may have been modified by someone else. Try again.`;
      }
      
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Failed to update content on GitHub", 
          details: errorDetails
        })
      };
    }
    
    // Trigger a Netlify build if NETLIFY tokens are available
    if (process.env.NETLIFY_AUTH_TOKEN && process.env.NETLIFY_SITE_ID) {
      try {
        console.log("Attempting to trigger Netlify build");
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
    } else {
      console.log("Netlify build not triggered - missing NETLIFY_AUTH_TOKEN or NETLIFY_SITE_ID");
    }
    
    const now = new Date();
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Content updated successfully",
        updated_at: siteConfig.last_updated,
        updated_at_ist: istTime.toISOString(),
        github_repo: `${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`
      })
    };
    
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Failed to update content", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
}; 