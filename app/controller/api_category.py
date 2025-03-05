from flask import request, url_for, abort, jsonify
import sqlalchemy as sa
import openai
import os

from app.controller import bp_api
from app import db
from app.models import Task, GroupTask, Category
from flask_login import login_user, current_user, logout_user, login_required
from flask import request, jsonify



@bp_api.route('/categories', methods=['GET'])
def get_categories():
    try:
        # Assuming `Category` has a `user_id` column to filter categories per user
        categories = Category.query.filter_by(user_id=current_user.id).all()
        categories_list = [{"id": cat.id, "name": cat.name} for cat in categories]

        return jsonify(categories_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@bp_api.route('/category', methods=['GET'])
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


@bp_api.route('/category', methods=['POST'])
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

