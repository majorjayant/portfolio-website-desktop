# Portfolio Website

A streamlined portfolio website using AWS Amplify for hosting and AWS Lambda with MySQL for backend storage.

## Components

- **Frontend**: Static HTML/CSS/JS files in the `app/static` directory.
- **Admin Dashboard**: Located at `app/static/admin/dashboard.html` for managing site content.
- **Backend**: AWS Lambda function in the `lambda-no-mysql` directory (using MySQL for storage via RDS). Implements soft delete for work experience items using an `is_deleted` flag in the database.
- **Database**: MySQL database on AWS RDS (configuration in the Lambda function and `.env`). Assumes `workex` table includes `is_deleted` (TINYINT DEFAULT 0), `created_date` (DATETIME/TIMESTAMP), `updated_date` (DATETIME/TIMESTAMP) columns.

## Key Files

- `lambda-no-mysql/index.js`: Lambda function handling API requests for getting/updating site configuration and work experience (implements soft delete for work experience).
- `lambda-payload-delete.zip`: The latest deployment package for the Lambda function (created in the project root).
- `app/static/html/index.html` or `app/static/index.html`: Main portfolio website page.
- `app/static/js/main.js`: Frontend JavaScript for the portfolio page, including loading config and displaying data (only shows non-deleted work experience).
- `app/static/admin/dashboard.html`: HTML and JavaScript for the Admin Dashboard interface.
- `app/static/admin/login.html`: Admin login page.

## Deployment

1.  Set up AWS RDS MySQL database. Ensure the `workex` table has `is_deleted` (TINYINT DEFAULT 0), `created_date`, and `updated_date` columns. Ensure `site_config` table exists.
2.  Configure environment variables for the Lambda function (e.g., DB host, user, password, database name).
3.  Deploy the latest Lambda deployment package (`lambda-payload-delete.zip` located in the project root) to AWS Lambda and configure API Gateway trigger.
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
3.  Upon successful login, you will be redirected to the main dashboard page (`/static/admin/dashboard.html`).

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
    *   Items are loaded dynamically from the database when the page loads (only non-deleted items are shown).
    *   **Adding an Item:** Click the "Add Work Experience" button.
    *   **Fields per Item:**
        *   `Job Title*`: Your role or position (Required).
        *   `Company*`: The name of the company (Required).
        *   `Location`: The city/state or general location of the job.
        *   `From Date`: The start date of the position (Year and Month).
        *   `To Date`: The end date of the position (Year and Month). Leave empty and check "Current Job" if you are still employed there.
        *   `Current Job`: Checkbox to indicate if this is your current position. If checked, the 'To Date' field will be disabled.
        *   `Description`: A brief description of your responsibilities and achievements in the role.
    *   **Deleting an Item (Soft Delete):** Click the "Delete" button next to the item you wish to remove.
        *   This **does not** remove the item from the dashboard immediately.
        *   Instead, it visually marks the item (e.g., faded out) and sets a hidden flag (`is_deleted = 1`) associated with that item in the form.
        *   When you click "Save Changes", the data for *all* items (including the marked one) is sent to the backend.
        *   The backend then processes the item marked with `is_deleted = 1` by updating its record in the database to set the `is_deleted` column to `1`.
        *   The item will no longer appear on the public website or in the dashboard on subsequent loads (as only items with `is_deleted = 0` are fetched).

### Operations

1.  **Loading Data:** When the dashboard loads, it automatically fetches the current site configuration and *non-deleted* work experience data (`is_deleted = 0`) from the Lambda backend.
    *   A loading indicator is shown while data is being fetched.
    *   If there's an error fetching data (e.g., API issue), an error message appears.

