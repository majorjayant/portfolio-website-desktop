from datetime import datetime
from app import db

class Visitor(db.Model):
    """Model for tracking website visitors"""
    __tablename__ = 'visitors'
    
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(50), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    page_visited = db.Column(db.String(255), nullable=False)
    referrer = db.Column(db.String(255), nullable=True)
    visit_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Visitor {self.id} - {self.page_visited}>' 