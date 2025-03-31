from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

class Admin(UserMixin, db.Model):
    """Admin model for authentication"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def create_admin(username, password):
        """Create a new admin user"""
        admin = Admin(username=username)
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        return admin 