2.  **Saving Changes:**
    *   After making modifications, click "Save Changes".
    *   The dashboard gathers all data, including *all* currently displayed work experience items and their associated deletion status (hidden `is_deleted` flag: 0 or 1).
    *   It sends a `POST` request to the Lambda function (`action: 'update_site_config'`).
    *   The Lambda function (`saveWorkExperience`):
        *   Validates the request.
        *   Updates/Inserts `site_config` data.
        *   Iterates through the received `work_experience` array:
            *   **Soft Delete:** If an item has an `id` and `is_deleted: 1`, it performs `UPDATE workex SET is_deleted = 1, updated_date = NOW() WHERE id = ? AND is_deleted = 0`.
            *   **Update:** If an item has an `id` and `is_deleted: 0`, it performs a normal `UPDATE` on all fields, setting `updated_date = NOW()` and ensuring `is_deleted = 0`.
            *   **Insert:** If an item has no `id` and `is_deleted: 0`, it performs an `INSERT`, setting `created_date`, `updated_date`, and `is_deleted = 0`.
            *   **Ignore:** If an item has no `id` and `is_deleted: 1` (e.g., added and deleted before first save), it is ignored.
    *   A loading overlay appears; success/error messages are displayed.

3.  **Refreshing Data:**
    *   Clicking "Refresh Data" reloads only the *non-deleted* configuration and work experience items (`is_deleted = 0`).

4.  **Logout:**
    *   Click the "Logout" button in the top navigation bar.
    *   This removes the authentication token from your browser's local storage and redirects you to the login page.

### How it Works (Technical Flow - Updated)

1.  **Load:** `dashboard.html` loads -> JavaScript checks auth -> Calls `loadSiteConfig`.
2.  **Fetch:** `loadSiteConfig` makes `GET` request (`?type=site_config`).
3.  **Lambda GET:** Lambda runs `getSiteConfig` and `getWorkExperience`. `getWorkExperience` uses `SELECT * FROM workex WHERE is_deleted = 0 ...`. Returns JSON with `site_config` and only *non-deleted* `work_experience`.
4.  **Populate:** `loadSiteConfig` calls `populateForm` and `loadWorkExperienceData`.
5.  **Display WorkEx:** `loadWorkExperienceData` displays only the non-deleted items received.
6.  **User Deletes (Frontend):** User clicks delete on an item -> JavaScript finds the corresponding work experience container -> Sets the hidden input `.workex-is-deleted` value to `1` -> Adds the `.marked-for-deletion` class for visual feedback. The item remains in the DOM.
7.  **Save:** User clicks "Save Changes" -> `getWorkExperienceData` collects data from *all* work experience containers, reading the value of the hidden `.workex-is-deleted` input for each (0 or 1) -> `saveSiteConfig` sends `POST` request with the full list including `is_deleted` flags.
8.  **Lambda POST:** Lambda receives request -> Calls `saveSiteConfig` -> Calls `saveWorkExperience`.
    *   `saveWorkExperience` iterates through the payload items *without* fetching IDs separately.
    *   For each item:
        *   Checks `item.id` and `item.is_deleted`.
        *   If `id` and `is_deleted: 1`, prepares/executes `UPDATE ... SET is_deleted = 1 WHERE id = ? AND is_deleted = 0`. Logs result.
        *   If `id` and `is_deleted: 0`, prepares/executes normal `UPDATE ... WHERE id = ?`. Logs result.
        *   If no `id` and `is_deleted: 0`, prepares/executes `INSERT ...`. Logs result.
        *   If no `id` and `is_deleted: 1`, skips and logs ignore action.
    *   Commits transaction if all operations succeed, otherwise rolls back.
    *   Returns success/error.
9.  **Refresh After Save:** `saveSiteConfig` calls `fetchConfiguration` which re-runs the `GET` request, fetching only the items where `is_deleted = 0`, thus reflecting any soft deletions.

---

## Developer Guide: Adding New Fields

This section outlines the steps required to add a new manageable field to the website, controllable via the Admin Dashboard.

**Scenario:** Add a new text field called `portfolio_highlight` to the `site_config`.

