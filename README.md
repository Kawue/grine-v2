1. Wenn in der mz Liste mehrere Werte markiert werden, dann werden das mz Bild und das aggregate Bild getriggert.
Es sollte aber nur das aggregate sein.

5. Wenn das Lasso aktiv ist, es wird ein Knoten zur Kontrolle angeklickt und das neue Bild wird in den
Cache geladen, dann kann wieder im Graphen geklickt werden und alle Knoten morphen sich.
Gleichzeitig bleibt der im Cache ausgewählt. Das lässt sich nun auf 2 Arten lösen:
a) Es kann kein neues Bild in den Cache geladen werden, wenn das Lasso aktiv ist.
b) Wenn ein neues Bild in den Cache geladen wird, dann wird das Lasso gelöst, der
Graph freigegeben und der Knoten zu dem in den Cache geladenen Bild wird markiert.




# Grine v2

## Project setup

### Frontend
```
cd frontend
yarn install
yarn serve
```

### Backend
```
cd backened
pip3 install -r requirements.txt
```

## Run project
`./run/frontend.sh`
`./run/backend.sh`

or manually:

```
cd backend
python3 api.py grinev2barleytest.h5 test_new_json.json
```

```
cd frontend
yarn serve
```


## Frontend

### FontAwesome / Vue Awesome
https://justineo.github.io/vue-awesome/demo/
Here is a list of icons: https://github.com/Justineo/vue-awesome/tree/master/src/icons

### Vue Loading Spinner
https://nguyenvanduocit.github.io/vue-loading-spinner/

## Backend

### Api Endpoints
returns available merge methods if mz image of multiple images is queried
GET /mz-merge-methods

get all dataset names:
GET /datasets

get mz values of dataset:
GET /datasets/<dataset_name>/mzvalues
GET /datasets/barley101_1/mzvalues

get mz image data for dataset and mz values, mz values are passed via post request
POST /datasets/<dataset_name>/mzvalues/imagedata
POST /datasets/barley101_1/mzvalues/imagedata

get mz image data for dataset for all mz values:
GET /datasets/<dataset_name>/imagedata
GET /datasets/barley101_1/imagedata

get all image data for all datasets and all mz values:
GET /datasets/mzimagedata

get graph data for all datasets
GET /datasets/graphdata
