from sys import argv
import pandas as pd
import numpy as np
import json
import graph_func
import base64
from mzDataset import mzDataSet
from flask import Flask, abort,request, make_response
from flask_cors import CORS
from PIL import Image
from io import BytesIO
from os import listdir
from os.path import exists, isdir, isfile
import matplotlib.pyplot as plt

datasets = {}
path_to_dataset = 'datasets/'

if len(argv[3:]) == 1:
    if isdir(argv[3]):
        for f in listdir(argv[3]):
            if f.split(".")[1] == "h5":
                dataset_name = f.split(".")[0]
                datasets[dataset_name] = mzDataSet(pd.read_hdf(f).droplevel('dataset').sort_index(), dataset_name)
    else:
        dataset_name = argv[3].split(".")[0]
        datasets[dataset_name] = mzDataSet(pd.read_hdf(path_to_dataset + argv[3]).droplevel('dataset').sort_index(), dataset_name)
else:
    for path in argv[3:]:
        dataset_name = path.split(".")[0]
        datasets[dataset_name] = mzDataSet(pd.read_hdf(path_to_dataset + argv[3]).droplevel('dataset').sort_index(), dataset_name)

pca_dframe = pd.read_hdf('datasets/' + argv[2])
with open('json/' + argv[1], 'r') as file:
    firstDataset = json.load(file)['graphs']['graph0']
    graph_func.graph_initialisation(np.load('datasets/similarity-matrix-{}.npy'.format(firstDataset['dataset'])), firstDataset['threshold'])

del dataset_name

# returns list of allowed merge methods for mz intensities
def merge_methods():
    return ['mean', 'median', 'max', 'min']


# returns names of all available datasets
def dataset_names():
    return list(datasets.keys())


# returns list of all mz_values
def mz_values(ds_name):
    return datasets[ds_name].getMzValues()


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
def image_data_for_dataset_and_mzs(ds_name, mz_values, merge_method, colorscale):
    raw_data = image_data_for_dataset_and_mzs_raw_data(ds_name, mz_values, merge_method)

    pos_x = raw_data[0].astype(int)
    pos_y = raw_data[1].astype(int)
    pos_x_max = pos_x.max() + 1
    pos_y_max = pos_y.max() + 1

    intensity = np.zeros((pos_y_max, pos_x_max, 4))
    colormap = plt.cm.ScalarMappable(plt.Normalize(), cmap=plt.cm.get_cmap(colorscale))
    colormap.set_clim(np.percentile(raw_data[2], (0,100)))
    intensity[(pos_y, pos_x)] = colormap.to_rgba(np.array(raw_data[2]), bytes=True)

    idx = np.indices((pos_y_max, pos_x_max))
    pos = np.dstack((idx[0], idx[1]))
    pos_x = pos[:,:,1].flatten()
    pos_y = pos[:,:,0].flatten()

    intensity = list(intensity.flatten())
    intensity = [intensity[i:i+4] for i in range(0, len(intensity), 4)]
    print('return')

    return [
        {'x': int(x), 'y': int(y), 'color': c}
        for x, y, c in zip(pos_x, pos_y, intensity)
    ]


# does binarization of the selected dataset and a node dataset, keeps only points > min_intensity
# checks for overlap (amount datapoints with 1 in multiplied dataset) higher min_overlap
def selection_match(dframe_selected, dframe_node, min_intensity, min_overlap, merge_method):
    # merge all columns (mzs) by merge_method into one column
    #print("START SELECTION")
    merge_method_dynamic_call = getattr(dframe_selected, merge_method)
    dframe_selected = merge_method_dynamic_call(axis=1)

    # get the maximum for each column and multiply by the min_intensity
    t = np.max(dframe_selected) * min_intensity
    dframe_selected = (dframe_selected < t).astype('float64')  # binarization

    # merge all columns (mzs) by merge_method into one column
    merge_method_dynamic_call = getattr(dframe_node, merge_method)
    dframe_node = merge_method_dynamic_call(axis=1)

    # get the maximum for each column and multiply by the min_intensity
    t = np.max(dframe_node) * min_intensity
    dframe_node = (dframe_node < t).astype('float64')  # binarization

    # find amount of common entries in selected and node dataset
    dframe_multiplied = dframe_selected * dframe_node
    overlap = dframe_multiplied.sum() / len(dframe_selected)
    #print("END SELECTION")
    return overlap >= min_overlap


# returns the names of nodes which are matching based on provided min_intensity and max_overlap
# from frontend
def check_nodes_for_match(ds_name, node_data, selected_mzs, selected_points, merge_method, min_intensity, min_overlap):
    print("START CHECK MATCH")
    single_dframe = merged_dframe.loc[merged_dframe.index.get_level_values("dataset") == ds_name].droplevel('dataset').sort_index()

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
    print("END CHECK MATCH")
    return node_names


