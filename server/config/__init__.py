import os

UPLOAD_FOLDER = os.path.abspath('upload_files')
if not os.path.exists(UPLOAD_FOLDER):
  os.makedirs(UPLOAD_FOLDER)

DB_NAME = 'malign_viz'

class Config(object):
    DEBUG = False
    TESTING = False
    UPLOAD_FOLDER = UPLOAD_FOLDER
    DATABASE_URI = 'sqlite://:memory:'

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True