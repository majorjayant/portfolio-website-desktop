# AWS Amplify Deployment Guide

This guide provides step-by-step instructions for deploying your portfolio website to AWS Amplify.

## Current Amplify Details

- **App ID**: d200zhb2va2zdo
- **Domain**: https://main.d200zhb2va2zdo.amplifyapp.com/
- **Region**: eu-north-1

## Prerequisites

1. AWS account with access to AWS Amplify
2. Your code in a Git repository (GitHub, GitLab, BitBucket, or AWS CodeCommit)

## Deployment Steps

### 1. Access AWS Amplify Console

1. Log in to the AWS Management Console
2. Go to the AWS Amplify service
3. Select your existing app (d200zhb2va2zdo) or create a new one

### 2. Connect Your Repository

If not already connected:

1. Click "Host your web app"
2. Select your Git provider (GitHub, BitBucket, GitLab, etc.)
3. Authorize AWS Amplify to access your repository
4. Select the repository and branch you want to deploy

### 3. Configure Build Settings

1. Your repository should already contain the `amplify.yml` file at the root
2. On the "Configure build settings" page:
   - Review the auto-detected settings
   - If needed, modify environment variables for the build
   - Add the following environment variables:
     - `STATIC_DEPLOYMENT`: `true`
     - `AWS_REGION`: `eu-north-1`
     - `IMAGE_FAVICON_URL`: `https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon`
     - `IMAGE_LOGO_URL`: `https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo`
     - `IMAGE_BANNER_URL`: `https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner`
     - `IMAGE_ABOUT_PROFILE_URL`: `https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg`

3. Advanced settings (if needed):
   - Set Python version to 3.11
   - Set build image to the latest Amazon Linux 2 image

### 4. Environment Variables Management (Later)

You can add or modify environment variables at any time:

1. Go to your Amplify app
2. Click on "Environment variables" in the left menu
3. Add or edit variables as needed
4. Click "Save"

### 5. Redeploy/Rebuild

If you've updated configuration and need to redeploy:

1. Go to your Amplify app
2. Click on "Hosting environments" in the left menu
3. Select the branch you want to redeploy
4. Click "Redeploy this version"

### 6. Verify Deployment

1. Once the build completes, click on the provided URL to view your app
2. Verify that all pages render correctly
3. Check that your images and assets appear properly

## Troubleshooting Common Issues

### Build Fails With Dependency Errors

- Check the build logs for specific errors
- Update `requirements-dev.txt` to include all required packages
- Use the specific package versions that are compatible with your code

### "Your App Will Appear Here" Message

This typically means one of the following:

1. **Missing index.html**: Ensure that your build process creates `index.html` in the correct location
2. **Incorrect baseDirectory**: Verify that the `baseDirectory` in `amplify.yml` matches the location where your `index.html` is built
3. **Build Error**: Check build logs to ensure there were no errors during the build process

### Serving the Wrong Content

- Ensure the `artifacts.files` pattern in `amplify.yml` is correct
- Check that the `baseDirectory` path is correct relative to your project structure

### Cache Issues

If you see stale content:

1. Add cache headers in `amplify.yml` (already included)
2. Create a new deployment to refresh the cache

## Monitoring and Logs

1. To view build logs:
   - Go to your Amplify app in the console
   - Select the branch
   - Click "View build logs"

2. To monitor app performance:
   - Use AWS CloudWatch to set up monitoring and alerts

## Additional Amplify Features to Consider

- **Custom Domains**: Connect your own domain name
- **Preview Environments**: Create preview URLs for pull requests
- **Branch-Based Deployments**: Set up multiple environments (dev, staging, prod)
- **Password Protection**: Protect your app with basic auth during development 