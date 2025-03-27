#!/usr/bin/env python
"""
Database update script for the Portfolio Website
This script updates the database schema and populates default values for new fields.
"""

import os
import sys
from sqlalchemy import inspect, create_engine, MetaData, Table, Column, String, Text
from sqlalchemy.sql import select
from dotenv import load_dotenv
import traceback

# Load environment variables
load_dotenv()

def print_header(message):
    """Print a header message"""
    print("\n" + "=" * 80)
    print(message)
    print("=" * 80)

def get_db_url():
    """Get the database URL from environment variables"""
    # First try to get the standard SQLAlchemy DATABASE_URL
    db_url = os.environ.get('DATABASE_URL')
    
    # If not found, try to build it from individual components
    if not db_url:
        db_host = os.environ.get('DB_HOST', 'localhost')
        db_port = os.environ.get('DB_PORT', '3306')
        db_user = os.environ.get('DB_USER', 'root')
        db_pass = os.environ.get('DB_PASSWORD', '')
        db_name = os.environ.get('DB_NAME', 'portfolio')
        
        # Build the URL
        db_url = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
    
    # If still no URL, use SQLite as fallback
    if not db_url:
        db_url = 'sqlite:///app.db'
    
    return db_url

def update_user_profiles_table():
    """Update the user_profiles table schema"""
    print_header("Updating user_profiles table")
    
    try:
        # Connect to the database
        db_url = get_db_url()
        print(f"Connecting to database: {db_url}")
        engine = create_engine(db_url)
        
        # Get metadata
        metadata = MetaData()
        metadata.reflect(bind=engine)
        
        # Check if user_profiles table exists
        if 'user_profiles' not in metadata.tables:
            print("Table 'user_profiles' does not exist. Creating it...")
            
            # Create the table
            user_profiles = Table(
                'user_profiles', metadata,
                Column('id', Integer, primary_key=True),
                Column('user_id', Integer, unique=True, nullable=True),
                Column('name', String(100), nullable=False),
                Column('bio_header', String(200), nullable=True),
                Column('bio', Text, nullable=True),
                Column('objective', Text, nullable=True),
                Column('title', String(100), nullable=True),
                Column('email', String(100), nullable=True),
                Column('phone', String(20), nullable=True),
                Column('location', String(100), nullable=True),
                Column('website', String(255), nullable=True),
                Column('github', String(255), nullable=True),
                Column('linkedin', String(255), nullable=True),
                Column('twitter', String(255), nullable=True),
                Column('profile_image', String(255), nullable=True),
                Column('profile_image_s3', String(255), nullable=True),
                Column('banner_image', String(255), nullable=True),
                Column('favicon', String(255), nullable=True),
                Column('logo', String(255), nullable=True),
                Column('created_at', DateTime, default=datetime.utcnow),
                Column('updated_at', DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
            )
            metadata.create_all(engine)
            print("✓ Table created successfully")
            
            # Insert default profile
            with engine.connect() as conn:
                ins = user_profiles.insert().values(
                    name="J'ayant",
                    bio_header="test bio",
                    bio="Over the past 15 years, I've worked in various areas of digital design, including front-end development.",
                    objective="Objective test",
                    title="Product Manager & Developer",
                    profile_image_s3="https://website-majorjayant.s3.eu-north-1.amazonaws.com/64a2f619-164f-41c9-9c21-5ac116bf8f12.jpeg"
                )
                conn.execute(ins)
                print("✓ Default profile added")
            
            return
        
        # If table exists, check if columns exist
        table = metadata.tables['user_profiles']
        inspector = inspect(engine)
        columns = [col['name'] for col in inspector.get_columns('user_profiles')]
        
        with engine.begin() as conn:
            # Add bio_header if it doesn't exist
            if 'bio_header' not in columns:
                print("Adding bio_header column...")
                conn.execute('ALTER TABLE user_profiles ADD COLUMN bio_header VARCHAR(200)')
                print("✓ bio_header column added")
            
            # Add objective if it doesn't exist
            if 'objective' not in columns:
                print("Adding objective column...")
                conn.execute('ALTER TABLE user_profiles ADD COLUMN objective TEXT')
                print("✓ objective column added")
            
            # Add profile_image_s3 if it doesn't exist
            if 'profile_image_s3' not in columns:
                print("Adding profile_image_s3 column...")
                conn.execute('ALTER TABLE user_profiles ADD COLUMN profile_image_s3 VARCHAR(255)')
                print("✓ profile_image_s3 column added")
        
        # Update the first profile with the example values
        with engine.connect() as conn:
            # First, check if there's any profile
            select_stmt = select([table.c.id])
            result = conn.execute(select_stmt).fetchone()
            
            if result:
                # Update existing profile
                profile_id = result[0]
                update_stmt = table.update().where(table.c.id == profile_id).values(
                    name="J'ayant",
                    bio_header="test bio",
                    bio="Over the past 15 years, I've worked in various areas of digital design, including front-end development.",
                    objective="Objective test",
                    profile_image_s3="https://website-majorjayant.s3.eu-north-1.amazonaws.com/64a2f619-164f-41c9-9c21-5ac116bf8f12.jpeg"
                )
                conn.execute(update_stmt)
                print("✓ Existing profile updated with example data")
            else:
                # Insert new profile
                ins = table.insert().values(
                    name="J'ayant",
                    bio_header="test bio",
                    bio="Over the past 15 years, I've worked in various areas of digital design, including front-end development.",
                    objective="Objective test",
                    title="Product Manager & Developer",
                    profile_image_s3="https://website-majorjayant.s3.eu-north-1.amazonaws.com/64a2f619-164f-41c9-9c21-5ac116bf8f12.jpeg"
                )
                conn.execute(ins)
                print("✓ New profile inserted with example data")
        
        print("User profiles table update completed!")
        
    except Exception as e:
        print(f"Error updating user_profiles table: {str(e)}")
        traceback.print_exc()

def main():
    """Main function"""
    print_header("Portfolio Website Database Update")
    
    try:
        # Import SQLAlchemy specific types
        from sqlalchemy import Integer, DateTime
        from datetime import datetime
        
        # Update user_profiles table
        update_user_profiles_table()
        
        print_header("Database Update Completed!")
    except Exception as e:
        print(f"Error: {str(e)}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main() 