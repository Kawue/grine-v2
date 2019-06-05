# Grine v2

## Project setup

### Frontend
```
yarn install
yarn serve
```

### Backend
```
pip3 install tables pandas flask
python3 access_commands.py grinev2barleytest.h5
```


## Frontend

### FontAwesome / Vue Awesome
https://justineo.github.io/vue-awesome/demo/
Here is a list of icons: https://github.com/Justineo/vue-awesome/tree/master/src/icons

## Backend

### Api Endpoints
get all dataset names:
/datasets

get mz values of dataset:
/datasets/<dataset_name>/mzvalues
/datasets/barley101_1/mzvalues

get mz image data for dataset and mz value:
/datasets/<dataset_name>/mzvalues/<mz_value_id>/imagedata
/datasets/barley101_1/mzvalues/0/imagedata

get mz image data for dataset for all mz values:
/datasets/<dataset_name>/imagedata
/datasets/barley101_1/imagedata

get all image data for all datasets and all mz values:
/datasets/mzimagedata

get graph data for all datasets
/datasets/graphdata
