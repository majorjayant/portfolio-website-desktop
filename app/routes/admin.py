from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app
from flask_login import login_user, logout_user, login_required, current_user
from app import db, login_manager
from app.models import Admin, SiteConfig
from app.forms import LoginForm, SiteConfigForm
import logging

# Setup logging
logger = logging.getLogger(__name__)

# Create blueprint with explicit url_prefix
admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.before_request
def check_admin_access():
    """Check access to admin routes"""
    logger.info(f"Accessing admin route: {request.path}")
    # Check static mode
    is_static = current_app.config.get('STATIC_DEPLOYMENT', False)
    logger.info(f"Static deployment mode: {is_static}")
    if is_static:
        logger.warning("Admin access blocked due to static mode")
        return render_template('404.html', message="Admin panel is not available in static mode")

@login_manager.user_loader
def load_user(user_id):
    """Load user by ID."""
    logger.info(f"Loading user with ID: {user_id}")
    return Admin.query.get(int(user_id))

@admin_bp.route('/login', methods=['GET', 'POST'], strict_slashes=False)
def login():
    """Admin login route"""
    logger.info("Accessing admin login route")
    
    if current_user.is_authenticated:
        logger.info("User already authenticated, redirecting to dashboard")
        return redirect(url_for('admin.dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        logger.info(f"Login attempt for username: {form.username.data}")
        user = Admin.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            logger.info("Login successful")
            return redirect(url_for('admin.dashboard'))
        logger.warning("Invalid login attempt")
        flash('Invalid username or password')
    return render_template('admin/login.html', form=form)

@admin_bp.route('/logout')
@login_required
def logout():
    """Admin logout route"""
    # Check static mode
    static_response = check_static_mode()
    if static_response:
        return static_response

    logout_user()
    return redirect(url_for('admin.login'))

@admin_bp.route('/dashboard', methods=['GET'])
@login_required
def dashboard():
    """Admin dashboard route"""
    # Check static mode
    static_response = check_static_mode()
    if static_response:
        return static_response

    form = SiteConfigForm()
    config = SiteConfig.query.first()
    
    if config:
        # Pre-populate form with existing data
        form.image_favicon_url.data = config.image_favicon_url
        form.image_logo_url.data = config.image_logo_url
        form.image_banner_url.data = config.image_banner_url
        form.image_about_profile_url.data = config.image_about_profile_url
        form.image_about_photo1_url.data = config.image_about_photo1_url
        form.image_about_photo2_url.data = config.image_about_photo2_url
        form.image_about_photo3_url.data = config.image_about_photo3_url
        form.image_about_photo4_url.data = config.image_about_photo4_url
        form.about_title.data = config.about_title
        form.about_subtitle.data = config.about_subtitle
        form.about_description.data = config.about_description
        form.about_photo1_alt.data = config.about_photo1_alt
        form.about_photo2_alt.data = config.about_photo2_alt
        form.about_photo3_alt.data = config.about_photo3_alt
        form.about_photo4_alt.data = config.about_photo4_alt
    
    return render_template('admin/dashboard.html', form=form)

@admin_bp.route('/update-config', methods=['POST'])
@login_required
def update_config():
    """Update site configuration"""
    # Check static mode
    static_response = check_static_mode()
    if static_response:
        return static_response

    form = SiteConfigForm()
    if form.validate_on_submit():
        config = SiteConfig.query.first()
        if not config:
            config = SiteConfig()
            db.session.add(config)
        
        # Update config with form data
        config.image_favicon_url = form.image_favicon_url.data
        config.image_logo_url = form.image_logo_url.data
        config.image_banner_url = form.image_banner_url.data
        config.image_about_profile_url = form.image_about_profile_url.data
        config.image_about_photo1_url = form.image_about_photo1_url.data
        config.image_about_photo2_url = form.image_about_photo2_url.data
        config.image_about_photo3_url = form.image_about_photo3_url.data
        config.image_about_photo4_url = form.image_about_photo4_url.data
        config.about_title = form.about_title.data
        config.about_subtitle = form.about_subtitle.data
        config.about_description = form.about_description.data
        config.about_photo1_alt = form.about_photo1_alt.data
        config.about_photo2_alt = form.about_photo2_alt.data
        config.about_photo3_alt = form.about_photo3_alt.data
        config.about_photo4_alt = form.about_photo4_alt.data
        
        try:
            db.session.commit()
            flash('Configuration updated successfully', 'success')
        except Exception as e:
            db.session.rollback()
            flash(f'Error updating configuration: {str(e)}', 'error')
    else:
        for field, errors in form.errors.items():
            for error in errors:
                flash(f'{field}: {error}', 'error')
    
    return redirect(url_for('admin.dashboard')) 