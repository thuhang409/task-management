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
    new_grouptask = GroupTask(
        name=data.get('name'),
        user_id=data.get('user_id')
    )

    # Add task to the database
    db.session.add(new_grouptask)
    db.session.commit()

    return new_grouptask.to_dict(), 201

@bp.route("/group_task/<int:group_id>", methods=["PUT"])
def edit_group_task(group_id):
    data = request.json
    new_name = data.get("name")

    group = GroupTask.query.get(group_id)
    if not group:
        return jsonify({"success": False, "error": "Group not found"}), 404

    group.name = new_name
    db.session.commit()
    return group.to_dict(), 201

@bp.route("/task", methods=['POST'])
def create_task():
    data = request.get_json()

    # Extract task data from the request
    new_task = Task(
        name=data.get('name'),
        group_id=data.get('group_id'),
        category=data.get('category')
    )

    # Add task to the database
    db.session.add(new_task)
    db.session.commit()

    return new_task.to_dict(), 201

from flask import request, jsonify

@bp.route("/task/<int:task_id>", methods=["PUT"])
def edit_task(task_id):
    data = request.json
    task = Task.query.get(task_id)

    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    # Update task name if provided
    if "name" in data:
        task.name = data["name"]

    # Update group_id if provided
    if "group_id" in data:
        task.group_id = data["group_id"]

    db.session.commit()
    return task.to_dict(), 201


@bp.route('/task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully"}), 200