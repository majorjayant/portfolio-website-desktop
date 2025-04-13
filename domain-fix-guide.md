# Guide to Fix jayant.tech Domain Redirection Issue

## Problem:
When accessing jayant.tech, the URL is changing to https://main.d200zhb2va2zdo.amplifyapp.com/ instead of staying as jayant.tech.

## Root Cause:
This is happening because the custom domain is configured as a 301/302 redirect rather than as a proper custom domain with CloudFront distribution (200 rewrite).

## Solution Steps:

### 1. Update Redirect Settings in AWS Amplify Console

1. Log into your AWS Management Console
2. Navigate to AWS Amplify
3. Select your portfolio website application
4. In the left navigation menu, click on "App settings"
5. Click on "Rewrites and redirects"
6. Click "Edit" and then "Open Text Editor"
7. Copy and paste the following JSON configuration:

```json
[
  {
    "source": "/",
    "target": "/",
    "status": "200",
    "condition": null
  },
  {
    "source": "/<*>",
    "target": "/<*>", 
    "status": "200",
    "condition": null
  },
  {
    "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf|map|json)$)([^.]+$)/>",
    "target": "/",
    "status": "200",
    "condition": null
  }
]
```

8. Click "Save"

### 2. Verify Custom Domain Configuration

1. In the left navigation menu, click on "Domain management"
2. Ensure that jayant.tech is configured as a custom domain, not as a redirect
3. Check the status of the domain - it should be "Available" with a green checkmark
4. If the domain is in "Pending verification" state, follow the verification instructions
5. If the domain shows any errors, click "Actions" and select "Verify configuration"

### 3. Check DNS Configuration in Route 53 or Your DNS Provider

If using Route 53:
1. Open the Route 53 console
2. Go to "Hosted zones" and select jayant.tech
3. Verify there are proper CNAME records pointing to your Amplify app domain
4. Ensure the root domain (apex domain) has an A record with Alias pointing to the CloudFront distribution

For third-party DNS providers:
1. Log into your DNS provider's console
2. Check that the CNAME for www.jayant.tech points to the Amplify app domain
3. For the root domain, ensure it's properly configured as per Amplify's instructions

### 4. Clear Browser Cache and DNS Cache

1. Clear your browser cache and cookies
2. Flush your DNS cache:
   - On Windows: Open Command Prompt and run `ipconfig /flushdns`
   - On Mac: Open Terminal and run `sudo killall -HUP mDNSResponder`
   - On Linux: Open Terminal and run `sudo systemd-resolve --flush-caches`

### 5. Add Custom Headers Configuration (Optional)

If the issue persists, try adding custom headers in the AWS Amplify console:

1. Go to "App settings" > "Build settings"
2. Navigate to the "customHeaders" section of your amplify.yml file
3. Add the following configuration:

```yaml
customHeaders:
  - pattern: '**/*'
    headers:
      - key: 'Strict-Transport-Security'
        value: 'max-age=31536000; includeSubDomains'
      - key: 'X-Frame-Options'
        value: 'SAMEORIGIN'
      - key: 'X-XSS-Protection'
        value: '1; mode=block'
```

### 6. Test the Domain

After making these changes, wait a few minutes for the configuration to propagate, then test both the root domain (jayant.tech) and the www subdomain (www.jayant.tech) to ensure they're working correctly without redirecting to the amplifyapp.com URL.

## Additional Troubleshooting:

If the issue persists:

1. Check if there are any redirect rules set at the CloudFront distribution level
2. Verify that there are no conflicting DNS records (especially older records pointing to different services)
3. Test with different browsers and devices to rule out local caching issues
4. Check if there are any redirect rules in your application code (like in index.html)

For more assistance, refer to the AWS Amplify documentation on custom domains: https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html 