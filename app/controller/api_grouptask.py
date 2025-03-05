from flask import request, url_for, abort, jsonify
import sqlalchemy as sa
import openai
import os

from app.controller import bp_api
from app import db
from app.models import Task, GroupTask, Category
from flask_login import login_user, current_user, logout_user, login_required
from flask import request, jsonify


@bp_api.route("/group-tasks", methods=['GET'])
def get_all_group_tasks():
    try:
        # Assuming `Category` has a `user_id` column to filter categories per user
        grouptasks = GroupTask.query.filter_by(user_id=current_user.id).all()
        grouptasks_lst = [{"id": gtask.id, "name": gtask.name} for gtask in grouptasks]

        return jsonify(grouptasks_lst), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@bp_api.route("/group_task/<int:group_id>", methods=['GET'])
def get_group_task(group_id):
    try:
        group_task = GroupTask.query.get(group_id)
        if not group_task:
            return jsonify({"error": "Group task not found"}), 404
            
        return jsonify({
            "id": group_task.id,
            "name": group_task.name,
            "user_id": group_task.user_id
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp_api.route("/group-task", methods=['POST'])
def create_group_task():
    data = request.get_json()

    # Extract task data from the request
    new_grouptask = GroupTask(
        name=data.get('name'),
        user_id=current_user.id
    )

    # Add task to the database
    db.session.add(new_grouptask)
    db.session.commit()

    return new_grouptask.to_dict(), 201

@bp_api.route("/group_task/<int:group_id>", methods=["PUT"])
def edit_group_task(group_id):
    data = request.json
    new_name = data.get("name")

    group = GroupTask.query.get(group_id)
    if not group:
        return jsonify({"success": False, "error": "Group not found"}), 404

    group.name = new_name
    db.session.commit()
    return group.to_dict(), 201

@bp_api.route('/group_task/<int:gtask_id>', methods=['DELETE'])
def delete_group_task(gtask_id):
    gtask = GroupTask.query.get(gtask_id)
    if not gtask:
        return jsonify({"error": "Group task not found"}), 404
    
    # Delete all task
    # Task.query.filter_by(group_id=gtask_id).delete()

    db.session.delete(gtask)
    db.session.commit()

    return jsonify({"message": "GroupTask and related tasks deleted successfully"}), 200
