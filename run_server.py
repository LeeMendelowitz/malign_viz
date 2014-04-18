#!/usr/bin/env python
"""
Run the server
"""
import os
import sys

# sys.path includes 'server/lib' due to appengine_config.py
import flask
from flask import Flask, Blueprint
from server.api import api_blueprint
from server.config import DevelopmentConfig
import server.db

server.db.connect()

app = Flask(__name__)
app.register_blueprint(api_blueprint, url_prefix='/api')
app.config.from_object(DevelopmentConfig)

@app.route('/')
def root():
  return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run()