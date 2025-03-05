
from .grouptask import GroupTask
from .user import User 
from .task import Task
from .category import Category
from app import db, login

__all__ = ["GroupTask", "User", "Task", "Category"]

@login.user_loader
def load_user(id):
    return db.session.get(User, int(id))
