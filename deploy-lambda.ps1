Write-Host "======= Lambda Function Deployment =======" -ForegroundColor Cyan

# Set AWS region
$env:AWS_REGION = "eu-north-1"

# Set Lambda function name - replace with your actual function name
$FUNCTION_NAME = "portfolio-get-content"

# Create a deployment package
Write-Host "Creating deployment package..." -ForegroundColor Green
Compress-Archive -Path lambda/get_content.py -DestinationPath lambda-package.zip -Force

# Deploy to Lambda
Write-Host "Deploying to Lambda..." -ForegroundColor Green
aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file fileb://lambda-package.zip

Write-Host "Lambda deployment completed!" -ForegroundColor Cyan
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 