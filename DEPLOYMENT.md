# Deployment Guide

This guide explains how to deploy the portfolio website to AWS.

## Prerequisites

1. AWS CLI installed and configured with appropriate credentials
   - Install: https://aws.amazon.com/cli/
   - Configure: `aws configure`

2. Python 3.11 or later installed

3. Make sure your AWS account has:
   - An S3 bucket named `website-majorjayant` 
   - A CloudFront distribution at `d27vy29tvixx30.cloudfront.net`
   - A Lambda function named `portfolio-get-content`
   - AWS Amplify app with ID `d200zhb2va2zdo` (domain: `https://main.d200zhb2va2zdo.amplifyapp.com/`)

## AWS Configuration

- **Region**: eu-north-1
- **S3 Bucket**: website-majorjayant
- **CloudFront Distribution**: d27vy29tvixx30.cloudfront.net
- **Lambda Function**: portfolio-get-content
- **Amplify App**: d200zhb2va2zdo

## Deployment Scripts

This project includes several deployment scripts:

### Static Website Deployment

- **PowerShell**: `deploy.ps1`
- **Batch**: `deploy.bat`

These scripts will:
1. Build the static site using Python
2. Upload files to S3
3. Create a CloudFront invalidation to refresh the CDN cache

### Lambda Function Deployment

- **PowerShell**: `deploy-lambda.ps1`
- **Batch**: `deploy-lambda.bat`

These scripts will:
1. Create a ZIP deployment package
2. Update the Lambda function code

### Complete Deployment (Website + Lambda)

- **PowerShell**: `deploy-all.ps1`
- **Batch**: `deploy-all.bat`

These scripts perform both the website and Lambda deployments in one go.

## Running the Deployment

1. Choose the appropriate script based on your needs
2. Right-click the script and select "Run with PowerShell" or double-click the .bat file
3. Monitor the output for any errors

## Manual Deployment Steps

If you prefer to deploy manually:

### Static Website
```
python build_static_site.py
aws s3 sync app/static s3://website-majorjayant --delete
aws cloudfront create-invalidation --distribution-id d27vy29tvixx30.cloudfront.net --paths "/*"
```

### Lambda Function
```
Compress-Archive -Path lambda/get_content.py -DestinationPath lambda-package.zip -Force
aws lambda update-function-code --function-name portfolio-get-content --zip-file fileb://lambda-package.zip
```

## Troubleshooting

- If you encounter permission errors, check your AWS CLI configuration
- If the AWS CLI commands aren't recognized, ensure the AWS CLI is properly installed and in your PATH
- If the deployment package creation fails, make sure PowerShell is available
- If your deployment doesn't appear on Amplify (`https://main.d200zhb2va2zdo.amplifyapp.com/`), check Amplify settings to ensure it's properly connected to your deployment source 