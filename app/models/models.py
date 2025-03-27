"""
Helper functions to provide dummy data for the portfolio site.
These functions are used as placeholder data when a database is not available.
"""

def get_projects():
    """Return dummy projects data"""
    return [
        {
            'id': 1,
            'title': 'E-Commerce Platform',
            'description': 'Developed a fully responsive e-commerce platform with payment processing integration.',
            'image_url': '/static/img/project1.jpg',
            'link': '#'
        },
        {
            'id': 2,
            'title': 'Travel Application',
            'description': 'Mobile app for travelers to discover local experiences and book tours.',
            'image_url': '/static/img/project2.jpg',
            'link': '#'
        },
        {
            'id': 3,
            'title': 'Healthcare Dashboard',
            'description': 'Analytics dashboard for healthcare providers to track patient outcomes.',
            'image_url': '/static/img/project3.jpg',
            'link': '#'
        }
    ]

def get_experience():
    """Return dummy experience data"""
    return [
        {
            'id': 1,
            'title': 'Senior Product Manager',
            'company': 'Tech Solutions Inc.',
            'period': 'Jan 2020 - Present',
            'description': 'Leading product development for enterprise SaaS solutions. Managing a team of 5 developers and 2 designers.'
        },
        {
            'id': 2,
            'title': 'Product Manager',
            'company': 'Digital Innovations Co.',
            'period': 'Mar 2017 - Dec 2019',
            'description': 'Managed the development of mobile applications for financial services clients.'
        },
        {
            'id': 3,
            'title': 'Associate Product Manager',
            'company': 'StartupHub',
            'period': 'Jun 2015 - Feb 2017',
            'description': 'Assisted in the development and launch of three successful web applications.'
        }
    ]

def get_education():
    """Return dummy education data"""
    return [
        {
            'id': 1,
            'degree': 'Master of Business Administration',
            'institution': 'Business University',
            'period': '2014 - 2015',
            'description': 'Specialized in Technology Management with focus on Product Development.'
        },
        {
            'id': 2,
            'degree': 'Bachelor of Science in Computer Science',
            'institution': 'Tech Institute',
            'period': '2010 - 2014',
            'description': 'Graduated with honors. Focused on software engineering and UI/UX design.'
        }
    ]

def get_certifications():
    """Return dummy certification data"""
    return [
        {
            'id': 1,
            'title': 'Certified Product Manager',
            'issuer': 'Product Management Institute',
            'issue_date': 'Jun 2019',
            'expiry_date': 'Jun 2022',
            'certificate_url': '#'
        },
        {
            'id': 2,
            'title': 'Certified Scrum Master',
            'issuer': 'Scrum Alliance',
            'issue_date': 'Mar 2018',
            'expiry_date': 'Mar 2020',
            'certificate_url': '#'
        },
        {
            'id': 3,
            'title': 'Advanced UX Design',
            'issuer': 'Design Academy',
            'issue_date': 'Nov 2017',
            'expiry_date': None,
            'certificate_url': '#'
        }
    ] 