# Portfolio Website Documentation

This documentation explains the structure, application flow, and styling organization for the portfolio website.

## Application Architecture

The website consists of three main components:
1. **Frontend Homepage** - Public-facing portfolio site
2. **Admin Dashboard** - Content management interface
3. **CSS Organization** - Styling structure

## 1. Frontend Homepage Flow

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

## 2. Admin Dashboard Flow

### Authentication
1. Admin accesses `/admin` or `/admin-direct` endpoint
2. Authentication check via token stored in localStorage
3. If authenticated, dashboard loads
4. If not authenticated, redirected to login page

### Content Management
1. Dashboard loads current site configuration from API
2. Form fields populate with existing content
3. Admin can update:
   - Site title, subtitle, and description
   - Images (favicon, logo, banner, profile, gallery)
   - Work experience (add, edit, delete entries)
   - Education and certifications

### Save Process
1. Admin submits form with updated content
2. Client-side validation checks required fields
3. API call sends data to AWS Lambda endpoint
4. Success/error message displays
5. Frontend automatically refreshes with new content

## 3. CSS Organization

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

## Maintenance Guidelines

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

## Recent Updates
1. Consolidated experience section styles into a single file
2. Improved mobile responsiveness for the experience section
3. Enhanced skill tag visibility across all color themes
4. Fixed icon alignment issues in experience drawers 