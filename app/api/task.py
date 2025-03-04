from flask import request, url_for, abort, jsonify
import sqlalchemy as sa
import openai
import os

from app.api import bp
from app import db
from app.models import Task, GroupTask, Category
from flask_login import login_user, current_user, logout_user, login_required
from flask import request, jsonify

openai.api_key = os.environ.get("OPENAI_KEY")


@bp.route("/group-tasks", methods=['GET'])
def get_all_group_tasks():
    try:
        # Assuming `Category` has a `user_id` column to filter categories per user
        grouptasks = GroupTask.query.filter_by(user_id=current_user.id).all()
        grouptasks_lst = [{"id": gtask.id, "name": gtask.name} for gtask in grouptasks]

        return jsonify(grouptasks_lst), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@bp.route("/group_task/<int:group_id>", methods=['GET'])
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


@bp.route("/group-task", methods=['POST'])
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

@bp.route('/group_task/<int:gtask_id>', methods=['DELETE'])
def delete_group_task(gtask_id):
    gtask = GroupTask.query.get(gtask_id)
    if not gtask:
        return jsonify({"error": "Group task not found"}), 404
    
    # Delete all task
    # Task.query.filter_by(group_id=gtask_id).delete()

    db.session.delete(gtask)
    db.session.commit()

    return jsonify({"message": "GroupTask and related tasks deleted successfully"}), 200


@bp.route("/task/<int:task_id>", methods=['GET'])
def get_task(task_id):
    try:
        task = Task.query.get(task_id)
        data = {"id": task.id, "name": task.name, "description":task.description, "group_id":task.group_id, "category_id":task.category_id}
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route("/task", methods=['POST'])
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

    if "category_id" in data:
        task.category_id = data["category_id"]

    if "description" in data:
        task.description = data["description"]

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


@bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        # Assuming `Category` has a `user_id` column to filter categories per user
        categories = Category.query.filter_by(user_id=current_user.id).all()
        categories_list = [{"id": cat.id, "name": cat.name} for cat in categories]

        return jsonify(categories_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@bp.route('/category', methods=['GET'])
def get_category():
    category_id = request.args.get('id', type=int)
    category_name = request.args.get('name', type=str)

    if not category_id and not category_name:
        return jsonify({'error': 'Cần cung cấp id hoặc name'}), 400

    # Tìm theo ID
    if category_id:
        category = db.session.get(Category, category_id)
        if not category:
            return jsonify({'error': 'Category không tồn tại'}), 404

    # Tìm theo Name (chỉ lấy của user hiện tại)
    elif category_name:
        category = db.session.scalar(
            sa.select(Category).where(
                Category.name == category_name,
                Category.user_id == current_user.id  # Chỉ lấy category của user hiện tại
            )
        )
        if not category:
            return jsonify({'error': 'Category không tồn tại hoặc không thuộc về bạn'}), 404

    return jsonify({
        'id': category.id,
        'name': category.name,
        'user_id': category.user_id
    }), 200


@bp.route('/category', methods=['POST'])
def create_category():
    data = request.get_json()
    category_name = data.get('name')

    if not category_name:
        return jsonify({'error': 'Thiếu category name'}), 400

    # Check if there's any category
    category = db.session.scalar(
        sa.select(Category).where(
            Category.name == category_name,
            Category.user_id == current_user.id
        )
    )

    if category:
        return jsonify({
            'id': category.id,
            'name': category.name,
            'user_id': category.user_id
        }), 200

    # If not existed, create new one
    new_category = Category(name=category_name, user_id=current_user.id)
    db.session.add(new_category)
    db.session.commit()

    return jsonify({
        'id': new_category.id,
        'name': new_category.name,
        'user_id': new_category.user_id
    }), 201

@bp.route('/classify-task', methods=['POST'])
def classify_task():
    data = request.get_json()
    user_input = data.get('task')
    prompt = f"""
    Extract the task and classify its category as one of the following:
                            
    - Personal: Related to self-care, hobbies, or personal errands.  
    - Work: Related to job, study, or professional responsibilities.  
    - Social: Related to communication, events, or social interactions.  
    - Other: Does not fit the above categories.  
    
    Return a JSON object with:  
    - task: The core action of the task.  
    - category: The appropriate category.  
    - description: The full original input.  
                            
    If no clear task is detected, return the full sentence as the task name.
                            
    ### Examples ###
    "Buy groceries for the weekend" → {{"task": "Buy groceries", "category": "Personal", "description": "Buy groceries for the weekend"}}
    "Prepare the monthly sales report" → {{"task": "Prepare sales report", "category": "Work", "description": "Prepare the monthly sales report"}}
    "Call John to confirm dinner plans" → {{"task": "Call John", "category": "Social", "description": "Call John to confirm dinner plans"}}
    "Watch a documentary about space" -> {{"task": "Watch documentary", "category": "Other", "description": "Watch a documentary about space"}}

    Now classify: "{user_input}"
    Return JSON only.
    """
    if not user_input:
        return jsonify({'error': 'Text field is required'}), 400
    
    # Call OpenAI API
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are a chatbot that converts natural language input into a structured to-do list."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    # Extract the response
    ai_response = response.choices[0].message.content

    return jsonify(ai_response), 200

