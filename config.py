import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = "!\xe9W\xb3\xb1\xf6\xde\xb9^\x8eAE\xdf\xf8\xfb\x0f\xc6H-\xbe\xd6'\x83K"
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'app.db') 