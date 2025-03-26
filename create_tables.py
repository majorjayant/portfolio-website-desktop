from flask import Flask
from app import app
from app.models.portfolio_image import db, PortfolioImage
import os
import sys
import traceback
from dotenv import load_dotenv
import sqlalchemy

# Load environment variables
load_dotenv()

def create_database_tables():
    """Create all database tables"""
    try:
        with app.app_context():
            # Test connection to the database
            print("Testing database connection...")
            engine = db.engine
            connection = engine.connect()
            connection.close()
            print("Database connection successful!")
            
            # Check if the database exists
            print("Checking if database 'website' exists...")
            db_name = os.environ.get('DB_NAME')
            inspector = sqlalchemy.inspect(engine)
            tables = inspector.get_table_names()
            print(f"Existing tables in '{db_name}' database: {tables}")
            
            print("\nCreating database tables...")
            # Create all tables defined in models
            db.create_all()
            print("Database tables created successfully!")

            # List all tables in the database
            print("\nCreated tables:")
            for table in db.metadata.tables.keys():
                print(f"- {table}")
                
    except Exception as e:
        print("\n===== ERROR =====")
        print(f"Failed to create tables: {str(e)}")
        print("\nDetailed traceback:")
        traceback.print_exc()
        print("=================")
        return False
    
    return True

if __name__ == "__main__":
    # Print database configuration
    db_host = os.environ.get('DB_HOST')
    db_port = os.environ.get('DB_PORT')
    db_user = os.environ.get('DB_USER')
    db_name = os.environ.get('DB_NAME')
    db_url = os.environ.get('DATABASE_URL')
    
    print(f"Database Configuration:")
    print(f"Host: {db_host}")
    print(f"Port: {db_port}")
    print(f"User: {db_user}")
    print(f"Database: {db_name}")
    print(f"SQLAlchemy URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    print("\n")
    
    success = create_database_tables()
    
    if success:
        print("\nDatabase setup completed successfully!")
        sys.exit(0)
    else:
        print("\nDatabase setup failed!")
        sys.exit(1) 