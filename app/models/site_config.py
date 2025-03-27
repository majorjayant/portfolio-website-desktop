from datetime import datetime
from app import db
import os

class SiteConfig(db.Model):
    """Model for storing site-wide configuration including image URLs"""
    __tablename__ = 'site_configs'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), nullable=False, unique=True)
    value = db.Column(db.Text, nullable=True)
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<SiteConfig {self.key}>"
    
    @classmethod
    def get_value(cls, key, default=None):
        """Get a configuration value by key"""
        try:
            config = cls.query.filter_by(key=key).first()
            if config:
                return config.value
            return default
        except Exception as e:
            # Log the error if possible
            print(f"Error getting config value for {key}: {str(e)}")
            return default
    
    @classmethod
    def set_value(cls, key, value, description=None):
        """Set a configuration value"""
        try:
            config = cls.query.filter_by(key=key).first()
            if config:
                config.value = value
                if description:
                    config.description = description
                config.updated_at = datetime.utcnow()
            else:
                config = cls(key=key, value=value, description=description)
                db.session.add(config)
            db.session.commit()
            return config
        except Exception as e:
            # Log the error if possible
            print(f"Error setting config value for {key}: {str(e)}")
            db.session.rollback()
            return None
    
    @classmethod
    def get_image_url(cls, image_type):
        """Get image URL by type (favicon, logo, banner, about_profile, about_photo1, etc.) with fallbacks for deployments"""
        try:
            # First try getting from environment variables (for Netlify deployment)
            env_key = f"IMAGE_{image_type.upper()}_URL"
            if env_key in os.environ and os.environ[env_key]:
                return os.environ[env_key]
                
            # Then try getting from the database
            key = f"image_{image_type}_url"
            url = cls.get_value(key)
            if url:
                return url
                
            # Fallback S3 URLs for production deployments
            s3_fallbacks = {
                'favicon': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon',
                'logo': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo',
                'banner': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner',
                'about_profile': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg',
                'about_photo1': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/about_photo1.jpg',
                'about_photo2': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/about_photo2.jpg',
                'about_photo3': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/about_photo3.jpg',
                'about_photo4': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/about_photo4.jpg'
            }
            
            # Use S3 fallbacks for production
            if image_type in s3_fallbacks:
                return s3_fallbacks[image_type]
                
            # Final local static fallbacks
            defaults = {
                'favicon': '/static/img/favicon.png',
                'logo': '/static/img/logo.png',
                'banner': '/static/img/banner_latest.png',
                'about_profile': '/static/img/placeholder.png',
                'about_photo1': '/static/img/placeholder.png',
                'about_photo2': '/static/img/placeholder.png',
                'about_photo3': '/static/img/placeholder.png',
                'about_photo4': '/static/img/placeholder.png'
            }
            return defaults.get(image_type, '/static/img/placeholder.png')
        
        except Exception as e:
            # Log the error if possible
            print(f"Error getting image URL for {image_type}: {str(e)}")
            # Return a fallback based on image type
            fallbacks = {
                'favicon': '/static/img/favicon.png',
                'logo': '/static/img/logo.png',
                'banner': '/static/img/banner_latest.png',
                'about_profile': '/static/img/placeholder.png',
                'about_photo1': '/static/img/placeholder.png',
                'about_photo2': '/static/img/placeholder.png',
                'about_photo3': '/static/img/placeholder.png',
                'about_photo4': '/static/img/placeholder.png'
            }
            return fallbacks.get(image_type, '/static/img/placeholder.png')
    
    @classmethod
    def get_about_content(cls):
        """Get about me section content with fallbacks"""
        # Default content if nothing is found in the database
        default_content = {
            'title': 'about.',
            'subtitle': "I'm a passionate product manager based in New Delhi, India.",
            'description': "Since 2015, I've enjoyed turning complex problems into simple, beautiful and intuitive designs. When I'm not coding or managing products, you'll find me cooking, playing video games or exploring new places.",
            'profile_image': cls.get_image_url('about_profile'),
            'photos': [
                {'url': cls.get_image_url('about_photo1'), 'alt': 'Personal photo 1'},
                {'url': cls.get_image_url('about_photo2'), 'alt': 'Personal photo 2'},
                {'url': cls.get_image_url('about_photo3'), 'alt': 'Personal photo 3'},
                {'url': cls.get_image_url('about_photo4'), 'alt': 'Personal photo 4'}
            ]
        }
        
        try:
            # Try to get values from database
            title = cls.get_value('about_title', default_content['title'])
            subtitle = cls.get_value('about_subtitle', default_content['subtitle'])
            description = cls.get_value('about_description', default_content['description'])
            
            # Get photo alt texts with fallbacks
            photo1_alt = cls.get_value('about_photo1_alt', 'Personal photo 1')
            photo2_alt = cls.get_value('about_photo2_alt', 'Personal photo 2')
            photo3_alt = cls.get_value('about_photo3_alt', 'Personal photo 3')
            photo4_alt = cls.get_value('about_photo4_alt', 'Personal photo 4')
            
            # Ensure we have valid image URLs, falling back to static files if S3 URLs fail
            profile_image = cls.get_image_url('about_profile')
            if not profile_image or profile_image.startswith('Error:'):
                profile_image = '/static/img/profile.jpg'
            
            photo1_url = cls.get_image_url('about_photo1')
            if not photo1_url or photo1_url.startswith('Error:'):
                photo1_url = '/static/img/about_photo1.jpg'
            
            photo2_url = cls.get_image_url('about_photo2')
            if not photo2_url or photo2_url.startswith('Error:'):
                photo2_url = '/static/img/about_photo2.jpg'
            
            photo3_url = cls.get_image_url('about_photo3')
            if not photo3_url or photo3_url.startswith('Error:'):
                photo3_url = '/static/img/about_photo3.jpg'
            
            photo4_url = cls.get_image_url('about_photo4')
            if not photo4_url or photo4_url.startswith('Error:'):
                photo4_url = '/static/img/about_photo4.jpg'
            
            # Construct and return the content
            return {
                'title': title,
                'subtitle': subtitle,
                'description': description,
                'profile_image': profile_image,
                'photos': [
                    {'url': photo1_url, 'alt': photo1_alt},
                    {'url': photo2_url, 'alt': photo2_alt},
                    {'url': photo3_url, 'alt': photo3_alt},
                    {'url': photo4_url, 'alt': photo4_alt}
                ]
            }
        except Exception as e:
            # Log the error if possible
            print(f"Error getting about content: {str(e)}")
            return default_content 