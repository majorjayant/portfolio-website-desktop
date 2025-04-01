# Portfolio Website Lambda Function

This AWS Lambda function is designed to handle database operations for a portfolio website. It provides an API for retrieving and updating site configuration data stored in a MySQL database.

## Features

- MySQL2 database integration
- Automatic table creation
- Fallback to default configuration when database is unavailable
- CORS support
- Error handling and retry logic
- Race pattern to prevent timeouts

## Deployment Instructions

1. Download this package to your local machine
2. Install Node.js if you don't have it already
3. Navigate to this directory in your terminal/command prompt
4. Run `npm install` to install the required dependencies
5. Zip the contents of this directory (including node_modules folder)
6. Upload the zip file to your AWS Lambda function

## Environment Variables

Configure the following environment variables in the AWS Lambda console:

- `DB_HOST` - MySQL database host (your RDS endpoint)
- `DB_USER` - MySQL username 
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - MySQL database name
- `DB_PORT` - MySQL port (default: 3306)

**Note:** Never commit credentials to your repository. Use environment variables instead.

## API Usage

### GET Request
To retrieve site configuration:
```
GET /your-api-endpoint?type=site_config
```

### POST Request
To update site configuration:
```
POST /your-api-endpoint?type=site_config
Content-Type: application/json

{
  "about_title": "New Title",
  "about_subtitle": "New Subtitle",
  ...other configuration fields
}
```

## Handler Configuration

Make sure your Lambda handler is set to `index.handler` 