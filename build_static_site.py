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
import re
from flask import url_for, render_template
from pathlib import Path
from urllib.parse import urlparse

# Set static deployment flag
os.environ['STATIC_DEPLOYMENT'] = 'true'

# Set image URLs from environment variables or use S3 fallbacks for the static site
# For Netlify, these should be set in the Netlify environment variables settings
s3_base_url = 'https://website-majorjayant.s3.eu-north-1.amazonaws.com'
os.environ['IMAGE_FAVICON_URL'] = os.environ.get('IMAGE_FAVICON_URL', f'{s3_base_url}/FavIcon')
os.environ['IMAGE_LOGO_URL'] = os.environ.get('IMAGE_LOGO_URL', f'{s3_base_url}/Logo')
os.environ['IMAGE_BANNER_URL'] = os.environ.get('IMAGE_BANNER_URL', f'{s3_base_url}/Banner')
os.environ['IMAGE_ABOUT_PROFILE_URL'] = os.environ.get('IMAGE_ABOUT_PROFILE_URL', f'{s3_base_url}/profilephoto+(2).svg')
os.environ['IMAGE_ABOUT_PHOTO1_URL'] = os.environ.get('IMAGE_ABOUT_PHOTO1_URL', f'{s3_base_url}/about_photo1.jpg')
os.environ['IMAGE_ABOUT_PHOTO2_URL'] = os.environ.get('IMAGE_ABOUT_PHOTO2_URL', f'{s3_base_url}/about_photo2.jpg')
os.environ['IMAGE_ABOUT_PHOTO3_URL'] = os.environ.get('IMAGE_ABOUT_PHOTO3_URL', f'{s3_base_url}/about_photo3.jpg')
os.environ['IMAGE_ABOUT_PHOTO4_URL'] = os.environ.get('IMAGE_ABOUT_PHOTO4_URL', f'{s3_base_url}/about_photo4.jpg')

# About content fallbacks - these should also be set in Netlify environment variables
os.environ['ABOUT_TITLE'] = os.environ.get('ABOUT_TITLE', 'about.')
os.environ['ABOUT_SUBTITLE'] = os.environ.get('ABOUT_SUBTITLE', "I'm a passionate product manager based in New Delhi, India.")
os.environ['ABOUT_DESCRIPTION'] = os.environ.get('ABOUT_DESCRIPTION', "Since 2015, I've enjoyed turning complex problems into simple, beautiful and intuitive designs. When I'm not coding or managing products, you'll find me cooking, playing video games or exploring new places.")
os.environ['ABOUT_PHOTO1_ALT'] = os.environ.get('ABOUT_PHOTO1_ALT', 'Personal photo 1') 
os.environ['ABOUT_PHOTO2_ALT'] = os.environ.get('ABOUT_PHOTO2_ALT', 'Personal photo 2')
os.environ['ABOUT_PHOTO3_ALT'] = os.environ.get('ABOUT_PHOTO3_ALT', 'Personal photo 3')
os.environ['ABOUT_PHOTO4_ALT'] = os.environ.get('ABOUT_PHOTO4_ALT', 'Personal photo 4')

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
        
        # Normalize paths to prevent issues with mixed slashes
        def normalize_path(path):
            return os.path.normpath(path)
        
        # Skip copying if source and destination are the same
        def safe_copy(src_file, dst_file):
            src_norm = normalize_path(src_file)
            dst_norm = normalize_path(dst_file)
            
            if src_norm == dst_norm:
                print(f"  ⚠ Skipping copy of {src_norm} to itself")
                return False
                
            if os.path.exists(dst_norm):
                # If file exists at destination, only copy if source is newer
                src_mtime = os.path.getmtime(src_norm)
                dst_mtime = os.path.getmtime(dst_norm)
                if src_mtime <= dst_mtime:
                    print(f"  ⚠ Skipping copy of {src_norm} as destination is newer or same age")
                    return False
            
            # Copy the file
            shutil.copy2(src_norm, dst_norm)
            return True
        
        # Copy CSS files
        css_src = os.path.join(static_dir, 'css')
        css_dest = os.path.join(OUTPUT_DIR, 'css')
        if os.path.exists(css_src):
            ensure_dir(css_dest)
            for file in os.listdir(css_src):
                src_file = os.path.join(css_src, file)
                dst_file = os.path.join(css_dest, file)
                if os.path.isfile(src_file) and safe_copy(src_file, dst_file):
                    css_count += 1
        
        # Copy JS files
        js_src = os.path.join(static_dir, 'js')
        js_dest = os.path.join(OUTPUT_DIR, 'js')
        if os.path.exists(js_src):
            ensure_dir(js_dest)
            for file in os.listdir(js_src):
                src_file = os.path.join(js_src, file)
                dst_file = os.path.join(js_dest, file)
                if os.path.isfile(src_file) and safe_copy(src_file, dst_file):
                    js_count += 1
        
        # Copy image files
        img_src = os.path.join(static_dir, 'img')
        img_dest = os.path.join(OUTPUT_DIR, 'img')
        if os.path.exists(img_src):
            ensure_dir(img_dest)
            for file in os.listdir(img_src):
                src_file = os.path.join(img_src, file)
                dst_file = os.path.join(img_dest, file)
                if os.path.isfile(src_file) and safe_copy(src_file, dst_file):
                    img_count += 1
        
        print(f"  ✓ Copied {css_count} CSS files, {js_count} JS files, and {img_count} image files")
    except Exception as e:
        print(f"  ✗ Error copying static assets: {str(e)}")
        traceback.print_exc()

