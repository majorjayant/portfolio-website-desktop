# AWS Amplify Deployment Setup Guide

This guide provides the necessary steps to successfully deploy the portfolio website to AWS Amplify after experiencing build failures.

## Quick Fix for Build Failures

1. **Corrupt Build Specification**: The `amplify.yml` file might have become corrupted with non-printable characters. If this happens, replace it with the pre-configured `amplify-fixed.yml` file:
   ```bash
   copy amplify-fixed.yml amplify.yml
   git add amplify.yml
   git commit -m "Fix amplify.yml build spec file"
   git push
   ```

2. **Trigger a new build** in the AWS Amplify Console after pushing the changes.

## AWS Amplify Console Configuration

Ensure these settings are configured in the AWS Amplify Console:

1. **Environment Variables**:
   ```
   STATIC_DEPLOYMENT: true
   REGION: eu-north-1
   IMAGE_FAVICON_URL: https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon
   IMAGE_LOGO_URL: https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo
   IMAGE_BANNER_URL: https://website-majorjayant.s3.eu-north-1.amazonaws.com/Group+10+(1).png
   IMAGE_ABOUT_PROFILE_URL: https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg
   ```

2. **Build Settings**:
   - Ensure the build specification is automatically detected from the `amplify.yml` file
   - Set Python version to 3.11
   - Select the appropriate build image (latest Amazon Linux 2)

3. **Domain Management**:
   - Connect your custom domain if needed
   - Set up your SSL certificate (already available)

## Understanding the Build Process

The build process follows these steps:
1. **PreBuild**: Sets up Python and installs dependencies from `requirements-dev.txt`
2. **Build**: Runs `build_static_site.py` to generate static files in `app/static`
3. **Post-Build**: Validates outputs and runs diagnostics
4. **Deployment**: Deploys the contents of `app/static` to Amplify's CDN

## Troubleshooting

If builds continue to fail:

1. Check the Amplify build logs for specific errors
2. Review the output from `amplify-debug.sh` (runs automatically during build)
3. Verify all environment variables are correctly set
4. Ensure all dependencies in `requirements-dev.txt` are properly specified
5. Check that `app/static` is created and contains an `index.html` file

## Integration with Other AWS Services

Your setup utilizes:
- S3 bucket for file storage
- Lambda function for backend processing
- CloudFront for content delivery
- API Gateway for API access
- CloudFlare for DNS management

## Maintenance

When making changes to the site:
1. Push changes to the GitHub repository
2. Amplify will automatically detect changes and initiate a new build
3. Monitor the build progress in the Amplify Console
4. Once successful, the site will be automatically deployed 