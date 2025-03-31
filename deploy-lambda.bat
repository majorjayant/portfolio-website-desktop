@echo off
echo ======= Lambda Function Deployment =======

REM Set Lambda function name - replace with your actual function name
set FUNCTION_NAME=portfolio-get-content

REM Create a deployment package
echo Creating deployment package...
powershell -Command "Compress-Archive -Path lambda\get_content.py -DestinationPath lambda-package.zip -Force"

REM Deploy to Lambda
echo Deploying to Lambda...
aws lambda update-function-code --function-name %FUNCTION_NAME% --zip-file fileb://lambda-package.zip

echo Lambda deployment completed!
pause 