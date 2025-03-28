# Portfolio Website

A professional portfolio website built with Flask, featuring an image generator tool.

## Features

- Responsive design for desktop and mobile
- Portfolio section to showcase projects and experience
- Image Generator tool powered by AI
- Contact form

## Local Development

### Prerequisites

- Python 3.9+
- pip (Python package manager)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/majorjayant/portfolio-website-desktop.git
   cd portfolio-website-desktop
   ```

2. Run the setup script:
   ```
   python setup.py
   ```
   
   This script will:
   - Create a virtual environment
   - Install dependencies
   - Set up environment variables
   - Offer to run the application

3. Alternative manual setup:
   ```
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Set up environment variables
   # Create a .env file with the following:
   FLASK_APP=run.py
   FLASK_ENV=development
   FLASK_DEBUG=1
   DATABASE_URL=sqlite:///app.db
   SECRET_KEY=your-secret-key
   ```

4. Run the application:
   ```
   python run.py
   ```

5. Visit `http://127.0.0.1:5000` in your browser.

## Deployment

This project is configured for deployment on Netlify as a static site.

### Deployment Steps

1. Fork or clone this repository to your GitHub account.

2. Connect your GitHub repository to Netlify.

3. Configure the build settings:
   - Build command: `python build_static_site.py`
   - Publish directory: `app/static`

4. Deploy the site!

## Static Site Generation

This project includes a script to generate a static version of the site for deployment on platforms like Netlify:

```
python build_static_site.py
```

The script will:
1. Render all Flask routes as static HTML files
2. Copy all static assets (CSS, JS, images)
3. Generate a special static version of the image generator tool
4. Create the necessary directory structure for deployment

## Static Site Generation for Netlify

This project supports static site generation for deployment on Netlify. The static site generation process has been enhanced to use content from your database even in static deployment mode.

### Workflow for Static Site Deployment

1. **Export database content**:
   Before deploying to Netlify, export the current database content to a JSON file:

   ```bash
   python export_site_config.py
   ```

   This will create or update the file `app/static/data/site_config.json` with the current content from your database.

2. **Commit the exported data**:
   Make sure to commit this JSON file to your repository so Netlify can use it during the build process.

3. **Build the static site**:
   The build script automatically uses the exported data file when generating the static site:

   ```bash
   python build_static_site.py
   ```

   This script will:
   - Look for the exported data file and use it if available
   - Fall back to environment variables if the data file is not available
   - Generate static HTML files for all routes
   - Copy necessary assets

4. **Deploy to Netlify**:
   Push your changes to the branch connected to Netlify, and Netlify will automatically build and deploy your site.

### Environment Variables

The following environment variables can be set in Netlify to override default values:

- `IMAGE_FAVICON_URL`: URL for the favicon
- `IMAGE_LOGO_URL`: URL for the logo
- `IMAGE_BANNER_URL`: URL for the banner
- `IMAGE_ABOUT_PROFILE_URL`: URL for the about profile image
- `IMAGE_ABOUT_PHOTO1_URL` to `IMAGE_ABOUT_PHOTO4_URL`: URLs for the about photos
- `ABOUT_TITLE`: Title for the about section
- `ABOUT_SUBTITLE`: Subtitle for the about section
- `ABOUT_DESCRIPTION`: Description for the about section
- `ABOUT_PHOTO1_ALT` to `ABOUT_PHOTO4_ALT`: Alt text for the about photos

### Client-Side Fallbacks

The static site includes client-side JavaScript fallbacks that will:
1. Try to load content from the server-rendered HTML
2. If that fails, try to load from the exported JSON file
3. If that fails, use hardcoded fallbacks

This ensures your site will always display something even if there are issues with the database or environment variables.

## Project Structure

```
portfolio-website-desktop/
├── app/
│   ├── static/         # Static assets (CSS, JS, images)
│   ├── templates/      # HTML templates
│   ├── models.py       # Database models
│   ├── routes.py       # Application routes
│   └── __init__.py     # Application initialization
├── build_static_site.py # Static site generator
├── netlify.toml        # Netlify configuration
├── requirements.txt    # Python dependencies
├── runtime.txt         # Python runtime version
├── run.py              # Application entry point
└── setup.py            # Setup script for local development
```

## License

MIT 