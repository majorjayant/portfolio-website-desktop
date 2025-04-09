# Portfolio Website

A modern, responsive portfolio website built with HTML, CSS, and JavaScript. The site is designed to be easily customizable through an admin dashboard and a Lambda API for dynamic content.

## File Structure

```
/
├── app/                      # Main application directory
│   ├── admin/                # Admin dashboard components
│   ├── static/               # Static assets (served by Amplify)
│   │   ├── index.html        # Main entry point
│   │   ├── css/              # CSS stylesheets
│   │   ├── js/               # JavaScript files
│   │   ├── html/             # HTML components
│   │   │   ├── index.html    # Redirect to main index.html
│   │   │   └── _footer.html  # Footer component
│   │   └── admin/            # Admin interface
├── lambda-no-mysql/          # Lambda function code
└── index.html                # Root redirect to /static/index.html
```

## Work Experience Feature

The site now supports a work experience timeline section on the homepage. Work experience data is managed through the admin dashboard and stored in the Lambda function's DynamoDB table.

### How the Work Experience Data Flows:

1. Data is entered in the admin dashboard
2. Saved to DynamoDB via the Lambda function
3. Retrieved by the frontend via API call
4. Displayed in a vertical timeline on the homepage

## Deployment

To deploy the website:

1. Run one of the deployment scripts:
   - Windows: `.\deploy.ps1`
   - Linux/Mac: `./deploy.sh`
2. Upload the generated `portfolio-deploy.zip` to AWS Amplify

## Configuration

Site configuration is managed through the admin dashboard at `/admin/dashboard.html`. The configuration includes:

- Site title and favicon
- Banner images (desktop and mobile versions)
- About section content
- Work experience items
- Gallery photos

## Development

To run the site locally, simply open the `app/static/index.html` file in your browser.
