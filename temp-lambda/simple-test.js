// Simple Lambda test function without external dependencies
exports.handler = async (event) => {
  console.log('Simple Test Function - Version 1.0.0');
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // Define standard response headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
    'Content-Type': 'application/json'
  };

  // Record environment variables (for diagnostic purposes)
  const environmentVariables = {
    DB_HOST: process.env.DB_HOST || 'not set',
    DB_USER: process.env.DB_USER || 'not set',
    DB_NAME: process.env.DB_NAME || 'not set',
    DB_PORT: process.env.DB_PORT || 'not set',
    // Don't log password, even masked
    AWS_REGION: process.env.AWS_REGION || 'not set',
    NODE_PATH: process.env.NODE_PATH || 'not set',
    PATH: process.env.PATH || 'not set'
  };
  
  // Filesystem check
  let filesystemInfo = {};
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check if node_modules exists and what's inside
    const taskDir = '/var/task';
    filesystemInfo.taskDirExists = fs.existsSync(taskDir);
    
    if (filesystemInfo.taskDirExists) {
      const nodeModulesPath = path.join(taskDir, 'node_modules');
      filesystemInfo.nodeModulesExists = fs.existsSync(nodeModulesPath);
      
      if (filesystemInfo.nodeModulesExists) {
        try {
          filesystemInfo.nodeModulesContents = fs.readdirSync(nodeModulesPath);
        } catch (e) {
          filesystemInfo.nodeModulesError = e.message;
        }
      }
    }
  } catch (e) {
    filesystemInfo.error = e.message;
  }
  
  // Check for mysql2 specifically 
  let mysql2Check = {
    moduleFound: false,
    error: null
  };
  
  try {
    // Try to load the module
    require('mysql2');
    mysql2Check.moduleFound = true;
  } catch (e) {
    mysql2Check.error = e.message;
  }
  
  // Get all available modules
  let availableModules = [];
  try {
    availableModules = Object.keys(require('module')._cache);
  } catch (e) {
    // Ignore errors
  }
  
  // Process information
  const processInfo = {
    arch: process.arch,
    platform: process.platform,
    version: process.version,
    nodeVersion: process.versions.node,
    v8Version: process.versions.v8
  };
  
  // Return diagnostic information
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Lambda diagnostic information',
      environment: environmentVariables,
      filesystem: filesystemInfo,
      mysql2Check: mysql2Check,
      availableModulesCount: availableModules.length,
      process: processInfo,
      event: event
    }, null, 2)
  };
}; 