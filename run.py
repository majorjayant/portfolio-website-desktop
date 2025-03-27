#!/usr/bin/env python
"""
Run script for the Portfolio Website
This is the entry point for running the Flask application locally.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import the Flask application
from app import app, db

if __name__ == "__main__":
    # Check if port is specified in environment variables
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    
    # Create all database tables if they don't exist
    with app.app_context():
        db.create_all()
    
    # Display startup message
    print(f"Starting Portfolio Website on port {port} (debug={debug})")
    print("Press CTRL+C to stop the server")
    
    # Run the Flask application
    app.run(host="0.0.0.0", port=port, debug=debug) 