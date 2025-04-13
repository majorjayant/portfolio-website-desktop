# Portfolio Website

A streamlined portfolio website using AWS Amplify for hosting and AWS Lambda with MySQL for backend storage.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Admin Dashboard](#admin-dashboard)
- [Frontend Components](#frontend-components)
- [CSS Organization](#css-organization)
- [Developer Guide](#developer-guide)

## Overview

### Recent Updates & Improvements

The codebase has undergone several important improvements to enhance maintainability and reliability:

1. **Centralized Configuration**: 
   - Removed hardcoded URLs in favor of environment variables 
   - Created centralized asset handling in JavaScript
   - Updated `environment-config.json` with standardized structure

2. **Build Process Enhancements**:
   - Improved `amplify.yml` to handle Python build environment properly
   - Enhanced fallback mechanism in case primary build fails
   - Added proper caching configuration for static assets

3. **Cleaned Codebase**:
   - Removed unnecessary test files and empty CSS files
   - Updated package.json scripts to clarify deployment approach
   - Removed Netlify-specific configuration

4. **Better Error Handling**:
   - Added frontend fallbacks for failed API requests
   - Improved image loading with fallback paths
   - Enhanced error notifications for user experience

5. **Work Experience Section Improvements**:
   - Fixed issues with description and skills visibility in work experience cards
   - Improved styling of section title and positioning
   - Enhanced spacing between sections for better visual hierarchy
   - Ensured proper display of list items in job descriptions
   - Optimized skills extraction and display

## Architecture

### Key Components

- **Frontend**: Static HTML/CSS/JS files in the `app/static` directory.
- **Admin Dashboard**: Located at `app/static/admin/dashboard.html` for managing site content.
- **Backend**: AWS Lambda function in the `lambda-no-mysql` directory (using MySQL for storage via RDS). Implements soft delete for work experience items using an `is_deleted` flag in the database.
- **Database**: MySQL database on AWS RDS (configuration in the Lambda function and `.env`). Assumes `workex` table includes `is_deleted` (TINYINT DEFAULT 0), `created_date` (DATETIME/TIMESTAMP), `updated_date` (DATETIME/TIMESTAMP) columns.

### Key Files

- `lambda-no-mysql/index.js`: Lambda function handling API requests for getting/updating site configuration and work experience (implements soft delete for work experience).
- `lambda-payload-delete.zip`: The latest deployment package for the Lambda function (created in the project root).
- `app/static/html/index.html` or `app/static/index.html`: Main portfolio website page.
- `app/static/js/main.js`: Frontend JavaScript for the portfolio page, including loading config and displaying data (only shows non-deleted work experience).
- `app/static/admin/dashboard.html`: HTML and JavaScript for the Admin Dashboard interface.
- `app/static/admin/login.html`: Admin login page.

### Admin Dashboard Structure

- `/app/static/admin/dashboard.html` - The main admin dashboard file (single source of truth)
- `/app/admin/index.html` - Redirect file pointing to the main dashboard
- `/app/admin/dashboard/index.html` - Redirect file for clean URL structure

### API Communication

The application communicates with the API endpoint at:
`https://zelbc2vwg2.execute-api.eu-north-1.amazonaws.com/Staging/website-portfolio`

This API handles:
- Fetching site configuration
- Updating site configuration
- Managing work experience data

## Deployment

1. Set up AWS RDS MySQL database. Ensure the `workex` table has `is_deleted` (TINYINT DEFAULT 0), `created_date`, and `updated_date` columns. Ensure `site_config` table exists.
2. Configure environment variables for the Lambda function (e.g., DB host, user, password, database name).
3. Deploy the latest Lambda deployment package (`lambda-payload-delete.zip` located in the project root) to AWS Lambda and configure API Gateway trigger.
4. Deploy the frontend static files (contents of `app/static/`) to AWS Amplify or another static hosting provider.
5. Ensure the API endpoint URL in `app/static/admin/dashboard.html` and `app/static/js/main.js` points to your deployed API Gateway stage URL.

## Admin Dashboard

The Admin Dashboard provides a user-friendly interface to update various sections of your website without needing to edit the code directly.

### Key Features

1. **Authentication System** - Handles login/logout and protects admin content
2. **Site Configuration** - For updating website title, description, images, etc.
3. **Work Experience Management** - For adding/editing/deleting work experience entries
4. **Rich Text Formatting** - Buttons for adding HTML formatting to text fields (B/I/U/BR)
5. **Responsive Design** - Works on both desktop and mobile devices

### Authentication

The dashboard uses localStorage to store and validate the `admin_token`.
If not authenticated, users will see a login prompt.

### URL Structure

- `/admin/` - Redirects to the main dashboard
- `/admin/dashboard/` - Alternate URL that also redirects to the main dashboard
- `/static/admin/dashboard.html` - Direct URL to the dashboard (used by the redirects)

### Dashboard Sections and Fields

The dashboard is divided into several sections:

1. **General Website Information:**
   * `Site Title`: The main title displayed, often in the browser tab and potentially on the page. Supports basic HTML tags.
   * `Subtitle`: A secondary title or tagline. Supports basic HTML tags.
   * `Description`: The main descriptive text for the 'About' section. Supports basic HTML tags and line breaks.

2. **Website Images:**
   * `Favicon URL`: URL for the small icon shown in the browser tab.
   * `Logo URL`: URL for the main site logo, typically displayed in the header/navbar.
   * `Banner URL`: URL for the main banner image displayed on the homepage.
   * `Mobile Banner URL`: URL for an alternative banner image optimized for mobile devices.
   * `Profile Image URL`: URL for the main profile picture used in the 'About' section.

3. **Gallery Photos:**
   * `Photo 1-4 URL`: URLs for images displayed in the gallery section.
   * `Photo 1-4 Alt Text`: Descriptive alternative text for each gallery image.

4. **Work Experience:**
   * This section allows you to manage your professional experience timeline.
   * Items are loaded dynamically from the database when the page loads.
   * **Fields per Item:**
     * `Job Title*`: Your role or position (Required).
     * `Company*`: The name of the company (Required).
     * `Location`: The city/state or general location of the job.
     * `From Date`: The start date of the position (Year and Month).
     * `To Date`: The end date of the position.
     * `Current Job`: Checkbox to indicate if this is your current position.
     * `Description`: A brief description of your responsibilities and achievements.

### Operations

1. **Accessing the Dashboard**: Navigate to `/admin/login` and enter credentials.

2. **Loading Data**: The dashboard automatically fetches the current site configuration and work experience data from the Lambda backend on load.

3. **Saving Changes**:
   * After making modifications, click "Save Changes".
   * A loading overlay appears; success/error messages are displayed.

4. **Deleting Work Experience Items (Soft Delete)**:
   * Click the "Delete" button next to a work experience item to mark it for deletion.
   * This sets the `is_deleted` flag to 1, which prevents it from displaying on the live site.

5. **Refreshing Data**:
   * Click "Refresh Data" to reload configuration and non-deleted work experience items.

6. **Logout**:
   * Click the "Logout" button to clear the authentication token and return to the login page.

## Frontend Components

### Page Structure
- **Banner Section**: Full-width banner with parallax effect
- **About Section**: Profile image and bio
- **Experience Section**: Interactive work experience drawers
- **Education Section**: Academic history
- **Certifications Section**: Professional certifications

### Data Flow
1. Initial page load triggers fetch from AWS Lambda API
2. `fetchLatestAboutContent()` loads site configuration from the API
3. `updatePageWithConfig()` populates page content dynamically
4. Work experiences are loaded and displayed as collapsible drawers
5. Carousel images load from configuration URLs
6. Interactive elements initialize (parallax, carousel, drawer toggles)

### User Interaction
- Scroll-based transitions (banner to about section)
- Hover/click on experience drawers to expand
- Photo carousel with 3D rotation effect
- Responsive navigation that adapts to scroll position

### Experience Section Structure
The experience drawers follow this HTML structure:
```html
<div class="experience-drawer color-1">
  <div class="drawer-header">
    <div class="drawer-date">November 2023 - Present</div>
    <div class="drawer-title-company">
      <h3>Product Owner | Product Manager</h3>
      <p>AtliQ Technologies Pvt. Ltd.</p>
    </div>
    <div class="drawer-location">Vadodara, India</div>
  </div>
  <div class="drawer-description">
    <div class="description-content">
      <!-- Description content -->
    </div>
    <div class="skills-container">
      <span class="skill-tag">Product Management</span>
      <span class="skill-tag">Agile</span>
      <!-- More skill tags -->
    </div>
  </div>
</div>
```

## CSS Organization

### File Structure
1. **style.css** - Main stylesheet for the entire website
   - Contains general styles for the whole site
   - Does not contain experience section styles

2. **experience-section-combined.css** - Consolidated experience section styles
   - Contains ALL styles related to the experience section
   - Includes responsive behavior for all screen sizes
   - Uses consistent naming conventions and organization

### CSS Methodology
- **Component-Based**: Each section has isolated styles
- **Mobile-First**: Base styles with responsive overrides
- **Namespaced Classes**: Prevents style conflicts (e.g., `drawer-title`, `drawer-date`)
- **CSS Variables**: Used for theme colors and spacing

### Theme Colors
- Primary colors: Brown palette (#6c584c, #a38566, #d1b38a, #e9dac1)
- Each drawer has a different color class (color-1, color-2, etc.)
- Text colors adapt to background (white on dark, dark on light)

### Mobile Responsiveness
- Breakpoints at 768px and 480px
- Mobile adaptations:
  - Centered elements with adjusted spacing
  - Touch-friendly tap targets
  - Stacked layout for previously horizontal elements
  - Adjusted font sizes and padding

## Developer Guide

### Adding New Fields

This section outlines the steps required to add a new manageable field to the website, controllable via the Admin Dashboard.

**Scenario:** Add a new text field called `portfolio_highlight` to the `site_config`.

1. **Database Schema:**
   * Add the new column `portfolio_highlight` to your `site_config` table in the MySQL database.
   * Set a sensible default if needed (e.g., `NULL` or `''`).

2. **Lambda Function (`lambda-no-mysql/index.js`):**
   * **`getSiteConfig` Function:**
     * Ensure the `SELECT` query retrieves the new column.
     * Update the logic that builds the `configObject` to include the new field.
   * **`saveSiteConfig` Function:**
     * Add the new field to the list of fields being updated/inserted.
     * Modify the `INSERT` and `UPDATE` statements.

3. **Admin Dashboard:**
   * Add a new form field in `app/static/admin/dashboard.html`:
     ```html
     <div class="form-group">
       <label for="portfolio_highlight">Portfolio Highlight:</label>
       <input type="text" id="portfolio_highlight" name="portfolio_highlight" class="form-control">
     </div>
     ```
   * Update the JavaScript to handle the new field:
     * Add it to `populateForm` to ensure it's populated when data is loaded.
     * Add it to the data collection in the save function.

4. **Frontend Display:**
   * Modify the frontend HTML (`app/static/index.html`) to include a placeholder for the new field.
   * Update `main.js` to populate this field from the site config.

### Adding New Sections

1. Create HTML structure in index.html
2. Add corresponding styles in style.css
3. Update admin dashboard to include form fields
4. Add API handlers for the new content type

### Updating Styling

1. Edit general styles in style.css
2. For experience section, edit experience-section-combined.css
3. Keep the same naming conventions and organization
4. Test on multiple devices and screen sizes

### Best Practices

1. Keep CSS files under 1000 lines each
2. Document major changes in comments
3. Use consistent naming conventions
4. Maintain mobile responsiveness with each change
5. Test on major browsers after significant updates