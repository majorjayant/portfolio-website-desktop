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