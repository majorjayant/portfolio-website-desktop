# Import necessary modules
from flask import render_template, request, jsonify, flash, redirect, url_for, session, send_file, send_from_directory, abort
from datetime import datetime
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define a function to register all routes with the app
def register_routes(app):
    """Register all routes with the Flask app"""
    
    from app import db, csrf
    from app.models.site_config import SiteConfig
    from app.models.models import get_projects, get_experience, get_education, get_certifications
    
    try:
        from app.models.portfolio_image import PortfolioImage
    except ImportError:
        # Create a placeholder if the model doesn't exist
        class PortfolioImage:
            pass
    
    # Create a site_config singleton for use in templates
    @app.context_processor
    def inject_site_config():
        return {'site_config': SiteConfig}
    
    @app.before_request
    def make_session_permanent():
        """Make the session permanent with the configured lifetime"""
        session.permanent = True

    @app.route('/', strict_slashes=False)
    def home():
        """Render the home page"""
        # Only handle exact '/' path to prevent catching all routes
        if request.path != '/':
            return abort(404)
            
        # Get dummy data if database operations fail
        try:
            projects = get_projects()
            experience = get_experience()
            education = get_education()
            certifications = get_certifications()
        except Exception as e:
            app.logger.error(f"Error getting content data: {str(e)}")
            projects = []
            experience = []
            education = []
            certifications = []
        
        # Get about section content from the database with fallback
        try:
            about_content = SiteConfig.get_about_content()
        except Exception as e:
            app.logger.error(f"Error getting about content: {str(e)}")
            about_content = None
            
        # Fallback content if database fails
        if not about_content:
            about_content = {
                'title': 'about.',
                'subtitle': "I'm a product designer based in sunny Sydney, Australia.",
                'description': "Since 2005, I've enjoyed turning complex problems into simple, beautiful and intuitive designs. When I'm not pushing pixels, you'll find me cooking, gardening or working out in the park.",
                'profile_image': '/static/img/profile.jpg',
                'photos': [
                    {'url': '/static/img/about_photo1.jpg', 'alt': 'Mini me'},
                    {'url': '/static/img/about_photo2.jpg', 'alt': 'Sunny Sydney'},
                    {'url': '/static/img/about_photo3.jpg', 'alt': 'Home sweet home'},
                    {'url': '/static/img/about_photo4.jpg', 'alt': 'My workspace'}
                ]
            }
        
        return render_template('index.html', 
                              projects=projects, 
                              experience=experience,
                              education=education,
                              certifications=certifications,
                              about_content=about_content)

    @app.route('/projects')
    def projects():
        """Render the projects page"""
        return render_template('projects.html')

    @app.route('/solutions')
    def solutions():
        """Render the solutions page"""
        return render_template('solutions.html')

    @app.route('/contact')
    def contact():
        """Render the contact page"""
        return render_template('contact.html')

    @app.route('/health')
    def health_check():
        """Health check endpoint for monitoring"""
        app_info = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': os.environ.get('APP_VERSION', 'development')
        }
        
        # Check if this is being called during static site generation
        if app.config.get('STATIC_DEPLOYMENT', False):
            # Return HTML for static site generation
            return render_template('404.html', message="Health check endpoint")
            
        # Regular JSON response for API calls
        return jsonify(app_info)

    @app.errorhandler(404)
    def page_not_found(e):
        """Handle 404 errors"""
        return render_template('404.html'), 404

    @app.errorhandler(500)
    def server_error(e):
        """Handle 500 errors"""
        return render_template('500.html'), 500 