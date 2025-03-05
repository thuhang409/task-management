from flask import Blueprint

bp_api = Blueprint('api', __name__)
bp_auth = Blueprint('auth', __name__)
bp_main = Blueprint('main', __name__)

from app.controller import api_category, api_grouptask, api_classifytask, api_task, auth, main
