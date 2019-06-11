from sys import argv
import pandas as pd
import numpy as np
import json
from flask import Flask
from flask_cors import CORS

# load dataframe (.h5)
merged_dframe = pd.read_hdf('datasets/' + argv[1])


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
    return (val - min) / (max - min)


# provides data to render image for passed mz_value and dataset
def image_data_for_dataset_and_mz(ds_name, mz_value):
    single_dframe = merged_dframe.loc[merged_dframe.index.get_level_values("dataset") == ds_name]
    pos_x = np.array(single_dframe.index.get_level_values("grid_x"))
    pos_y = np.array(single_dframe.index.get_level_values("grid_y"))
    intensity = list(np.array(single_dframe[mz_value]).astype(float))

    intensity_min = min(intensity)
    intensity_max = max(intensity)

    return [
        {'x': int(x), 'y': int(y), 'intensity': float(norm(i, intensity_min, intensity_max))}
        for x, y, i in zip(pos_x, pos_y, intensity)
    ]


# provides data to render all mz images for passed dataset
def image_data_for_dataset(ds_name):
    object = {}
    for key, mz in mz_values(ds_name).items():
        object[mz] = image_data_for_dataset_and_mz(ds_name, mz)
    return object


# provides all image data of all datasets and all mzvalues
def image_data_all_datasets():
    object = {}
    for ds in dataset_names():
        object.update({ds: image_data_for_dataset(ds)})
    return object


# generates json file for graph
def graph_data_all_datasets():
    with open('json/' + argv[2], 'r') as file:
        try:
            data = json.load(file)
        except:
            data = {}
    return data


app = Flask(__name__)
CORS(app)


@app.route('/datasets')
def datasets_action():
    return json.dumps(dataset_names())


@app.route('/datasets/<dataset_name>/mzvalues')
def datasets_mzvalues_action(dataset_name):
    return json.dumps(mz_values(dataset_name))


@app.route('/datasets/<dataset_name>/mzvalues/<mz_value_id>/imagedata')
def datasets_mzvalues_imagedata_action(dataset_name, mz_value_id):
    mz_value = mz_values(dataset_name)[int(mz_value_id)]
    return json.dumps(image_data_for_dataset_and_mz(dataset_name, mz_value))


@app.route('/datasets/<dataset_name>/imagedata')
def datasets_imagedata_action(dataset_name):
    return json.dumps(image_data_for_dataset(dataset_name))


@app.route('/datasets/imagedata')
def datasets_all_imagedata_action():
    return json.dumps(image_data_all_datasets())


@app.route('/datasets/graphdata')
def datasets_graphdata_action():
    return json.dumps(graph_data_all_datasets())


if __name__ == '__main__':
    app.run(debug=True)
