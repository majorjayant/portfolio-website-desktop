"""
Standalone index file for Amplify
This provides a fallback in case the main build process fails
"""

import os
import sys
import json
from pathlib import Path

def generate_index_html():
    """Generate a fallback index.html file that matches main site design more closely"""
    
    print("Generating fallback index.html file")
    
    # Get environment variables or use defaults for assets
    favicon_url = os.environ.get('IMAGE_FAVICON_URL', 'img/favicon.ico')
    logo_url = os.environ.get('IMAGE_LOGO_URL', 'img/logo.png')
    profile_url = os.environ.get('IMAGE_ABOUT_PROFILE_URL', 'img/profile.jpg')
    
    # Create a basic site config for the template
    site_config = {
        "site_title": "Jayant Malik | Portfolio",
        "site_subtitle": "Product Manager | Developer",
        "site_description": "Welcome to my portfolio website. I'm a passionate product manager based in New Delhi, India. Since 2015, I've enjoyed turning complex problems into simple, beautiful and intuitive designs."
    }
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{site_config["site_title"]}</title>
    <link rel="icon" href="{favicon_url}">
    <style>
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.5;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            background-color: #f8f8f8;
        }}
        header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem 0;
        }}
        .logo {{
            height: 50px;
        }}
        main {{
            display: flex;
            flex-direction: column;
            min-height: 70vh;
            padding: 2rem 0;
        }}
        .hero {{
            display: flex;
            flex-direction: column;
            gap: 2rem;
            margin-bottom: 4rem;
            background-color: #fff;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        @media (min-width: 768px) {{
            .hero {{
                flex-direction: row;
            }}
        }}
        .hero-content {{
            flex: 1;
        }}
        .hero-image {{
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }}
        .hero-image img {{
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }}
        h1 {{
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #333;
        }}
        p {{
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
            color: #555;
        }}
        footer {{
            text-align: center;
            padding: 2rem 0;
            font-size: 0.9rem;
            color: #666;
            border-top: 1px solid #eee;
            margin-top: 2rem;
        }}
        .contact-link {{
            display: inline-block;
            margin-top: 1rem;
            padding: 0.8rem 1.5rem;
            background-color: #333;
            color: #fff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            transition: background-color 0.3s;
        }}
        .contact-link:hover {{
            background-color: #555;
        }}
    </style>
</head>
<body>
    <header>
        <img src="{logo_url}" alt="Logo" class="logo" onerror="this.onerror=null; this.src='img/logo-fallback.png';">
    </header>
    
    <main>
        <section class="hero">
            <div class="hero-content">
                <h1>Jayant Malik</h1>
                <p>{site_config["site_subtitle"]}</p>
                <p>{site_config["site_description"]}</p>
                <a href="contact.html" class="contact-link">Contact Me</a>
            </div>
            <div class="hero-image">
                <img src="{profile_url}" 
                     alt="Jayant Malik" 
                     onerror="this.onerror=null; this.src='img/profile-fallback.jpg';">
            </div>
        </section>
    </main>
    
    <footer>
        <p>&copy; {os.environ.get('CURRENT_YEAR', '2025')} Jayant Malik. All rights reserved.</p>
    </footer>
    
    <!-- Save site config for JavaScript -->
    <script>
        window.siteConfig = {json.dumps(site_config)};
    </script>
</body>
</html>"""
    
    # Print system info for debugging
    print(f"Python version: {sys.version}")
    print(f"Current working directory: {os.getcwd()}")
    
    # Create the static directory if it doesn't exist
    static_dir = Path("app/static")
    static_dir.mkdir(parents=True, exist_ok=True)
    print(f"Created directory: {static_dir}")
    
    # Write the HTML to index.html
    try:
        with open(static_dir / "index.html", "w", encoding="utf-8") as f:
            f.write(html)
        print(f"✓ Generated fallback index.html at {static_dir}/index.html")
        
        # Also create a site_config.json file for JS to use
        with open(static_dir / "data/site_config.json", "w", encoding="utf-8") as f:
            json.dump({"site_configs": site_config}, f, indent=2)
        print(f"✓ Generated site_config.json at {static_dir}/data/site_config.json")
    except Exception as e:
        print(f"Error writing file: {str(e)}")
        
    # List the contents of the directory to verify
    print("Directory contents:")
    try:
        for path in static_dir.iterdir():
            print(f"  - {path.name}")
    except Exception as e:
        print(f"Error listing directory: {str(e)}")

if __name__ == "__main__":
    generate_index_html() 