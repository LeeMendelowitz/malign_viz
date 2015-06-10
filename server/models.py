"""
Code for models
"""
from mongoengine import *
from mongoengine.context_managers import switch_collection
import json
from types import NoneType
import datetime



class DictConversionError(Exception):
  pass

def get_dict_data(elem):
  """
  Convert the element to a dictionary representation.

  If it is a basic type (int, long ,str, bool, None), return as is.
  If it is a list, tuple, or dict, convert each item or key/value.
  Otherwise, use the to_dict method.
  If none of this works, raise DictConversionError.
  """
  if isinstance(elem, (int, float, long, str, bool, unicode, NoneType)):
    return elem
  elif isinstance(elem, (list, tuple)):
    return [i for i in iter_items(elem)]
  elif isinstance(elem, dict):
    return {k:v for k,v in iter_dict_times(elem.iteritems())}
  elif hasattr(elem, 'to_dict'):
    return elem.to_dict()
  else:
    # Don't know how to represent this type.
    raise DictConversionError

def iter_items(items):
  """
  Iterate over each item in items and yield
  it's converted value.
  """
  for item in items:
      try:
        yield get_dict_data(item)
      except DictConversionError:
        pass

def iter_dict_times(dict_items):
  """
  Iterate over (key,value) pairs and yield converted items.
  """
  for k,v in dict_items:
    try:
      yield (get_dict_data(k), get_dict_data(v))
    except DictConversionError:
      pass

class DictMixin(object):
  """
  Add a to_dict method to a class.
  """
  def to_dict(self):
    """
    Utility method to convert self into a dictionary representation of
    basic JSON compatible types.
    """
    r = get_dict_data(self.__dict__['_data'])
    return r

#############################################

class Chunk(DictMixin, EmbeddedDocument):
  start = IntField()
  end = IntField()
  size = IntField()

  """
  def __str__(self):
    return self.to_json()
  """

  def to_tuple(self):
    return (self.start, self.end, self.size)


class Score(DictMixin, EmbeddedDocument):
  query_miss_score = FloatField()
  ref_miss_score = FloatField()
  sizing_score = FloatField()

  """
  def __str__(self):
    return self.to_json()
  """

  def to_tuple(self):
    return (self.query_miss_score,
            self.ref_miss_score,
            self.sizing_score)

class MatchedChunk(DictMixin, EmbeddedDocument):
  query_chunk = EmbeddedDocumentField(Chunk)
  ref_chunk = EmbeddedDocumentField(Chunk)
  score = EmbeddedDocumentField(Score)

  """
  def __str__(self):
    return self.to_json()
  """

  def to_tuple(self):
    return (self.query_chunk.to_tuple(),
      self.ref_chunk.to_tuple(),
      self.score.to_tuple())





class Alignment(DictMixin, Document):  
  doc_type = StringField(default = 'alignment', required = True)
  experiment = StringField()
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

  total_score_rescaled = FloatField()
  rescaled_matched_chunks = ListField(field = EmbeddedDocumentField(MatchedChunk))
  rescaled_score = EmbeddedDocumentField(Score)

  meta = {'collection': 'alignments',
          'indexes' : [ ('query_id'),
                        ('query_id', 'total_score_rescaled'),
                        ('query_id', 'rescaled_score.sizing_score')
                      ]}

  def __str__(self):
    return self.to_json()


class Map(DictMixin, Document):
  """
  Representation of a Map (Rmap, Nmap, or Reference)
  for a single restriction enzyme.
  """
  doc_type = StringField(default = 'map', required = True)
  experiment = StringField()
  name = StringField(primary_key = True)
  fragments = ListField(field = IntField()) # fragments
  num_fragments = IntField() # Number of fragments
  length = IntField() # Length in bp
  type = StringField(required = True, choices=("query", "reference"))

  @classmethod
  def from_line(cls , line, map_type, experiment = None):
    """
    Parse a line in a SOMA Map file to create a new object.
    """

    fields = line.strip().split()
    name = fields[0]
    length = int(fields[1])
    num_fragments = int(fields[2])
    fragments = [int(frag) for frag in fields[3:]]

    ret = cls(name = name, length = length, num_fragments = num_fragments,
              type = map_type,
              fragments = fragments)

    if experiment is not None:
      ret.experiment = experiment

    return ret

  def to_dict(self):
    d = get_dict_data(self.__dict__['_data'])
    d['name'] = self.name
    return d

  meta = {'collection' : 'maps',
          'indexes' : ['name',
                        ('type', 'name')
                      ]}

QueryMap = Map
ReferenceMap = Map

class Experiment(DictMixin, Document):

  name = StringField(required = True)
  description = StringField()
  created = DateTimeField(default = datetime.datetime.now)

  meta = {'collection': 'experiments'}

  def get_alignments(self):
    collection_name = '%s.alignments'%self.name
    with switch_collection(Alignment, collection_name) as A:
      A.ensure_indexes()
      return list(A.objects)

  def get_maps(self):
    collection_name = '%s.maps'%self.name
    with switch_collection(Map, collection_name) as A:
      A.ensure_indexes()
      return list(A.objects)

  def get_query_map_ids(self):
    """Get a list of query ids"""
    collection_name = '%s.maps'%self.name
    # Select a list of distinct query_id's from the alignments
    with switch_collection(Map, collection_name) as A:
      A.ensure_indexes()
      return A.objects.filter(type = 'query').distinct('name')

  def get_query_maps(self):
    """Get a list of query ids"""
    collection_name = '%s.maps'%self.name
    # Select a list of distinct query_id's from the alignments
    with switch_collection(Map, collection_name) as A:
      A.ensure_indexes()
      return A.objects.filter(type = 'query')

  def get_ref_map_ids(self):
    """Get a list of ref ids"""
    collection_name = '%s.maps'%self.name
    # Select a list of distinct query_id's from the alignments
    with switch_collection(Map, collection_name) as A:
      A.ensure_indexes()
      return A.objects.filter(type = 'reference').distinct('name')

  def get_ref_maps(self):
    """Get a list of ref ids"""
    collection_name = '%s.maps'%self.name
    # Select a list of distinct query_id's from the alignments
    with switch_collection(Map, collection_name) as A:
      A.ensure_indexes()
      return A.objects.filter(type = 'reference')

# class QueryMap(Map, Document):
#   meta = {'collection' : 'query_maps',
#           'indexes' : ['name']}

# class ReferenceMap(Map, Document):
#   meta = {'collection' : 'reference_maps',
#           'indexes' : ['name']}

