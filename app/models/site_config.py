from datetime import datetime
from app import db

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
        config = cls.query.filter_by(key=key).first()
        if config:
            return config.value
        return default
    
    @classmethod
    def set_value(cls, key, value, description=None):
        """Set a configuration value"""
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
    
    @classmethod
    def get_image_url(cls, image_type):
        """Get image URL by type (favicon, logo, banner)"""
        key = f"image_{image_type}_url"
        url = cls.get_value(key)
        if url:
            return url
        
        # Default fallback paths
        defaults = {
            'favicon': '/static/img/favicon.png',
            'logo': '/static/img/logo.png',
            'banner': '/static/img/banner_latest.png'
        }
        return defaults.get(image_type, None) 