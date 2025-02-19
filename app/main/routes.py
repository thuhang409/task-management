from datetime import datetime, timezone
from urllib.parse import urlsplit

from flask import render_template, flash, redirect, url_for, request, current_app
from flask_login import login_user, current_user, logout_user, login_required
import sqlalchemy as sa

from app.main import bp

@bp.route("/", methods=['GET', 'POST'])
@login_required
def index():
    posts = current_user.grouptasks()
    return render_template("index.html",  title='Home', posts=posts) 