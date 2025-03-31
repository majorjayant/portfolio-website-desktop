Write-Host "======= Complete Portfolio Website Deployment =======" -ForegroundColor Cyan

# Build the static site
Write-Host "Building static site..." -ForegroundColor Green
python build_static_site.py

# Set AWS region
$env:AWS_REGION = "eu-north-1"

# Set S3 bucket name - replace with your actual bucket name
$S3_BUCKET = "website-majorjayant"

# Set CloudFront distribution ID - replace with your actual distribution ID 
$CLOUDFRONT_DISTRIBUTION = "d27vy29tvixx30.cloudfront.net"

# Set Lambda function name - replace with your actual function name
$FUNCTION_NAME = "portfolio-get-content"

# Deploy static site to S3
Write-Host "Deploying static site to S3..." -ForegroundColor Green
aws s3 sync app/static s3://$S3_BUCKET --delete

# Create CloudFront invalidation
Write-Host "Creating CloudFront invalidation..." -ForegroundColor Green
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION --paths "/*"

# Create Lambda deployment package
Write-Host "Creating Lambda deployment package..." -ForegroundColor Green
Compress-Archive -Path lambda/get_content.py -DestinationPath lambda-package.zip -Force

# Deploy to Lambda
Write-Host "Deploying to Lambda..." -ForegroundColor Green
aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file fileb://lambda-package.zip

Write-Host "Deployment completed!" -ForegroundColor Cyan
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 