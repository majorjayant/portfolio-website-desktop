// Netlify serverless function to handle Flask app routes
exports.handler = async function(event, context) {
  const path = event.path.replace('/.netlify/functions/app', '');
  
  // Redirect to static pages based on the route
  let redirectPath;
  
  if (path === '/' || path === '') {
    redirectPath = '/index.html';
  } else if (path === '/projects') {
    redirectPath = '/projects.html';
  } else if (path === '/solutions') {
    redirectPath = '/solutions.html';
  } else if (path === '/contact') {
    redirectPath = '/contact.html';
  } else if (path === '/image-generator-tool') {
    redirectPath = '/image_generator.html';
  } else {
    // Default to index for any other path
    redirectPath = '/index.html';
  }
  
  return {
    statusCode: 302,
    headers: {
      'Location': redirectPath,
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify({ redirected: true })
  };
}; 