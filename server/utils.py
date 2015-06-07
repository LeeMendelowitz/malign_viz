"""
Utility functions
"""

from common import wrap_file_function
from models import Map

@wrap_file_function('r', 'w')
def convert_maps_file_to_mongo(maps_in, json_out):
  """
  Convert a maps file to the mongo format so it can be
  imported with mongoimport.
  """

  map_gen = (Map.from_line(l) for l in maps_in)
  for m in map_gen:
    json_out.write(m.to_json() + '\n')

