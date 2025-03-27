# This file is intentionally empty
# It exists to make the 'app/models' directory a proper Python package 

# Import db instance first to avoid circular imports
from app import db

# Import models
from app.models.portfolio_image import PortfolioImage
from app.models.user_profile import UserProfile
from app.models.site_config import SiteConfig

# Export all models 
__all__ = ['db', 'PortfolioImage', 'UserProfile', 'SiteConfig'] 