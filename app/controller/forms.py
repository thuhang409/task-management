from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField, TextAreaField
from wtforms.validators import DataRequired, ValidationError, Email, EqualTo, Length
import sqlalchemy as sa
import sqlalchemy.orm as so

from app import db
from app.models import User

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField("Remember Me")
    submit = SubmitField("Sign in")

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    password2 = PasswordField('Password Confirm', validators=[DataRequired(), EqualTo("password")])
    submit = SubmitField("Register")

    def validate_username(self, username):
        user = db.session.scalar(sa.select(User).where(User.username==username.data))
        if user is not None:
            raise ValidationError("Please use a different username.")
        
    def validate_email(self, email):
        user = db.session.scalar(sa.select(User).where(User.email == email.data))
        if user is not None:
            raise ValidationError("Please use a different email.")
