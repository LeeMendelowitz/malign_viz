"""
Code for connecting to the database.
"""
import pymongo
from pymongo import MongoClient
import mongoengine

DB_NAME = "MM52"

c = MongoClient()
db = c[DB_NAME]

def get_db():
  return db

def connect():
  mongoengine.connect(DB_NAME)