# PowerShell deployment script for Windows users

Write-Host "Starting portfolio website deployment preparation..." -ForegroundColor Green

# Create a deployment zip file
Write-Host "Creating deployment package..." -ForegroundColor Yellow
Push-Location app
Compress-Archive -Path static -DestinationPath ../portfolio-deploy.zip -Force
Pop-Location

Write-Host "Deployment package created: portfolio-deploy.zip" -ForegroundColor Green
Write-Host ""
Write-Host "=== DEPLOYMENT INSTRUCTIONS ===" -ForegroundColor Yellow
Write-Host "1. Log in to AWS Amplify Console: https://console.aws.amazon.com/amplify/"
Write-Host "2. Select your portfolio website app"
Write-Host "3. Go to 'Hosting environments' tab"
Write-Host "4. Under 'Manual deploys', select 'Upload a ZIP file'"
Write-Host "5. Upload the portfolio-deploy.zip file"
Write-Host "6. Review the deployment"
Write-Host ""
Write-Host "After deployment, verify that:" -ForegroundColor Green
Write-Host "- The site loads correctly with no 404 errors"
Write-Host "- The modal functionality works properly"
Write-Host "" 