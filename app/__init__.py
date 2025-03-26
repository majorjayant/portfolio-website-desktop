# This file is intentionally empty
# It exists to make the 'app' directory a proper Python package 

# Import necessary packages
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os
from dotenv import load_dotenv
from datetime import timedelta
from flask_session import Session  # Import Flask-Session
from flask_wtf.csrf import CSRFProtect  # Import CSRF protection

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure app
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-dev-key')

# Configure SQLAlchemy
database_url = os.environ.get('DATABASE_URL')
if database_url:
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    # Default to SQLite for development
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///portfolio.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure CSRF protection
csrf = CSRFProtect(app)

# Set permanent session lifetime
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours

# Create a static folder for temp files during build if it doesn't exist
temp_dir = os.path.join(app.static_folder, 'temp')
os.makedirs(temp_dir, exist_ok=True)

# Initialize database
from app.models.portfolio_image import db
db.init_app(app)
migrate = Migrate(app, db)

# Import routes
from app import routes 