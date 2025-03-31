# AWS Amplify Deployment Configuration

This repository includes configuration files for deploying the portfolio website to AWS Amplify.

## Key Configuration Files

1. **`amplify.yml`**: Main build configuration for Amplify
2. **`environment-config.json`**: Environment variables for the build
3. **`amplify-debug.sh`**: Script to diagnose build issues
4. **`check-build-requirements.py`**: Script to verify build dependencies
5. **`app/index_standalone.py`**: Fallback generator if main build fails

## How the Build Process Works

The build process in Amplify follows these steps:

1. **PreBuild Phase**:
   - Sets up the Python environment
   - Installs dependencies from `requirements-dev.txt`
   - Runs the build requirements check script

2. **Build Phase**:
   - Sets environment variables
   - Runs the main static site generator (`build_static_site.py`)
   - Falls back to standalone index generator if main build fails
   - Verifies output exists and runs diagnostics

3. **Artifacts**:
   - Uses `app/static` as the base directory
   - Includes all files in that directory
   - Applies cache control headers

## Troubleshooting

If you encounter build issues:

1. Check the Amplify build logs
2. Review the output from `amplify-debug.sh` and `check-build-requirements.py`
3. Verify that all environment variables are set correctly
4. Make sure the Python dependencies are installed correctly

## Environment Variables

These should be configured in the Amplify Console:

```
STATIC_DEPLOYMENT: true
AWS_REGION: eu-north-1
IMAGE_FAVICON_URL: https://website-majorjayant.s3.eu-north-1.amazonaws.com/FavIcon
IMAGE_LOGO_URL: https://website-majorjayant.s3.eu-north-1.amazonaws.com/Logo
IMAGE_BANNER_URL: https://website-majorjayant.s3.eu-north-1.amazonaws.com/Banner
IMAGE_ABOUT_PROFILE_URL: https://website-majorjayant.s3.eu-north-1.amazonaws.com/profilephoto+(2).svg
```

## Amplify App Details

- **App ID**: d200zhb2va2zdo
- **Domain**: https://main.d200zhb2va2zdo.amplifyapp.com/
- **Region**: eu-north-1

## Continuous Integration

The repository includes a GitHub workflow file (`.github/workflows/amplify-test-build.yml`) that tests the build process on pull requests.

## Manual Testing

To test the build process locally:

1. Install dependencies: `pip install -r requirements-dev.txt`
2. Run the build requirements check: `python check-build-requirements.py`
3. Set environment variables (as listed above)
4. Run the build: `python build_static_site.py`
5. If the build fails, use the fallback: `python app/index_standalone.py`

## Custom Domain Setup

After your first successful deployment, you can configure a custom domain:

1. Go to your Amplify app in the AWS Console
2. Click on "Domain management"
3. Follow the steps to add a custom domain 