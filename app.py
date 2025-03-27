#!/usr/bin/env python
"""
Main entry point for the Portfolio Website application.
This file can be used to run the application directly.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import the Flask application
from app import app, db

if __name__ == '__main__':
    # Create all database tables if they don't exist
    with app.app_context():
        db.create_all()
    
    # Run the application
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    
    print(f"Starting Portfolio Website on port {port} (debug={debug})")
    print("Press CTRL+C to stop the server")
    
    app.run(debug=debug, host='0.0.0.0', port=port) 