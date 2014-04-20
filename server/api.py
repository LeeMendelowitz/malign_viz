"""
API for getting alignments from database
"""

import flask
from flask import (Blueprint, render_template, abort,
  redirect, flash, url_for, session, request)
import json
import logging



api_blueprint = Blueprint('api', __name__,
                        template_folder='templates')

from .models import Alignment, QueryMap, ReferenceMap
from .cors import crossdomain

@api_blueprint.route('/queries', methods=('GET',))
@crossdomain(origin="*")
def list_query_ids():
    """
    List all query ids in the database

    TODO: Figure out how to cursor this.
    """
    logging.info("Received list queries request.")
    qids = Alignment.objects.distinct('query_id')
    d = {'query_id' : qids}
    return json.dumps(d)

@api_blueprint.route('/queries/<query_id>', methods=('GET',))
@crossdomain(origin="*")
def query_details(query_id):
    """
    Get the query map
    """
    logging.info("Received query details request for query %s."%query_id)
    qmaps = QueryMap.objects(name = query_id)
    qmap = qmaps[0] if qmaps.count() > 0 else None
    d = {'query_map' : qmap.to_dict()}
    return json.dumps(d)

@api_blueprint.route('/references', methods=('GET',))
@crossdomain(origin="*")
def reference_details():
    """
    Get the references
    """
    logging.info("Received references request.")
    ref_maps = list(ReferenceMap.objects())
    ref_map_data= [rmap.to_dict() for rmap in ref_maps]
    d = {'reference_maps' : ref_map_data}
    return json.dumps(d)


@api_blueprint.route('/alignments/<query_id>', methods=('GET',))
@crossdomain(origin="*")
def alignments_for_query(query_id):
    """
    Get all alignments for the given query id.
    """
    logging.info("Received alignments request for query %s."%query_id)
    alns = Alignment.objects(query_id = query_id)
    d = {'alignments' : [aln.to_dict() for aln in alns]}
    return json.dumps(d)

