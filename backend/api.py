import pandas as pd
import numpy as np
import json
import graph_func
import base64
from mzDataset import MzDataSet, DimRedDataSet
from flask import Flask, abort, request, make_response
from flask_cors import CORS
from PIL import Image
from io import BytesIO
from argparse import ArgumentParser

parser = ArgumentParser()
parser.add_argument('-j', '--json', dest='json_name', required=True, nargs='?', help='name of the json file', metavar='filename', type=str)
parser.add_argument('-m', '--method', dest='dimred_method', type=str, required=True, nargs='?', choices=['pca', 'nmf', 'lda', 'tsne', 'umap', 'ica', 'kpca', 'lsa', 'lle', 'mds', 'isomap', 'spectralembedding'], help='method for dimensionality reduction.')
args = parser.parse_args()
# Constants for folder structure
path_to_data = 'data/'
path_to_json = 'json/'
path_to_matrix = 'matrix/'
path_to_dataset = 'dataset/'
path_to_dimreduce = 'dimreduce/'
matrix_blueprint = 'similarity-matrix-{}.npy'
dimreduce_blueprint = 'dimreduce-{}-{}.h5'
dataset_blueprint = '{}.h5'

# dict to handle multiple datasets
datasets = {}


with open(path_to_data + path_to_json + args.json_name, 'r') as file:
    json_content = json.load(file)['graphs']
    for graphKey in json_content.keys():
        datasets[json_content[graphKey]['dataset']] = ''
    firstDataset = json_content['graph0']
    graph_func.graph_initialisation(np.load((path_to_data + path_to_matrix + matrix_blueprint).format(firstDataset['dataset'])), firstDataset['threshold'])
    del json_content
    del firstDataset

for dataset_name in datasets.keys():
    datasets[dataset_name] = {
        'dimreduce': DimRedDataSet(pd.read_hdf((path_to_data + path_to_dimreduce + dimreduce_blueprint).format(dataset_name, args.dimred_method)).droplevel('dataset')),
        'dataset': MzDataSet(pd.read_hdf((path_to_data + path_to_dataset + dataset_blueprint).format(dataset_name)).droplevel('dataset'))
    }

# returns list of allowed merge methods for mz intensities
def merge_methods():
    return ['mean', 'median', 'max', 'min']


# returns names of all available datasets
def dataset_names():
    return list(datasets.keys())


# returns list of all mz_values
def mz_values(ds_name):
    return datasets[ds_name]['dataset'].getMzValues()


# generates json file for graph
def graph_data_all_datasets():
    with open(path_to_data + path_to_json + args.json_name, 'r') as file:
        try:
            data = json.load(file)
        except:
            data = {}
    return data


app = Flask(__name__)
CORS(app)


# get available merge methods if mz image of multiple images is queried
@app.route('/mz-merge-methods')
def merge_methods_action():
    return json.dumps(merge_methods())


# get all dataset names
@app.route('/datasets')
def datasets_action():
    return json.dumps(dataset_names())


# get mz values of dataset
@app.route('/datasets/<dataset_name>/mzvalues')
def datasets_mzvalues_action(dataset_name):
    if dataset_name not in dataset_names():
        return abort(400)

    return json.dumps(mz_values(dataset_name))


@app.route('/graph/centrality', methods=['GET'])
def centrality():
    return json.dumps(graph_func.betweenness_centrality())


@app.route('/graph/cluster_coefficient', methods=['GET'])
def clust_coeff():
    return json.dumps(graph_func.cluster_coefficient())


@app.route('/graph/eccentricity', methods=['GET'])
def eccentricity():
    return json.dumps(graph_func.eccentricity())


@app.route('/graph/degree', methods=['GET'])
def degree():
    return json.dumps(graph_func.degree())


@app.route('/graph/group_degree', methods=['GET'])
def group_degree():
    return json.dumps(graph_func.group_degree())


@app.route('/graph/avg_edge_weights', methods=['GET'])
def avg_edge_weights():
    return json.dumps(graph_func.average_weight_per_edge())


@app.route('/graph/between_group_degree', methods=['GET'])
def bet_group_degree():
    return json.dumps(graph_func.between_group_degree())


@app.route('/graph/within_group_degree', methods=['GET'])
def with_group_degree():
    return json.dumps(graph_func.within_group_degree())


@app.route('/graph/within_cluster_centrality', methods=['GET'])
def within_cluster_centrality():
    return json.dumps(graph_func.within_cluster_centrality())


@app.route('/graph/spanning_tree_degree', methods=['GET'])
def spanning_tree_degree():
    return json.dumps(graph_func.minimal_spanning_tree_degree())


@app.route('/graph/avg_neighbor_degree', methods=['GET'])
def avg_neighbor_degree():
    return json.dumps(graph_func.avg_neighbor_degree())


@app.route('/graph/update_cluster', methods=['PATCH'])
def update_graph_cluster():
    graph_func.update_graph(request.get_data().decode('utf-8'))
    return 'OK'


