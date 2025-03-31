@echo off
echo ======= Portfolio Website AWS Deployment =======

REM Build the static site
echo Building static site...
python build_static_site.py

REM Set AWS region
set AWS_REGION=eu-north-1

REM Set S3 bucket name - replace with your actual bucket name
set S3_BUCKET=website-majorjayant

REM Set CloudFront distribution ID - replace with your actual distribution ID 
set CLOUDFRONT_DISTRIBUTION=d27vy29tvixx30.cloudfront.net

REM Deploy to S3
echo Deploying static site to S3...
aws s3 sync app/static s3://%S3_BUCKET% --delete

REM Create CloudFront invalidation
echo Creating CloudFront invalidation...
aws cloudfront create-invalidation --distribution-id %CLOUDFRONT_DISTRIBUTION% --paths "/*"

echo Deployment completed!
pause 