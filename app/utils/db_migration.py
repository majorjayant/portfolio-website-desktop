"""Database migration utility functions"""
from app.models.site_config import SiteConfig
from app import db

def init_site_config():
    """Initialize site configuration with default values if not present"""
    # Basic site configuration
    defaults = {
        # Site images
        'image_favicon_url': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon',
        'image_logo_url': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo',
        'image_banner_url': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner',
        
        # About section content
        'about_title': 'about.',
        'about_subtitle': "I'm a passionate product manager based in New Delhi, India.",
        'about_description': "Since 2015, I've enjoyed turning complex problems into simple, beautiful and intuitive designs. When I'm not coding or managing products, you'll find me cooking, playing video games or exploring new places.",
        
        # About section images
        'image_about_profile_url': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg',
        'image_about_photo1_url': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/about_photo1.jpg',
        'image_about_photo2_url': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/about_photo2.jpg',
        'image_about_photo3_url': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/about_photo3.jpg',
        'image_about_photo4_url': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/about_photo4.jpg',
        
        # About photo alt text
        'about_photo1_alt': 'Personal photo 1',
        'about_photo2_alt': 'Personal photo 2',
        'about_photo3_alt': 'Personal photo 3',
        'about_photo4_alt': 'Personal photo 4'
    }
    
    # Set default values if not present
    for key, value in defaults.items():
        try:
            existing = SiteConfig.query.filter_by(key=key).first()
            if not existing:
                config = SiteConfig(
                    key=key, 
                    value=value, 
                    description=f"Value for {key} - can be overridden by environment variables on Netlify"
                )
                db.session.add(config)
                print(f"Added default value for {key}")
            else:
                print(f"Config {key} already exists, skipping")
        except Exception as e:
            print(f"Error setting {key}: {str(e)}")
    
    # Commit all changes at once
    try:
        db.session.commit()
        print("Committed all site configuration changes")
    except Exception as e:
        db.session.rollback()
        print(f"Error committing site config changes: {str(e)}")


def run_migrations():
    """Run all database migrations"""
    print("Running database migrations...")
    init_site_config()
    db.session.commit()
    print("Database migrations complete")


if __name__ == "__main__":
    # This allows running migrations directly
    from flask import Flask
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    
    with app.app_context():
        run_migrations() 