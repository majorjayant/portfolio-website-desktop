from datetime import datetime
from app import db

class PortfolioImage(db.Model):
    __tablename__ = 'portfolio_images'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    s3_key = db.Column(db.String(255), nullable=True)
    s3_url = db.Column(db.String(255), nullable=True)
    width = db.Column(db.Integer, nullable=True)
    height = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<PortfolioImage {self.name}>"
    
    @property
    def url(self):
        """Return the URL for the image"""
        if self.s3_url:
            return self.s3_url
        return f"/static/img/{self.name}" 