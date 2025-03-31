exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const { username, password } = JSON.parse(event.body);
        
        // Get credentials from environment variables
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

        if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
            console.error('Admin credentials not configured');
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Server configuration error' })
            };
        }

        // Check credentials
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // In a real application, you would generate a JWT or session token here
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    message: 'Login successful',
                    // You could add a token here: token: generateToken(username)
                })
            };
        }

        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Invalid credentials' })
        };

    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
}; 