#!/usr/bin/env python
"""
Run the server
"""
import os
import sys

from server.common import logging_utils
import logging

root_logger = logging_utils.create_root_logger()
root_logger.setLevel(logging.DEBUG)

# sys.path includes 'server/lib' due to appengine_config.py
import flask
from flask import Flask, Blueprint, redirect
from server.api import api_blueprint
from server.config import DevelopmentConfig, Config
import server.db


server.db.connect()

app = Flask(__name__)
app.register_blueprint(api_blueprint, url_prefix='/api')
app.config.from_object(DevelopmentConfig)

@app.route('/')
def root():
  logging.info("Request for path: %s"%"/")
  return app.send_static_file('index.html')

if __name__ == '__main__':
    app.debug = True
    app.run(host='127.0.0.1', port=8001)
