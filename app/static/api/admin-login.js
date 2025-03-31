// Admin login handler for static site
// This simulates API functionality, checking credentials and returning a response

// Read the request parameters
const urlParams = new URLSearchParams(window.location.search);
const rawBody = document.body.textContent;

let username = '';
let password = '';

// Try to parse JSON body if available
try {
  const body = JSON.parse(rawBody);
  username = body.username;
  password = body.password;
} catch (e) {
  // If JSON parsing fails, try to get from URLSearchParams
  username = urlParams.get('username');
  password = urlParams.get('password');
}

// Hard-coded admin credentials (in a real app, these would be stored securely)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123';

// Check credentials
const response = {
  success: username === ADMIN_USERNAME && password === ADMIN_PASSWORD,
  message: username === ADMIN_USERNAME && password === ADMIN_PASSWORD ? 
    'Login successful' : 'Invalid username or password'
};

// Set content type
document.contentType = 'application/json';

// Output the response
document.write(JSON.stringify(response)); 