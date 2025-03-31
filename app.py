#!/usr/bin/env python
"""
Main entry point for the Portfolio Website application.
This file can be used to run the application directly.
"""

import os
import click
from flask.cli import with_appcontext
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import the Flask application
from app import app, db

@app.cli.command("build")
def build_static():
    """Build static site for deployment."""
    click.echo("Building static site...")
    
    # Ensure the static directory exists
    os.makedirs('app/static', exist_ok=True)
    
    # Generate static files
    with app.app_context():
        # Create all database tables
        db.create_all()
        
        # Render and save each template
        from flask import render_template
        pages = [
            ('/', 'index.html'),
            ('/projects', 'projects.html'),
            ('/solutions', 'solutions.html'),
            ('/contact', 'contact.html'),
        ]
        
        for route, template in pages:
            output_dir = f'app/static{route}'
            os.makedirs(output_dir, exist_ok=True)
            
            content = render_template(template)
            output_path = os.path.join(output_dir, 'index.html')
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(content)
                click.echo(f"Generated {output_path}")
    
    click.echo("Static site build complete!")

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