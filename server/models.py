"""
Code for models
"""
from mongoengine import *
import json

class Chunk(EmbeddedDocument):
  start = IntField()
  end = IntField()
  size = IntField()

  def __str__(self):
    return self.to_json()

  def to_tuple(self):
    return (self.start, self.end, self.size)

class Score(EmbeddedDocument):
  query_miss_score = FloatField()
  ref_miss_score = FloatField()
  sizing_score = FloatField()

  def __str__(self):
    return self.to_json()

  def to_tuple(self):
    return (self.query_miss_score,
            self.ref_miss_score,
            self.sizing_score)

class MatchedChunk(EmbeddedDocument):
  query_chunk = EmbeddedDocumentField(Chunk)
  ref_chunk = EmbeddedDocumentField(Chunk)
  score = EmbeddedDocumentField(Score)

  def __str__(self):
    return self.to_json()

  def to_tuple(self):
    return (self.query_chunk.to_tuple(),
      self.ref_chunk.to_tuple(),
      self.score.to_tuple())

class Alignment(Document):  
  query_num_frags = IntField()
  ref_misses = IntField()
  interior_size_ratio = FloatField()
  total_miss_rate = FloatField()
  ref_miss_rate = FloatField()
  query_misses = IntField()
  num_matched_sites = IntField()
  query_miss_rate = FloatField()
  ref_interior_size = IntField()
  ref_id = StringField()
  score = EmbeddedDocumentField(Score)
  query_id = StringField()
  query_num_sites = IntField()
  max_chunk_sizing_score = FloatField()
  total_score = FloatField()
  ref_is_forward = BooleanField()
  query_interior_size = IntField()
  matched_chunks = ListField(field = EmbeddedDocumentField(MatchedChunk))

  meta = {'collection': 'alignments'}

  def __str__(self):
    return self.to_json()

  def web_json(self):
    """
    Return json representation for web server.
    """
    fields = ['ref_id', 'query_id', 'total_score', 'ref_is_forward']
    d = dict((f,getattr(self, f)) for f in fields)
    d['matched_chunks'] = [mc.to_json() for mc in self.matched_chunks]
    #d['matched_chunks'] = [mc.to_tuple() for mc in self.matched_chunks]
    return json.dumps(d)

