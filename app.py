import os
from flask import Flask, render_template, request, redirect, url_for, flash
from dotenv import load_dotenv
from app.models.models import (
    fetch_projects, fetch_experience, fetch_education, 
    fetch_certifications, submit_enquiry
)

# Load environment variables
load_dotenv()

app = Flask(__name__, template_folder='app/templates', static_folder='app/static')
app.secret_key = os.urandom(24)

# Routes
@app.route('/')
def home():
    experience = fetch_experience()
    education = fetch_education()
    certifications = fetch_certifications()
    return render_template('index.html', 
                          experience=experience, 
                          education=education,
                          certifications=certifications)

@app.route('/projects')
def projects():
    all_projects = fetch_projects()
    return render_template('projects.html', projects=all_projects)

@app.route('/solutions')
def solutions():
    return render_template('solutions.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        
        # Store message in database
        result = submit_enquiry(name, email, message)
        if result:
            flash('Your message has been sent successfully!', 'success')
        else:
            flash('An error occurred while sending your message. Please try again.', 'error')
        return redirect(url_for('contact'))
            
    return render_template('contact.html')

if __name__ == '__main__':
    app.run(debug=True) 