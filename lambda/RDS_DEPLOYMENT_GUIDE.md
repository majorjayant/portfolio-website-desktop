# RDS-Enabled Lambda Deployment Guide

This guide explains how to deploy the Lambda function with AWS RDS database connectivity.

## Prerequisites

1. Node.js 16+ installed on your system
2. AWS CLI configured with appropriate permissions
3. AWS RDS MySQL/MariaDB database instance set up and accessible
4. The database credentials (host, username, password, database name)

## Deployment Steps

### 1. Install Dependencies

First, install the required dependencies:

```bash
cd lambda
npm install
```

### 2. Create the Deployment Package

Create a ZIP file containing the Lambda function and its dependencies:

```bash
# For Windows PowerShell
Compress-Archive -Path .\index-rds.js, .\node_modules -DestinationPath lambda-rds-deployment.zip -Force

# For Linux/Mac
zip -r lambda-rds-deployment.zip index-rds.js node_modules
```

### 3. Configure Environment Variables in AWS Lambda

In the AWS Lambda Console:

1. Go to your Lambda function
2. Navigate to the "Configuration" tab
3. Click on "Environment variables"
4. Add the following variables:
   - `DB_HOST` - Your RDS endpoint (e.g., mydb.123456789012.us-east-1.rds.amazonaws.com)
   - `DB_USER` - Database username
   - `DB_PASSWORD` - Database password
   - `DB_NAME` - Database name
   - `DB_PORT` - Database port (typically 3306 for MySQL)

### 4. Upload the Deployment Package

1. In the Lambda console, go to the "Code" tab
2. Click "Upload from" and select ".zip file"
3. Upload your `lambda-rds-deployment.zip` file
4. Click "Save"

### 5. Update the Handler

1. In the "Runtime settings" section, click "Edit"
2. Change the Handler to `index-rds.handler`
3. Click "Save"

### 6. Configure Lambda Execution Role

Ensure your Lambda execution role has permissions to:
- Access RDS (via AmazonRDSFullAccess or a custom policy)
- Basic Lambda execution (logging to CloudWatch)

### 7. Configure VPC Settings (if RDS is in a VPC)

If your RDS instance is in a VPC:
1. Go to the "Configuration" tab > "VPC"
2. Click "Edit"
3. Select the same VPC as your RDS instance
4. Select subnets in the same availability zones as your RDS instance
5. Select a security group that allows access to your RDS instance
6. Click "Save"

### 8. Increase Timeout

The database operations might take longer than the default timeout:
1. Go to the "Configuration" tab > "General configuration"
2. Click "Edit"
3. Increase the timeout to at least 30 seconds
4. Click "Save"

### 9. Test the Function

Create a test event with the following structure:

```json
{
  "httpMethod": "GET",
  "queryStringParameters": {
    "type": "site_config"
  },
  "headers": {}
}
```

Click "Test" to execute the function and verify it can connect to your database.

## Troubleshooting

### Connection Issues
- Verify your RDS instance is publicly accessible or in the same VPC as your Lambda
- Check that your security group allows connections from your Lambda function
- Verify the database credentials are correct
- Check the Lambda execution role has appropriate permissions

### Timeout Errors
- Increase the Lambda timeout setting
- Check for slow database queries

### Out of Memory Errors
- Increase the Lambda memory allocation

## Next Steps

1. Consider implementing proper token-based authentication
2. Add caching to reduce database load
3. Implement a more sophisticated data model for your site configuration
4. Set up CloudWatch alarms to monitor for errors 