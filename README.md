# Portfolio Website with Image Generator

A portfolio website with a built-in image generator tool that creates logos, banners, profile photos, project thumbnails, icons, and text banners based on descriptions.

## Features

- Modern, responsive portfolio website design
- Image generator tool with six different image types
- Multiple image variations with download functionality
- Clean, intuitive user interface

## Local Development

### Prerequisites

- Python 3.9+
- Flask
- Pillow (PIL fork)
- Other dependencies in requirements.txt

### Installation

1. Clone the repository
```bash
git clone https://github.com/majorjayant/portfolio-website-desktop.git
cd portfolio-website-desktop
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Run the application
```bash
python app.py
```

4. Open your browser and navigate to `http://localhost:5000`

## Deployment

The application is configured for deployment on Netlify as a static site with serverless functions for dynamic features.

### Netlify Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Deploy with the following settings:
   - Build command: `pip install -r requirements.txt && python build_static_site.py`
   - Publish directory: `app/static`

**Note:** The image generation functionality has limited capabilities in the static deployment. For full functionality, run the application locally.

## Project Structure

- `app/` - Main application directory
  - `static/` - Static files (CSS, JS, images)
  - `templates/` - HTML templates
  - `utils/` - Utility functions including image generation
  - `models/` - Database models
- `netlify/` - Netlify serverless functions
- `build_static_site.py` - Script to generate static HTML files for deployment

## License

MIT 