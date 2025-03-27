exports.handler = async function(event, context) {
  // Get all environment variables related to images
  const imageVars = Object.keys(process.env)
    .filter(key => key.includes('IMAGE_') || key.includes('STATIC_'))
    .reduce((obj, key) => {
      obj[key] = process.env[key];
      return obj;
    }, {});
  
  // Return environment information as JSON
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: "Site configuration debug info",
      staticDeployment: process.env.STATIC_DEPLOYMENT || "not set",
      imageUrls: imageVars,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version
    }, null, 2)
  };
}; 