# provides data to render all mz images for passed dataset
def image_data_for_dataset(ds_name, colorscale):
    object = {}
    for key, mz in mz_values(ds_name).items():
        object[mz] = image_data_for_dataset_and_mzs(ds_name, [mz], None, colorscale)
    return object


# provides all image data of all datasets and all mzvalues
def image_data_all_datasets(colorscale):
    object = {}
    for ds in dataset_names():
        object.update({ds: image_data_for_dataset(ds, colorscale)})
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
    pos_x = np.array(single_dframe.index.get_level_values("grid_x")).astype(int)
    pos_y = np.array(single_dframe.index.get_level_values("grid_y")).astype(int)

    pos_x_max = pos_x.max() + 1
    pos_y_max = pos_y.max() + 1

    img = np.zeros((pos_y_max, pos_x_max, 4))

    # get the r,g and b values/volumns from the pca
    r = np.array(single_dframe['umapR'])
    g = np.array(single_dframe['umapG'])
    b = np.array(single_dframe['umapB'])

    # norm the rgb values to a number between 0 and 1
    r_norm = np.interp(r, (r.min(), r.max()), (0, 1))
    g_norm = np.interp(g, (g.min(), g.max()), (0, 1))
    b_norm = np.interp(b, (b.min(), b.max()), (0, 1))

    alpha = [1] * len(r)
    if len(mz_values):
        # mz_raw_data returns format [pos_x, pos_y, alpha] from the non-pc dataset, alpha based on
        # passed merge_method
        mz_raw_data = image_data_for_dataset_and_mzs_raw_data(ds_name, mz_values, merge_method)
        alpha = mz_raw_data[2]  # we only need the intensity

        if data_threshold is not None:
            # we have a threshold, so we set all intensities to 0 which are below that threshold
            # using binarization
            alpha[alpha < data_threshold] = 0
            alpha[alpha >= data_threshold] = 1

    img[(pos_y, pos_x, 0)] = r_norm
    img[(pos_y, pos_x, 1)] = g_norm
    img[(pos_y, pos_x, 2)] = b_norm
    img[(pos_y, pos_x, 3)] = alpha

    img = (img * 255).astype(int)

    img = img.flatten().tolist()
    img = [img[i:i+4] for i in range(0, len(img), 4)]

    idx = np.indices((pos_y_max, pos_x_max))
    pos = np.dstack((idx[0], idx[1]))
    pos_x = pos[:,:,1].flatten()
    pos_y = pos[:,:,0].flatten()

    # we return something like this:
    # [{x: 27, y: 22, color: "#1464830c"}, {x: 28, y: 22, color: "#11677809"}, ...]
    # old version {'x': int(x), 'y': int(y), 'color': (np.array(matplotlib.colors.to_rgba([r, g, b, i])) * 255).astype(int).tolist()} for x, y, r, g, b, i in zip(pos_x, pos_y, r_norm, g_norm, b_norm, intensity)
    return [
        {'x': int(x), 'y': int(y), 'color': c}
        for x, y, c in zip(pos_x, pos_y, img)
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
    graph_func.graph_initialisation(np.load('datasets/similarity-matrix-' + dataset_name + '.npy'), threshold)
    return json.dumps('OK')


@app.route('/datasets/<dataset_name>/imagedimensions', methods=['GET'])
def dataset_image_dimension(dataset_name):
    return json.dumps({'height': datasets[dataset_name].getCube().shape[0], 'width': datasets[dataset_name].getCube().shape[1]})

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
    print("START OUTER ROUTINE")
    ret = check_nodes_for_match(
        dataset_name,
        post_data_visible_node_data,
        post_data_selected_mzs,
        post_data_selected_points,
        method,
        post_data_min_intensity,
        post_data_min_overlap
    )
    print("END OUTER ROUTINE")
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
        datasets[dataset_name].getColorImage(
            post_data_mz_values,
            method=methods[method],
            cmap=colorscales[colorscale]),
        mode='RGBA'
    ).save(img_io, 'PNG')
    img_io.seek(0)
    response = make_response('data:image/png;base64,' + base64.b64encode(img_io.getvalue()).decode("utf-8"), 200)
    response.mimetype = "text/plain"
    return response


# get mz image data for dataset for all mz values
@app.route('/datasets/<dataset_name>/imagedata/colorscale/<colorscale>')
def datasets_imagedata_all_mz_action(dataset_name, colorscale):
    if dataset_name not in dataset_names():
        return abort(400)

    return json.dumps(image_data_for_dataset(dataset_name, colorscale))


# get all image data for all datasets and all mz values
@app.route('/datasets/imagedata/colorscale/<colorscale>')
def datasets_all_datasets_all_imagedata_action(colorscale):
    return json.dumps(image_data_all_datasets(colorscale))


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
