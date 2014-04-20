"""
Code for connecting to the database.
"""
import pymongo
from pymongo import MongoClient
from pymongo.errors import AutoReconnect

import mongoengine
from mongoengine import OperationError, NotUniqueError
import sys
stderr = sys.stderr.write
stdout = sys.stdout.write

import logging

from datetime import datetime

import models

DB_NAME = "MM52"

c = MongoClient()
db = c[DB_NAME]

def get_db():
  return db

def connect():
  mongoengine.connect(DB_NAME)

def load_query_map_file(path, batch = 10000, clear = False):
  """
  Save query maps into database.
  """

  if clear:
    models.QueryMap.drop_collection()

  fin = open(path)
  docs = []

  def iter_lines(fin):
    for l in fin:
      l = l.strip()
      if not l:
        continue
      yield l

  start = datetime.now()
  last = start

  for i,l in enumerate(iter_lines(fin)):
    q = models.QueryMap.from_line(l)
    #stderr("Read map %s\n"%q.name)
    docs.append(q)
    if len(docs) == batch:
      now = datetime.now()
      elapsed = (datetime.now() - start).total_seconds()
      stderr("BULK INSERT! i=%i %6.2f\n"%(i, elapsed))
      try:
        for d in docs:
          d.save()
        #models.QueryMap.objects.insert(docs)
        docs = []
      except AutoReconnect as e:
        stderr("Received Exception: %s\n"%str(e))

  fin.close()

  try:
    for d in docs:
      d.save()
    #models.QueryMap.objects.insert(docs)
    docs = []
  except AutoReconnect as e:
    stderr("Received Exception: %s\n"%str(e))

  elapsed = (datetime.now() - start).total_seconds()
  stderr("Inserted %i maps in %6.2f\n"%(i, elapsed))

def load_query_map_file_bulk(path, batch = 20000):
  """
  Save query maps into database.
  """
  load_map_file_bulk(path, document_model = models.QueryMap, batch=batch)

def load_reference_map_file_bulk(path, batch = 20000):
  """
  Save reference maps into database.
  """
  import pdb; pdb.set_trace()
  load_map_file_bulk(path, document_model = models.ReferenceMap, batch=batch)
  
def load_map_file_bulk(map_file_path, document_model, batch = 20000):
  """
  Save maps loaded from the map_file_path in bulk to the database,
  as documents given by the document_model.

  document_model should be QueryMap or ReferenceMap.

  Try to handle errors.
  """

  # Clear the collection
  document_model.drop_collection()

  fin = open(map_file_path)
  docs = []

  def iter_lines(fin):
    for l in fin:
      l = l.strip()
      if not l:
        continue
      yield l

  def cleanup_docs(docs):
      # Delete the docs that may already exist before re-inserting.
      ids = [doc.pk for doc in docs]
      document_model.objects(pk__in = ids).delete()

  def write_docs(docs):
    """
    Write the documents, and handle failures.
    """
    if not docs:
      return

    while True:
      try:
        if docs:
          document_model.objects.insert(docs)
          docs = []
        break
      except AutoReconnect as e:
        stderr("Received Exception: %s\n"%str(e))
        cleanup_docs(docs)
      except OperationError as e:
        stderr("Recevied Exception: %s\n"%str(e))
        cleanup_docs(docs)
      except NotUniqueError as e:
        stderr("Recevied Exception: %s\n"%str(e))
        cleanup_docs(docs)

  start = datetime.now()
  last = start

  for i,l in enumerate(iter_lines(fin)):
    q = document_model.from_line(l)
    #stderr("Read map %s\n"%q.name)
    docs.append(q)

    if len(docs) == batch:
      now = datetime.now()
      
      stderr("BULK INSERT! i=%i "%(i))
      write_docs(docs)
      elapsed = (datetime.now() - start).total_seconds()
      stderr(" %6.2f\n"%(elapsed))
      docs = []

  fin.close()

  write_docs(docs)

  elapsed = (datetime.now() - start).total_seconds()
  logging.info("Inserted %i maps in %6.2f\n"%(i, elapsed))