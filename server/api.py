"""
API for getting alignments from database
"""

import flask
from flask import (Blueprint, render_template, abort,
  redirect, url_for, session, request, abort, jsonify)
from werkzeug import secure_filename
import os
import json
import subprocess
from mongoengine import DoesNotExist, MultipleObjectsReturned

from config import UPLOAD_FOLDER, DB_NAME

# Set up logging
from common.logging_utils import create_logger
logger = create_logger('api')

api_blueprint = Blueprint('api', __name__,
                        template_folder='templates')

from .models import Alignment, QueryMap, ReferenceMap, Experiment
from .cors import crossdomain

ALLOWED_EXTENSIONS = set(['json'])

def json_response(msg, status_code = 200):
    response = jsonify(msg = msg)
    response.status_code = status_code
    return response

@api_blueprint.route('/experiments')
def list_experiments():
    """
    List all exerpiments
    """
    logger.info("Received experiments request.")
    experiments = Experiment.objects
    d = {'experiments' : [e.to_dict() for e in experiments]}
    logger.debug("Response: " + str(d))
    return jsonify(d)

@api_blueprint.route('/experiments/<experiment_id>/delete', methods=['POST'])
def delete_experiment(experiment_id):
    logger.info("Received experiment info request for experiment %s"%experiment_id)
    logger.info("cookie keys: %s"%(str(request.cookies.keys())))

    try:

        e = Experiment.objects.filter(name = experiment_id).get()
        e.delete()
        response = jsonify(msg = 'deleted')
        return response

    except (DoesNotExist, MultipleObjectsReturned) as e:

        response = jsonify()
        response.status_code = 404
        return response

@api_blueprint.route('/experiments/<experiment_id>', methods=['GET', 'POST'])
def get_or_update_experiment(experiment_id):
    logger.info("Received get or update request for experiment: %s"%experiment_id)
    if request.method == 'POST':
        return experiment_info_create_or_update(experiment_id)
    else:
        return experiment_info(experiment_id)



def experiment_info(experiment_id):
    """
    List a summary for a single experiment
    """
    logger.info("Received experiment info request for experiment %s"%experiment_id)
    logger.info("cookie keys: %s"%(str(request.cookies.keys())))
    try:

        e = Experiment.objects.filter(name = experiment_id).get()
        d = e.get_summary()

    except (DoesNotExist, MultipleObjectsReturned) as e:

        response = jsonify()
        response.status_code = 404
        return response

    logger.debug("Response: " + str(d))
    return jsonify(d)


def experiment_info_create_or_update(experiment_id):
    """
    Update information for a single experiment
    """
    logger.info("Received experiment udpate request for experiment %s"%experiment_id)
    logger.info("cookie keys: %s"%(str(request.cookies.keys())))

    try:

        data = request.json
        keys = data.keys()
        required_keys = ('description', 'name')
        for k in required_keys:
            if k not in keys:
                response = jsonify(msg="missing required keys")
                response.status_code = 400
                return response

        description = data['description']
        e = Experiment.objects.filter(name = experiment_id).get()
        e.description = description
        e.save()

        return jsonify(msg = 'updated')

    except (DoesNotExist) as e:

        e = Experiment(name = experiment_id, description = description)
        e.save()

        return jsonify(msg = 'created')

    except (MultipleObjectsReturned) as e:

        response = jsonify(msg = 'multiple objects!')
        response.status_code = 500
        return response


    logger.debug("Response: " + str(d))
    return jsonify(d)

@api_blueprint.route('/create/experiment', methods=['POST', 'GET'])
def create_experiment():
    logger.info("Received experiment create request")

    try:

        data = request.form
        keys = data.keys()
        files = request.files

        required_files = ('query_file', 'ref_file', 'aln_file')
        for k in required_files:
            if k not in request.files.keys():
                response = jsonify(msg="missing required files")
                response.status_code = 400
                return response

        ################################################################
        # Save the uploaded files
        for f in required_files:

            file = request.files[f]
            filename = secure_filename(file.filename)
            file.save(os.path.join(UPLOAD_FOLDER, filename))

        return jsonify(msg = 'success')

    except (DoesNotExist, MultipleObjectsReturned) as e:

        response = jsonify()
        response.status_code = 404
        return response

    logger.debug("Response: " + str(d))
    return jsonify(d)


@api_blueprint.route('/upload_experiment_files/<experiment_id>', methods=['POST'])
def upload_experiment_files(experiment_id):
    logger.info("Received experiment upload file POST request")

    files = request.files

    required_files = ('query_file', 'ref_file', 'aln_file')
    for k in required_files:
        if k not in request.files.keys():
            response = jsonify(msg="missing required files")
            response.status_code = 400
            return response

    ################################################################
    # Save the uploaded files
    output_dir = os.path.join(UPLOAD_FOLDER, experiment_id)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    saved_files = {}

    for f in required_files:

        file = request.files[f]

        # This will remove spaces and other annoying stuff.
        output_filename = secure_filename(file.filename)

        # Make sure file is not empty
        if not output_filename:
            return json_response('bad filename', 400)

        output_filename = os.path.join(output_dir, output_filename)
        file.save(output_filename)
        saved_files[f] = output_filename

    ret_code = import_maps_file(experiment_id, saved_files['query_file'])
    if ret_code != 0:
        return json_response('error processing query file', 400)

    ret_code = import_maps_file(experiment_id, saved_files['ref_file'])
    if ret_code != 0:
        return json_response('error processing ref file', 400)

    ret_code = import_alignments_file(experiment_id, saved_files['aln_file'])
    if ret_code != 0:
        return json_response('error processing alignments file', 400)

    return json_response('success')


