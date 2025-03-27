// Netlify Function to update site content remotely
const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const path = require("path");

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  
  // Verify authentication token
  const authToken = event.headers.authorization;
  const expectedToken = process.env.UPDATE_CONTENT_TOKEN;
  
  if (!authToken || authToken !== `Bearer ${expectedToken}`) {
    return { statusCode: 401, body: "Unauthorized" };
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
    
    // Initialize Octokit with GitHub token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    // Get the current site_config.json
    const { data: fileData } = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: "app/static/data/site_config.json",
      ref: "main"
    });
    
    // Decode the file content
    const content = Buffer.from(fileData.content, 'base64').toString();
    const siteConfig = JSON.parse(content);
    
    // Update about content
    siteConfig.about_content = {
      title,
      subtitle,
      description,
      profile_image: profile_image || siteConfig.about_content.profile_image,
      photos: photos || siteConfig.about_content.photos
    };
    
    // Update the timestamp
    siteConfig.last_updated = new Date().toISOString();
    siteConfig.update_source = "netlify_function";
    
    // Commit the changes back to GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: "app/static/data/site_config.json",
      message: "Update about content via Netlify function",
      content: Buffer.from(JSON.stringify(siteConfig, null, 2)).toString('base64'),
      sha: fileData.sha,
      branch: "main"
    });
    
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