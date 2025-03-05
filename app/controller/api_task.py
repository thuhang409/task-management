from flask import request, url_for, abort, jsonify
import sqlalchemy as sa
import openai
import os

from app.controller import bp_api
from app import db
from app.models import Task, GroupTask, Category
from flask_login import login_user, current_user, logout_user, login_required
from flask import request, jsonify

@bp_api.route("/task/<int:task_id>", methods=['GET'])
def get_task(task_id):
    try:
        task = Task.query.get(task_id)
        data = {"id": task.id, "name": task.name, "description":task.description, "group_id":task.group_id, "category_id":task.category_id}
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp_api.route("/task", methods=['POST'])
def create_task():
    data = request.get_json()

    # Extract task data from the request
    new_task = Task(
        name=data.get('name'),
        group_id=data.get('group_id'),
        category_id=data.get('category_id'),
        description=data.get('description'),
    )

    # Add task to the database
    db.session.add(new_task)
    db.session.commit()

    return new_task.to_dict(), 201


@bp_api.route("/task/<int:task_id>", methods=["PUT"])
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

    if "category_id" in data:
        task.category_id = data["category_id"]

    if "description" in data:
        task.description = data["description"]

    db.session.commit()
    return task.to_dict(), 201


@bp_api.route('/task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully"}), 200


