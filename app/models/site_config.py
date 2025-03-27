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
        """Get image URL by type (favicon, logo, banner) with fallbacks for deployments"""
        # First try getting from environment variables (for Netlify deployment)
        env_key = f"IMAGE_{image_type.upper()}_URL"
        if env_key in os.environ:
            return os.environ[env_key]
            
        # Then try getting from the database
        key = f"image_{image_type}_url"
        try:
            url = cls.get_value(key)
            if url:
                return url
        except Exception:
            # Silently fail if database is not available
            pass
        
        # Fallback S3 URLs for production deployments
        s3_fallbacks = {
            'favicon': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon',
            'logo': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo',
            'banner': 'https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner'
        }
        
        # Use S3 fallbacks for production
        if image_type in s3_fallbacks:
            return s3_fallbacks[image_type]
            
        # Final local static fallbacks
        defaults = {
            'favicon': '/static/img/favicon.png',
            'logo': '/static/img/logo.png',
            'banner': '/static/img/banner_latest.png'
        }
        return defaults.get(image_type, None) 