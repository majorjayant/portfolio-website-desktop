# Portfolio Website

A streamlined portfolio website using AWS Amplify for hosting and AWS Lambda with MySQL for backend storage.

## Components

- **Frontend**: Static HTML/CSS/JS files in the `app/static` directory.
- **Admin Dashboard**: Located at `app/static/admin/dashboard.html` for managing site content.
- **Backend**: AWS Lambda function in the `lambda-no-mysql` directory (using MySQL for storage via RDS).
- **Database**: MySQL database on AWS RDS (configuration in the Lambda function and `.env`).

## Key Files

- `lambda-no-mysql/index.js`: Lambda function handling API requests for getting/updating site configuration and work experience.
- `lambda-no-mysql/lambda-*.zip`: Various deployment packages for the Lambda function (use the latest version recommended).
- `app/static/html/index.html` or `app/static/index.html`: Main portfolio website page.
- `app/static/js/main.js`: Frontend JavaScript for the portfolio page, including loading config and displaying data.
- `app/static/admin/dashboard.html`: HTML and JavaScript for the Admin Dashboard interface.
- `app/static/admin/login.html`: Admin login page.

## Deployment

1.  Set up AWS RDS MySQL database and run the necessary SQL setup scripts (if applicable, details may vary based on setup).
2.  Configure environment variables for the Lambda function (e.g., DB host, user, password, database name).
3.  Deploy the latest Lambda deployment package (e.g., `lambda-db-fix.zip`) to AWS Lambda and configure API Gateway trigger.
4.  Deploy the frontend static files (contents of `app/static/`) to AWS Amplify or another static hosting provider.
5.  Ensure the API endpoint URL in `app/static/admin/dashboard.html` and `app/static/js/main.js` points to your deployed API Gateway stage URL.

---

## Admin Dashboard Guide (`/admin`)

This guide explains how to use the Admin Dashboard to manage the content of your portfolio website.

### Purpose

The Admin Dashboard provides a user-friendly interface to update various sections of your website without needing to edit the code directly. All changes are saved to the MySQL database via the AWS Lambda backend.

### Accessing the Dashboard

1.  Navigate to `/admin/login` on your website URL (e.g., `yourwebsite.com/admin/login`).
2.  Enter the admin username and password.
    *   _Note: Authentication logic is handled by the `handleLogin` function within the Lambda function (`lambda-no-mysql/index.js`). You may need to consult or modify this function based on your specific user management setup._
3.  Upon successful login, you will be redirected to the main dashboard page (`/admin/dashboard` or `/static/admin/dashboard.html`).

### Dashboard Sections and Fields

The dashboard is divided into several sections:

1.  **General Website Information:**
    *   `Site Title`: The main title displayed, often in the browser tab and potentially on the page. Supports basic HTML tags (Bold, Italic, Underline, Line Break) via formatting buttons.
    *   `Subtitle`: A secondary title or tagline. Supports basic HTML tags.
    *   `Description`: The main descriptive text for the 'About' section or a general site description. Supports basic HTML tags and line breaks.

2.  **Website Images:**
    *   `Favicon URL`: URL for the small icon shown in the browser tab.
    *   `Logo URL`: URL for the main site logo, typically displayed in the header/navbar.
    *   `Banner URL`: URL for the main banner image displayed on the homepage (usually for desktop views).
    *   `Mobile Banner URL`: URL for an alternative banner image optimized for mobile devices (screens 768px wide or less).
    *   `Profile Image URL`: URL for the main profile picture used in the 'About' section.

3.  **Gallery Photos:**
    *   `Photo 1-4 URL`: URLs for images displayed in the gallery or 'snaps' section.
    *   `Photo 1-4 Alt Text`: Descriptive alternative text for each gallery image, important for accessibility (SEO and screen readers).