# Fix asset paths in HTML content
def fix_static_paths(html_content):
    """Fix static asset paths in HTML content for proper deployment on Netlify"""
    # Replace /static/ references with relative paths
    fixed_html = html_content.replace('href="/static/', 'href="/')
    fixed_html = fixed_html.replace('src="/static/', 'src="/')
    
    # Replace Flask url_for references that might have been rendered
    fixed_html = re.sub(r'href="https?://[^/]+/static/', 'href="/', fixed_html)
    fixed_html = re.sub(r'src="https?://[^/]+/static/', 'src="/', fixed_html)
    
    return fixed_html

# Create a list of routes to generate static HTML files for
def get_routes():
    """Get all routes from the Flask app"""
    print("\nDiscovering Flask routes...")
    
    routes = []
    try:
        for rule in app.url_map.iter_rules():
            # Skip static routes and any route that takes parameters
            # Also skip admin routes for the static site
            if "GET" in rule.methods and not rule.arguments and not rule.endpoint.startswith('static') and not rule.endpoint.startswith('admin'):
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
            for route in routes:
                try:
                    # Create the request context for the route
                    print(f"  ○ Processing route: {url_for(route)}")
                    
                    # Render the template
                    html_content = app.view_functions[route]()
                    
                    # Fix static file references
                    html_content = fix_static_paths(html_content)
                    
                    # Prepare the output file path
                    if route == 'home':
                        # Save index page
                        output_file = os.path.join(html_dir, 'index.html')
                    else:
                        # Create subdirectories if needed
                        route_parts = url_for(route).strip('/').split('/')
                        if len(route_parts) > 1:
                            subdir = os.path.join(html_dir, *route_parts[:-1])
                            ensure_dir(subdir)
                        
                        # Use the last part of the route for the filename, or default to index.html
                        filename = f"{route_parts[-1] if route_parts[-1] else route}.html"
                        output_file = os.path.join(html_dir, *route_parts[:-1], filename)
                    
                    # Write the HTML file
                    with open(output_file, 'w', encoding='utf-8') as f:
                        f.write(html_content)
                    
                    print(f"    ✓ Generated: {output_file}")
                    success_count += 1
                
                except Exception as e:
                    print(f"    ✗ Error generating {route}: {str(e)}")
                    traceback.print_exc()
                    error_count += 1
        
        # Copy HTML files to root directory for Netlify
        print("\nCopying HTML files to root directory...")
        files_copied = 0
        
        for root, dirs, files in os.walk(html_dir):
            for file in files:
                if file.endswith('.html'):
                    # Get relative path from html_dir
                    rel_path = os.path.relpath(os.path.join(root, file), html_dir)
                    
                    # Prepare destination path
                    dest_file = os.path.join(OUTPUT_DIR, rel_path)
                    
                    # Ensure directory exists
                    dest_dir = os.path.dirname(dest_file)
                    if dest_dir and not os.path.exists(dest_dir):
                        os.makedirs(dest_dir)
                    
                    # Copy file
                    shutil.copy2(os.path.join(root, file), dest_file)
                    files_copied += 1
        
        print(f"  ✓ Copied {files_copied} HTML files to root directory")
        
        # Create _redirects file for Netlify
        redirects_file = os.path.join(OUTPUT_DIR, '_redirects')
        with open(redirects_file, 'w', encoding='utf-8') as f:
            f.write("# Netlify redirects file\n")
            f.write("# Redirect all routes to index.html for SPA-like behavior\n")
            f.write("/*    /index.html   200\n")
        
        print(f"  ✓ Created Netlify _redirects file")
        
        # Print build summary
        print("\n" + "=" * 80)
        print("BUILD SUMMARY")
        print("=" * 80)
        print(f"  ✓ Successfully generated: {success_count} pages")
        print(f"  ✗ Failed to generate: {error_count} pages")
        print(f"  ○ Build time: {time.time() - start_time:.2f} seconds")
        
        print("\nStatic site generation completed! Ready for deployment.")
        
    except Exception as e:
        print(f"\n✗ Error in build process: {str(e)}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    build_static_site() 