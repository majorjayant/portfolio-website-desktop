# Admin Dashboard Structure

This document outlines the organization of the admin dashboard for the Portfolio Website.

## File Structure

- `/app/static/admin/dashboard.html` - The main admin dashboard file (single source of truth)
- `/app/admin/index.html` - Redirect file pointing to the main dashboard
- `/app/admin/dashboard/index.html` - Redirect file for clean URL structure

## Key Features

The admin dashboard includes the following features:

1. **Authentication System** - Handles login/logout and protects admin content
2. **Site Configuration** - For updating website title, description, images, etc.
3. **Work Experience Management** - For adding/editing/deleting work experience entries
4. **Rich Text Formatting** - Buttons for adding HTML formatting to text fields (B/I/U/BR)
5. **Responsive Design** - Works on both desktop and mobile devices

## Maintenance Guidelines

When updating the admin dashboard:

1. Only modify the `/app/static/admin/dashboard.html` file
2. Ensure all JavaScript functions (insertTag, fetchWorkExperienceData, etc.) remain intact
3. Test thoroughly after making changes to ensure all features continue to work
4. Keep the redirect files pointing to the correct location if URLs change

## URL Structure

- `/admin/` - Redirects to the main dashboard
- `/admin/dashboard/` - Alternate URL that also redirects to the main dashboard
- `/static/admin/dashboard.html` - Direct URL to the dashboard (used by the redirects)

## API Communication

The dashboard communicates with the API endpoint at:
`https://zelbc2vwg2.execute-api.eu-north-1.amazonaws.com/Staging/website-portfolio`

This API handles:
- Fetching site configuration
- Updating site configuration
- Managing work experience data

## Authentication

The dashboard uses localStorage to store and validate the `admin_token`.
If not authenticated, users will see a login prompt. 