"""
Utility functions
"""

from common import wrap_file_function
from models import Map
import sys

@wrap_file_function('r', 'w')
def convert_maps_file_to_mongo(maps_in, json_out, map_type):
  """
  Convert a maps file to the mongo format so it can be
  imported with mongoimport.
  """
  report_interval = 1000

  map_gen = (Map.from_line(l, map_type) for l in maps_in)
  for i, m in enumerate(map_gen):
    
    json_out.write(m.to_json() + '\n')

    if (i+1) % report_interval == 0:
      sys.stderr.write("Converted %i maps\n"%(i+1))

