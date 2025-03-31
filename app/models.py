from datetime import datetime
# This file is for backward compatibility
# Import all models from the models package

from app.models import db, SiteConfig

# Re-export the models and db for backward compatibility
__all__ = ['db', 'SiteConfig'] 