# Grine v2

GRINE is an interactive visualization tool for the exploration of community structures in MSI image networks. If you use GRINE for your own work please reference it as [1].

## Data Creation
To start Grine three files need to be provided:
 1. A .HDF5 file that contains the MSI data information.
 2. A .JSON file that contains the community detection and graph information.
 3. A .NPY file that contains the dimension reduction information.

For 1. we refer to our preprocessing pipeline [A Mad Pie](https://github.com/Kawue/amadpie/) . For a self written processing we refer to [pyImzML-Parser](https://github.com/alexandrovteam/pyimzML/blob/master/pyimzml/ImzMLParser.py) and [Pandas](https://pandas.pydata.org/) .

For 2. we refer to our [MSI Community Detection Project](https://github.com/Kawue/msi-community-detection). The theory is explained in [1].

For 3. We refer to [?](www.google.de).

All three projects produce the needed data files, which can then be used to start GRINE as stated below.

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
* Open `backend/uwsgi.ini` and follow the instructions.
* Start Docker container

## Handbook
### Graph:
* Zoom with mouse wheel
* Reposition camera with Drag and Drop on background
* Rearrange nodes with Drag and Drop
* Expand Node with CTRL + Click on Node
* Shrink Node with CTRL + SHIFT + Click on Node

### MzList:
* Shrink and expand widget with arrow in top right corner
* Click on mz value to highlight nodes which contains this mz value
* Mark multiple mz value to mark multiple nodes
* Double click on mz value to annotate this mz value
* Click on "sticky note" icon to show annotations or mz value
* Click on "eye" icon to show all or only mz values of highlighted nodes
* Click on "sort"icon to sort mz values in increasing or decreasing order

### ImagePanel:
* Shrink and expand widget with arrow in top right corner
* Click on image to move it to cache canvas
* The cache canvas offers a lasso selection of interesting regions. This triggers the image-to-graph workflow, which allows to search for images with specific distributions within the graph.
* Selecting DR activates the dimension reduction image comparison.
	* The dimension reduction image (DR image) is an RGBA image which is build by encoding one dimension reduction component image in each color channel.
	* The alpha value is used to visualize the regions where the cached image overlaps with the DR image. If relative is activated the intensity value of the cached image encodes the alpha value, where the highest intensity equals to alpha equal to one and the lowest equals to alpha equal to zero. If relative is deactivated the percentage slider defines a threshold (t) of X% of the intensity maximum within the cached image. Every pixel with a lower intensity than t is set to alpha equal to zero, while the other pixels are set to alpha equal to one.

### Options:
Click on gearwheel to open option tabs
####Network
* Slider: edge length, repulsion of nodes and iterations for the automatic graph layout
* Center camera to reset zoom and movements of camera
* Center nodes to center camera and move all nodes back to the center
* Toggle mode between Free and Lasso Mode
	* Free Mode: Move camera freely
	* Lasso Mode: Draw a lasso to select nodes
#### Image
* Aggregation method for mz images. This method is applied to render the community images, as well as the aggregation images.
* Select colorscale for images and NodeTrix
* Select a minimal intensity and a minimal overlap for the image-to-graph workflow.
	* Image-to-graph workflow: for this workflow direction a region of interest has to be selected in the cached image. Based on the selection the images of the currently visible nodes are examined. Nodes are marked if their images contain a distribution pattern that overlaps with the region of interest.
	* Minimal intensity: Mass Spectromtry Images contain a lot of noise and pixel to pixel intensity variation. Therefore the overlap is calculated based on binarized images. The minimal intensity defines the binarization threshold.
	* Minimum overlap: In mosts cases a 100% overlap not given. Also, pattern that overlap to a specific percentage X with a give pattern can be as interesting as the ones that overlap to 100%. The minimum overlap allows to detect all images that reach a overlap of at least X% in the selected region.
#### Data
* Select dataset
* Export JSON
* Select graph statistic and start query, Results will be displayed in the mz List 

### Others
* "Clear" button to clear all selections
* Click on container which show the current mode to toggle this mode
####NodeTrix
* Select nodes by clicking single nodes or multiplie nodes with lasso selection
* Click NodeTrix button to aktivate NodeTrix of selected nodes
* Left row of nodes is selectable by lasso selection
* Change colorscale under image options

#### Split
* Select nodes from one community whoch should be seperated
#### Merge
* Select nodes from different communities which should be merge
* Select nodes in the following dialog into which all nodes should be merged
#### Reassignment
* Select nodes which should be reassinged and one node from the community to which is the new parent
* Select new parent in the following dialog

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

### Run project
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




[1]: https://bmcbioinformatics.biomedcentral.com/articles/10.1186/s12859-019-2890-6
