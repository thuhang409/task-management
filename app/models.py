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
        return db.session.scalars(sa.select(GroupTask).where(GroupTask.user_id == self.id)).all()
    
    def get_categories(self):
        return db.session.scalars(sa.select(Category).where(Category.user_id == self.id)).all()



class GroupTask(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(100), nullable=False)
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("user.id"), nullable=False)

    user: so.Mapped["User"] = so.relationship(back_populates="group_tasks")
    tasks: so.WriteOnlyMapped["Task"] = so.relationship(back_populates="group_task", passive_deletes=True)

    def __repr__(self):
        return f"Group Task {self.name}"
    
    def get_tasks(self):
        return db.session.scalars(sa.select(Task).where(Task.group_id == self.id)).all()
    
    def to_dict(self):
        data = {"id":self.id,
                "name": self.name,
                "user_id": self.user_id
                }
        return data

class Task(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(255), nullable=False)
    description: so.Mapped[Optional[str]] = so.mapped_column(sa.Text, nullable=True)
    created_at: so.Mapped[datetime] = so.mapped_column(default=lambda: datetime.now(timezone.utc))

    group_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("group_task.id"), nullable=False)
    group_task: so.Mapped["GroupTask"] = so.relationship(back_populates="tasks")

    category_id: so.Mapped[Optional[int]] = so.mapped_column(sa.ForeignKey("category.id"), nullable=True)
    category: so.Mapped[Optional["Category"]] = so.relationship("Category", back_populates="tasks")

    def __repr__(self):
        return f"Task {self.name}"
    
    def to_dict(self):
        data = {
            "id": self.id,
            "name": self.name,
            "group_id": self.group_id,
            "category_id": self.category_id  # Thêm category_id vào dict
        }
        return data

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

# class ActivitiesLog(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     action = db.Column(db.String(255), nullable=False)  
#     timestamp = db.Column(db.DateTime, default=datetime.utcnow)

@login.user_loader
def load_user(id):
    return db.session.get(User, int(id))
