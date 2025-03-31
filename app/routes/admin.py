from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from app.models import Admin, SiteConfig
from app.forms import LoginForm, SiteConfigForm
from app import db

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Admin login route"""
    if current_user.is_authenticated:
        return redirect(url_for('admin.dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        admin = Admin.query.filter_by(username=form.username.data).first()
        if admin and admin.check_password(form.password.data):
            login_user(admin)
            return redirect(url_for('admin.dashboard'))
        flash('Invalid username or password', 'error')
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
    config = SiteConfig.query.first()
    if not config:
        config = SiteConfig()
        db.session.add(config)
        db.session.commit()
    form = SiteConfigForm(obj=config)
    return render_template('admin/dashboard.html', form=form, config=config)

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
        
        # Update all fields from the form
        form.populate_obj(config)
        
        try:
            db.session.commit()
            flash('Configuration updated successfully', 'success')
        except Exception as e:
            db.session.rollback()
            flash(f'Error updating configuration: {str(e)}', 'error')
            
    return redirect(url_for('admin.dashboard')) 