# Grine v2

## Project Production startup
### Start:
```
docker-compose up --build -d
```
Visit Browser under `localhost:8080`

### Stop:
```
docker-compose down
```
### Change Dataset:
* Stop Docker container
* Copy JSON into `backend/json` and datasets into `backend/datasets`
* Open `uwsgi.ini` in `backend` and follow the instructions.
* Start Docker container

## Project Development setup

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
python3 api.py real_data.json dimreduce_example.h5 barley101GrineV2.h5
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
