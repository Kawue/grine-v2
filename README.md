# COBI-GRINE

COBI-GRINE is an interactive visualization tool for the exploration of community structures in MSI image networks. If you use COBI-GRINE for your own work please reference it as [1].

## Data Creation
To start COBI-GRINE four files need to be provided:
 1. A .HDF5 file that contains the MSI data information.
 2. A .JSON file that contains the community detection and graph information.
 3. A .NPY file that contains the dimension reduction information.
 4. A .NPY file that contains the similarity matrix information.

For 1. we refer to our processing pipeline [ProViM](https://github.com/Kawue/provim). For a self written processing we refer to [pyImzML-Parser](https://github.com/alexandrovteam/pyimzML/blob/master/pyimzml/ImzMLParser.py) and [Pandas](https://pandas.pydata.org/) .

For 2. to 4. we refer to our [MSI Community Detection Project](https://github.com/Kawue/msi-community-detection). The theory is explained in [1].

## Project Production startup
Docker is not compatible with Windows 7, 8 and 10 Home. For details about a workaround see instructions below. 
### First time usage
This command is only necessary when you use COBI-GRINE for the first time.
```
docker-compose build
```
### Start:
```
docker-compose up -d
```
Visit Browser under `localhost:8080`

### Stop:
```
docker-compose down
```
### Load new Dataset:
* Stop Docker container with `docker-compose down`
* Copy JSON into `backend/data/json`. The name of the file is irrelevant.
* For every graph in the JSON file identify the dataset name, which you can find in the JSON file itself. The name should be unique for every dataset.
* Copy every dataset file into `backend/data/dataset`. The name of the files must have the pattern `<dataset_name>.h5`, where `<dataset_name>` is the placeholder for the real dataset name.
* Copy the computed similarity matrices into `backend/data/matrix`. The name of the files must have the pattern `similarity-matrix-<dataset_name>.npy`, where `<dataset_name>` is the placeholder for the real dataset name.
* (Optional)
Copy every dimensionality reduction data file into `backend/data/dimreduce`. The files will be automatically detected and loaded, if the name of the files begins with`dimreduce-<dataset_name>`.
* (Optional)
Create a new folder in `backend/data/histo-images` where the folder name is a dataset name. Copy every hisopathology image into this folder. The images will be automatically detected and loaded.
* Open `backend/uwsgi.ini`. Search the lines which starts with `pyargv = ...` and replace it with `pyargv = -j <json_file>` where `<json_file>` is the placeholder for the name of your json file.
* Start Docker container with `docker-compose up -d`

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
#### Network
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
#### Network
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
#### NodeTrix
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
python3 api.py -j real_data.json
```

```
cd frontend
yarn serve
```

## Docker on Windows 7, 8 and 10 Home
1. Visit [Docker](https://docs.docker.com/toolbox/toolbox_install_windows/). Follow the given instructions and install all required software to install the Docker Toolbox on Windows.
2. Control if virtualization is enabled on your system. Task Manager -> Performance tab -> CPU -> Virtualization. If it is enabled continue with Step X.
3. If virtualization is disabled, it needs to be enabled in your BIOS. Navigate into your systems BIOS and look for Virtualization Technology (VT). Enable VT, save settings and reboot. This option is most likely part of the Advanced or Security tab. This step can deviate based on your Windows and Mainboard Manufacturer.
4. Open your CMD as administrator and call `docker-machine create default --virtualbox-no-vtx-check`. A restart may be required.
5. In your OracleVM VirtualBox selected the appropriate machine (probably the one labeled "default") -> Settings -> Network -> Adapter 1 -> Advanced -> Port Forwarding. Click on "+" to add a new rule and set Host Port to 8080 and Guest Port to 8080. Be sure to leave Host IP and Guest IP empty. Also, add another rule for the Port 5000 in the same way. A restart of your VirtualBox may be needed.
6. Now you should be ready to use the Docker QuickStart Shell to call the Docker commands provided to start this tool.


[1]: https://bmcbioinformatics.biomedcentral.com/articles/10.1186/s12859-019-2890-6
