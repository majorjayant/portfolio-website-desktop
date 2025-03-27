# Import necessary modules
from flask import render_template, request, jsonify, flash, redirect, url_for, session, send_file, send_from_directory, abort
from datetime import datetime
import os
import logging
import json

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

    @app.route('/')
    def home():
        """Render the home page"""
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

    @app.route('/admin/site-config', methods=['GET', 'POST'])
    def admin_site_config():
        """Admin page for managing site configuration"""
        if not app.config.get('STATIC_DEPLOYMENT', False):
            try:
                if request.method == 'POST':
                    # Get form data
                    key = request.form.get('key')
                    value = request.form.get('value')
                    description = request.form.get('description')
                    
                    # Update or create config entry
                    config = SiteConfig.set_value(key, value, description)
                    if config:
                        flash('Config updated successfully', 'success')
                    else:
                        flash('Error updating config', 'error')
                
                # Get all config entries
                try:
                    configs = SiteConfig.query.all()
                except:
                    configs = []
                
                # Prepare image URLs for display
                image_urls = {
                    'favicon': SiteConfig.get_image_url('favicon'),
                    'logo': SiteConfig.get_image_url('logo'),
                    'banner': SiteConfig.get_image_url('banner'),
                    'about_profile': SiteConfig.get_image_url('about_profile'),
                    'about_photo1': SiteConfig.get_image_url('about_photo1'),
                    'about_photo2': SiteConfig.get_image_url('about_photo2'),
                    'about_photo3': SiteConfig.get_image_url('about_photo3'),
                    'about_photo4': SiteConfig.get_image_url('about_photo4')
                }
                
                return render_template('admin/site-config.html', configs=configs, image_urls=image_urls)
            except Exception as e:
                app.logger.error(f"Error in admin_site_config: {str(e)}")
                return render_template('admin/site-config.html', configs=[], image_urls={})
        else:
            # In static mode, show a message that admin is not available
            return render_template('admin/site-config.html', configs=[], image_urls={}, static_mode=True)

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
        
    @app.route('/api/about-content')
    def get_about_content_api():
        """API endpoint to get fresh about content from database"""
        try:
            # Always get fresh data from the database
            about_content = SiteConfig.get_about_content()
            
            # Log the data being returned
            app.logger.info(f"Fetched fresh about content: {about_content['title']}")
            
            # Update the static JSON file with the latest data
            try:
                # Get the static data path
                static_data_dir = os.path.join(app.static_folder, 'data')
                json_file_path = os.path.join(static_data_dir, 'site_config.json')
                
                # Ensure the directory exists
                if not os.path.exists(static_data_dir):
                    os.makedirs(static_data_dir)
                
                # Read existing file if it exists
                existing_data = {}
                if os.path.exists(json_file_path):
                    with open(json_file_path, 'r', encoding='utf-8') as f:
                        existing_data = json.load(f)
                
                # Update the about_content section
                existing_data['about_content'] = about_content
                existing_data['last_updated'] = datetime.utcnow().isoformat()
                existing_data['update_source'] = 'api_request'
                
                # Write back to the file
                with open(json_file_path, 'w', encoding='utf-8') as f:
                    json.dump(existing_data, f, indent=2, ensure_ascii=False)
                
                app.logger.info(f"Updated static JSON file with fresh content at {json_file_path}")
            except Exception as json_error:
                app.logger.error(f"Error updating static JSON file: {str(json_error)}")
            
            # Return the data as JSON
            return jsonify({
                'status': 'success',
                'data': about_content,
                'timestamp': datetime.utcnow().isoformat()
            })
        except Exception as e:
            app.logger.error(f"Error getting about content from API: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': str(e),
                'timestamp': datetime.utcnow().isoformat()
            }), 500 