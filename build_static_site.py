#!/usr/bin/env python
"""
Build script to generate static HTML files from Flask templates.
This script renders all Flask routes and saves them as static HTML files.
"""

import os
import shutil
from flask import url_for, render_template
from app import app

# Set the output directory (must match netlify.toml publish directory)
OUTPUT_DIR = 'app/static'

# Make sure the output directories exist
def ensure_dir(dir_path):
    """Make sure the directory exists"""
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)

# Create a list of routes to generate static HTML files for
def get_routes():
    """Get all routes from the Flask app"""
    routes = []
    for rule in app.url_map.iter_rules():
        # Skip static routes and any route that takes parameters
        if "GET" in rule.methods and not rule.arguments and not rule.endpoint.startswith('static'):
            routes.append(rule.endpoint)
    return routes

# Generate the static HTML files
def build_static_site():
    """Build static HTML files from Flask routes"""
    # Get routes to generate
    routes = get_routes()
    
    # Create output directory
    ensure_dir(OUTPUT_DIR)
    
    # Create output directories for HTML files and assets
    html_dir = os.path.join(OUTPUT_DIR, 'html')
    ensure_dir(html_dir)
    
    # Generate static HTML for each route
    with app.test_request_context():
        for endpoint in routes:
            try:
                # Special case for the image generator tool
                if endpoint == 'image_generator_tool':
                    print(f"Generating static HTML for route: {url_for(endpoint)} (using static template)")
                    
                    # Use the static version instead
                    html = render_template('image_generator_static.html')
                    
                    # Write the HTML to file
                    output_path = os.path.join(html_dir, 'image_generator_tool.html')
                    ensure_dir(os.path.dirname(output_path))
                    with open(output_path, 'w', encoding='utf-8') as f:
                        f.write(html)
                    
                    print(f"Generated: {output_path}")
                    continue
                
                # Get URL for the endpoint
                url = url_for(endpoint)
                print(f"Generating static HTML for route: {url}")
                
                # Get the output path
                if url == '/':
                    output_path = os.path.join(html_dir, 'index.html')
                else:
                    # Remove leading slash and convert to HTML filename
                    path = url.lstrip('/')
                    output_path = os.path.join(html_dir, f"{path}.html")
                
                # Make sure the directory exists
                ensure_dir(os.path.dirname(output_path))
                
                # Get the rendered HTML
                with app.test_client() as client:
                    response = client.get(url)
                    html = response.data.decode('utf-8')
                
                # Write the HTML to file
                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(html)
                
                print(f"Generated: {output_path}")
            except Exception as e:
                print(f"Error generating static HTML for {endpoint}: {str(e)}")
    
    # Copy HTML files to the root directory for Netlify
    for file in os.listdir(html_dir):
        src_file = os.path.join(html_dir, file)
        dst_file = os.path.join(OUTPUT_DIR, file)
        if os.path.isfile(src_file):
            shutil.copy2(src_file, dst_file)
            print(f"Copied HTML file to root: {file}")
    
    # Create a temp directory
    temp_dir = os.path.join(OUTPUT_DIR, 'temp')
    ensure_dir(temp_dir)
    print(f"Created temp directory: {temp_dir}")

    print("Static site generation completed!")

if __name__ == "__main__":
    build_static_site() 