@app.route('/graph/change_graph', methods=['PATCH'])
def change_graph():
    data = request.get_data().decode('utf-8')
    dataset_name = data['name']
    threshold = data['threshold']
    if dataset_name not in dataset_names():
        return abort(400)
    graph_func.graph_initialisation(np.load((path_to_data + path_to_matrix + matrix_blueprint).format(dataset_name)), threshold)
    return json.dumps('OK')


@app.route('/datasets/<dataset_name>/imagedimensions', methods=['GET'])
def dataset_image_dimension(dataset_name):
    shape = datasets[dataset_name]['dataset'].getCube().shape
    return json.dumps({'height': shape[0], 'width': shape[1]})


# gets a list of visible nodes from the frontend
# get a list of selected points
# returns which nodes are similar
@app.route('/datasets/<dataset_name>/imagedata/method/<method>/match', methods=['POST'])
def datasets_imagedata_selection_match_nodes_action(dataset_name, method):
    if dataset_name not in dataset_names():
        return abort(400)

    if method not in merge_methods():
        return abort(400)

    try:
        post_data = request.get_data()
        post_data_json = json.loads(post_data.decode('utf-8'))
        post_data_selected_points = post_data_json['selectedPoints']
        post_data_selected_mzs = [float(i) for i in post_data_json['selectedMzs']]
        post_data_visible_node_data = post_data_json['visibleNodes']
        post_data_min_intensity = float(post_data_json['minIntensity']) / 100
        post_data_min_overlap = float(post_data_json['minOverlap']) / 100
    except:
        return abort(400)
    print('START OUTER ROUTINE')

    print('END OUTER ROUTINE')
    return json.dumps(ret)


# get mz image data for dataset and mz values
# specified merge method is passed via GET parameter
# mz values are passed via post request
@app.route('/datasets/<dataset_name>/mzimage', methods=['POST'])
def datasets_imagedata_multiple_mz_action(dataset_name):
    if dataset_name not in dataset_names():
        return abort(400)
    try:
        post_data = request.get_data()
        post_data_json = json.loads(post_data.decode('utf-8'))
        method = post_data_json['method']
        colorscale = post_data_json['colorscale']
        post_data_mz_values = [float(i) for i in post_data_json['mzValues']]
    except:
        return abort(400)

    if len(post_data_mz_values) == 0:
        return abort(400)

    colorscales = {
        'Viridis': 'viridis',
        'Magma': 'magma',
        'Inferno': 'inferno',
        'Plasma': 'plasma',
        'PiYG': 'PiYG'
    }

    methods = {
        'mean': np.mean,
        'median': np.median,
        'min': np.min,
        'max': np.max,
    }
    img_io = BytesIO()
    Image.fromarray(
        datasets[dataset_name]['dataset'].getColorImage(
            post_data_mz_values,
            method=methods[method],
            cmap=colorscales[colorscale]),
        mode='RGBA'
    ).save(img_io, 'PNG')
    img_io.seek(0)
    response = make_response('data:image/png;base64,' + base64.b64encode(img_io.getvalue()).decode('utf-8'), 200)
    response.mimetype = 'text/plain'
    return response


@app.route('/datasets/<dataset_name>/dimreduceimage', methods=['POST'])
def datasets_imagedata_dimreduce_image(dataset_name):
    if dataset_name not in dataset_names():
        return abort(400)
    try:
        post_data = request.get_data()
        post_data_json = json.loads(post_data.decode('utf-8'))
        try:
            method = post_data_json['method']
            mz_values = [float(i) for i in post_data_json['mzValues']]
            if len(mz_values) == 0:
                return abort(400)
        except KeyError:
            method = None
            mz_values = None
        try:
            alpha = float(post_data_json['alpha'])/100
        except KeyError:
            alpha = None
        except ValueError:
            abort(400)
    except:
        return abort(400)


    methods = {
        'mean': np.mean,
        'median': np.median,
        'min': np.min,
        'max': np.max,
    }
    img_io = BytesIO()
    if method is None:
        Image.fromarray(
                datasets[dataset_name]['dimreduce'].getImage(),
                mode='RGBA'
         ).save(img_io, 'PNG')
    else:
        intensity = datasets[dataset_name]['dataset'].getGreyImage(mz_values, method=methods[method])
        Image.fromarray(
            datasets[dataset_name]['dimreduce'].getRelativeImage(intensity) if alpha is None else datasets[dataset_name]['dimreduce'].getAbsoluteImage(intensity, alpha),
            mode='RGBA'
        ).save(img_io, 'PNG')
    img_io.seek(0)
    response = make_response('data:image/png;base64,' + base64.b64encode(img_io.getvalue()).decode('utf-8'), 200)
    response.mimetype = 'text/plain'
    return response


# get graph data for all datasets
@app.route('/datasets/graphdata')
def datasets_all_datasets_all_graphdata_action():
    return json.dumps(graph_data_all_datasets())


if __name__ == '__main__':
    app.run(debug=True)