def import_maps_file(experiment_id, map_file):
    """Import the maps file through mongoimport"""

    db = DB_NAME
    collection = '%s.maps'%experiment_id
    
    cmd = ['mongoimport', '--db', db, '-c', collection]

    with open(map_file) as fin:
        p = subprocess.Popen(cmd, stdin=fin)
        p.wait()

    return p.returncode

def import_alignments_file(experiment_id, aln_file):
    """Import the alignments file through mongoimport"""

    db = DB_NAME
    collection = '%s.alignments'%experiment_id
    
    cmd = ['mongoimport', '--db', db, '-c', collection]

    with open(aln_file) as fin:
        p = subprocess.Popen(cmd, stdin=fin)
        p.wait()

    return p.returncode


@api_blueprint.route('/experiments/<experiment_id>/queries')
def experiment_queries(experiment_id):
    """
    List all queries from an experiment
    """
    logger.info("Received experiment queries request for experiment %s"%experiment_id)
    try:

        e = Experiment.objects.filter(name = experiment_id).get()
        query_maps = e.get_query_maps()
        return jsonify(query_maps = [q.to_dict() for q in query_maps])

    except (DoesNotExist, MultipleObjectsReturned) as e:

        response = jsonify()
        response.status_code = 404
        return response

@api_blueprint.route('/experiments/<experiment_id>/references')
def experiment_references(experiment_id):
    """
    List all references from an experiment
    """
    logger.info("Received experiment references request for experiment %s"%experiment_id)
    try:

        e = Experiment.objects.filter(name = experiment_id).get()
        ref_maps = e.get_ref_maps()
        return jsonify(reference_maps = [q.to_dict() for q in ref_maps])

    except (DoesNotExist, MultipleObjectsReturned) as e:

        response = jsonify()
        response.status_code = 404
        return response

@api_blueprint.route('/experiments/<experiment_id>/alignments')
def experiment_alignments(experiment_id):
    """
    List all alignments from an experiment
    """
    logger.info("Received experiment alignments request for experiment %s"%experiment_id)
    try:

        e = Experiment.objects.filter(name = experiment_id).get()
        alns = e.get_alignments()
        return jsonify(alignments = [a.to_dict() for a in alns])

    except (DoesNotExist, MultipleObjectsReturned) as e:

        response = jsonify()
        response.status_code = 404
        return response

@api_blueprint.route('/experiments/<experiment_id>/alignments/<query_id>')
def experiment_alignments_for_query(experiment_id, query_id):
    """
    List all alignments from an experiment
    """
    logger.info("Received experiment alignments request for experiment %s"%experiment_id)
    try:

        e = Experiment.objects.filter(name = experiment_id).get()
        alns = e.get_alignments_for_query(query_id)
        return jsonify(alignments = [a.to_dict() for a in alns])

    except (DoesNotExist, MultipleObjectsReturned) as e:

        response = jsonify()
        response.status_code = 404
        return response

###########################################################################
# Old routes are below. I am in process of tieing all data to a 
# a particular experiment. 
@api_blueprint.route('/queries')
def list_query_ids():
    """
    List all query ids in the database

    TODO: Figure out how to cursor this.
    """
    logger.info("Received list queries request.")
    qids = Alignment.objects.distinct('query_id')
    d = {'query_id' : qids}
    logger.debug("Response: " + str(d))
    return jsonify(d)

@api_blueprint.route('/queries/<query_id>')
def query_details(query_id):
    """
    Get the query map
    """
    logger.info("Received query details request for query %s."%query_id)
    qmaps = QueryMap.objects(name = query_id)
    qmap = qmaps[0] if qmaps.count() > 0 else None
    d = {'query_map' : qmap.to_dict()}
    logger.debug("Response: " + str(d))
    return jsonify(d)

@api_blueprint.route('/references')
def all_reference_details():
    """
    Get the references
    """
    logger.info("Received references request.")
    ref_maps = list(ReferenceMap.objects())
    ref_map_data= [rmap.to_dict() if rmap else None for rmap in ref_maps]
    d = {'reference_maps' : ref_map_data}
    logger.debug("Response: " + str(d))
    return jsonify(d)

@api_blueprint.route('/references/<reference_id>')
def reference_details(reference_id):
    """
    Get the references
    """
    logger.info("Received reference details request for reference %s"%reference_id)
    refmaps = ReferenceMap.objects(name = reference_id)
    refmap = refmaps[0] if refmaps.count() > 0 else None
    d = {'reference_map' : refmap.to_dict() if refmap else None}
    logger.debug("Response: " + str(d))
    return jsonify(d)


@api_blueprint.route('/alignments/<query_id>')
def alignments_for_query(query_id):
    """
    Get all alignments for the given query id.
    Sort by rescaled score.
    """
    logger.info("Received alignments request for query %s."%query_id)
    alns = Alignment.objects(query_id = query_id).order_by('total_score_rescaled')
    #alns = alns[0:20] # Slice to 20.
    d = {'alignments' : [aln.to_dict() for aln in alns]}
    logger.debug("Response: " + str(d))
    return jsonify(d)

