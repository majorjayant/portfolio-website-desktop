import os
from app import app, db
from app.models.portfolio_image import PortfolioImage

def init_db():
    """Initialize the database and create all tables."""
    print("Creating database tables...")
    
    # Create tables
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")
        
        # Check if tables were created by checking if portfolio_images table exists
        tables = db.engine.table_names()
        print(f"Tables in database: {tables}")
        
        if 'portfolio_images' in tables:
            print("PortfolioImage table created successfully!")
            # Count existing records
            image_count = PortfolioImage.query.count()
            print(f"Current number of images in database: {image_count}")
        else:
            print("PortfolioImage table was not created!")

if __name__ == "__main__":
    init_db() 