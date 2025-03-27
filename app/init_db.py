"""
Database initialization script
This script creates and populates the database with initial data
"""

from app import db
from app.models import UserProfile, PortfolioImage

def init_db():
    """Initialize the database with default data"""
    print("Initializing database...")
    
    # Create tables if they don't exist
    db.create_all()
    
    # Check if user profile exists
    profile = UserProfile.query.first()
    if not profile:
        # Create default user profile
        profile = UserProfile(
            name="Jayant",
            bio_header="Product Manager",
            bio="Over the past 15 years, I've worked in various areas of digital design, including front-end development, user experience design, and product management. My approach combines technical expertise with a deep understanding of user needs to deliver products that truly make a difference.",
            objective="To leverage my skills in product development, user experience design, and technical implementation to create meaningful products that solve real-world problems and deliver exceptional value to users and stakeholders alike.",
            profile_image_url="https://website-majorjayant.s3.eu-north-1.amazonaws.com/64a2f619-164f-41c9-9c21-5ac116bf8f12.jpeg",
            logo_url="https://website-majorjayant.s3.eu-north-1.amazonaws.com/Group+1+(1).png",
            banner_url="https://website-majorjayant.s3.eu-north-1.amazonaws.com/Group+4.png",
            favicon_url="https://website-majorjayant.s3.eu-north-1.amazonaws.com/Group+3.png",
            theme_primary_color="#3a4a70",
            theme_secondary_color="#f8f9fa",
            theme_accent_color="#2d3a59"
        )
        db.session.add(profile)
        print("Created default user profile")
    else:
        # Update existing profile with new images if not already set
        if not profile.profile_image_url:
            profile.profile_image_url = "https://website-majorjayant.s3.eu-north-1.amazonaws.com/64a2f619-164f-41c9-9c21-5ac116bf8f12.jpeg"
        if not profile.logo_url:
            profile.logo_url = "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Group+1+(1).png"
        if not profile.banner_url:
            profile.banner_url = "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Group+4.png"
        if not profile.favicon_url:
            profile.favicon_url = "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Group+3.png"
        print("Updated existing user profile")
    
    # Add portfolio images if they don't exist
    images = [
        {
            "name": "Profile Photo",
            "type": "profile",
            "s3_key": "64a2f619-164f-41c9-9c21-5ac116bf8f12.jpeg",
            "s3_url": "https://website-majorjayant.s3.eu-north-1.amazonaws.com/64a2f619-164f-41c9-9c21-5ac116bf8f12.jpeg"
        },
        {
            "name": "Logo",
            "type": "logo",
            "s3_key": "Group+1+(1).png",
            "s3_url": "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Group+1+(1).png"
        },
        {
            "name": "Banner",
            "type": "banner",
            "s3_key": "Group+4.png",
            "s3_url": "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Group+4.png"
        },
        {
            "name": "Favicon",
            "type": "favicon",
            "s3_key": "Group+3.png",
            "s3_url": "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Group+3.png"
        }
    ]
    
    for img_data in images:
        # Check if image already exists
        existing_image = PortfolioImage.query.filter_by(s3_key=img_data["s3_key"]).first()
        if not existing_image:
            new_image = PortfolioImage(
                name=img_data["name"],
                type=img_data["type"],
                s3_key=img_data["s3_key"],
                s3_url=img_data["s3_url"]
            )
            db.session.add(new_image)
            print(f"Added {img_data['type']} image: {img_data['name']}")
    
    # Commit all changes
    db.session.commit()
    print("Database initialization complete!")

if __name__ == "__main__":
    # Import the app context
    from app import app
    with app.app_context():
        init_db() 