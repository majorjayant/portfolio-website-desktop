# This file is intentionally empty
# It exists to make the 'app' directory a proper Python package 

# Import necessary packages
from flask import Flask
import os
import sys
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from datetime import timedelta
from flask_migrate import Migrate
from flask_login import LoginManager

# Initialize Flask extensions
db = SQLAlchemy()
migrate = Migrate()
csrf = CSRFProtect()
login_manager = LoginManager()

# Create app instance
app = None

def create_app(test_config=None):
    """Create and configure the Flask application"""
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
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    
    # Configure Flask-Login
    login_manager.init_app(app)
    login_manager.login_view = 'admin.login'
    login_manager.login_message = 'Please log in to access this page.'
    
    # Import models
    from app.models import Admin
    
    @login_manager.user_loader
    def load_user(user_id):
        return Admin.query.get(int(user_id))
    
    # Create database tables
    with app.app_context():
        db.create_all()
        
        # Create default admin user if none exists
        if not Admin.query.first():
            admin = Admin(username='admin')
            admin.set_password('admin')
            db.session.add(admin)
            db.session.commit()
    
    # Register blueprints
    from app.routes.admin import admin_bp
    app.register_blueprint(admin_bp, url_prefix='/admin')
    
    return app

# Initialize the app instance
app = create_app()

# Import models after app is created to avoid circular imports
if not app.config.get('STATIC_DEPLOYMENT', False):
    try:
        from app.models.site_config import SiteConfig
        from app.models.portfolio_image import PortfolioImage
        print("Models imported successfully")
    except Exception as e:
        print(f"Error importing models: {e}") 