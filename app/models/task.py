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