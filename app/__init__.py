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

# Load environment variables
load_dotenv()

# Initialize app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'development-key')

# Configure session to be permanent with a timeout of 30 minutes
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
app.config['SESSION_TYPE'] = 'filesystem'  # Set session type
Session(app)  # Initialize Flask-Session

# Setup CSRF protection
csrf = CSRFProtect(app)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///portfolio.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
from app.models.portfolio_image import db
db.init_app(app)
migrate = Migrate(app, db)

# Import routes
from app import routes 