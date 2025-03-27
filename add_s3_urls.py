from app import create_app
from app.models import SiteConfig

def update_image_urls():
    """Update image URLs to use S3 links"""
    print("Updating image URLs to S3 links...")
    app = create_app()
    
    with app.app_context():
        # Update banner image URL
        banner_url = "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner"
        print(f"Setting banner URL to: {banner_url}")
        SiteConfig.set_value(
            "image_banner_url", 
            banner_url,
            "S3 URL for the homepage banner image"
        )
        
        # Update logo URL
        logo_url = "https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo"
        print(f"Setting logo URL to: {logo_url}")
        SiteConfig.set_value(
            "image_logo_url", 
            logo_url,
            "S3 URL for the site logo"
        )
        
        # Update favicon URL
        favicon_url = "https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon"
        print(f"Setting favicon URL to: {favicon_url}")
        SiteConfig.set_value(
            "image_favicon_url", 
            favicon_url,
            "S3 URL for the site favicon"
        )
        
        print("Image URLs updated successfully!")
        
        # Display current configuration
        print("\nCurrent configuration:")
        for key in ["image_banner_url", "image_logo_url", "image_favicon_url"]:
            config = SiteConfig.query.filter_by(key=key).first()
            if config:
                print(f"{key}: {config.value}")

if __name__ == "__main__":
    update_image_urls() 