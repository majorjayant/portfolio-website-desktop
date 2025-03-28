// Netlify Function to update site content remotely
const { Octokit } = require("@octokit/rest");
const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  console.log("Update content function called");
  
  // Debug environment (without revealing sensitive values)
  const envVarNames = Object.keys(process.env).sort();
  console.log("Available environment variables:", envVarNames.map(name => {
    // Don't log the actual value of sensitive variables
    if (name.includes("TOKEN") || name.includes("KEY") || name.includes("SECRET")) {
      return `${name}: [REDACTED]`;
    }
    return `${name}: ${typeof process.env[name] === 'string' ? process.env[name].substring(0, 10) + '...' : '[NOT_STRING]'}`;
  }));
  
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  
  // Verify authentication token
  const authHeader = event.headers.authorization || event.headers.Authorization;
  const expectedToken = process.env.UPDATE_CONTENT_TOKEN;
  
  console.log("Auth header present:", !!authHeader);
  console.log("Expected token present:", !!expectedToken);
  
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.replace('Bearer ', '') !== expectedToken) {
    console.error("Authentication failed:", 
                  !authHeader ? "No header" : 
                  !authHeader.startsWith('Bearer ') ? "Invalid format" : 
                  "Token mismatch");
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
    
    // Check for GitHub token specifically
    const githubToken = process.env.GITHUB_TOKEN;
    const githubOwner = process.env.GITHUB_OWNER || "majorjayant";
    const githubRepo = process.env.GITHUB_REPO || "portfolio-website-desktop";
    
    console.log("GitHub config:", {
      "GITHUB_TOKEN present": !!githubToken,
      "GITHUB_OWNER": githubOwner,
      "GITHUB_REPO": githubRepo
    });
    
    if (!githubToken) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "GitHub token missing", 
          details: "The GITHUB_TOKEN environment variable is not set. Add this in the Netlify environment variables settings." 
        })
      };
    }
    
    // Initialize Octokit with GitHub token
    const octokit = new Octokit({
      auth: githubToken
    });
    
    // Get the current site_config.json
    let fileData;
    try {
      console.log(`Fetching content from GitHub: ${githubOwner}/${githubRepo}`);
      const response = await octokit.repos.getContent({
        owner: githubOwner,
        repo: githubRepo,
        path: "app/static/data/site_config.json",
        ref: "main"
      });
      fileData = response.data;
      console.log("Successfully fetched file from GitHub");
    } catch (err) {
      console.error("Error getting file from GitHub:", err);
      
      // Provide more specific error message based on the error
      let errorDetails = err.message;
      if (err.status === 404) {
        errorDetails = `File not found at app/static/data/site_config.json in ${githubOwner}/${githubRepo}. Make sure the file exists and the path is correct.`;
      } else if (err.status === 401 || err.status === 403) {
        errorDetails = `GitHub authentication failed. Check that your GITHUB_TOKEN has the correct permissions (needs 'repo' scope).`;
      }
      
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Failed to get content from GitHub", 
          details: errorDetails,
          status: err.status,
          github_info: {
            owner: githubOwner,
            repo: githubRepo,
            token_present: !!githubToken
          }
        })
      };
    }
    
    // Decode the file content
    let content, siteConfig;
    try {
      content = Buffer.from(fileData.content, 'base64').toString();
      siteConfig = JSON.parse(content);
      console.log("Successfully parsed site config");
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
      console.log("Committing changes to GitHub");
      await octokit.repos.createOrUpdateFileContents({
        owner: githubOwner,
        repo: githubRepo,
        path: "app/static/data/site_config.json",
        message: "Update about content via Netlify function",
        content: Buffer.from(JSON.stringify(siteConfig, null, 2)).toString('base64'),
        sha: fileData.sha,
        branch: "main"
      });
      console.log("Successfully committed changes to GitHub");
    } catch (commitErr) {
      console.error("Error committing to GitHub:", commitErr);
      
      // Provide more specific error message based on the error
      let errorDetails = commitErr.message;
      if (commitErr.status === 404) {
        errorDetails = `Repository ${githubOwner}/${githubRepo} not found. Check your GITHUB_OWNER and GITHUB_REPO environment variables.`;
      } else if (commitErr.status === 401 || commitErr.status === 403) {
        errorDetails = `GitHub authentication failed. Your GITHUB_TOKEN doesn't have write access to the repository.`;
      } else if (commitErr.status === 422) {
        errorDetails = `GitHub validation error. The file may have been modified by someone else. Try again.`;
      }
      
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: "Failed to update content on GitHub", 
          details: errorDetails,
          status: commitErr.status
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
        github_repo: `${githubOwner}/${githubRepo}`
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