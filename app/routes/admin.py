from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from app import db, login_manager
from app.models import Admin, SiteConfig
from app.forms import LoginForm, SiteConfigForm

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@login_manager.user_loader
def load_user(user_id):
    """Load user by ID."""
    return Admin.query.get(int(user_id))

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Admin login route"""
    if current_user.is_authenticated:
        return redirect(url_for('admin.dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = Admin.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            return redirect(url_for('admin.dashboard'))
        flash('Invalid username or password')
    return render_template('admin/login.html', form=form)

@admin_bp.route('/logout')
@login_required
def logout():
    """Admin logout route"""
    logout_user()
    return redirect(url_for('admin.login'))

@admin_bp.route('/dashboard', methods=['GET'])
@login_required
def dashboard():
    """Admin dashboard route"""
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