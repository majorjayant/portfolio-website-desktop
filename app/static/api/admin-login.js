// This is a client-side mock of the admin login API
// In a real-world scenario, this would be a server-side function

// Default admin credentials (for demo purposes only)
// In production, use environment variables or a secure database
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password123";

// Parse the request body
const getRequestBody = () => {
    try {
        // In a real API, we would get this from the request
        // This is just a mock for the client-side implementation
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get('username');
        const password = urlParams.get('password');
        return { username, password };
    } catch (error) {
        return null;
    }
};

// Handle the login request
const handleLogin = () => {
    const body = getRequestBody();
    
    if (!body || !body.username || !body.password) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Username and password are required' })
        };
    }
    
    const { username, password } = body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Login successful',
                token: 'mock-jwt-token' // In a real app, generate a JWT token
            })
        };
    }
    
    return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid credentials' })
    };
};

// Get the response
const response = handleLogin();

// Set content type to JSON
document.contentType = 'application/json';

// Output the response
document.write(response.body); 