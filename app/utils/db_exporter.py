#!/usr/bin/env python
"""
Database Exporter Utility

This script exports data from the site_configs table to a JSON file that can be used
during static site generation for Netlify deployment.
"""

import os
import json
from datetime import datetime
import sys

# Add the parent directory to the path so we can import app
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(os.path.dirname(current_dir))
sys.path.insert(0, parent_dir)

def create_fallback_data():
    """Create fallback data if database is not accessible"""
    print("  ⚠ Database not accessible, creating fallback site_config data")
    
    # S3 base URL for images
    s3_base_url = 'https://website-majorjayant.s3.eu-north-1.amazonaws.com'
    
    # Create fallback about content with meaningful content rather than test data
    about_content = {
        'title': 'About Me',
        'subtitle': "I'm a passionate product manager based in New Delhi, India.",
        'description': "Since 2015, I've enjoyed turning complex problems into simple, beautiful and intuitive designs. When I'm not coding or managing products, you'll find me cooking, playing video games or exploring new places.",
        'profile_image': os.environ.get('IMAGE_ABOUT_PROFILE_URL', f'{s3_base_url}/profilephoto+(2).svg'),
        'photos': [
            {'url': os.environ.get('IMAGE_ABOUT_PHOTO1_URL', f'{s3_base_url}/about_photo1.jpg'), 
             'alt': 'Personal photo showing my interests'},
            {'url': os.environ.get('IMAGE_ABOUT_PHOTO2_URL', f'{s3_base_url}/about_photo2.jpg'), 
             'alt': 'A moment from my travels'},
            {'url': os.environ.get('IMAGE_ABOUT_PHOTO3_URL', f'{s3_base_url}/about_photo3.jpg'), 
             'alt': 'Working on a project'},
            {'url': os.environ.get('IMAGE_ABOUT_PHOTO4_URL', f'{s3_base_url}/about_photo4.jpg'), 
             'alt': 'Enjoying outdoor activities'}
        ]
    }
    
    # Create fallback image URLs
    image_urls = {
        'favicon': os.environ.get('IMAGE_FAVICON_URL', f'{s3_base_url}/FavIcon'),
        'logo': os.environ.get('IMAGE_LOGO_URL', f'{s3_base_url}/Logo'),
        'banner': os.environ.get('IMAGE_BANNER_URL', f'{s3_base_url}/Banner'),
        'about_profile': os.environ.get('IMAGE_ABOUT_PROFILE_URL', f'{s3_base_url}/profilephoto+(2).svg'),
        'about_photo1': os.environ.get('IMAGE_ABOUT_PHOTO1_URL', f'{s3_base_url}/about_photo1.jpg'),
        'about_photo2': os.environ.get('IMAGE_ABOUT_PHOTO2_URL', f'{s3_base_url}/about_photo2.jpg'),
        'about_photo3': os.environ.get('IMAGE_ABOUT_PHOTO3_URL', f'{s3_base_url}/about_photo3.jpg'),
        'about_photo4': os.environ.get('IMAGE_ABOUT_PHOTO4_URL', f'{s3_base_url}/about_photo4.jpg')
    }
    
    # Create fallback site_configs
    site_configs = {
        'about_title': {'value': about_content['title'], 'description': 'About section title', 'updated_at': datetime.utcnow().isoformat()},
        'about_subtitle': {'value': about_content['subtitle'], 'description': 'About section subtitle', 'updated_at': datetime.utcnow().isoformat()},
        'about_description': {'value': about_content['description'], 'description': 'About section description', 'updated_at': datetime.utcnow().isoformat()},
        'about_photo1_alt': {'value': about_content['photos'][0]['alt'], 'description': 'Alt text for about photo 1', 'updated_at': datetime.utcnow().isoformat()},
        'about_photo2_alt': {'value': about_content['photos'][1]['alt'], 'description': 'Alt text for about photo 2', 'updated_at': datetime.utcnow().isoformat()},
        'about_photo3_alt': {'value': about_content['photos'][2]['alt'], 'description': 'Alt text for about photo 3', 'updated_at': datetime.utcnow().isoformat()},
        'about_photo4_alt': {'value': about_content['photos'][3]['alt'], 'description': 'Alt text for about photo 4', 'updated_at': datetime.utcnow().isoformat()},
        'image_favicon_url': {'value': image_urls['favicon'], 'description': 'Favicon URL', 'updated_at': datetime.utcnow().isoformat()},
        'image_logo_url': {'value': image_urls['logo'], 'description': 'Logo URL', 'updated_at': datetime.utcnow().isoformat()},
        'image_banner_url': {'value': image_urls['banner'], 'description': 'Banner URL', 'updated_at': datetime.utcnow().isoformat()},
        'image_about_profile_url': {'value': image_urls['about_profile'], 'description': 'About profile image URL', 'updated_at': datetime.utcnow().isoformat()},
        'image_about_photo1_url': {'value': image_urls['about_photo1'], 'description': 'About photo 1 URL', 'updated_at': datetime.utcnow().isoformat()},
        'image_about_photo2_url': {'value': image_urls['about_photo2'], 'description': 'About photo 2 URL', 'updated_at': datetime.utcnow().isoformat()},
        'image_about_photo3_url': {'value': image_urls['about_photo3'], 'description': 'About photo 3 URL', 'updated_at': datetime.utcnow().isoformat()},
        'image_about_photo4_url': {'value': image_urls['about_photo4'], 'description': 'About photo 4 URL', 'updated_at': datetime.utcnow().isoformat()}
    }
    
    # Create final export data
    return {
        'site_configs': site_configs,
        'about_content': about_content,
        'image_urls': image_urls,
        'exported_at': datetime.utcnow().isoformat(),
        'export_source': 'fallback'
    }

