# Import necessary modules
from flask import render_template, request, jsonify, flash, redirect, url_for, session, send_file
from datetime import datetime
import uuid
import os
from io import BytesIO
from PIL import Image
from app.helpers import get_app_info

# Define a function to register all routes with the app
def register_routes(app):
    """Register all routes with the Flask app"""
    
    from app.models.portfolio_image import PortfolioImage, db
    from app.models.site_config import SiteConfig
    from app.utils.image_generator import generate_image as generate_image_util
    from app.utils.s3_utils import s3_handler
    
    @app.before_request
    def make_session_permanent():
        """Make the session permanent with the configured lifetime"""
        session.permanent = True

    # Add SiteConfig to all template contexts
    @app.context_processor
    def inject_site_config():
        """Inject site configuration into all templates"""
        return {'site_config': SiteConfig}

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
        """Admin interface for managing site configuration"""
        # In a real implementation, you'd add authentication here
        
        if request.method == 'POST':
            # Handle image URL updates
            for image_type in ['favicon', 'logo', 'banner']:
                url_key = f"image_{image_type}_url"
                if url_key in request.form:
                    url_value = request.form[url_key].strip()
                    if url_value:
                        SiteConfig.set_value(
                            url_key, 
                            url_value, 
                            f"URL for the site {image_type} image"
                        )
                        flash(f"{image_type.capitalize()} URL updated successfully", "success")
            
            return redirect(url_for('admin_site_config'))
            
        # Get current configuration values
        config_values = {
            'favicon_url': SiteConfig.get_image_url('favicon'),
            'logo_url': SiteConfig.get_image_url('logo'),
            'banner_url': SiteConfig.get_image_url('banner')
        }
        
        return render_template('admin/site_config.html', config=config_values)

    @app.route('/generate-download-image', methods=['POST'])
    def generate_download_image():
        """Generate an image based on description and provide it as a direct download"""
        try:
            # Get form data
            image_type = request.form.get('image_type')
            description = request.form.get('description', '')
            
            # Extract other parameters based on image type
            params = {
                'description': description  # Add description to all image types
            }
            
            if image_type == 'logo':
                params['logo_text'] = request.form.get('logo_text', 'LOGO')
                filename = f"logo_{params['logo_text'].lower()}.png"
                content_type = 'image/png'
            
            elif image_type == 'banner':
                params['width'] = int(request.form.get('width', 1920))
                params['height'] = int(request.form.get('height', 480))
                params['pattern'] = True  # Always add pattern for visual interest
                filename = f"banner_{params['width']}x{params['height']}.jpg"
                content_type = 'image/jpeg'
            
            elif image_type == 'profile':
                params['size'] = int(request.form.get('size', 500))
                filename = f"profile_photo.jpg"
                content_type = 'image/jpeg'
            
            elif image_type == 'project':
                params['category'] = request.form.get('category', 'PROJECT')
                params['width'] = int(request.form.get('width', 400))
                params['height'] = int(request.form.get('height', 300))
                filename = f"project_{params['category'].lower()}.jpg"
                content_type = 'image/jpeg'
            
            elif image_type == 'icon':
                # Determine icon type from description
                if 'document' in description.lower():
                    params['icon_type'] = 'document'
                elif 'chart' in description.lower() or 'graph' in description.lower():
                    params['icon_type'] = 'chart'
                elif 'light' in description.lower() or 'idea' in description.lower():
                    params['icon_type'] = 'lightbulb'
                else:
                    params['icon_type'] = 'default'
                    
                params['size'] = int(request.form.get('size', 200))
                filename = f"icon_{params['icon_type']}.png"
                content_type = 'image/png'
            
            elif image_type == 'text':
                params['text'] = request.form.get('text', 'Sample Text')
                params['width'] = int(request.form.get('width', 1200))
                params['height'] = int(request.form.get('height', 300))
                # Create a safe filename from text
                safe_text = "".join(c for c in params['text'] if c.isalnum() or c in ' _-')[:20]
                filename = f"text_banner_{safe_text.replace(' ', '_')}.jpg"
            else:
                return jsonify({"error": "Invalid image type"}), 400
            
            # Generate the image
            img, generated_content_type, img_format = generate_image_util(image_type, **params)
            
            # Use the format from the generator if available
            if generated_content_type:
                content_type = generated_content_type
            
            # Convert the image to a bytes stream for response
            img_io = BytesIO()
            if img_format == 'JPEG':
                # Ensure image is in RGB mode for JPEG
                if img.mode == 'RGBA':
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
                    img = background
                img.save(img_io, 'JPEG', quality=90)
            else:
                img.save(img_io, format=img_format)
            img_io.seek(0)
            
            # Return image as a downloadable file
            return send_file(
                img_io,
                mimetype=content_type,
                as_attachment=True,
                download_name=filename
            )
        
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/image-generator-tool')
    def image_generator_tool():
        """Render the image generator tool page for users"""
        return render_template('image_generator.html')

    @app.route('/generate-image-variations', methods=['POST'])
    def generate_image_variations():
        """Generate multiple variations of an image based on description and display them for selection"""
        try:
            # Get form data
            image_type = request.form.get('image_type')
            description = request.form.get('description', '')
            
            # Extract other parameters based on image type
            base_params = {
                'description': description  # Add description to all image types
            }
            
            # Configure base params and filename based on image type
            if image_type == 'logo':
                base_params['logo_text'] = request.form.get('logo_text', 'LOGO')
                filename_prefix = f"logo_{base_params['logo_text'].lower()}"
            
            elif image_type == 'banner':
                base_params['width'] = int(request.form.get('width', 1920))
                base_params['height'] = int(request.form.get('height', 480))
                base_params['pattern'] = True
                filename_prefix = f"banner_{base_params['width']}x{base_params['height']}"
            
            elif image_type == 'profile':
                base_params['size'] = int(request.form.get('size', 500))
                filename_prefix = "profile_photo"
            
            elif image_type == 'project':
                base_params['category'] = request.form.get('category', 'PROJECT')
                base_params['width'] = int(request.form.get('width', 400))
                base_params['height'] = int(request.form.get('height', 300))
                filename_prefix = f"project_{base_params['category'].lower()}"
            
            elif image_type == 'icon':
                # For icons, we'll create different icon types
                icon_types = ['document', 'chart', 'lightbulb']
                if 'document' in description.lower():
                    icon_types = ['document'] * 2 + icon_types[1:]
                elif 'chart' in description.lower() or 'graph' in description.lower():
                    icon_types = [icon_types[0]] + ['chart'] * 2 + [icon_types[2]]
                elif 'light' in description.lower() or 'idea' in description.lower():
                    icon_types = icon_types[:2] + ['lightbulb'] * 2
                    
                base_params['size'] = int(request.form.get('size', 200))
                filename_prefix = "icon"
            
            elif image_type == 'text':
                base_params['text'] = request.form.get('text', 'Sample Text')
                base_params['width'] = int(request.form.get('width', 1200))
                base_params['height'] = int(request.form.get('height', 300))
                # Create a safe filename prefix from text
                safe_text = "".join(c for c in base_params['text'] if c.isalnum() or c in ' _-')[:20]
                filename_prefix = f"text_banner_{safe_text.replace(' ', '_')}"
            else:
                return jsonify({"error": "Invalid image type"}), 400
            
            # Generate variations and save to temp folder
            variations = []
            for i in range(3):  # Reducing to 3 variations for simplicity
                # Generate variations with different parameters
                # ... (implement your variation generation logic)
                
                # For now, just return dummy data
                variation_id = i + 1
                temp_url = f"/static/temp/sample_{variation_id}.jpg"
                variations.append({
                    "id": variation_id,
                    "url": temp_url,
                    "description": f"Variation {variation_id}"
                })
                
            return jsonify({"variations": variations})
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/download-variation/<int:variation_id>')
    def download_variation(variation_id):
        """Download a specific image variation"""
        try:
            # In a real implementation, you would retrieve the actual image
            # For now, return a placeholder response
            return jsonify({"message": f"Downloading variation {variation_id}", "status": "success"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # Health check endpoint for monitoring
    @app.route('/health')
    def health_check():
        """Health check endpoint for monitoring"""
        app_info = get_app_info()
        return jsonify({
            'status': 'ok',
            'message': 'Application is running',
            'environment': app_info['environment'],
            'timestamp': app_info['timestamp']
        })

    # Error handlers
    @app.errorhandler(404)
    def page_not_found(e):
        """Handle 404 errors"""
        return render_template('404.html'), 404

    @app.errorhandler(500)
    def server_error(e):
        """Handle 500 errors"""
        return render_template('500.html'), 500 