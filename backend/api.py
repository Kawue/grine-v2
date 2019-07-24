from sys import argv
import pandas as pd
import numpy as np
import json
from flask import Flask
from flask import abort
from flask import request
from flask_cors import CORS
from os import listdir
from os.path import exists, isdir, isfile

# load dataframe (.h5)

merged_dframe = pd.DataFrame()

for path in argv[2:]:
    if len(argv[2:]) == 1:
        if isdir(path):
            for f in listdir(path):
                if f.split(".")[1] == "h5":
                    merged_dframe = merged_dframe.append(pd.read_hdf(f))
        else:
            merged_dframe = pd.read_hdf('datasets/' + path)
    else:
        for path in argv[2:]:
            merged_dframe = merged_dframe.append(pd.read_hdf('datasets/' + path))

merged_dframe = merged_dframe.fillna(value=0)


# returns list of allowed merge methods for mz intensizties
def merge_methods():
    return ['min', 'max', 'median', 'mean']


# returns names of all available datasets
def dataset_names():
    dt_names = set(merged_dframe.index.get_level_values("dataset"))
    names = []
    for name in dt_names:
        names.append(name)
    return names


# returns list of all mz_values
def mz_values(ds_name):
    single_dframe = merged_dframe.loc[merged_dframe.index.get_level_values("dataset") == ds_name]
    mzs = []
    for key, value in single_dframe.iteritems():
        mzs.append(key)
    return {i: mzs[i] for i in range(0, len(mzs))}


def norm(val, min, max):
    if max > 0:
        val = (val - min) / (max - min)
        return val
    else:
        return 0


# provides data to render image for passed dataset, multiple mz_values and merge_method (min, max, median)
def image_data_for_dataset_and_mzs(ds_name, mz_values, merge_method):
    single_dframe = merged_dframe.loc[merged_dframe.index.get_level_values("dataset") == ds_name]
    pos_x = np.array(single_dframe.index.get_level_values("grid_x"))
    pos_y = np.array(single_dframe.index.get_level_values("grid_y"))

    pos_x_min = pos_x.min()
    pos_y_min = pos_y.min()
    pos_x[:] = [x - pos_x_min for x in pos_x]
    pos_y[:] = [y - pos_y_min for y in pos_y]

    # holds the intensities of all mz_values in an array
    intensity = np.array(single_dframe[mz_values])

    if len(mz_values) > 1:
        # merge the intensities into a single one with specified method and on specified axis
        merge_method_dynamic_call = getattr(np, merge_method)
        intensity = merge_method_dynamic_call(intensity, 1)

    intensity_min = min(intensity)
    intensity_max = max(intensity)

    return [
        {'x': int(x), 'y': int(y), 'intensity': float(norm(i, intensity_min, intensity_max))}
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
    keys = []
    for i in selected_points:
        keys.append((i['x'], i['y']))
    keys = [(a, b, ds_name) for a, b, in keys]
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
        post_data_json = json.loads(post_data)
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
        post_data_json = json.loads(post_data)
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


# get graph data for all datasets
@app.route('/datasets/graphdata')
def datasets_all_datasets_all_graphdata_action():
    return json.dumps(graph_data_all_datasets())


if __name__ == '__main__':
    app.run(debug=True)
