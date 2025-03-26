#!/usr/bin/env python
"""
Build script to generate static HTML files from Flask templates.
This script renders all Flask routes and saves them as static HTML files for deployment on Netlify.
"""

import os
import sys
import shutil
import traceback
import time
from flask import url_for, render_template

# Start time for timing the build process
start_time = time.time()

# Print header for build process
print("\n" + "=" * 80)
print("STATIC SITE GENERATION FOR PORTFOLIO WEBSITE")
print("=" * 80)

# Print Python and environment information
print(f"\nEnvironment Information:")
print(f"  Python version: {sys.version}")
print(f"  Python executable: {sys.executable}")
print(f"  Current working directory: {os.getcwd()}")
print(f"  Platform: {sys.platform}")

try:
    # Import app after printing diagnostics
    print("\nImporting Flask application...")
    from app import app
    print("✓ Successfully imported Flask app")
except Exception as e:
    print(f"✗ Error importing app: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

# Set the output directory (must match netlify.toml publish directory)
OUTPUT_DIR = 'app/static'
print(f"\nOutput directory: {OUTPUT_DIR}")

# Make sure the output directories exist
def ensure_dir(dir_path):
    """Make sure the directory exists"""
    try:
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
            print(f"  ✓ Created directory: {dir_path}")
        else:
            print(f"  ○ Directory already exists: {dir_path}")
    except Exception as e:
        print(f"  ✗ Error creating directory {dir_path}: {str(e)}")
        raise

# Copy static assets
def copy_static_assets():
    """Copy static assets (CSS, JS, images) to the output directory"""
    print("\nCopying static assets...")
    
    try:
        # Source directories
        static_dir = os.path.join('app', 'static')
        if not os.path.exists(static_dir):
            print(f"  ⚠ Warning: Static directory {static_dir} does not exist")
            return
        
        # Assets counters
        css_count = 0
        js_count = 0
        img_count = 0
        
        # Copy CSS files
        css_src = os.path.join(static_dir, 'css')
        css_dest = os.path.join(OUTPUT_DIR, 'css')
        if os.path.exists(css_src):
            ensure_dir(css_dest)
            for file in os.listdir(css_src):
                src_file = os.path.join(css_src, file)
                dst_file = os.path.join(css_dest, file)
                if os.path.isfile(src_file):
                    shutil.copy2(src_file, dst_file)
                    css_count += 1
        
        # Copy JS files
        js_src = os.path.join(static_dir, 'js')
        js_dest = os.path.join(OUTPUT_DIR, 'js')
        if os.path.exists(js_src):
            ensure_dir(js_dest)
            for file in os.listdir(js_src):
                src_file = os.path.join(js_src, file)
                dst_file = os.path.join(js_dest, file)
                if os.path.isfile(src_file):
                    shutil.copy2(src_file, dst_file)
                    js_count += 1
        
        # Copy image files
        img_src = os.path.join(static_dir, 'img')
        img_dest = os.path.join(OUTPUT_DIR, 'img')
        if os.path.exists(img_src):
            ensure_dir(img_dest)
            for file in os.listdir(img_src):
                src_file = os.path.join(img_src, file)
                dst_file = os.path.join(img_dest, file)
                if os.path.isfile(src_file):
                    shutil.copy2(src_file, dst_file)
                    img_count += 1
        
        print(f"  ✓ Copied {css_count} CSS files, {js_count} JS files, and {img_count} image files")
    except Exception as e:
        print(f"  ✗ Error copying static assets: {str(e)}")
        traceback.print_exc()

# Create a list of routes to generate static HTML files for
def get_routes():
    """Get all routes from the Flask app"""
    print("\nDiscovering Flask routes...")
    
    routes = []
    try:
        for rule in app.url_map.iter_rules():
            # Skip static routes and any route that takes parameters
            if "GET" in rule.methods and not rule.arguments and not rule.endpoint.startswith('static'):
                routes.append(rule.endpoint)
        
        if routes:
            print(f"  ✓ Found {len(routes)} routes to generate:")
            for route in routes:
                print(f"    - {route}")
        else:
            print("  ⚠ No routes found - will create fallback content")
            
        return routes
    except Exception as e:
        print(f"  ✗ Error getting routes: {str(e)}")
        traceback.print_exc()
        return []

# Generate the static HTML files
def build_static_site():
    """Build static HTML files from Flask routes"""
    print("\nBuilding static site...")
    
    try:
        # Get routes to generate
        routes = get_routes()
        
        # Create output directory
        print("\nCreating directory structure...")
        ensure_dir(OUTPUT_DIR)
        
        # Create html directory
        html_dir = os.path.join(OUTPUT_DIR, 'html')
        ensure_dir(html_dir)
        
        # Make sure static asset directories exist
        css_dir = os.path.join(OUTPUT_DIR, 'css')
        js_dir = os.path.join(OUTPUT_DIR, 'js')
        img_dir = os.path.join(OUTPUT_DIR, 'img')
        temp_dir = os.path.join(OUTPUT_DIR, 'temp')
        
        ensure_dir(css_dir)
        ensure_dir(js_dir)
        ensure_dir(img_dir)
        ensure_dir(temp_dir)
        
        # Copy static assets
        copy_static_assets()
        
        # Create a placeholder index.html if no routes were found
        if not routes:
            print("\nNo routes found, creating placeholder index.html...")
            placeholder_html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Portfolio Website</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; text-align: center; }
                    .container { max-width: 800px; margin: 0 auto; }
                    h1 { color: #333; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Portfolio Website</h1>
                    <p>This is a static version of the portfolio website.</p>
                    <p>For the full functionality, please run the application locally.</p>
                </div>
            </body>
            </html>
            """
            with open(os.path.join(OUTPUT_DIR, 'index.html'), 'w', encoding='utf-8') as f:
                f.write(placeholder_html)
            print("  ✓ Created placeholder index.html")
            return
        
        # Count successfully generated pages
        success_count = 0
        error_count = 0
        
        # Generate static HTML for each route
        print("\nGenerating HTML files for routes...")
        with app.test_request_context():
            for endpoint in routes:
                try:
                    # Special case for the image generator tool
                    if endpoint == 'image_generator_tool':
                        print(f"  ○ Processing route: {url_for(endpoint)} (using static template)")
                        
                        # Use the static version instead
                        html = render_template('image_generator_static.html')
                        
                        # Write the HTML to file
                        output_path = os.path.join(html_dir, 'image_generator_tool.html')
                        ensure_dir(os.path.dirname(output_path))
                        with open(output_path, 'w', encoding='utf-8') as f:
                            f.write(html)
                        
                        print(f"    ✓ Generated: {output_path}")
                        success_count += 1
                        continue
                    
                    # Get URL for the endpoint
                    url = url_for(endpoint)
                    print(f"  ○ Processing route: {url}")
                    
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
                    
                    print(f"    ✓ Generated: {output_path}")
                    success_count += 1
                except Exception as e:
                    print(f"    ✗ Error generating HTML for {endpoint}: {str(e)}")
                    traceback.print_exc()
                    error_count += 1
        
        # Copy HTML files to the root directory for Netlify
        print("\nCopying HTML files to root directory...")
        root_copy_count = 0
        for file in os.listdir(html_dir):
            src_file = os.path.join(html_dir, file)
            dst_file = os.path.join(OUTPUT_DIR, file)
            if os.path.isfile(src_file):
                try:
                    shutil.copy2(src_file, dst_file)
                    root_copy_count += 1
                except Exception as e:
                    print(f"  ✗ Error copying {file}: {str(e)}")
        
        print(f"  ✓ Copied {root_copy_count} HTML files to root directory")
        
        # Calculate build time
        build_time = time.time() - start_time
        
        # Print summary
        print("\n" + "=" * 80)
        print("BUILD SUMMARY")
        print("=" * 80)
        print(f"  ✓ Successfully generated: {success_count} pages")
        if error_count > 0:
            print(f"  ✗ Failed to generate: {error_count} pages")
        print(f"  ○ Build time: {build_time:.2f} seconds")
        print("\nStatic site generation completed! Ready for deployment.")
    
    except Exception as e:
        print(f"\nFATAL ERROR building static site: {str(e)}")
        traceback.print_exc()
        
        # Create a minimal index.html as fallback
        print("\nCreating emergency fallback index.html...")
        fallback_html = """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Portfolio Website</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; text-align: center; background-color: #f8f9fa; }
                .container { max-width: 800px; margin: 40px auto; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #3a4a70; }
                .error { color: #721c24; background-color: #f8d7da; padding: 10px; border-radius: 4px; margin: 20px 0; }
                .btn { display: inline-block; background-color: #3a4a70; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Portfolio Website</h1>
                <p>The site is currently experiencing technical difficulties.</p>
                <div class="error">An error occurred during the build process. Please check the build logs.</div>
                <p>For the full functionality, please run the application locally:</p>
                <a href="https://github.com/majorjayant/portfolio-website-desktop" class="btn">View on GitHub</a>
            </div>
        </body>
        </html>
        """
        try:
            ensure_dir(OUTPUT_DIR)
            with open(os.path.join(OUTPUT_DIR, 'index.html'), 'w', encoding='utf-8') as f:
                f.write(fallback_html)
            print("  ✓ Created fallback index.html")
        except Exception as inner_e:
            print(f"  ✗ Failed to create fallback index.html: {str(inner_e)}")
            sys.exit(1)
        
        # Exit with error code
        sys.exit(1)

if __name__ == "__main__":
    build_static_site() 