# Portfolio Website

A modern, responsive portfolio website with an admin dashboard for content management.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Admin Dashboard](#admin-dashboard)
- [Frontend Components](#frontend-components)
- [CSS Organization](#css-organization)
- [Developer Guide](#developer-guide)
- [Recent Fixes](#recent-fixes)

## Overview

This portfolio website features a clean, modern design with a responsive layout that works on all devices. It includes an admin dashboard for easy content management without requiring code changes.

Recent updates:
- Centralized configuration for easy maintenance 
- Enhanced build process for better performance
- Cleaner codebase with improved organization
- Better error handling and logging
- Improved Work Experience section with enhanced visual effects
- Added Education section with admin dashboard management
- Fixed rich text editor functionality in the admin dashboard
- **JWT Authentication System**: Implemented secure JWT-based authentication for the admin dashboard

## Architecture

### Components

#### Frontend
- Located in `app/static`
- HTML, CSS, and JavaScript
- Admin Dashboard at `app/static/admin/dashboard.html`

#### Backend
- AWS Lambda function in `lambda-no-mysql`
- API Gateway endpoints for data retrieval and updates

#### Database
- MySQL database on AWS RDS
- Tables for site configuration, work experience, and education

### Key Files
- `lambda-no-mysql/index.js`: Handles API requests
- `app/static/js/main.js`: Frontend JavaScript
- `app/static/admin/dashboard.html`: Admin dashboard

## Deployment

1. Set up AWS RDS MySQL database
   - Create a database named `website`
   - Configure security groups for Lambda access

2. Configure environment variables for Lambda function
   - DB_HOST: Database hostname
   - DB_USER: Database username
   - DB_PASSWORD: Database password
   - DB_NAME: Database name (default: website)
   - DB_PORT: Database port (default: 3306)

3. Deploy Lambda package
   - Create a zip of the `lambda-no-mysql/dist` directory
   - Upload to AWS Lambda
   - Configure API Gateway triggers

4. Update API endpoint
   - Set the API endpoint in frontend files (main.js and dashboard.html)

## Admin Dashboard

The Admin Dashboard provides a user-friendly interface to manage website content without needing to edit code.

### Features

- **Authentication System**: Secure login required to access dashboard
- **Site Configuration**: Manage basic site information
  - Site title
  - Header info
  - Contact information
  - Social media links
- **Work Experience Management**: Add, edit, and delete work experiences
  - Title, company, dates
  - Description with rich text formatting
  - Technology tags
  - Custom ordering
- **Education Management**: Add, edit, and delete education entries
  - Institution, degree, dates
  - Description with rich text formatting
  - Custom ordering
- **Rich Text Formatting**: Format text in description fields
  - Bold, italic, underline formatting
  - Headings (H1, H2)
  - Paragraph tags
  - Bulleted lists
  - Links
  - Line breaks
- **Responsive Design**: Fully functional on mobile devices

### URL Structure
- Admin dashboard: `/admin/dashboard.html`
- Login: `/admin/login.html`

### Dashboard Sections

#### Site Configuration
- Website title and subtitle
- About section description
- Image URLs (logo, banner, favicon, profile)
- Gallery photos and alt text

#### Work Experience Management
- Add, edit, or remove work experience entries
- Fields include:
  - Job title
  - Company name
  - Location
  - Date range
  - Current job flag
  - Description with rich text formatting

#### Education Management
- Add, edit, or remove education entries
- Fields include:
  - Degree name
  - Institution name
  - Location
  - Date range
  - Currently enrolled flag

### Authentication
The admin dashboard uses a JWT (JSON Web Token) authentication system for secure access:
- User credentials are verified against stored values
- Upon successful authentication, a JWT is generated and stored in localStorage
- All subsequent API requests include the JWT token for authorization
- Token expiration is handled with automatic logout
- Protection against common authentication attacks

#### JWT Implementation Details
- **Token Generation**: Server generates a JWT containing user information and expiration time
- **Token Structure**: Contains header, payload (with user ID, username, and exp time), and signature
- **Secure Storage**: JWT stored in localStorage with appropriate security measures
- **Authorization Header**: All API requests include the token in the Authorization header
- **Token Verification**: Server validates token signature and expiration before processing requests
- **Auto-Renewal**: Tokens are automatically renewed during active sessions
- **Secure Logout**: Properly clears tokens and session data
- **Error Handling**: Graceful handling of authentication failures with user-friendly messages

### Content Management
The dashboard provides an intuitive interface for managing website content:
- Work Experience: Add, edit, and delete job experiences
- Education: Manage academic qualifications
- Certifications: Update professional certifications
- Skills: Organize technical and soft skills
- Projects: Showcase portfolio projects
- Settings: Configure site-wide parameters

### Data Persistence
All content is stored in a MySQL database and retrieved via Lambda functions:
- Data is validated both client-side and server-side
- Changes are immediately reflected on the website
- Backup options available to prevent data loss

## Frontend Components

### Page Structure
- Header with navigation
- Hero section
- About section
- Experience section with interactive timeline
- Education section with card layout
- Projects section
- Contact form
- Footer with links and information

### Data Flow
- Content loaded from API on page load
- Fallbacks to local JSON files if API unavailable
- Dynamic rendering of work experience and education sections

### User Interaction
- Interactive experience timeline that responds to mouse movements
- Smooth scrolling navigation
- Mobile-friendly navigation and content

#### Experience Section
```html
<div class="experience-drawers">
  <!-- Dynamically populated with work experience entries -->
</div>
```

#### Education Section
```html
<div class="education-container">
  <!-- Dynamically populated with education entries -->
</div>
```

## CSS Organization

### File Structure
- `app/static/css/style.css`: Main styles
- `app/static/css/mobile.css`: Mobile-specific styles
- `app/static/css/experience-section-combined.css`: Experience section styles
- `app/static/css/admin-dashboard.css`: Admin dashboard styles

### Methodology
- Mobile-first responsive design
- CSS variables for consistent theming
- BEM-inspired naming convention
- Minimized dependencies on external libraries

### Theme Colors
- Primary: #333333
- Accent: #d1b38a
- Background Light: #f9f9f9
- Text Light: #ffffff
- Text Dark: #333333

### Mobile Responsiveness
- Fluid typography (responsive font sizes)
- Flexbox and CSS Grid for layouts
- Media queries for breakpoints
- Touch-friendly interactive elements

## Developer Guide

### Adding New Fields/Sections

#### Database Changes
1. Add new columns to the appropriate table
2. Ensure the Lambda function references these columns

#### Lambda Function Updates
1. Update the relevant `get` function to include new fields
2. Update the corresponding `save` function to handle the new fields
3. Test the API with sample data

#### Admin Dashboard Updates
1. Add form fields for the new data in `dashboard.html`
2. Update the JavaScript functions to handle the new fields
3. Test the form submission and data retrieval

#### Frontend Display Updates
1. Update the HTML structure to accommodate new data
2. Modify the JavaScript to display the new fields
3. Add appropriate styling

### Keeping the Code Organized

- Follow existing naming conventions
- Comment code sections for clarity
- Use consistent indentation and formatting
- Keep functions focused on a single responsibility
- Test changes thoroughly before deployment

### Bug Fixes

#### Rich Text Editor
- Fixed missing `initRichTextToolbars` function which caused JavaScript errors
- Implemented proper toolbar creation for text fields
- Added support for various formatting options (bold, italic, headings, etc.)

## Recent Fixes

### Rich Text Editor Implementation

The admin dashboard now includes a fully functional rich text editor for description fields. This feature allows:

- Formatting text with HTML tags (bold, italic, underline, etc.)
- Adding headings, paragraphs, and lists
- Inserting links and line breaks

The implementation includes:

1. **Rich Text Toolbars**: Automatically appears above text areas marked with `data-rich-text="true"` attribute
2. **Tag Insertion**: Inserts proper HTML tags at cursor position or around selected text
3. **Dynamic Initialization**: Toolbars are created when form sections become visible or on page load

This rich text editor makes content management more intuitive, allowing non-technical users to format content without knowing HTML.

### JWT Authentication System Implementation

Implemented a complete JWT (JSON Web Token) authentication system for the admin dashboard:

1. **Server-side JWT Implementation**:
   - Added JWT token generation and validation to Lambda function
   - Set up proper CORS headers for secure token transmission
   - Created protected endpoints that validate JWT before processing requests
   - Implemented secure hashing for password verification
   - Added refresh token capabilities for extended sessions

2. **Client-side Authentication Flow**:
   - Implemented secure login process with credential validation
   - Added token storage in localStorage with proper expiration handling
   - Set up Authorization headers for all API requests
   - Added automatic token refresh mechanism before expiration
   - Implemented silent re-authentication without disrupting user experience

3. **Security Enhancements**:
   - Added token expiration and automatic renewal mechanisms
   - Implemented secure logout procedures
   - Added protection against common authentication attacks
   - Limited token validity period to minimize risk
   - Implemented payload encryption for sensitive data

4. **User Experience Improvements**:
   - Added clear error messages for authentication failures
   - Implemented session persistence across page refreshes
   - Created smooth transitions between authenticated states
   - Added visual indicators for authentication status
   - Provided graceful degradation when authentication fails

5. **Technical Implementation Details**:
   - Token Structure: Header (algorithm), Payload (user data, expiration), Signature
   - Server Verification: Validates token integrity and expiration before processing requests
   - Authentication API: Dedicated /auth endpoint for token issuance and validation
   - Error Handling: Standardized error responses with appropriate HTTP status codes
   - Cross-Origin Support: Properly configured CORS headers for secure token transmission

This implementation provides a robust security layer for the admin dashboard while maintaining excellent user experience. The JWT approach offers stateless authentication that scales well and minimizes server-side storage requirements.

### Admin Panel Authentication Fixes

Fixed authentication issues in the admin panel that were causing problems when navigating between sections:

1. **Improved Token Handling**:
   - Updated authentication checks to work with non-JWT tokens
   - Added support for direct login tokens from admin-direct page
   - Implemented fallback authentication mechanism for different token formats

2. **Navigation Path Corrections**:
   - Fixed sidebar navigation links to use proper relative paths
   - Updated all admin pages to use consistent path structure
   - Ensured dashboard links point to correct locations

3. **Error Handling Enhancements**:
   - Added robust error handling for authentication failures
   - Prevented authentication errors from blocking UI access
   - Improved user feedback during authentication process

4. **Integration Improvements**:
   - Added proper document ready event listeners across all admin pages
   - Standardized authentication approach across the admin panel
   - Ensured consistent behavior when navigating between sections

These fixes ensure that users remain authenticated while navigating between different sections of the admin panel, resulting in a seamless content management experience.