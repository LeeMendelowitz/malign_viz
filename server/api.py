"""
API for getting alignments from database
"""

import flask
from flask import (Blueprint, render_template, abort,
  redirect, flash, url_for, session, request)
import json



api_blueprint = Blueprint('api', __name__,
                        template_folder='templates')

from .models import Alignment
from .cors import crossdomain

@api_blueprint.route('/queries', methods=('GET',))
@crossdomain(origin="*")
def list_query_ids():
    """
    List all query ids in the database

    TODO: Figure out how to cursor this.
    """
    qids = Alignment.objects.distinct('query_id')
    d = {'query_id' : qids}
    return json.dumps(d)

@api_blueprint.route('/queries/<query_id>', methods=('GET',))
@crossdomain(origin="*")
def alignments_for_query(query_id):
    """
    Get all alignments for the given query id.
    """
    form_data = flask.request.form
    alns = Alignment.objects(query_id = query_id)
    d = {'alignments' : [aln.web_json() for aln in alns]}
    return json.dumps(d)

