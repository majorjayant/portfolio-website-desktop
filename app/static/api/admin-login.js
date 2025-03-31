// Simple admin login handler
exports.handler = async function(event, context) {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { username, password } = body;
    
    // Check credentials (hardcoded for simplicity)
    // In production, use environment variables or a secure method
    if (username === 'admin' && password === 'admin123') {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                success: true, 
                message: 'Login successful',
                token: 'sample-token-12345'
            })
        };
    }
    
    // Return error for invalid credentials
    return {
        statusCode: 401,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
            success: false, 
            message: 'Invalid username or password' 
        })
    };
}; 