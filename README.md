# Personal Portfolio Website

A professional portfolio website built with Flask, featuring a responsive design, database integration, and modern animations.

## Features

- Responsive design optimized for all devices
- Sections for bio, experience, education, and certifications
- Project showcase with filtering by category
- Contact form with database storage
- MySQL RDS database integration
- Modern animations and transitions
- Deployable to Netlify

## Tech Stack

- **Backend**: Python, Flask
- **Frontend**: HTML, CSS, JavaScript
- **Database**: MySQL (AWS RDS)
- **Deployment**: Netlify, GitHub
- **Other**: Animate.css, Font Awesome

## Getting Started

### Prerequisites

- Python 3.8+
- MySQL Database (AWS RDS)
- pip (Python package manager)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/majorjayant/portfolio-website-desktop.git
   cd portfolio-website-desktop
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows:
     ```
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=your-database-host
   DB_PORT=3306
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   DB_NAME=your-database-name
   ```

6. Run the application:
   ```
   python app.py
   ```

7. Visit `http://localhost:5000` in your browser.

## Database Setup

1. Create the necessary tables in your MySQL database:

```sql
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  document_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE experience (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE education (
  id INT AUTO_INCREMENT PRIMARY KEY,
  degree VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE certifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  issued_date DATE NOT NULL,
  expiry_date DATE,
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Deployment

### Netlify Deployment

1. Update the `netlify.toml` file with your build settings.
2. Push your changes to GitHub.
3. Connect your GitHub repository to Netlify.
4. Configure the build settings:
   - Build command: `pip install -r requirements.txt`
   - Publish directory: `dist`
5. Set up environment variables in Netlify's dashboard.

## Customization

1. Replace the placeholder content in the templates with your own information.
2. Add your own images to `app/static/img/`.
3. Customize colors and styling in `app/static/css/style.css`.
4. Update database queries to match your specific needs.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design inspired by [Sean Halpin](https://www.seanhalpin.xyz/about) and [Adham Dannaway](https://www.adhamdannaway.com/)
- Icons by Font Awesome
- Animations by Animate.css 