1.  **Database Schema:**
    *   **Add Column:** Add the new column `portfolio_highlight` (e.g., `VARCHAR(255)`) to your `site_config` table in the MySQL database. Set a sensible default if needed (e.g., `NULL` or `''`).
    *   _Location: Perform this directly on your RDS instance using a SQL client._

2.  **Lambda Function (`lambda-no-mysql/index.js`):**
    *   **`getSiteConfig` Function:**
        *   Ensure the `SELECT` query retrieves the new column. If using `SELECT *`, it might be included automatically, but explicitly adding it (`SELECT config_key, config_value, ... portfolio_highlight FROM site_config`) is safer if you aren't selecting all columns.
        *   Update the logic that builds the `configObject` to include the new field: `configObject.portfolio_highlight = row.portfolio_highlight;` (adjust based on how your query returns data).
    *   **`saveSiteConfig` Function:**
        *   Add the new field to the list of fields being updated/inserted. Modify the `INSERT` and `UPDATE` statements.
        *   Example (Conceptual - adapt to your specific query structure):
            ```sql
            -- For UPDATE
            UPDATE site_config SET ..., portfolio_highlight = ? WHERE ...
            -- For INSERT
            INSERT INTO site_config (..., portfolio_highlight) VALUES (..., ?)
            ```
        *   Ensure the corresponding value from the `configData` payload is passed in the parameters array for the SQL execution: `..., configData.portfolio_highlight || '', ...`.

3.  **Admin Dashboard (`app/static/admin/dashboard.html`):**
    *   **HTML (Form Input):**
        *   Add a new `label` and `input` (or `textarea`) element within the `<form id="site-config-form">`. Give the input a unique `id` matching the field name (e.g., `id="portfolio_highlight"`).
        *   Place it in a relevant section (e.g., "General Website Information").
    *   **JavaScript (`populateForm` function):**
        *   Add a line to set the value of the new input field when data is loaded: `document.getElementById('portfolio_highlight').value = config.portfolio_highlight || '';`.
    *   **JavaScript (Form Submission Listener / `siteConfigData` object):**
        *   Add the new field to the `siteConfigData` object that gathers form values: `portfolio_highlight: document.getElementById('portfolio_highlight').value,`.

4.  **Frontend Website (`app/static/js/main.js` or relevant JS):**
    *   **`updateWebsiteElements` Function (or similar):**
        *   Access the new field from the globally stored `window.siteConfig` object (which is populated by `processConfigData`).
        *   Find the target HTML element on the *public* website where this data should be displayed.
        *   Update the `textContent` or `innerHTML` of the target element: `targetElement.textContent = config.portfolio_highlight || '';`.

5.  **Deployment:**
    *   Create a new Lambda deployment package (`.zip`) including the updated `index.js` and `node_modules`.
    *   Deploy the updated Lambda function.
    *   Deploy the updated frontend files (`dashboard.html`, potentially `main.js` and the main `index.html` if you added a display element there).

**Summary for New Field (`portfolio_highlight`):**

*   **DB:** Add column `portfolio_highlight` to `site_config`.
*   **Lambda `getSiteConfig`:** Select and include `portfolio_highlight` in the response.
*   **Lambda `saveSiteConfig`:** Include `portfolio_highlight` in `INSERT`/`UPDATE` SQL and parameters.
*   **Dashboard HTML:** Add `<label>` and `<input id="portfolio_highlight">`.
*   **Dashboard JS `populateForm`:** Set `$('#portfolio_highlight').value`.
*   **Dashboard JS `submit` listener:** Add `portfolio_highlight: $('#portfolio_highlight').value` to `siteConfigData`.
*   **Frontend JS `updateWebsiteElements`:** Update relevant HTML element using `window.siteConfig.portfolio_highlight`.
*   **Deploy:** Update Lambda & Frontend.

This workflow ensures data flows correctly from the database, to the dashboard for editing, back to the database for saving, and finally to the public website for display.
