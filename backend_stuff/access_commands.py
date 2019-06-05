from sys import argv
import pandas as pd
import numpy as np
import json
from flask import Flask

# load dataframe (.h5)
merged_dframe = pd.read_hdf(argv[1])


# select one of the 3 data sets
example_ds_name = "barley101_1"


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
    return mzs


# provides data to render image for passed mz_value
def mz_image_data(ds_name, mz_value):
    single_dframe = merged_dframe.loc[merged_dframe.index.get_level_values("dataset") == ds_name]

    # get x positions for all pixels from a selected single data set
    pos_x = np.array(single_dframe.index.get_level_values("grid_x"))

    # get y positions for all pixels from a selected single data set
    pos_y = np.array(single_dframe.index.get_level_values("grid_y"))

    # select a single mz image vector from a selected single data set

    intensity = list(np.array(single_dframe[mz_value]).astype(float))

    return [{'x': int(x), 'y': int(y), 'intensity': float(i)} for x, y, i in zip(pos_x, pos_y, intensity)]


#print(intensity)
#print(test[:, 2])
#print(single_dframe[example_mz])
#print(single_dframe[example_mz][4])
#intensity = np.array(single_dframe.index.get_level_values(example_mz))
#print(intensity)
#print(single_dframe[example_mz])


app = Flask(__name__)


@app.route('/datasets')
def datasets_action():
    return json.dumps(dataset_names())


@app.route('/mzvalues')
def mz_values_action():
    return json.dumps(mz_values(dataset_names()[0]))


@app.route('/mzdata')
def mz_data_action():
    return json.dumps(mz_image_data(dataset_names()[0], 74.651))


if __name__ == '__main__':
    app.run(debug=True)
