Write-Host "======= Portfolio Website AWS Deployment =======" -ForegroundColor Cyan

# Build the static site
Write-Host "Building static site..." -ForegroundColor Green
python build_static_site.py

# Set AWS region
$env:AWS_REGION = "eu-north-1"

# Set S3 bucket name - replace with your actual bucket name
$S3_BUCKET = "website-majorjayant"

# Set CloudFront distribution ID - replace with your actual distribution ID 
$CLOUDFRONT_DISTRIBUTION = "d27vy29tvixx30.cloudfront.net"

# Deploy to S3
Write-Host "Deploying static site to S3..." -ForegroundColor Green
aws s3 sync app/static s3://$S3_BUCKET --delete

# Create CloudFront invalidation
Write-Host "Creating CloudFront invalidation..." -ForegroundColor Green
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION --paths "/*"

Write-Host "Deployment completed!" -ForegroundColor Cyan
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 