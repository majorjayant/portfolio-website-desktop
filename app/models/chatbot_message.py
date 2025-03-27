from datetime import datetime
from app import db

class ChatbotMessage(db.Model):
    """Model for storing chatbot interactions"""
    __tablename__ = 'chatbot_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.Text, nullable=False)
    is_user = db.Column(db.Boolean, default=True)
    session_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<ChatbotMessage {'User' if self.is_user else 'Bot'}: {self.message[:20]}..." 