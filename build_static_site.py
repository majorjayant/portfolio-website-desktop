import os
import shutil
from app import create_app
from flask_frozen import Freezer

def build_static_site():
    """Build static site for Amplify deployment"""
    print("Starting static site generation...")
    
    # Create Flask app
    app = create_app()
    app.config['FREEZER_DESTINATION'] = os.path.join(app.root_path, 'static')
    app.config['FREEZER_RELATIVE_URLS'] = True
    
    # Initialize Freezer
    freezer = Freezer(app)
    
    # Create static directory if it doesn't exist
    static_dir = app.config['FREEZER_DESTINATION']
    if not os.path.exists(static_dir):
        os.makedirs(static_dir)
    
    # Copy static assets
    static_assets = os.path.join(app.root_path, 'static')
    if os.path.exists(static_assets):
        for item in os.listdir(static_assets):
            s = os.path.join(static_assets, item)
            d = os.path.join(static_dir, item)
            if os.path.isdir(s):
                shutil.copytree(s, d, dirs_exist_ok=True)
            else:
                shutil.copy2(s, d)
    
    # Generate static files
    print("Freezing routes...")
    freezer.freeze()
    
    print("Static site generation complete!")

if __name__ == '__main__':
    build_static_site() 