4.  **Work Experience:**
    *   This section allows you to manage your professional experience timeline.
    *   Items are loaded dynamically from the database when the page loads.
    *   **Adding an Item:** Click the "Add Work Experience" button.
    *   **Fields per Item:**
        *   `Job Title*`: Your role or position (Required).
        *   `Company*`: The name of the company (Required).
        *   `Location`: The city/state or general location of the job.
        *   `From Date`: The start date of the position (Year and Month).
        *   `To Date`: The end date of the position (Year and Month). Leave empty and check "Current Job" if you are still employed there.
        *   `Current Job`: Checkbox to indicate if this is your current position. If checked, the 'To Date' field will be disabled.
        *   `Description`: A brief description of your responsibilities and achievements in the role.
    *   **Deleting an Item:** Click the "Delete" button next to the item you wish to remove. *Note: Deletion happens immediately on the frontend; changes are finalized only when you click "Save Changes".*

### Operations

1.  **Loading Data:** When the dashboard loads, it automatically fetches the current site configuration and work experience data from the Lambda backend (which queries the MySQL database).
    *   A loading indicator is shown while data is being fetched.
    *   If there's an error fetching data (e.g., API issue), an error message appears, and the dashboard might try to load fallback data from local JSON files (if configured).

2.  **Saving Changes:**
    *   After making any modifications in the form fields (text, URLs, work experience), click the "Save Changes" button.
    *   The dashboard gathers all the data from the form, including all work experience items.
    *   It sends this data in a `POST` request to the Lambda function (`action: 'update_site_config'`).
    *   The Lambda function validates the request (including authentication token) and then performs `UPDATE` or `INSERT` operations on the `site_config` and `workex` tables in the database.
    *   Work Experience Handling: The save function updates existing items based on their ID, inserts new items (if no ID is present), and deletes any items from the database that were present before but are *not* included in the submitted data (this handles the frontend delete button functionality).
    *   A loading overlay appears during the save process.
    *   Success or error messages are displayed upon completion.

3.  **Refreshing Data:**
    *   Click the "Refresh Data" button to manually reload the latest configuration and work experience data from the backend without saving any current changes.
    *   This is useful if you want to discard local edits or see if data has been updated elsewhere.

4.  **Logout:**
    *   Click the "Logout" button in the top navigation bar.
    *   This removes the authentication token from your browser's local storage and redirects you to the login page.

### How it Works (Technical Flow)

1.  **Load:** `dashboard.html` loads -> JavaScript checks for auth token -> If valid, calls `loadSiteConfig`.
2.  **Fetch:** `loadSiteConfig` makes a `GET` request to the Lambda API endpoint (`?type=site_config`).
3.  **Lambda GET:** Lambda function receives the request, calls `getSiteConfig` and `getWorkExperience` (which query the MySQL DB), and returns a JSON object containing both `site_config` and `work_experience` data.
4.  **Populate:** Back in `dashboard.html`, `loadSiteConfig` receives the JSON, calls `populateForm` to fill the main config fields, and calls `loadWorkExperienceData` to process and display the work experience items.
5.  **Display WorkEx:** `loadWorkExperienceData` clears the existing items and calls `addWorkExperienceItem` for each entry received from the API, dynamically creating the HTML form elements.
6.  **Save:** User clicks "Save Changes" -> `submit` event listener gathers data (using `getWorkExperienceData` for workex items) -> `saveSiteConfig` function sends a `POST` request to Lambda with the combined payload.
7.  **Lambda POST:** Lambda function receives the `POST` request, validates auth, calls `saveSiteConfig` and `saveWorkExperience` (which perform `UPDATE`/`INSERT`/`DELETE` operations on the DB), and returns a success/error message.
8.  **Refresh After Save:** Upon successful save, `saveSiteConfig` calls `fetchConfiguration` (similar to `loadSiteConfig`) to reload the dashboard with the newly saved data.

This detailed flow ensures that the dashboard reflects the current state of the database and allows seamless content management for the portfolio website.