def export_site_configs():
    """Export site_configs table to a JSON file"""
    print("Exporting site configuration from database...")
    
    # Output file path
    output_dir = os.path.join(current_dir, '..', 'static', 'data')
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    output_file = os.path.join(output_dir, 'site_config.json')
    
    try:
        # Try to import app and models
        from app import app, db
        from app.models.site_config import SiteConfig
        
        # Check if database is accessible
        db_accessible = False
        try:
            # Initialize app context to use database
            with app.app_context():
                # Try a simple query to see if database is accessible
                SiteConfig.query.first()
                db_accessible = True
        except Exception as e:
            print(f"  ⚠ Database not accessible: {str(e)}")
            db_accessible = False
        
        # If database is accessible, export data from database
        if db_accessible:
            with app.app_context():
                # Get all site configs
                site_configs = SiteConfig.query.all()
                
                # Convert to dictionary
                config_dict = {}
                for config in site_configs:
                    config_dict[config.key] = {
                        'value': config.value,
                        'description': config.description,
                        'updated_at': config.updated_at.isoformat() if config.updated_at else None
                    }
                
                # Override test data with real content
                if "about_title" in config_dict and config_dict["about_title"]["value"].startswith("Test About Title"):
                    print("  ○ Replacing test title with real content")
                    config_dict["about_title"]["value"] = "About Me"
                    config_dict["about_title"]["description"] = "Replaced test content with real content"
                
                if "about_subtitle" in config_dict and config_dict["about_subtitle"]["value"].startswith("Test Subtitle"):
                    print("  ○ Replacing test subtitle with real content")
                    config_dict["about_subtitle"]["value"] = "I'm a passionate product manager based in New Delhi, India."
                    config_dict["about_subtitle"]["description"] = "Replaced test content with real content"
                
                if "about_description" in config_dict and config_dict["about_description"]["value"].startswith("This is a test description"):
                    print("  ○ Replacing test description with real content")
                    config_dict["about_description"]["value"] = "Since 2015, I've enjoyed turning complex problems into simple, beautiful and intuitive designs. When I'm not coding or managing products, you'll find me cooking, playing video games or exploring new places."
                    config_dict["about_description"]["description"] = "Replaced test content with real content"
                
                # Create about section content with updated values
                about_content = SiteConfig.get_about_content()
                
                # Override about_content with our custom values if test data was found
                if about_content["title"].startswith("Test About Title"):
                    about_content["title"] = config_dict["about_title"]["value"]
                    about_content["subtitle"] = config_dict["about_subtitle"]["value"]
                    about_content["description"] = config_dict["about_description"]["value"]
                
                # Get direct image URLs for reference
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
                
                # Create final export data
                export_data = {
                    'site_configs': config_dict,
                    'about_content': about_content,
                    'image_urls': image_urls,
                    'exported_at': datetime.utcnow().isoformat(),
                    'export_source': 'database'
                }
                
                print(f"  ✓ Successfully retrieved {len(config_dict)} site configs from database")
        else:
            # Create fallback data
            export_data = create_fallback_data()
        
        # Write to file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        print(f"  ✓ Successfully exported site config data to {output_file}")
        return output_file
    
    except Exception as e:
        print(f"  ⚠ Error exporting site configs: {str(e)}")
        
        # Create fallback data
        export_data = create_fallback_data()
        
        # Write fallback data to file
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)
            
            print(f"  ✓ Created fallback site config data at {output_file}")
            return output_file
        except Exception as write_error:
            print(f"  ✗ Error writing fallback data: {str(write_error)}")
            return None

if __name__ == '__main__':
    export_site_configs() 