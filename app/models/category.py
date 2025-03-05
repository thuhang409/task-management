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
from app import db
from app import login

class Category(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(100), nullable=False)
    
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("user.id"), nullable=False)
    user: so.Mapped["User"] = so.relationship("User", back_populates="categories")

    tasks: so.WriteOnlyMapped["Task"] = so.relationship("Task", back_populates="category")

    __table_args__ = (
        sa.UniqueConstraint("user_id", "name", name="uq_user_category_name"),
    )

    def __repr__(self):
        return f"Category {self.name} (User {self.user_id})"