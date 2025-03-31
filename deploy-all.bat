@echo off
echo ======= Complete Portfolio Website Deployment =======

REM Build the static site
echo Building static site...
python build_static_site.py

REM Set AWS region
set AWS_REGION=eu-north-1

REM Set S3 bucket name - replace with your actual bucket name
set S3_BUCKET=website-majorjayant

REM Set CloudFront distribution ID - replace with your actual distribution ID 
set CLOUDFRONT_DISTRIBUTION=d27vy29tvixx30.cloudfront.net

REM Set Lambda function name - replace with your actual function name
set FUNCTION_NAME=portfolio-get-content

REM Deploy static site to S3
echo Deploying static site to S3...
aws s3 sync app/static s3://%S3_BUCKET% --delete

REM Create CloudFront invalidation
echo Creating CloudFront invalidation...
aws cloudfront create-invalidation --distribution-id %CLOUDFRONT_DISTRIBUTION% --paths "/*"

REM Create Lambda deployment package
echo Creating Lambda deployment package...
powershell -Command "Compress-Archive -Path lambda\get_content.py -DestinationPath lambda-package.zip -Force"

REM Deploy to Lambda
echo Deploying to Lambda...
aws lambda update-function-code --function-name %FUNCTION_NAME% --zip-file fileb://lambda-package.zip

echo Deployment completed!
pause 