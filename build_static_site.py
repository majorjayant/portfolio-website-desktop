#!/usr/bin/env python
"""
Static site builder for Portfolio Website

This script:
1. Ensures all required directories exist
2. Generates/copies static files to app/static directory
3. Handles environment variable substitution in templates
4. Adds versioning to CSS files to prevent caching issues
"""

import os
import sys
import shutil
import json
import re
from pathlib import Path
from datetime import datetime

def ensure_directories():
    """Ensure all required directories exist"""
    print("Ensuring required directories exist...")
    
    directories = [
        "app/static",
        "app/static/data",
        "app/static/admin",
        "app/static/admin-direct",
        "app/static/api"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Directory {directory} exists or was created")
    
    return True

def create_site_config():
    """Create a basic site config file if one doesn't exist"""
    config_file = Path("app/static/data/site_config.json")
    
    if not config_file.exists():
        print("Creating default site_config.json file...")
        
        # Get environment variables for configuration
        favicon_url = os.environ.get('IMAGE_FAVICON_URL', 'img/favicon.ico')
        logo_url = os.environ.get('IMAGE_LOGO_URL', 'img/logo.png')
        banner_url = os.environ.get('IMAGE_BANNER_URL', 'img/banner.jpg')
        profile_url = os.environ.get('IMAGE_ABOUT_PROFILE_URL', 'img/profile.jpg')
        
        # Create default site config
        config = {
            "site_configs": {
                "site_title": "Jayant Malik | Portfolio",
                "site_subtitle": "Product Manager | Developer",
                "site_description": "Welcome to my portfolio website. I'm a passionate product manager and developer based in New Delhi, India.",
                "image_urls": {
                    "favicon": favicon_url,
                    "logo": logo_url,
                    "banner": banner_url,
                    "about_profile": profile_url
                },
                "exported_at": datetime.now().isoformat(),
                "export_source": "build_static_site.py"
            }
        }
        
        # Write the config file
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2)
        
        print(f"✓ Created default site_config.json at {config_file}")
    else:
        print(f"✓ Site config file {config_file} already exists")
    
    return True

def add_asset_versioning():
    """Add version parameters to CSS and JS files to prevent caching issues"""
    print("Adding versioning to CSS and JS references...")
    
    # Generate a timestamp version
    version = int(datetime.now().timestamp())
    
    # Find all HTML files
    static_dir = Path("app/static")
    html_files = list(static_dir.glob("**/*.html"))
    
    # Pattern for CSS links
    css_pattern = re.compile(r'(<link\s+[^>]*href=["\'])([^"\']*\.css)(["\'][^>]*>)')
    
    # Pattern for JS scripts
    js_pattern = re.compile(r'(<script\s+[^>]*src=["\'])([^"\']*\.js)(["\'][^>]*>)')
    
    for html_file in html_files:
        print(f"Processing {html_file.relative_to(static_dir)}...")
        
        # Read the file content
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace CSS links with versioned links, avoiding those that already have version
        def replace_asset_links(match):
            tag_start = match.group(1)
            asset_url = match.group(2)
            tag_end = match.group(3)
            
            # Only add version to local files, not CDN links
            if asset_url.startswith('http') or '?' in asset_url:
                return f'{tag_start}{asset_url}{tag_end}'
            
            return f'{tag_start}{asset_url}?v={version}{tag_end}'
        
        # Apply versioning to CSS and JS files
        updated_content = css_pattern.sub(replace_asset_links, content)
        updated_content = js_pattern.sub(replace_asset_links, updated_content)
        
        # Write back the updated content
        if content != updated_content:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f"  ✓ Updated asset references with version parameter")
        else:
            print(f"  - No asset references found or already versioned")
    
    return True

def ensure_site_consistency():
    """Make sure all HTML files from staging branch are properly included"""
    print("Ensuring site consistency across environments...")
    
    # Check if all necessary HTML files exist
    static_dir = Path("app/static")
    required_html_files = [
        "index.html", 
        "contact.html", 
        "projects.html", 
        "solutions.html"
    ]
    
    missing_files = []
    for html_file in required_html_files:
        file_path = static_dir / html_file
        if not file_path.exists():
            missing_files.append(html_file)
            print(f"  ! Missing {html_file}")
    
    if missing_files:
        print(f"Warning: Found {len(missing_files)} missing files that should be included")
        
        # Try to copy from html directory if available
        html_dir = static_dir / "html"
        if html_dir.exists():
            print("Attempting to restore missing files from html/ directory...")
            for missing_file in missing_files:
                source_path = html_dir / missing_file
                target_path = static_dir / missing_file
                if source_path.exists():
                    shutil.copy2(source_path, target_path)
                    print(f"  ✓ Restored {missing_file} from html/ directory")
                else:
                    print(f"  ✗ Could not find {missing_file} in html/ directory")
    
    return True

