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
        return render_template('index.html')

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
            logger.error(f"Error in admin_site_config: {str(e)}")
            return render_template('admin/site-config.html', configs=[], image_urls={})

    @app.route('/health')
    def health_check():
        """Health check endpoint for monitoring"""
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'version': os.environ.get('APP_VERSION', 'development')
        })

    @app.errorhandler(404)
    def page_not_found(e):
        """Handle 404 errors"""
        return render_template('404.html'), 404

    @app.errorhandler(500)
    def server_error(e):
        """Handle 500 errors"""
        return render_template('500.html'), 500

    # API Endpoints
    @app.route('/api/site-config', methods=['GET'])
    def get_site_config():
        """API endpoint to get site configuration"""
        try:
            # Get all site configuration
            configs = {}
            for config in SiteConfig.query.all():
                configs[config.key] = {
                    'value': config.value,
                    'description': config.description,
                    'updated_at': config.updated_at.isoformat() if config.updated_at else None
                }
            
            return jsonify({
                'status': 'success',
                'data': configs
            })
        except Exception as e:
            logger.error(f"Error fetching site config: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500

    @app.route('/api/about', methods=['GET'])
    def get_about():
        """API endpoint to get about section content"""
        try:
            about_content = SiteConfig.get_about_content()
            return jsonify({
                'status': 'success',
                'data': about_content
            })
        except Exception as e:
            logger.error(f"Error fetching about content: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500

    @app.route('/api/projects', methods=['GET'])
    def get_projects_api():
        """API endpoint to get projects data"""
        try:
            projects = get_projects()
            return jsonify({
                'status': 'success',
                'data': projects
            })
        except Exception as e:
            logger.error(f"Error fetching projects: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500

    @app.route('/api/experience', methods=['GET'])
    def get_experience_api():
        """API endpoint to get experience data"""
        try:
            experience = get_experience()
            return jsonify({
                'status': 'success',
                'data': experience
            })
        except Exception as e:
            logger.error(f"Error fetching experience: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500

    @app.route('/api/education', methods=['GET'])
    def get_education_api():
        """API endpoint to get education data"""
        try:
            education = get_education()
            return jsonify({
                'status': 'success',
                'data': education
            })
        except Exception as e:
            logger.error(f"Error fetching education: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500

    @app.route('/api/certifications', methods=['GET'])
    def get_certifications_api():
        """API endpoint to get certifications data"""
        try:
            certifications = get_certifications()
            return jsonify({
                'status': 'success',
                'data': certifications
            })
        except Exception as e:
            logger.error(f"Error fetching certifications: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500 