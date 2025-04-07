# Simpler PowerShell script to clean up the repository
# Using git commands directly

# Git remove commands for files and directories
$cmds = @(
    # Python backend files
    "git rm -rf app/__init__.py app/forms.py app/helpers.py app/models.py app/models app/routes.py app/routes app/templates app/utils app.py application.py flask_session",
    
    # Deployment files
    "git rm -rf .serverless build.sh build_static_site.py check-build-requirements.py deploying-to-amplify.md Procfile requirements-dev.txt requirements.txt runtime.txt serverless.yml setup.py",
    
    # Old Lambda files
    "git rm -rf lambda lambda-fix lambda-fix-cors lambda-package lambda-inline-fix.js temp-lambda",
    
    # Old Lambda zips
    "git rm -rf lambda-no-mysql-v1.7.0.zip lambda-no-mysql-v1.7.1.zip lambda-no-mysql-v1.7.2.zip lambda-deploy-v2.1.zip lambda-deploy-v2.2.zip lambda-deploy-v2.3.zip lambda-deploy-v2.zip lambda-fix-cors-v1.6.0.zip lambda-fix-cors.zip lambda-inline-fix-v1.3.0.zip lambda-login-fix-secure.zip lambda-login-fix.zip",
    
    # Documentation
    "git rm -rf AMPLIFY-DEPLOYMENT.md AMPLIFY-README.md DEPLOYMENT.md",
    
    # Deployment scripts
    "git rm -rf deploy-all.bat deploy-all.ps1 deploy-lambda.bat deploy-lambda.ps1 deploy.bat deploy.ps1"
)

# Create a simplified README
$newReadme = @"
# Portfolio Website

A streamlined portfolio website using AWS Amplify for hosting and AWS Lambda with MySQL for backend storage.

## Components

- **Frontend**: Static HTML/CSS/JS files in the `app/static` directory
- **Backend**: AWS Lambda function in the `lambda-no-mysql` directory (using MySQL for storage)
- **Database**: MySQL database on AWS RDS (configuration in the Lambda function)

## Key Files

- `lambda-no-mysql/index.js`: Lambda function for site configuration
- `lambda-no-mysql/lambda-function.zip`: Deployment package for the Lambda function
- `setup_database.sql`: Script to set up the MySQL database table
- `verify_database.sql`: Script to verify the database setup
- `update_image_urls.sql`: Script to update image URLs in the database

## Deployment

1. Deploy the static files to AWS Amplify
2. Deploy the Lambda function to AWS Lambda
3. Run the SQL scripts on the MySQL database
"@

Write-Host "Starting repository cleanup..."

# Execute each git command
foreach ($cmd in $cmds) {
    Write-Host "Executing: $cmd"
    Invoke-Expression -Command $cmd
}

# Update README.md
Set-Content -Path "README.md" -Value $newReadme
Write-Host "Updated README.md with simplified content"

# Final commit
Write-Host "`nCleanup completed. To commit these changes, run:"
Write-Host "git add README.md"
Write-Host "git commit -m 'Clean up repository to keep only essential files'"
Write-Host "git push origin staging" 