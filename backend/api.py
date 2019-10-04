from sys import argv
import pandas as pd
import numpy as np
import json
import time
import networkx as nx
import graph_func
from flask import Flask
from flask import abort
from flask import request
from flask_cors import CORS
from os import listdir
from os.path import exists, isdir, isfile
import matplotlib


merged_dframe = pd.DataFrame()

for path in argv[3:]:
    if len(argv[3:]) == 1:
        if isdir(path):
            for f in listdir(path):
                if f.split(".")[1] == "h5":
                    merged_dframe = merged_dframe.append(pd.read_hdf(f))
        else:
            merged_dframe = pd.read_hdf('datasets/' + path)
    else:
        for path in argv[3:]:
            merged_dframe = merged_dframe.append(pd.read_hdf('datasets/' + path))

merged_dframe = merged_dframe.fillna(value=0)

pca_dframe = pd.read_hdf('datasets/' + argv[2])
with open('json/' + argv[1], 'r') as file:
    firstDataset = json.load(file)['graphs']['graph0']
    graph_func.graph_initialisation(np.load('datasets/similarity-matrix-{}.npy'.format(firstDataset['dataset'])), firstDataset['threshold'])


# returns list of allowed merge methods for mz intensities
def merge_methods():
    return ['mean', 'median', 'max', 'min']


# returns names of all available datasets
def dataset_names():
    dt_names = set(merged_dframe.index.get_level_values("dataset"))
    return [name for name in dt_names]


# returns list of all mz_values
def mz_values(ds_name):
    single_dframe = merged_dframe.loc[merged_dframe.index.get_level_values("dataset") == ds_name]
    mzs = []
    for key, value in single_dframe.iteritems():
        mzs.append(key)
    return {i: mzs[i] for i in range(0, len(mzs))}


# provides data to render image for passed dataset, multiple mz_values and merge_method (min, max, median)
# returns x, y and normed intensities
def image_data_for_dataset_and_mzs_raw_data(ds_name, mz_values, merge_method):
    single_dframe = merged_dframe.loc[merged_dframe.index.get_level_values("dataset") == ds_name]
    pos_x = np.array(single_dframe.index.get_level_values("grid_x"))
    pos_y = np.array(single_dframe.index.get_level_values("grid_y"))

    # holds the intensities of all mz_values in an array
    intensity = np.array(single_dframe[mz_values])

    # merge the intensities into a single one with specified method and on specified axis
    merge_method_dynamic_call = getattr(np, merge_method)
    intensity = merge_method_dynamic_call(intensity, 1)

    intensity = np.interp(intensity, (intensity.min(), intensity.max()), (0, 1))

    return [pos_x, pos_y, intensity]


# provides data to render image for passed dataset, multiple mz_values and merge_method (min, max, median)
# returns data ready to pass through api
def image_data_for_dataset_and_mzs(ds_name, mz_values, merge_method):
    raw_data = image_data_for_dataset_and_mzs_raw_data(ds_name, mz_values, merge_method)
    pos_x = raw_data[0]
    pos_y = raw_data[1]
    intensity = raw_data[2]

    return [
        {'x': int(x), 'y': int(y), 'intensity': float(i)}
        for x, y, i in zip(pos_x, pos_y, intensity)
    ]


# does binarization of the selected dataset and a node dataset, keeps only points > min_intensity
# checks for overlap (amount datapoints with 1 in multiplied dataset) higher min_overlap
def selection_match(dframe_selected, dframe_node, min_intensity, min_overlap, merge_method):
    # merge all columns (mzs) by merge_method into one column
    merge_method_dynamic_call = getattr(dframe_selected, merge_method)
    dframe_selected = merge_method_dynamic_call(axis=1)

    # get the maximum for each column and multiply by the min_intensity
    t = np.max(dframe_selected) * min_intensity
    dframe_selected[dframe_selected < t] = 0  # binarization
    dframe_selected[dframe_selected >= t] = 1

    # merge all columns (mzs) by merge_method into one column
    merge_method_dynamic_call = getattr(dframe_node, merge_method)
    dframe_node = merge_method_dynamic_call(axis=1)

    # get the maximum for each column and multiply by the min_intensity
    t = np.max(dframe_node) * min_intensity
    dframe_node[dframe_node < t] = 0  # binarization
    dframe_node[dframe_node >= t] = 1

    # find amount of common entries in selected and node dataset
    dframe_multiplied = dframe_selected * dframe_node
    overlap = dframe_multiplied.sum() / len(dframe_selected)
    return overlap >= min_overlap


# returns the names of nodes which are matching based on provided min_intensity and max_overlap
# from frontend
def check_nodes_for_match(ds_name, node_data, selected_mzs, selected_points, merge_method, min_intensity, min_overlap):
    single_dframe = merged_dframe.loc[merged_dframe.index.get_level_values("dataset") == ds_name]

    # extract keys/points (x, y) from selected_points
    keys_selected = []
    for i in selected_points:
        keys_selected.append((i['x'], i['y']))
    keys = [(a, b, ds_name) for a, b, in keys_selected]
    dframe_selected = single_dframe.loc[keys]
    dframe_selected = dframe_selected[selected_mzs]

    node_names = []
    for node in node_data:
        dframe_node = single_dframe[node['mzs']]
        match = selection_match(dframe_selected, dframe_node, min_intensity, min_overlap, merge_method)
        if match:
            node_names.append(node['name'])

    return node_names


# provides data to render all mz images for passed dataset
def image_data_for_dataset(ds_name):
    object = {}
    for key, mz in mz_values(ds_name).items():
        object[mz] = image_data_for_dataset_and_mzs(ds_name, [mz], None)
    return object


