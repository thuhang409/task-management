import secrets
from hashlib import md5
from datetime import datetime, timezone
from typing import Optional
from datetime import timedelta

from flask import url_for
from flask_login import UserMixin
import sqlalchemy as sa
import sqlalchemy.orm as so
from app import login, db



class GroupTask(db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str] = so.mapped_column(sa.String(100), nullable=False)
    user_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey("user.id"), nullable=False)

    user: so.Mapped["User"] = so.relationship(back_populates="group_tasks")
    tasks: so.WriteOnlyMapped["Task"] = so.relationship(back_populates="group_task", passive_deletes=True)

    def __repr__(self):
        return f"Group Task {self.name}"
    
    def get_tasks(self):
        from app.models.task import Task
        return db.session.scalars(sa.select(Task).where(Task.group_id == self.id)).all()
    
    def to_dict(self):
        data = {"id":self.id,
                "name": self.name,
                "user_id": self.user_id
                }
        return data