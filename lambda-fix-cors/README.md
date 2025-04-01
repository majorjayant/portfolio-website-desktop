# Portfolio Website Lambda Function

This Lambda function handles the site configuration and admin authentication for the portfolio website.

## Version 1.5.0 Changes
- Fixed CORS issues by always returning 200 status code
- Improved error handling when database environment variables are missing
- Enhanced fallback mechanism to always serve default configuration
- Removed potential timeout issues

## Deployment Instructions

1. Upload the `lambda-fix-cors.zip` file to AWS Lambda
2. Set the Handler to `index.handler`
3. Configure the following environment variables:

```
DB_HOST       = Your RDS endpoint
DB_USER       = Your database username
DB_PASSWORD   = Your database password
DB_NAME       = Your database name
DB_PORT       = 3306 (or your custom port)
ADMIN_USERNAME = admin (or your preferred admin username)
ADMIN_PASSWORD = admin123 (or your preferred admin password)
```

4. Set the timeout to at least 10 seconds
5. Update the execution role to include the AmazonDynamoDBFullAccess policy if you're using DynamoDB

## Testing

Test the function with the following sample event:

```json
{
  "httpMethod": "GET",
  "queryStringParameters": {
    "type": "site_config"
  }
}
```

## Troubleshooting

- If you see a 502 Bad Gateway error, check that your Lambda function always returns a 200 status code
- For CORS errors, verify that the Access-Control-Allow-Origin header is set to '*'
- If admin login fails, verify that the ADMIN_USERNAME and ADMIN_PASSWORD environment variables are set correctly
- For database connection issues, check your RDS security group settings

## Default Fallback Behavior

This Lambda function includes a default site configuration that will be used if:
- Database environment variables are missing
- Database connection fails
- Database query errors occur

This ensures the website always displays something, even if the database is unavailable. 