# provides all image data of all datasets and all mzvalues
def image_data_all_datasets():
    object = {}
    for ds in dataset_names():
        object.update({ds: image_data_for_dataset(ds)})
    return object


# generates json file for graph
def graph_data_all_datasets():
    with open('json/' + argv[1], 'r') as file:
        try:
            data = json.load(file)
        except:
            data = {}
    return data


# returns PCA RGB image
def datasets_imagedata_pca_image_data(ds_name, mz_values, merge_method, data_threshold):
    # filter pca dataframe by dataset name
    single_dframe = pca_dframe.loc[pca_dframe.index.get_level_values("dataset") == ds_name]

    # get the x and y positions/columns from the pca
    pos_x = np.array(single_dframe.index.get_level_values("grid_x"))
    pos_y = np.array(single_dframe.index.get_level_values("grid_y"))

    # get the r,g and b values/volumns from the pca
    r = np.array(single_dframe['umapR'])
    g = np.array(single_dframe['umapG'])
    b = np.array(single_dframe['umapB'])

    # norm the rgb values to a number between 0 and 1
    r_norm = np.interp(r, (r.min(), r.max()), (0, 1))
    g_norm = np.interp(g, (g.min(), g.max()), (0, 1))
    b_norm = np.interp(b, (b.min(), b.max()), (0, 1))

    intensity = [1] * len(r)
    if len(mz_values):
        # mz_raw_data returns format [pos_x, pos_y, intensity] from the non-pc dataset, intensity based on
        # passed merge_method
        mz_raw_data = image_data_for_dataset_and_mzs_raw_data(ds_name, mz_values, merge_method)
        intensity = mz_raw_data[2]  # we only need the intensity

        if data_threshold is not None:
            # we have a threshold, so we set all intensities to 0 which are below that threshold
            # using binarization
            intensity[intensity < data_threshold] = 0
            intensity[intensity >= data_threshold] = 1

    # we return something like this:
    # [{x: 27, y: 22, color: "#1464830c"}, {x: 28, y: 22, color: "#11677809"}, ...]
    return [
        {'x': int(x), 'y': int(y), 'color': matplotlib.colors.to_hex([r, g, b, i], keep_alpha=True)}
        for x, y, r, g, b, i in zip(pos_x, pos_y, r_norm, g_norm, b_norm, intensity)
    ]


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


@app.route('/graph/avg_edge_weights', methods=['GET'])
def avg_edge_weights():
    return json.dumps(graph_func.average_weight_per_edge())


@app.route('/graph/between_group_degree', methods=['GET'])
def bet_group_degree():
    return json.dumps(graph_func.between_group_degree())


@app.route('/graph/within_group_degree', methods=['GET'])
def with_group_degree():
    return json.dumps(graph_func.within_group_degree())


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
    graph_func.graph_initialisation(np.load('datasets/similarity-matrix-' + dataset_name + '.npy'), threshold)
    return json.dumps('OK')


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

    ret = check_nodes_for_match(
        dataset_name,
        post_data_visible_node_data,
        post_data_selected_mzs,
        post_data_selected_points,
        method,
        post_data_min_intensity,
        post_data_min_overlap
    )
    return json.dumps(ret)


# get mz image data for dataset and mz values
# specified merge method is passed via GET parameter
# mz values are passed via post request
@app.route('/datasets/<dataset_name>/mzvalues/imagedata/method/<method>', methods=['POST'])
def datasets_imagedata_multiple_mz_action(dataset_name, method):
    if dataset_name not in dataset_names():
        return abort(400)

    if method not in merge_methods():
        return abort(400)

    try:
        post_data = request.get_data()
        post_data_json = json.loads(post_data.decode('utf-8'))
        post_data_mz_values = [float(i) for i in post_data_json['mzValues']]
    except:
        return abort(400)

    if len(post_data_mz_values) == 0:
        return abort(400)

    return json.dumps(image_data_for_dataset_and_mzs(dataset_name, post_data_mz_values, method))


# get mz image data for dataset for all mz values
@app.route('/datasets/<dataset_name>/imagedata')
def datasets_imagedata_all_mz_action(dataset_name):
    if dataset_name not in dataset_names():
        return abort(400)

    return json.dumps(image_data_for_dataset(dataset_name))


# get all image data for all datasets and all mz values
@app.route('/datasets/imagedata')
def datasets_all_datasets_all_imagedata_action():
    return json.dumps(image_data_all_datasets())


# get mz image data for dataset for all mz values
@app.route('/datasets/<dataset_name>/pcaimagedata/method/<method>', methods=['POST'])
def datasets_imagedata_pca_image_data_action(dataset_name, method):
    if dataset_name not in dataset_names():
        return abort(400)

    if method not in merge_methods():
        return abort(400)

    try:
        post_data = request.get_data()
        post_data_json = json.loads(post_data.decode('utf-8'))
        post_data_mz_values = [float(i) for i in post_data_json['mzValues']]
        if post_data_json['threshold'] is None:
            post_data_threshold = None
        else:
            post_data_threshold = float(post_data_json['threshold']) / 100
    except:
        return abort(400)

    return json.dumps(datasets_imagedata_pca_image_data(dataset_name, post_data_mz_values, method, post_data_threshold))


# get graph data for all datasets
@app.route('/datasets/graphdata')
def datasets_all_datasets_all_graphdata_action():
    return json.dumps(graph_data_all_datasets())


if __name__ == '__main__':
    app.run(debug=True)
