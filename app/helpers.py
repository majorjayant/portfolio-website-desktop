"""
Helper functions for the Flask application
"""

import os
import sys
import uuid
import datetime

def get_app_info():
    """Get information about the application environment"""
    info = {
        'python_version': sys.version,
        'environment': os.environ.get('FLASK_ENV', 'production'),
        'debug': os.environ.get('FLASK_DEBUG', '0') == '1',
        'timestamp': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
    }
    return info

def generate_unique_id():
    """Generate a unique ID for various application needs"""
    return str(uuid.uuid4())

def format_date(date_obj, format_str='%B %d, %Y'):
    """Format a date object as a string"""
    if not date_obj:
        return ''
    return date_obj.strftime(format_str)

def get_static_url(filepath):
    """Get the URL for a static file, handling both development and production environments"""
    # In development, use the Flask static route
    if os.environ.get('FLASK_ENV', 'production') == 'development':
        return f'/static/{filepath}'
    
    # In production (Netlify), use the root path
    return f'/{filepath}'

def truncate_text(text, max_length=100):
    """Truncate text to a maximum length, adding ellipsis if needed"""
    if not text or len(text) <= max_length:
        return text
    return text[:max_length].rstrip() + '...'

def is_valid_email(email):
    """Simple email validation"""
    if not email or '@' not in email or '.' not in email:
        return False
    return True 