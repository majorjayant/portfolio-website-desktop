# This file is intentionally empty
# It exists to make the 'app' directory a proper Python package 

# Import necessary packages
from flask import Flask, render_template
import os
import sys
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
import logging
from datetime import timedelta
import tempfile

# Initialize Flask extensions
db = SQLAlchemy()
csrf = CSRFProtect()

def create_app(test_config=None):
    """Create and configure the Flask application"""
    try:
        # Print diagnostic information
        print(f"Python version: {sys.version}")
        print(f"Python executable: {sys.executable}")
        print(f"Current working directory: {os.getcwd()}")
        
        # Load environment variables
        try:
            load_dotenv()
            print("Loaded environment variables from .env file")
        except Exception as e:
            print(f"Error loading .env file: {e}")
        
        # Create and configure the app
        app = Flask(__name__)
        app.static_folder = os.path.join(os.getcwd(), 'app/static')
        print(f"Flask app initialized with static folder: {app.static_folder}")
        
        # Configure the app
        app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-development-only')
        print(f"Using SECRET_KEY: {'from environment' if 'SECRET_KEY' in os.environ else 'default'}")
        
        # Database configuration
        try:
            db_url = os.environ.get('DATABASE_URL')
            if db_url:
                # Use MySQL if provided
                app.config['SQLALCHEMY_DATABASE_URI'] = db_url
                print(f"Using database URL from environment: {db_url[:10]}...")
            else:
                # Fall back to SQLite
                db_path = os.path.join(os.getcwd(), 'app.db')
                app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
                print(f"Using SQLite database: {db_path}")
            
            app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
            
            # Initialize database
            db.init_app(app)
            print("SQLAlchemy initialized successfully")
            
            # Create tables if they don't exist
            with app.app_context():
                db.create_all()
                # Initialize site configuration
                from app.utils.db_migration import init_site_config
                init_site_config()
        except Exception as e:
            print(f"Error configuring database: {e}")
        
        # Initialize CSRF protection
        csrf.init_app(app)
        print("CSRF protection initialized successfully")
        
        # Set session lifetime
        app.permanent_session_lifetime = timedelta(days=7)
        
        # Create a temporary directory for file uploads
        temp_dir = os.path.join(app.static_folder, 'temp')
        os.makedirs(temp_dir, exist_ok=True)
        print(f"Created temp directory in static folder")
        
        # Register routes with the app
        try:
            from app.routes import register_routes
            register_routes(app)
            print("Routes registered successfully")
        except Exception as e:
            print(f"Error registering routes: {e}")
        
        # Import models to ensure they are registered with SQLAlchemy
        try:
            from app.models import __all__ as model_modules
            print("Models imported successfully")
        except Exception as e:
            print(f"Error importing models: {e}")
        
        return app
        
    except Exception as e:
        print(f"Error initializing application: {e}")
        raise e

# Create app instance
app = create_app() 