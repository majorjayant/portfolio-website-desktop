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
    
    # Database configuration
    is_static_deployment = os.environ.get('STATIC_DEPLOYMENT', 'false').lower() == 'true'
    app.config['STATIC_DEPLOYMENT'] = is_static_deployment
    
    if not is_static_deployment:
        db_url = os.environ.get('DATABASE_URL')
        if db_url:
            # Use MySQL if provided
            app.config['SQLALCHEMY_DATABASE_URI'] = db_url
        else:
            # Fall back to SQLite
            db_path = os.path.join(os.getcwd(), 'app.db')
            app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
        
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        
        # Initialize database
        db.init_app(app)
        migrate.init_app(app, db)
        print("SQLAlchemy initialized successfully")
    else:
        print("Static deployment mode: Database initialization skipped")
    
    # Initialize CSRF protection
    csrf.init_app(app)
    print("CSRF protection initialized successfully")
    
    # Set session lifetime
    app.permanent_session_lifetime = timedelta(days=7)
    
    # Create a temporary directory for file uploads
    try:
        temp_dir = os.path.join(app.static_folder, 'temp')
        os.makedirs(temp_dir, exist_ok=True)
        print(f"Created temp directory in static folder")
    except Exception as e:
        print(f"Error creating temp directory: {e}")
    
    # Now initialize database
    if not is_static_deployment:
        with app.app_context():
            try:
                db.create_all()
                print("Database tables created successfully")
                
                # Initialize site config after all models are imported
                from app.utils.db_migration import init_site_config
                init_site_config()

                # Import models
                from app.models import Admin
                
                @login_manager.user_loader
                def load_user(user_id):
                    return Admin.query.get(int(user_id))
                
                # Create admin user if it doesn't exist
                if not Admin.query.first():
                    admin = Admin(username='admin')
                    admin.set_password('admin')  # Change this password in production!
                    db.session.add(admin)
                    db.session.commit()
            except Exception as e:
                print(f"Error initializing database: {e}")
    
    # Import and register blueprints/routes
    with app.app_context():
        from app.routes import register_routes
        from app.routes.admin import admin_bp
        register_routes(app)
        app.register_blueprint(admin_bp)
    
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