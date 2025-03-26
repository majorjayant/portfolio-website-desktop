# Import necessary modules
from flask import render_template, request, jsonify, flash, redirect, url_for, session, send_file
from datetime import datetime
import uuid
from app.models.portfolio_image import PortfolioImage, db
from app.utils.image_generator import generate_image as generate_image_util
from app.utils.s3_utils import s3_handler
from app import app
import os
from io import BytesIO
from PIL import Image

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
        
        # Generate 6 variations
        variations = []
        
        # Define variations based on image type
        for i in range(6):
            params = base_params.copy()
            
            # Modify params slightly for each variation to create diversity
            if image_type == 'logo':
                # For logos, vary color and style
                color_terms = ['blue', 'green', 'elegant', 'minimalist', 'tech', 'creative']
                varying_description = description + " " + color_terms[i]
                params['description'] = varying_description
            
            elif image_type == 'banner':
                # For banners, add different pattern hints
                pattern_terms = ['gradient', 'diagonal', 'minimalist', 'grid', 'dark', 'light']
                varying_description = description + " " + pattern_terms[i]
                params['description'] = varying_description
            
            elif image_type == 'profile':
                # For profile photos, vary the style
                style_terms = ['professional', 'creative', 'square', 'circle', 'abstract', 'modern']
                varying_description = description + " " + style_terms[i]
                params['description'] = varying_description
            
            elif image_type == 'project':
                # For project thumbnails, vary the style
                style_terms = ['chart', 'code', 'lines', 'pattern', 'dark', 'light']
                varying_description = description + " " + style_terms[i]
                params['description'] = varying_description
            
            elif image_type == 'icon':
                # For icons, cycle through different types and styles
                params['icon_type'] = icon_types[i % len(icon_types)]
                style_terms = ['filled', 'outline', 'gradient']
                varying_description = description + " " + style_terms[i % len(style_terms)]
                params['description'] = varying_description
            
            elif image_type == 'text':
                # For text banners, vary the style
                style_terms = ['gradient', 'diagonal', 'minimalist', 'dots', 'left', 'right']
                varying_description = description + " " + style_terms[i]
                params['description'] = varying_description
            
            # Generate image with variation
            img, content_type, img_format = generate_image_util(image_type, **params)
            
            # Create a unique filename
            file_extension = '.png' if img_format.upper() == 'PNG' else '.jpg'
            temp_filename = f"temp_{image_type}_{i}{file_extension}"
            temp_path = os.path.join('app/static/temp', temp_filename)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(temp_path), exist_ok=True)
            
            # Save the image locally for display
            img.save(temp_path)
            
            # Add to variations with URL and download information
            variations.append({
                'id': i,
                'url': url_for('static', filename=f'temp/{temp_filename}'),
                'download_name': f"{filename_prefix}_{i+1}{file_extension}",
                'content_type': content_type,
                'params': params
            })
        
        # Store generated options in session
        session['image_variations'] = variations
        
        return render_template('image_variations.html', 
                               variations=variations, 
                               image_type=image_type,
                               description=description)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/download-variation/<int:variation_id>')
def download_variation(variation_id):
    """Download a specific image variation"""
    try:
        if 'image_variations' not in session:
            return jsonify({"error": "Image variations session expired. Please generate new images."}), 400
        
        # Get the selected variation from session
        variations = session['image_variations']
        selected = next((v for v in variations if v['id'] == variation_id), None)
        
        if not selected:
            return jsonify({"error": "Invalid variation ID."}), 400
        
        # Get the image file path from the URL
        image_url = selected['url']
        # The URL is like /static/temp/filename.ext
        image_path = os.path.join(app.root_path, 'static', 'temp', os.path.basename(image_url))
        
        # Debug information
        print(f"Looking for image at: {image_path}")
        print(f"File exists: {os.path.exists(image_path)}")
        
        # Check if file exists
        if not os.path.exists(image_path):
            return jsonify({"error": "Image file not found."}), 404
        
        # Return the file for download
        return send_file(
            image_path,
            mimetype=selected['content_type'],
            as_attachment=True,
            download_name=selected['download_name']
        )
    
    except Exception as e:
        print(f"Download error: {str(e)}")
        return jsonify({"error": str(e)}), 500 