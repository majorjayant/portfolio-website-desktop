from datetime import datetime
from app import db

class UserProfile(db.Model):
    """Model for storing user profile information that can be edited from the database"""
    __tablename__ = 'user_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, unique=True)
    name = db.Column(db.String(100), nullable=False)
    bio_header = db.Column(db.String(200), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    objective = db.Column(db.Text, nullable=True)
    title = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    website = db.Column(db.String(255), nullable=True)
    github = db.Column(db.String(255), nullable=True)
    linkedin = db.Column(db.String(255), nullable=True)
    twitter = db.Column(db.String(255), nullable=True)
    profile_image = db.Column(db.String(255), nullable=True)
    profile_image_s3 = db.Column(db.String(255), nullable=True)
    banner_image = db.Column(db.String(255), nullable=True)
    favicon = db.Column(db.String(255), nullable=True)
    logo = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<UserProfile {self.name}>"
        
    @property
    def profile_image_url(self):
        """Get the profile image URL from S3 or local path"""
        if self.profile_image_s3:
            return self.profile_image_s3
        elif self.profile_image:
            return f"/static/img/{self.profile_image}"
        return "/static/img/default-profile.jpg" 