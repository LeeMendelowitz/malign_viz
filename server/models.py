"""
Code for models
"""
from mongoengine import *
from mongoengine.context_managers import switch_collection
import json
from collections import Counter
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
  elif isinstance(elem, (datetime.date, datetime.datetime)):
    return elem.isoformat()
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
    r = get_dict_data(self._data)
    return r

#############################################

class Chunk(DictMixin, EmbeddedDocument):
  start = IntField()
  end = IntField()
  size = IntField()
  is_boundary = BooleanField()

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
  ref_start = IntField()
  ref_end = IntField()
  ref_start_bp = IntField()
  ref_end_bp = IntField()
  score = EmbeddedDocumentField(Score)
  query_id = StringField()
  query_num_sites = IntField()
  max_chunk_sizing_score = FloatField()
  total_score = FloatField()
  query_scaling_factor = FloatField()
  is_forward = BooleanField()
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
    d = get_dict_data(self._data)
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

  @property
  def alignment_collection(self):
    collection_name = '%s.alignments'%self.name
    return collection_name

  @property
  def map_collection(self):
    collection_name = '%s.maps'%self.name
    return collection_name  

  def ensure_related_indexes(self):
    with switch_collection(Alignment, self.alignment_collection) as A:
      A.ensure_indexes()
    with switch_collection(Map, self.map_collection) as M:
      M.ensure_indexes()

  def get_alignments(self):
    with switch_collection(Alignment, self.alignment_collection) as A:
      A.ensure_indexes()
      return A.objects

  def get_alignments_for_query(self, query_id):
    alns = self.get_alignments()
    return alns.filter(query_id = query_id)

  def get_summary(self):
    """Return a summary of this experiment
    """
    ret = {}
    ret['name'] = self.name
    ret['description'] = self.description
    ret['created'] = self.created
    ret['num_query_maps'] = len(self.get_query_map_ids())
    ret['num_ref_maps'] = len(self.get_ref_map_ids())
    with switch_collection(Alignment, self.alignment_collection) as A:

      A.ensure_indexes()
      ret['num_alignments'] = A.objects.count()

      # Get the number of alignments per query
      alignments = A.objects.only('query_id')
      query_id_counts = Counter(a.query_id for a in alignments)
      aligned_queries = [{"query_id" : query_id, 
                          "aln_count": aln_count} for query_id, aln_count in query_id_counts.iteritems()]
      ret['aligned_queries'] = aligned_queries

    # Get a list of query_ids with the number of alignments for each query.
    # Mongoengine does not have good aggregation support so do it here in memory.
    return ret

  def get_maps(self):
    with switch_collection(Map, self.map_collection) as A:
      A.ensure_indexes()
      return  A.objects

  def get_query_map_ids(self):
    """Get a list of query ids"""
    # Select a list of distinct query_id's from the alignments
    with switch_collection(Map, self.map_collection) as A:
      A.ensure_indexes()
      return A.objects.filter(type = 'query').distinct('name')

  def get_query_maps(self):
    """Get a list of query ids"""
    # Select a list of distinct query_id's from the alignments
    with switch_collection(Map, self.map_collection) as A:
      A.ensure_indexes()
      return A.objects.filter(type = 'query')

  def get_ref_map_ids(self):
    """Get a list of ref ids"""
    # Select a list of distinct query_id's from the alignments
    with switch_collection(Map, self.map_collection) as A:
      A.ensure_indexes()
      return A.objects.filter(type = 'reference').distinct('name')

  def get_ref_maps(self):
    """Get a list of ref ids"""
    # Select a list of distinct query_id's from the alignments
    with switch_collection(Map, self.map_collection) as A:
      A.ensure_indexes()
      return A.objects.filter(type = 'reference')

# class QueryMap(Map, Document):
#   meta = {'collection' : 'query_maps',
#           'indexes' : ['name']}

# class ReferenceMap(Map, Document):
#   meta = {'collection' : 'reference_maps',
#           'indexes' : ['name']}

