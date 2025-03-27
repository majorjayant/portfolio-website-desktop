from app import create_app
from app.models import db
from app.utils.db_migration import init_site_config

def reset_database():
    """Reset the database and initialize site configurations"""
    print("Resetting database...")
    app = create_app()
    
    with app.app_context():
        # Drop all tables
        print("Dropping all tables...")
        db.drop_all()
        
        # Create all tables
        print("Creating all tables...")
        db.create_all()
        
        # Initialize site configuration
        print("Initializing site configuration...")
        init_site_config()
        
        print("Database reset complete!")

if __name__ == "__main__":
    reset_database() 