#!/usr/bin/env python
"""
Main entry point for the Portfolio Website application.
This file can be used to run the application directly.
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask extensions
db = SQLAlchemy()
migrate = Migrate()
csrf = CSRFProtect()
login_manager = LoginManager()

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'admin.login'
    
    with app.app_context():
        # Import models
        from app.models import Admin, SiteConfig
        
        # Create database tables
        db.create_all()
        
        # Create default admin user if none exists
        if not Admin.query.first():
            admin = Admin(username='admin')
            admin.set_password('admin')
            db.session.add(admin)
            db.session.commit()
    
    # Register blueprints
    from app.routes.admin import admin_bp
    app.register_blueprint(admin_bp)
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    # Create all database tables if they don't exist
    with app.app_context():
        db.create_all()
    
    # Run the application
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    
    print(f"Starting Portfolio Website on port {port} (debug={debug})")
    print("Press CTRL+C to stop the server")
    
    app.run(debug=debug, host='0.0.0.0', port=port) 