from flask import request, url_for, abort, jsonify
import sqlalchemy as sa
import openai
import os

from app.controller import bp_api
from app import db
from app.models import Task, GroupTask, Category
from flask_login import login_user, current_user, logout_user, login_required
from flask import request, jsonify

openai.api_key = os.environ.get("OPENAI_KEY")


@bp_api.route('/classify-task', methods=['POST'])
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
