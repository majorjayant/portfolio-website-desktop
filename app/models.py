from datetime import datetime
# This file is for backward compatibility
# Import all models from the models package

from app.models import db, UserProfile, PortfolioImage, Visitor, ChatbotMessage

# Re-export the models and db for backward compatibility
__all__ = ['db', 'UserProfile', 'PortfolioImage', 'Visitor', 'ChatbotMessage'] 