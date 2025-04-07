# PowerShell script to remove unnecessary files
# Keep only essential frontend files and the MySQL Lambda function

# Files and directories to clean up
$filesToRemove = @(
    # Python backend files
    "app/__init__.py",
    "app/forms.py",
    "app/helpers.py",
    "app/models.py",
    "app/models",
    "app/routes.py",
    "app/routes",
    "app/templates",
    "app/utils",
    "app.py",
    "application.py",
    "flask_session",
    
    # Deployment files no longer needed
    ".serverless",
    "build.sh",
    "build_static_site.py",
    "check-build-requirements.py",
    "deploying-to-amplify.md",
    "Procfile",
    "requirements-dev.txt",
    "requirements.txt",
    "runtime.txt",
    "serverless.yml",
    "setup.py",
    
    # Old Lambda files that are no longer needed
    "lambda",
    "lambda-fix",
    "lambda-fix-cors",
    "lambda-package",
    "lambda-inline-fix.js",
    "temp-lambda",
    
    # Old Lambda zip files
    "lambda-no-mysql-v1.7.0.zip",
    "lambda-no-mysql-v1.7.1.zip",
    "lambda-no-mysql-v1.7.2.zip",
    "lambda-deploy-v2.1.zip",
    "lambda-deploy-v2.2.zip",
    "lambda-deploy-v2.3.zip",
    "lambda-deploy-v2.zip",
    "lambda-fix-cors-v1.6.0.zip",
    "lambda-fix-cors.zip",
    "lambda-inline-fix-v1.3.0.zip",
    "lambda-login-fix-secure.zip",
    "lambda-login-fix.zip",
    
    # Documentation to keep only one version
    "AMPLIFY-DEPLOYMENT.md",
    "AMPLIFY-README.md",
    "DEPLOYMENT.md",
    
    # Deployment scripts no longer needed
    "deploy-all.bat",
    "deploy-all.ps1",
    "deploy-lambda.bat",
    "deploy-lambda.ps1",
    "deploy.bat",
    "deploy.ps1"
)

# Function to safely remove files and directories
function Remove-SafelyWithGit {
    param([string]$path)
    
    if (Test-Path $path) {
        Write-Host "Removing $path..."
        if ((Get-Item $path).PSIsContainer) {
            # It's a directory - use git rm -rf
            git rm -rf --cached $path
            Remove-Item -Recurse -Force $path -ErrorAction SilentlyContinue
        } else {
            # It's a file - use git rm
            git rm --cached $path
            Remove-Item -Force $path -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "Path $path does not exist, skipping..."
    }
}

# Confirm with the user
Write-Host "This script will remove unnecessary files from the repository."
Write-Host "The frontend functionality will be preserved, and only the MySQL Lambda function will be kept."
$confirm = Read-Host "Do you want to continue? (Y/N)"

if ($confirm -ne "Y") {
    Write-Host "Operation canceled."
    exit
}

# Remove each file/directory
foreach ($file in $filesToRemove) {
    Remove-SafelyWithGit $file
}

# Create a streamlined README.md
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

# Update the README.md
Set-Content -Path "README.md" -Value $newReadme

Write-Host "Cleanup completed. Files have been removed and README.md has been updated."
Write-Host "Please commit these changes to the repository." 