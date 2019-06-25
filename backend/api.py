from sys import argv
import pandas as pd
import numpy as np
import json
from flask import Flask
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
    with open('json/' + argv[1], 'r') as file:
        try:
            data = json.load(file)
        except:
            data = {}
    return data


app = Flask(__name__)
CORS(app)


# get all dataset names
@app.route('/datasets')
def datasets_action():
    return json.dumps(dataset_names())


# get mz values of dataset
@app.route('/datasets/<dataset_name>/mzvalues')
def datasets_mzvalues_action(dataset_name):
    return json.dumps(mz_values(dataset_name))


# get mz image data for dataset and single mz value
# the mz_value_id is provided by /datasets/<dataset_name>/mzvalues
@app.route('/datasets/<dataset_name>/mzvalues/<mz_value_id>/imagedata')
def datasets_imagedata_single_mz_action(dataset_name, mz_value_id):
    mz_value = mz_values(dataset_name)[int(mz_value_id)]
    return json.dumps(image_data_for_dataset_and_mz(dataset_name, mz_value))


# get mz image data for dataset and mz values
# mz values are passed via post request
@app.route('/datasets/<dataset_name>/mzvalues/imagedata')
def datasets_imagedata_multiple_mz_action(dataset_name, mz_value_id):
    mz_value = mz_values(dataset_name)[int(mz_value_id)]
    return json.dumps(image_data_for_dataset_and_mz(dataset_name, mz_value))


# get mz image data for dataset for all mz values
@app.route('/datasets/<dataset_name>/imagedata')
def datasets_imagedata_all_mz_action(dataset_name):
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
