"""
Standalone index file for Amplify
This provides a fallback in case the main build process fails
"""

import os
import sys
from pathlib import Path

def generate_index_html():
    """Generate a simple index.html file that can be used as a fallback"""
    
    print("Generating fallback index.html file")
    
    html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jayant Malik | Portfolio</title>
    <link rel="icon" href="https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon">
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.5;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem 0;
        }
        .logo {
            height: 50px;
        }
        main {
            display: flex;
            flex-direction: column;
            min-height: 70vh;
            padding: 2rem 0;
        }
        .hero {
            display: flex;
            flex-direction: column;
            gap: 2rem;
            margin-bottom: 4rem;
        }
        @media (min-width: 768px) {
            .hero {
                flex-direction: row;
            }
        }
        .hero-content {
            flex: 1;
        }
        .hero-image {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .hero-image img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
        }
        footer {
            text-align: center;
            padding: 2rem 0;
            font-size: 0.9rem;
            color: #666;
        }
    </style>
</head>
<body>
    <header>
        <img src="https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo" alt="Logo" class="logo">
    </header>
    
    <main>
        <section class="hero">
            <div class="hero-content">
                <h1>Jayant Malik</h1>
                <p>Product Manager | Developer</p>
                <p>Welcome to my portfolio website. I'm a passionate product manager based in New Delhi, India. 
                   Since 2015, I've enjoyed turning complex problems into simple, beautiful and intuitive designs.</p>
            </div>
            <div class="hero-image">
                <img src="https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg" 
                     alt="Jayant Malik" 
                     onerror="this.onerror=null; this.src='https://website-majorjayant.s3.eu-north-1.amazonaws.com/avatar.jpg';">
            </div>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2025 Jayant Malik. All rights reserved.</p>
    </footer>
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