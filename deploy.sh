#!/bin/bash

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting portfolio website deployment preparation...${NC}"

# Create a deployment zip file
echo -e "${YELLOW}Creating deployment package...${NC}"
cd app
zip -r ../portfolio-deploy.zip static

echo -e "${GREEN}Deployment package created: portfolio-deploy.zip${NC}"
echo ""
echo -e "${YELLOW}=== DEPLOYMENT INSTRUCTIONS ===${NC}"
echo "1. Log in to AWS Amplify Console: https://console.aws.amazon.com/amplify/"
echo "2. Select your portfolio website app"
echo "3. Go to 'Hosting environments' tab"
echo "4. Under 'Manual deploys', select 'Upload a ZIP file'"
echo "5. Upload the portfolio-deploy.zip file"
echo "6. Review the deployment"
echo ""
echo -e "${GREEN}After deployment, verify that:${NC}"
echo "- The site loads correctly with no 404 errors"
echo "- The modal functionality works properly"
echo ""
echo -e "${YELLOW}Note: For Windows users, you may need to use PowerShell to run:${NC}"
echo "cd app; Compress-Archive -Path static -DestinationPath ../portfolio-deploy.zip -Force"
echo "" 