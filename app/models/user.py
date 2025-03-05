import secrets
from hashlib import md5
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
from typing import Optional
from datetime import timedelta

from flask import url_for
from flask_login import UserMixin
import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db, login


    
class User(UserMixin, db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64), index=True, unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120), index=True, unique=True)
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(sa.String(256))
    about_me: so.Mapped[Optional[str]] = so.mapped_column(sa.String(140))
    last_seen: so.Mapped[Optional[datetime]] = so.mapped_column(default=lambda: datetime.now(timezone.utc))

    categories: so.WriteOnlyMapped["Category"] = so.relationship(back_populates="user")
    group_tasks: so.WriteOnlyMapped["GroupTask"] = so.relationship(back_populates="user")

    def __repr__(self):
        return '<User {}>'.format(self.username)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def get_grouptasks(self):
        from app.models.grouptask import GroupTask
        return db.session.scalars(sa.select(GroupTask).where(GroupTask.user_id == self.id)).all()
    
    def get_categories(self):
        from app.models.category import Category
        return db.session.scalars(sa.select(Category).where(Category.user_id == self.id)).all()
