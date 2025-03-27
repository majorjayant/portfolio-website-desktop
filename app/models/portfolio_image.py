from datetime import datetime
from app import db

class PortfolioImage(db.Model):
    """Model for storing portfolio images"""
    __tablename__ = 'portfolio_images'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=True)  # e.g., 'project', 'about', 'banner'
    s3_key = db.Column(db.String(255), nullable=True)
    s3_url = db.Column(db.String(255), nullable=True)
    local_path = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<PortfolioImage {self.id}: {self.title}>"
    
    @property
    def url(self):
        """Return the URL to use for the image (S3 or local)"""
        if self.s3_url:
            return self.s3_url
        elif self.local_path:
            return self.local_path
        return None 