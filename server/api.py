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
    logging.debug("Response: " + str(d))
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
    logging.debug("Response: " + str(d))
    return json.dumps(d)

@api_blueprint.route('/references', methods=('GET',))
@crossdomain(origin="*")
def all_reference_details():
    """
    Get the references
    """
    logging.info("Received references request.")
    ref_maps = list(ReferenceMap.objects())
    ref_map_data= [rmap.to_dict() if rmap else None for rmap in ref_maps]
    d = {'reference_maps' : ref_map_data}
    logging.debug("Response: " + str(d))
    return json.dumps(d)

@api_blueprint.route('/references/<reference_id>', methods=('GET',))
@crossdomain(origin="*")
def reference_details(reference_id):
    """
    Get the references
    """
    logging.info("Received reference details request for reference %s"%reference_id)
    refmaps = ReferenceMap.objects(name = reference_id)
    refmap = refmaps[0] if refmaps.count() > 0 else None
    d = {'reference_map' : refmap.to_dict() if refmap else None}
    logging.debug("Response: " + str(d))
    return json.dumps(d)


@api_blueprint.route('/alignments/<query_id>', methods=('GET',))
@crossdomain(origin="*")
def alignments_for_query(query_id):
    """
    Get all alignments for the given query id.
    Sort by rescaled score.
    """
    logging.info("Received alignments request for query %s."%query_id)
    alns = Alignment.objects(query_id = query_id).order_by('total_score_rescaled')
    #alns = alns[0:20] # Slice to 20.
    d = {'alignments' : [aln.to_dict() for aln in alns]}
    logging.debug("Response: " + str(d))
    return json.dumps(d)

