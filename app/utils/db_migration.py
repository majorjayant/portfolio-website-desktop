from app.models import db, SiteConfig

def init_site_config():
    """Initialize site configuration with default values if they don't exist"""
    print("Initializing site configuration...")
    
    # Default image URLs - corrected paths to match actual file structure
    default_configs = {
        'image_favicon_url': '/static/img/favicon.png',
        'image_logo_url': '/static/img/logo.png',
        'image_banner_url': '/static/img/banner_latest.png'
    }
    
    # Check if configurations exist and create them if they don't
    for key, value in default_configs.items():
        existing = SiteConfig.query.filter_by(key=key).first()
        if not existing:
            print(f"Creating default config for {key}")
            config = SiteConfig(
                key=key,
                value=value,
                description=f"URL for {key.replace('image_', '').replace('_url', '')}"
            )
            db.session.add(config)
    
    # Commit changes
    db.session.commit()
    print("Site configuration initialization complete")


def run_migrations():
    """Run all database migrations"""
    print("Running database migrations...")
    init_site_config()
    db.session.commit()
    print("Database migrations complete")


if __name__ == "__main__":
    # This allows running migrations directly
    from flask import Flask
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    
    with app.app_context():
        run_migrations() 