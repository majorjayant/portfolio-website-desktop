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

---

## Developer Guide: Adding New Manageable Fields

This section outlines the steps required to add a new field that can be managed via the Admin Dashboard and displayed on the frontend portfolio.

**Example Scenario:** Adding a `skills_used` text field to the Work Experience section.

**1. Database Modification:**
   *   Add the new column to your MySQL `workex` table.
      ```sql
      ALTER TABLE workex
      ADD COLUMN skills_used TEXT NULL DEFAULT NULL AFTER description;
      ```
   *   _Choose appropriate data types (TEXT, VARCHAR, INT, etc.) and constraints (NULL, DEFAULT)._

**2. Lambda Function (`lambda-no-mysql/index.js`):**
   *   **`getWorkExperience` Function:**
      *   Ensure your `SELECT * ...` statement implicitly fetches the new column. If you selected specific columns, add `skills_used` to the list.
      *   In the `rows.map(...)` section, add the new field to the `expObj` being returned:
         ```javascript
         const expObj = {
           // ... existing fields ...
           description: row.description,
           skills_used: row.skills_used || '' // Add the new field
         };
         ```
   *   **`saveWorkExperience` Function:**
      *   Add the new field (`skills_used`) to the parameters extracted from the `item` payload at the beginning of the `for...of` loop:
         ```javascript
         const skillsUsed = item.skills_used || '';
         ```
      *   Add the new field and its corresponding placeholder (`?`) to the `UPDATE workex SET ...` SQL statement:
         ```sql
         `UPDATE workex SET 
            ..., 
            description = ?, 
            skills_used = ?, -- Add new field
            updated_date = NOW(), 
            is_deleted = 0 
          WHERE id = ?`,
         // Add the variable to the parameter array in the correct position:
         [..., description, skillsUsed, itemIdInt] 
         ```
      *   Add the new column name and its corresponding placeholder (`?`) to the `INSERT INTO workex (...) VALUES (...)` SQL statement:
         ```sql
         `INSERT INTO workex (... description, skills_used, is_deleted, created_date, updated_date) 
          VALUES (?, ..., ?, ?, 0, NOW(), NOW())`, // Add placeholder
         // Add the variable to the parameter array in the correct position:
         [..., description, skillsUsed]
         ```
      *   _**Important:** Make sure the order of placeholders (`?`) exactly matches the order of variables in the parameter array for both UPDATE and INSERT._

**3. Admin Dashboard (`app/static/admin/dashboard.html`):**
   *   **`addWorkExperienceItem` Function:**
      *   Within this function, create the HTML elements (label, input/textarea) for the new field (`skills_used`). Assign appropriate classes (e.g., `workex-skills-used`) and attributes (`type`, `placeholder`, `rows` if textarea).
         ```javascript
         // Create skills field
         const skillsLabel = document.createElement('label');
         skillsLabel.textContent = 'Skills Used:';
         const skillsInput = document.createElement('textarea');
         skillsInput.className = 'workex-skills-used'; // Assign a class
         skillsInput.value = data.skills_used || ''; // Populate from loaded data
         skillsInput.placeholder = 'e.g., JavaScript, React, Node.js';
         skillsInput.rows = 2;
         ```
      *   Append these new elements to the `workExItem` div in the desired visual order:
         ```javascript
         // Add fields to work experience item
         // ... append other fields ...
         workExItem.appendChild(descLabel);
         workExItem.appendChild(descInput);
         workExItem.appendChild(skillsLabel); // Append new label
         workExItem.appendChild(skillsInput); // Append new input
         workExItem.appendChild(deleteBtn);
         ```
   *   **`getWorkExperienceData` Function:**
      *   Inside the `workExItems.forEach(...)` loop, retrieve the value from the new input field using its class.
         ```javascript
         const skillsUsed = item.querySelector('.workex-skills-used')?.value || '';
         ```
      *   Add the new field to the `workExData` object being created:
         ```javascript
         const workExData = {
           // ... existing fields ...
           description: item.querySelector('.workex-description')?.value || '',
           skills_used: skillsUsed // Add the new field
         };
         ```
   *   **(Optional) CSS Styling:** Add any necessary CSS rules in the `<style>` block or external CSS file for the new elements (e.g., `.workex-skills-used`) if needed.

**4. Frontend Portfolio Display (`app/static/js/main.js` or similar):**
   *   **`updateWorkExperienceTimeline` Function (or equivalent):**
      *   Ensure the data received from the API (via `loadSiteConfig`) includes the new field (`skills_used`). You might need to check the `processConfigData` function.
      *   Inside the loop that creates timeline items (`sortedWorkExperience.forEach(...)`), access the new field:
         ```javascript
         const skillsUsed = experience.skills_used || '';
         ```
      *   Modify the `innerHTML` for the `timelineItem` to display the `skillsUsed` data where desired. You might add a new paragraph or list.
         ```html
         <div class="timeline-content">
             <h3 class="job-title">${jobTitle}</h3>
             <h4 class="company-info">${company} ${location ? `| ${location}` : ''}</h4>
             <span class="date">${period}</span>
             <p class="timeline-description">${description}</p>
             ${skillsUsed ? `<p class="timeline-skills"><strong>Skills:</strong> ${skillsUsed}</p>` : ''} <!-- Display skills -->
         </div>
         ```
   *   **(Optional) CSS Styling:** Add CSS rules (e.g., in `app/static/css/style.css`) for the new element (e.g., `.timeline-skills`).

**5. Deployment:**
   *   Deploy the updated Lambda function package (`.zip`).
   *   Deploy the updated frontend files (`dashboard.html`, `main.js`, potentially CSS files) to your hosting provider (e.g., Amplify).

By following these steps, you can systematically add new manageable content fields to your portfolio system.
