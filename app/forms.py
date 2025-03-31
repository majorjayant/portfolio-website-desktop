from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField
from wtforms.validators import DataRequired, URL, Optional

class LoginForm(FlaskForm):
    """Form for admin login"""
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])

class SiteConfigForm(FlaskForm):
    """Form for updating site configuration"""
    # Image URLs
    image_favicon_url = StringField('Favicon URL', validators=[Optional(), URL()])
    image_logo_url = StringField('Logo URL', validators=[Optional(), URL()])
    image_banner_url = StringField('Banner URL', validators=[Optional(), URL()])
    image_about_profile_url = StringField('Profile Image URL', validators=[Optional(), URL()])
    image_about_photo1_url = StringField('About Photo 1 URL', validators=[Optional(), URL()])
    image_about_photo2_url = StringField('About Photo 2 URL', validators=[Optional(), URL()])
    image_about_photo3_url = StringField('About Photo 3 URL', validators=[Optional(), URL()])
    image_about_photo4_url = StringField('About Photo 4 URL', validators=[Optional(), URL()])

    # About section
    about_title = StringField('About Title', validators=[DataRequired()])
    about_subtitle = StringField('About Subtitle', validators=[DataRequired()])
    about_description = TextAreaField('About Description', validators=[DataRequired()])

    # Image alt text
    about_photo1_alt = StringField('Photo 1 Alt Text', validators=[Optional()])
    about_photo2_alt = StringField('Photo 2 Alt Text', validators=[Optional()])
    about_photo3_alt = StringField('Photo 3 Alt Text', validators=[Optional()])
    about_photo4_alt = StringField('Photo 4 Alt Text', validators=[Optional()]) 