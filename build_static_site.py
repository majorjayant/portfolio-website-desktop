#!/usr/bin/env python
"""
Static site builder for Portfolio Website

This script:
1. Ensures all required directories exist
2. Generates/copies static files to app/static directory
3. Handles environment variable substitution in templates
"""

import os
import sys
import shutil
import json
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
