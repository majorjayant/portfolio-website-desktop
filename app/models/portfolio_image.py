from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class PortfolioImage(db.Model):
    __tablename__ = 'portfolio_images'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # logo, banner, profile, project, icon, text
    s3_key = db.Column(db.String(255), nullable=False, unique=True)
    s3_url = db.Column(db.String(512), nullable=False)
    width = db.Column(db.Integer)
    height = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<PortfolioImage {self.name} ({self.type})>'
        
    @property
    def url(self):
        return self.s3_url 