#!/usr/bin/env python
"""
Convert maps to mongo db json format
"""

from server.utils import convert_maps_file_to_mongo

import argparse
parser = argparse.ArgumentParser()
parser.add_argument("maps", help="SOMA Maps file")
parser.add_argument("output", help="Output json file")
args = parser.parse_args()

convert_maps_file_to_mongo(args.maps, args.output)