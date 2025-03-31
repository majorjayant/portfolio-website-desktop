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
- Node.js 14+ (for AWS deployment)

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

## AWS Deployment

This project is configured for deployment on AWS using Lambda, CloudFront, and S3.

### AWS Deployment Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Node.js 14+ and npm installed
4. Serverless Framework installed globally (`npm install -g serverless`)

### AWS Deployment Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure AWS credentials:
   ```bash
   aws configure
   ```

3. Export your database content to JSON:
   ```bash
   python export_site_config.py
   ```

4. Build the static site:
   ```bash
   python build_static_site.py
   ```

5. Deploy to AWS:
   ```bash
   npm run deploy
   ```
   
   This will:
   - Create an S3 bucket for your website content
   - Set up a CloudFront distribution with proper caching
   - Deploy Lambda functions for dynamic content
   - Upload your static content to S3

6. For custom domain deployment:
   ```bash
   npm run deploy -- --domain your-domain.com --cert arn:aws:acm:us-east-1:YOUR_ACCOUNT_ID:certificate/YOUR_CERT_ID
   ```

### GitHub Actions Deployment

The repository includes a GitHub Actions workflow that will automatically deploy your site to AWS when you push to the main branch.

To set up GitHub Actions deployment:

1. Add your AWS credentials as GitHub secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

2. Push to the main branch, and GitHub Actions will handle the deployment automatically.

## Static Site Generation

This project includes a script to generate a static version of the site for deployment:

```
python build_static_site.py
```

The script will:
1. Render all Flask routes as static HTML files
2. Copy all static assets (CSS, JS, images)
3. Generate a special static version of the image generator tool
4. Create the necessary directory structure for deployment

## Migrating from Netlify to AWS

We've migrated this project from Netlify to AWS for improved flexibility and performance. Key changes include:

1. AWS Lambda replaces Netlify Functions
2. S3 static hosting with CloudFront CDN
3. API Gateway for secure API endpoints
4. Automated deployment via GitHub Actions

If you were previously using Netlify, follow these steps to migrate:

1. Update DNS settings to point to your CloudFront distribution
2. Transfer environment variables to AWS parameter store or directly in serverless.yml
3. Ensure all files are properly deployed to S3 via the deployment process

## Project Structure

```
portfolio-website-desktop/
├── app/
│   ├── static/         # Static assets (CSS, JS, images)
│   ├── templates/      # HTML templates
│   ├── models.py       # Database models
│   ├── routes.py       # Application routes
│   └── __init__.py     # Application initialization
├── lambda/             # AWS Lambda functions
├── build_static_site.py # Static site generator
├── serverless.yml      # AWS serverless configuration
├── package.json        # Node.js dependencies
├── requirements.txt    # Python dependencies
├── runtime.txt         # Python runtime version
└── setup.py            # Setup script for local development
```

## License

MIT 