def add_cache_busting_meta_tags():
    """Add cache control meta tags to HTML files to prevent mobile browser caching"""
    print("Adding cache control meta tags...")
    
    # Find all HTML files
    static_dir = Path("app/static")
    html_files = list(static_dir.glob("**/*.html"))
    
    # Meta tags to add
    meta_tags = [
        '<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">',
        '<meta http-equiv="Pragma" content="no-cache">',
        '<meta http-equiv="Expires" content="0">'
    ]
    
    for html_file in html_files:
        print(f"Processing {html_file.relative_to(static_dir)}...")
        
        # Read the file content
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if meta tags already exist
        if all(tag in content for tag in meta_tags):
            print(f"  - Cache control meta tags already present")
            continue
        
        # Find the head tag
        head_match = re.search(r'<head>(.*?)</head>', content, re.DOTALL)
        if not head_match:
            print(f"  ✗ Could not find head tag in {html_file}")
            continue
            
        head_content = head_match.group(1)
        new_head_content = head_content
        
        # Add missing meta tags
        for tag in meta_tags:
            if tag not in new_head_content:
                new_head_content = tag + '\n    ' + new_head_content
        
        # Replace head content
        if new_head_content != head_content:
            updated_content = content.replace(head_match.group(0), f'<head>{new_head_content}</head>')
            
            # Write back the updated content
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f"  ✓ Added cache control meta tags")
        else:
            print(f"  - Meta tags already present or could not be added")
    
    return True

def generate_version_manifest():
    """Generate a manifest file with versions of all assets"""
    print("Generating version manifest file...")
    
    # Generate a build timestamp
    build_timestamp = datetime.now().isoformat()
    version = int(datetime.now().timestamp())
    
    static_dir = Path("app/static")
    
    # List all CSS and JS files
    css_files = list(static_dir.glob("**/*.css"))
    js_files = list(static_dir.glob("**/*.js"))
    
    # Create manifest data
    manifest = {
        "build_timestamp": build_timestamp,
        "version": str(version),
        "build_environment": os.environ.get("AMPLIFY_ENVIRONMENT", "unknown"),
        "css_files": [str(f.relative_to(static_dir)) for f in css_files],
        "js_files": [str(f.relative_to(static_dir)) for f in js_files],
        "assets_version": f"v{version}"
    }
    
    # Write manifest file
    manifest_file = static_dir / "version-manifest.json"
    with open(manifest_file, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"✓ Generated version manifest at {manifest_file}")
    
    return True

def generate_static_site():
    """Main function to generate static site files"""
    print(f"Starting static site build at {datetime.now().isoformat()}")
    print(f"Python: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    
    # Ensure directories
    ensure_directories()
    
    # Create default site config
    create_site_config()
    
    # Copy index_standalone.py output if necessary
    index_file = Path("app/static/index.html")
    if not index_file.exists():
        print("Index file not found, generating from standalone script...")
        try:
            import app.index_standalone
            app.index_standalone.generate_index_html()
            print("✓ Generated index.html using standalone script")
        except Exception as e:
            print(f"Error generating index.html: {str(e)}")
            return False
    
    # Ensure site consistency
    ensure_site_consistency()
    
    # Add versioning to CSS and JS files
    add_asset_versioning()
    
    # Add cache busting meta tags
    add_cache_busting_meta_tags()
    
    # Generate version manifest
    generate_version_manifest()
    
    # List all static files
    static_dir = Path("app/static")
    print("\nStatic files generated:")
    for item in static_dir.rglob("*"):
        if item.is_file():
            print(f"  - {item.relative_to(static_dir)}")
    
    print("\n✓ Static site build completed successfully")
    return True

if __name__ == "__main__":
    if generate_static_site():
        sys.exit(0)
    else:
        sys.exit(1)
