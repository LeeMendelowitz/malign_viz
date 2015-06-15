import os

UPLOAD_FOLDER = os.environ.get("MALIGN_VIZ_UPLOAD_DIR", "upload_folder")
UPLOAD_FOLDER = os.path.abspath(UPLOAD_FOLDER)
DB_NAME = os.environ.get("MALIGN_VIZ_DB_NAME", 'malign_viz')

if not os.path.exists(UPLOAD_FOLDER):
  os.makedirs(UPLOAD_FOLDER)

class Config(object):
    DEBUG = False
    TESTING = False
    UPLOAD_FOLDER = UPLOAD_FOLDER
    DATABASE_URI = 'sqlite://:memory:'

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True