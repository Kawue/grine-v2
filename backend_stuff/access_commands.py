from sys import argv
import pandas as pd
import numpy as np

# load dataframe (.h5)
merged_dframe = pd.read_hdf(argv[1])

dataset_names = set(merged_dframe.index.get_level_values("dataset"))

# select on of the 3 data sets
example_ds_name = "barley101_1"
single_dframe = merged_dframe.loc[merged_dframe.index.get_level_values("dataset") == example_ds_name]

# get x positions for all pixels from a selected single data set
pos_x = np.array(single_dframe.index.get_level_values("grid_x"))

# get y positions for all pixels from a selected single data set
pos_y = np.array(single_dframe.index.get_level_values("grid_y"))

# select a single mz image vector from a selected single data set
example_mz = 74.651
single_dframe[example_mz]