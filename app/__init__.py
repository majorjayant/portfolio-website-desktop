# This file is intentionally empty
# It exists to make the 'app' directory a proper Python package 

# Import necessary packages
from flask import Flask
import os
import sys
from dotenv import load_dotenv

# Print environment information
print("Initializing Flask app...")
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")

# Load environment variables from .env file if it exists
env_file = os.path.join(os.getcwd(), '.env')
if os.path.exists(env_file):
    print(f"Loading environment variables from {env_file}")
    load_dotenv(env_file)
else:
    print("No .env file found, using default environment variables")

# Initialize Flask app
app = Flask(__name__)
print(f"Flask app initialized with static folder: {app.static_folder}")

# Configure app
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-dev-key')
print(f"Using SECRET_KEY: {'custom key' if os.environ.get('SECRET_KEY') else 'default-dev-key'}")

# Configure SQLAlchemy with error handling
try:
    from flask_sqlalchemy import SQLAlchemy
    from flask_migrate import Migrate
    from flask_wtf.csrf import CSRFProtect
    
    # Configure SQLAlchemy
    database_url = os.environ.get('DATABASE_URL')
    if database_url:
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
        print(f"Using database URL from environment: {database_url[:10]}...")
    else:
        # Default to SQLite for development
        sqlite_path = 'sqlite:///portfolio.db'
        app.config['SQLALCHEMY_DATABASE_URI'] = sqlite_path
        print(f"Using default SQLite database: {sqlite_path}")

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize database
    db = SQLAlchemy(app)
    print("SQLAlchemy initialized")
    
    # Configure CSRF protection
    csrf = CSRFProtect(app)
    print("CSRF protection enabled")
    
    # Set permanent session lifetime
    app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours

    # Create a static folder for temp files during build if it doesn't exist
    temp_dir = os.path.join(app.static_folder, 'temp')
    os.makedirs(temp_dir, exist_ok=True)
    print(f"Temp directory created: {temp_dir}")

    # Initialize database
    migrate = Migrate(app, db)

except ImportError as e:
    print(f"Warning: Could not import SQLAlchemy or related dependencies: {str(e)}")
    print("This is expected in a build-only environment")
    
    # Create placeholder variables for static site generation
    db = None
    csrf = None

# Import routes - do this at the end to avoid circular imports
try:
    from app import routes
    print("Routes imported successfully")
except Exception as e:
    print(f"Warning: Could not import routes: {str(e)}")
    print("This is expected in a build-only environment without full dependencies") 