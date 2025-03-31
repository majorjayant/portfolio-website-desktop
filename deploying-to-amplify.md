# Deploying to AWS Amplify

In addition to the manual S3/CloudFront deployment, you can use AWS Amplify for a more streamlined deployment experience.

## Current Amplify Details

- **App ID**: d200zhb2va2zdo
- **Domain**: https://main.d200zhb2va2zdo.amplifyapp.com/
- **Region**: eu-north-1

## Benefits of Using Amplify

1. **Continuous deployment** from your Git repository
2. **Built-in CI/CD pipeline**
3. **Preview environments** for pull requests
4. **Branch-based deployments**
5. **Custom domains** with free SSL certificates

## Setting Up AWS Amplify

1. **Connect your repository**:
   - Log in to the AWS Management Console
   - Go to AWS Amplify
   - Select your existing app (d200zhb2va2zdo) or create a new one
   - Connect to your GitHub/BitBucket/GitLab repository

2. **Configure build settings**:
   - Ensure your build settings include the necessary steps to build your application
   - Example `amplify.yml`:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - pip install -r requirements-dev.txt
       build:
         commands:
           - python build_static_site.py
     artifacts:
       baseDirectory: app/static
       files:
         - '**/*'
   ```

3. **Environment variables**:
   - Set any necessary environment variables in the Amplify Console
   - For security, add AWS credentials as environment variables instead of hardcoding them

## Troubleshooting Amplify Deployments

If your deployment shows the "Your app will appear here once you complete your first deployment" message, check:

1. **Build settings**: Make sure the `baseDirectory` parameter matches your build output directory (`app/static`)
2. **Build output**: Verify your build creates an `index.html` file in the artifacts base directory
3. **Build logs**: Review the build logs in the Amplify Console to identify any errors
4. **Permissions**: Ensure Amplify has the necessary permissions to access your resources

## Switching Between Deployment Methods

You can use both the manual S3/CloudFront deployment and Amplify. Some considerations:

- **Amplify**: Better for development and staging environments with continuous deployment
- **S3/CloudFront with scripts**: More control for production environments or when you need specific CloudFront configurations

To avoid conflicts, consider using different domains for each deployment method or ensuring that you're not deploying the same branch to both. 