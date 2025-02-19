from flask import request, url_for, abort, jsonify
import sqlalchemy as sa

from app.api import bp
from app import db
from app.models import Task, GroupTask
from flask_login import login_user, current_user, logout_user, login_required


@bp.route("/group-task", methods=['POST'])
def create_group_task():
    data = request.get_json()

    # Extract task data from the request
    new_task = GroupTask(
        name=data.get('name'),
        user_id=data.get('user_id')
    )

    # Add task to the database
    db.session.add(new_task)
    db.session.commit()

    return jsonify({'message': 'Task added successfully'}), 200
