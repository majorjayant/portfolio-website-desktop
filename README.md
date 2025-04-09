# Portfolio Website

A streamlined portfolio website using AWS Amplify for hosting and AWS Lambda with MySQL for backend storage.

## Components

- **Frontend**: Static HTML/CSS/JS files in the pp/static directory
- **Backend**: AWS Lambda function in the lambda-no-mysql directory (using MySQL for storage)
- **Database**: MySQL database on AWS RDS (configuration in the Lambda function)

## Key Files

- lambda-no-mysql/index.js: Lambda function for site configuration
- lambda-no-mysql/lambda-function.zip: Deployment package for the Lambda function
- setup_database.sql: Script to set up the MySQL database table
- erify_database.sql: Script to verify the database setup
- update_image_urls.sql: Script to update image URLs in the database

## Deployment

1. Deploy the static files to AWS Amplify
2. Deploy the Lambda function to AWS Lambda
3. Run the SQL scripts on the MySQL database
