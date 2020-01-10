import Vue from 'vue';
import Vuex from 'vuex';
import OptionsService from './services/OptionsService';
import MzListService from './services/MzListService';
import NetworkService from './services/NetworkService';
import axios from 'axios';
import * as _ from 'lodash';
import * as imageIndex from './constants';

Vue.use(Vuex);
Vue.config.devtools = true;

const optionsService = new OptionsService();
const mzListService = new MzListService();
// const imageService = new ImageService();
const networkService = new NetworkService();

const API_URL = 'http://localhost:5000';

export default new Vuex.Store({
  state: {
    loadingGraphData: true, // api fetch for graph data is running
    originalGraphData: {}, // graph data api return
    meta: {
      maxHierarchy: 1,
      maxGraphs: 1,
      threshold: 0,
    },
    images: {
      originalWidth: null,
      originalHeight: null,
      width: null,
      height: null,
      ScaleFactorObject: { 
        "Smallest": 0.25,
        "Smaller": 0.33,
        "Small": 0.5,
        "Original": 1,
        "Large": 2,
        "Larger": 3,
        "Largest": 4,
      },
      imageData: [
        {
          // imageIndex.COMMUNITY data used to render community image
          mzValues: [],
          base64Image: null, // points that are displayed as mz image
          selectedPoints: [], // points that are selected by the lasso
          lassoFetching: false, // true during api call of lasso matching
        },
        {
          // imageIndex.SELECTED_MZ data used to render image from selected mz values
          mzValues: [],
          base64Image: null, // points that are displayed as mz image
          selectedPoints: [], // points that are selected by the lasso
          lassoFetching: false, // true during api call of lasso matching
        },
        {
          // imageIndex.AGGREGATED data used to render image from multiple selected nodes
          mzValues: [],
          base64Image: null, // points that are displayed as mz image
          selectedPoints: [], // points that are selected by the lasso
          lassoFetching: false, // true during api call of lasso matching
        },
        {
          // imageIndex.LASSO data used to render image copied from other images
          mzValues: [],
          base64Image: null, // points that are displayed as mz image
          selectedPoints: [], // points that are selected by the lasso
          lassoFetching: false, // true during api call of lasso matching
        },
        {
          // imageIndex.DIM_RED data used to render the dimred image
          mzValues: [],
          base64Image: null, // points that are displayed as mz image
          selectedPoints: [], // points that are selected by the lasso
          lassoFetching: false, // true during api call of lasso matching
          available: false,
        },
        {
          // imageIndex.HIST data used to render the histopathologie image
          mzValues: [],
          base64Image: null, // points that are displayed as mz image
          selectedPoints: [], // points that are selected by the lasso
          lassoFetching: false, // true during api call of lasso matching
          alpha: 0.5,
          showOverlay: false,
          overlayDimRed: false,
          availableImages: [],
          histoImageIndex: 0,
          lassoActive: false,
        },
      ],
      loadingImageData: false, // api fetch for image data is running
    },
    mzList: {
      selectedMz: [],
      visibleMz: [],
      notVisibleMz: [],
    },
    network: {
      svgElements: {
        svg: null,
        nodeElements: null,
        linkElements: null,
        zoom: null,
        lasso: null,
      },
      simulation: null,
      nodes: [],
      edges: [],
      lassoMode: true,
      nodeTrix: {
        nodeTrixPossible: false,
        nodeTrixActive: false,
        minWeight: 0,
        maxWeight: 1,
        colorScale: null,
        oldElements: {
          oldNodes: [],
        },
        newElements: {
          newNodes: [],
          newEdges: [],
          nodeTrixNode: null,
        },
      },
      clusterChange: {
        compute: false,
        split: {
          oldGroup: [],
          newGroup: [],
          possible: false,
        },
        merge: {
          mergePossible: false,
          assignmentPossible: false,
          nodes: [],
        },
      },
    },
    options: {
      state: {
        // state of options widget
        tabActive: null,
        tabLocked: null,
        tabsExpanded: false,
      },
      network: {
        repulsion: -50,
        iterations: 300,
        edgeLength: 150,
      },
      graphStatistic: 'degree',
      image: {
        mergeMethod: null, // default will be first in array returned from api
        mergeMethods: [], // queries from api
        minIntensity: 20, // in %
        minOverlap: 80, // in %
        colorScale: 'interpolateViridis',
        colorScales: {
          interpolateMagma: 'Magma',
          interpolatePiYG: 'PiYG',
          interpolateViridis: 'Viridis',
          interpolatePlasma: 'Plasma',
          interpolateInferno: 'Inferno',
        },
        imageScaleFactor: "Original",
        dimred: {
          show: false,
          relative: true,
          threshold: 50, // in %
        },
      },
      mzList: {
        showAll: false,
        showAnnotation: true,
        asc: true,
      },
      data: {
        graph: 0, // selected graph
        graphChoices: {}, // available graphs for selection
      },
    },
  },
  getters: {
    getWholeData: state => {
      return state.originalGraphData;
    },
    getLoadingGraphData: state => {
      return state.loadingGraphData;
    },
    getLoadingImageData: state => {
      return state.images.loadingImageData;
    },
    getMzValues: state => {
      if (state.loadingGraphData) {
        return;
      }
      return state.originalGraphData.graphs['graph' + state.options.data.graph]
        .mzs;
    },
    getGraphData: state => {
      if (state.loadingGraphData) {
        return;
      }
      return state.originalGraphData.graphs;
    },
    getGraph: state => {
      if (state.loadingGraphData) {
        return;
      }
      return state.originalGraphData.graphs['graph' + state.options.data.graph]
        .graph;
    },
    getHistoAlpha: state => {
      return state.images.imageData[imageIndex.HIST].alpha;
    },
    getHistoImages: state => {
      return state.images.imageData[imageIndex.HIST].availableImages;
    },
    getHistoAvailable: state => {
      return state.images.imageData[imageIndex.HIST].availableImages.length > 0;
    },
    getHistoImageIndex: state => {
      return state.images.imageData[imageIndex.HIST].histoImageIndex;
    },
    getHistoImageLassoActive: state => {
      return state.images.imageData[imageIndex.HIST].lassoActive;
    },
    getDimRedAvailable: state => {
      return state.images.imageData[imageIndex.DIM_RED].available;
    },
    getDimRedThreshold: state => {
      return state.options.image.dimred.threshold;
    },
    getDimRedRelative: state => {
      return state.options.image.dimred.relative;
    },
    getImageScaleFactor: state => {
      return state.options.image.imageScaleFactor;
    },
    getImageScaleFactorValue: state => {
      return state.images.ScaleFactorObject[state.options.image.imageScaleFactor];
    },
    getImageData: state => index => {
      return state.images.imageData[index];
    },
    getImageWidth: state => {
      return state.images.width;
    },
    getHistoDimRedOverlay: state => {
      return state.images.imageData[imageIndex.HIST].overlayDimRed;
    },
    getImageHeight: state => {
      return state.images.height;
    },
    getOptionsImage: state => {
      return state.options.image;
    },
    getOptionsState: state => {
      return state.options.state;
    },
    getOptionsData: state => {
      return state.options.data;
    },
    meta: state => {
      return state.meta;
    },
    mzListGraph: state => {
      return state.options.mzList;
    },
    mzListOptions: state => {
      return state.options.graph;
    },
    mzListOptionsSelectedMz: state => {
      return state.mzList.selectedMz;
    },
    mzListOptionsVisibleMz: state => {
      return state.mzList.visibleMz;
    },
    mzListOptionsNotVisibleMz: state => {
      return state.mzList.notVisibleMz;
    },
    mzListOptionsShowAll: state => {
      return state.options.mzList.showAll;
    },
    mzListOptionsShowAnnotation: state => {
      return state.options.mzList.showAnnotation;
    },
    mzListOptionsAsc: state => {
      return state.options.mzList.asc;
    },
    networkOptions: state => {
      return state.options.network;
    },
    networkLassoMode: state => {
      return state.network.lassoMode;
    },
    networkSVGElements: state => {
      return state.network.svgElements;
    },
    networkSimulation: state => {
      return state.network.simulation;
    },
    networkEdges: state => {
      return state.network.edges;
    },
    networkNodes: state => {
      return state.network.nodes;
    },
    networkNodeTrixPossible: state => {
      return state.network.nodeTrix.nodeTrixPossible;
    },
    networkNodeTrixActive: state => {
      return state.network.nodeTrix.nodeTrixActive;
    },
    networkNodeTrixOldElements: state => {
      return state.network.nodeTrix.oldElements;
    },
    networkNodeTrixNewElements: state => {
      return state.network.nodeTrix.newElements;
    },
    networkClusterSplitPossible: state => {
      return state.network.clusterChange.split.possible;
    },
    networkNodeMergePossible: state => {
      return state.network.clusterChange.merge.mergePossible;
    },
    networkChangeAssignmentPossible: state => {
      return state.network.clusterChange.merge.assignmentPossible;
    },
    networkMergeNodes: state => {
      return state.network.clusterChange.merge.nodes;
    },
    networkComputeClusterChange: state => {
      return state.network.clusterChange.compute;
    },
    networkGraphStatistic: state => {
      return state.options.graphStatistic;
    },
    stateOptionsGraph: state => {
      return state.options.data.graph;
    },
    optionsDataGraphChoices: state => {
      return state.options.data.graphChoices;
    },
    optionsImageMergeMethodChoices: state => {
      return state.options.image.mergeMethods;
    },
    optionsImageColorScaleChoices: state => {
      return state.options.image.colorScales;
    },
    isMzLassoSelectionActive: state => {
      return state.images.imageData[imageIndex.LASSO].selectedPoints.length > 0;
    },
  },
  mutations: {
    SET_LOADING_IMAGE_DATA: (state, loading) => {
      state.images.loadingImageData = loading;
    },
    SET_IMAGE_DATA_SELECTED_POINTS: (state, payload) => {
      let index = payload[0];
      let data = payload[1];
      let mzImageData = state.images.imageData[index];
      mzImageData.selectedPoints = data;
    },
    CLEAR_IMAGE: (state, index) => {
      state.images.imageData[index].mzValues = [];
      if (!(index === imageIndex.DIM_RED)) {
        state.images.imageData[index].base64Image = null;
      }
    },
    CLEAR_IMAGES: state => {
      for (const index of [
        imageIndex.COMMUNITY,
        imageIndex.SELECTED_MZ,
        imageIndex.AGGREGATED,
      ]) {
        state.images.imageData[index].mzValues = [];
        state.images.imageData[index].base64Image = null;
      }
    },
    SET_IMAGE_DIMENSIONS: (state, payload) => {
      state.images.originalWidth = payload.width;
      state.images.originalHeight = payload.height;
      let scaleFactor = state.images.ScaleFactorObject[state.options.image.imageScaleFactor];
      state.images.width = Math.ceil(payload.width * scaleFactor);
      state.images.height = Math.ceil(payload.height * scaleFactor);
    },
    SET_IMAGE_DATA_VALUES: (state, payload) => {
      state.images.imageData[payload[0]].base64Image = payload[1];
    },
    SET_AVAILABLE_IMAGES: (state, payload) => {
      state.images.imageData[imageIndex.HIST].availableImages = payload[
        'histo'
      ].map(item => item.split('.')[0]);
      state.images.imageData[imageIndex.DIM_RED].available =
        payload['dimreduce'];
    },
    IMAGE_DATA_UPDATE_FROM_SELECTED_NODES: state => {
      const nodesSelected = NetworkService.getSelectedNodes(
        state.network.nodes,
        false
      ).concat(NetworkService.getSelectedNodeTrixNodes());
      const arraysMatch = (arr1, arr2) => {
        // Check if the arrays are the same length
        if (arr1.length !== arr2.length) return false;

        // Check if all items exist and are in the same order
        for (let i = 0; i < arr1.length; i++) {
          if (arr1[i] !== arr2[i]) return false;
        }

        // Otherwise, return true
        return true;
      };

      if (nodesSelected.length === 0) {
        state.images.imageData[imageIndex.COMMUNITY].mzValues = [];
        state.images.imageData[imageIndex.COMMUNITY].base64Image = null;
        state.images.imageData[imageIndex.AGGREGATED].mzValues = [];
        state.images.imageData[imageIndex.AGGREGATED].base64Image = null;
      } else if (nodesSelected.length === 1) {
        state.images.imageData[imageIndex.AGGREGATED].mzValues = [];
        state.images.imageData[imageIndex.AGGREGATED].base64Image = null;

        if (nodesSelected[0].mzs.length > 1) {
          if (
            !arraysMatch(
              state.images.imageData[imageIndex.COMMUNITY].mzValues,
              nodesSelected[0].mzs
            )
          ) {
            state.images.imageData[imageIndex.COMMUNITY].mzValues =
              nodesSelected[0].mzs;
          }
        } else if (nodesSelected[0].parent) {
          // find mzs of highest parent community
          const graph =
            state.originalGraphData.graphs['graph' + state.options.data.graph]
              .graph;
          let parentNode = NetworkService.getRootParentNodeFromNode(
            nodesSelected[0],
            graph
          );
          if (
            !arraysMatch(
              state.images.imageData[imageIndex.COMMUNITY].mzValues,
              parentNode.mzs
            )
          ) {
            state.images.imageData[imageIndex.COMMUNITY].mzValues =
              parentNode.mzs;
          }
        }
      } else if (nodesSelected.length > 1) {
        state.images.imageData[imageIndex.SELECTED_MZ].mzValues = [];
        state.images.imageData[imageIndex.SELECTED_MZ].base64Image = null;
        state.images.imageData[imageIndex.COMMUNITY].mzValues = [];
        state.images.imageData[imageIndex.COMMUNITY].base64Image = null;
        const mzs = [];
        for (const node of nodesSelected) {
          mzs.push(node.mzs);
        }
        state.images.imageData[imageIndex.AGGREGATED].mzValues = mzs.flat();
      }
    },
    IMAGE_COPY_INTO_SELECTION_IMAGE: (state, index) => {
      state.images.imageData[imageIndex.LASSO].mzValues = _.cloneDeep(
        state.images.imageData[index].mzValues
      );
      state.images.imageData[imageIndex.LASSO].base64Image = _.clone(
        state.images.imageData[index].base64Image
      );
      if (state.images.imageData[imageIndex.HIST].availableImages.length > 0) {
        state.images.imageData[imageIndex.HIST].showOverlay = true;
        state.images.imageData[imageIndex.HIST].overlayDimRed = false;
      }
      if (state.images.imageData[imageIndex.DIM_RED].available) {
        state.images.imageData[imageIndex.DIM_RED].mzValues = _.cloneDeep(
          state.images.imageData[index].mzValues
        );
      }
    },
    SET_DIMRED_AS_HISTO_OVERLAY: state => {
      state.images.imageData[imageIndex.HIST].showOverlay = true;
      state.images.imageData[imageIndex.HIST].overlayDimRed = true;
    },
    SET_HISTO_ALPHA: (state, alpha) => {
      state.images.imageData[imageIndex.HIST].alpha = alpha;
    },
    SET_HISTO_IMAGE_INDEX: (state, index) => {
      state.images.imageData[imageIndex.HIST].histoImageIndex = index;
    },
    SET_SHOW_HISTO_OVERLAY: (state, show) => {
      state.images.imageData[imageIndex.HIST].showOverlay = show;
      if (!show) {
        state.images.imageData[imageIndex.HIST].overlayDimRed = false;
      }
    },
    SET_HISTO_IMAGE_LASSO_ACTIVE: (state, value) => {
      state.images.imageData[imageIndex.HIST].lassoActive = value;
    },
    SET_LOADING_GRAPH_DATA: (state, loading) => {
      state.loadingGraphData = loading;
    },
    SET_ORIGINAL_GRAPH_DATA: (state, originalData) => {
      state.originalGraphData = originalData;

      // set options choices for dataset selection
      for (let graph in originalData['graphs']) {
        if (originalData['graphs'].hasOwnProperty(graph)) {
          state.options.data.graphChoices[graph.replace('graph', '')] =
            originalData['graphs'][graph]['dataset'];
        }
      }
      //state.options.data.graph = 0;
    },
    SET_NETWORK_OPTIONS: (state, options) => {
      state.options.network = options;
      NetworkService.updateSimulationParameters(
        state.network.simulation,
        options
      );
    },
    NETWORK_FREE_MODE: state => {
      state.network.lassoMode = true;
      networkService.toggleNetworkMode(
        state.network.lassoMode,
        state.network.svgElements
      );
    },
    NETWORK_TOGGLE_MODE: state => {
      state.network.lassoMode = !state.network.lassoMode;
      networkService.toggleNetworkMode(
        state.network.lassoMode,
        state.network.svgElements
      );
    },
    NETWORK_INIT_SVG: state => {
      state.network.svgElements = networkService.initSVG(
        state.network.nodes,
        state.network.edges,
        state.network.lassoMode
      );
    },
    NETWORK_SIMULATION_INIT: state => {
      state.network.simulation = networkService.initSimulation(
        state.network.simulation,
        state.network.nodes,
        state.network.edges,
        state.options.network,
        state.network.nodeTrix.newElements.nodeTrixNode,
        state.network.nodeTrix.newElements.newEdges,
        state.network.nodeTrix.newElements.newNodes.slice(
          0,
          state.network.nodeTrix.newElements.newNodes.length / 4
        )
      );
      state.network.svgElements.lasso.items(NetworkService.getLassoSVGNodes());
    },
    NETWORK_LOAD_GRAPH: state => {
      const tupel = networkService.loadGraph(
        state.originalGraphData.graphs['graph' + state.options.data.graph].graph
      );
      state.network.nodes = tupel[0];
      state.network.edges = tupel[1];
      const minMaxTupel = NetworkService.findMinMaxWeight(
        state.originalGraphData.graphs['graph' + state.options.data.graph]
          .graph['hierarchy' + state.meta.maxHierarchy].edges
      );
      state.network.nodeTrix.minWeight = minMaxTupel[0];
      state.network.nodeTrix.maxWeight = minMaxTupel[1];
    },
    NETWORK_EXPAND_NODE: (state, node) => {
      const hierarchy = NetworkService.hierarchyOfNodeName(node.name);
      if (hierarchy < state.meta.maxHierarchy && node.mzs.length > 1) {
        networkService.expandNode(
          state.originalGraphData.graphs['graph' + state.options.data.graph]
            .graph,
          node,
          state.network.nodes,
          state.network.edges
        );
      }
    },
    NETWORK_SHRINK_NODE: (state, node) => {
      const hierarchy = NetworkService.hierarchyOfNodeName(node.name);
      if (hierarchy > 0) {
        networkService.shrinkNode(
          state.originalGraphData.graphs['graph' + state.options.data.graph]
            .graph,
          node,
          state.network.nodes,
          state.network.edges
        );
      }
    },
    NETWORK_CENTER_NODES: state => {
      networkService.centerNodes(
        state.network.nodes,
        state.network.simulation,
        state.network.svgElements.zoom
      );
    },
    NETWORK_CENTER_CAMERA: state => {
      networkService.centerCamera(state.network.svgElements.zoom);
    },
    NETWORK_GRAPH_STATISTIC: (state, stat) => {
      state.options.graphStatistic = stat;
    },
    NETWORK_COMPUTE_NODETRIX: state => {
      state.network.nodeTrix.nodeTrixPossible = false;
      state.network.nodeTrix.nodeTrixActive = true;
      state.network.clusterChange.split.possible = false;
      state.network.clusterChange.merge.mergePossible = false;
      state.network.clusterChange.merge.assignmentPossible = false;
      networkService.computeNodeTrix(
        state.originalGraphData.graphs['graph' + state.options.data.graph]
          .graph,
        state.network.nodes,
        state.network.edges,
        state.meta.maxHierarchy,
        state.network.nodeTrix.colorScale,
        [state.network.nodeTrix.minWeight, state.network.nodeTrix.maxWeight]
      );
    },
    NETWORK_NODETRIX_RESET: state => {
      state.network.nodeTrix.nodeTrixActive = false;
      state.network.clusterChange.split.possible = false;
      state.network.clusterChange.merge.mergePossible = false;
      state.network.clusterChange.merge.assignmentPossible = false;
      networkService.resetNodeTrix(state.network.nodes, state.network.edges);
      if (
        NetworkService.getSelectedNodes(state.network.nodes, false).length === 0
      ) {
        state.network.nodeTrix.nodeTrixPossible = false;
      }
    },
    NETWORK_NODETRIX_CHANGE_COLORSCALE: state => {
      state.network.nodeTrix.colorScale = networkService.computeColorScale(
        state.options.image.colorScale,
        state.network.nodeTrix.minWeight,
        state.network.nodeTrix.maxWeight
      );
      networkService.redrawNodeTrix(state.network.nodeTrix.colorScale, [
        state.network.nodeTrix.minWeight,
        state.network.nodeTrix.maxWeight,
      ]);
    },
    NETWORK_SPLIT_CLUSTER_POSSIBLE: (state, data) => {
      state.network.clusterChange.split.possible = true;
      state.network.clusterChange.split.newGroup = data[0];
      state.network.clusterChange.split.oldGroup = data[1];
    },
    NETWORK_MERGE_NODES_POSSIBLE: (state, nodes) => {
      state.network.clusterChange.merge.mergePossible = true;
      state.network.clusterChange.merge.nodes = nodes;
    },
    NETWORK_ASSIGNMENT_CHANGE_POSSIBLE: (state, nodes) => {
      state.network.clusterChange.merge.assignmentPossible = true;
      state.network.clusterChange.merge.nodes = nodes;
    },
    NETWORK_CHANGE_ASSIGNMENT: (state, parentIndex) => {
      state.network.clusterChange.compute = true;
      state.network.clusterChange.split.possible = false;
      state.network.clusterChange.merge.mergePossible = false;
      state.network.clusterChange.merge.assignmentPossible = false;
      networkService.changeNodesAssignment(
        state.originalGraphData.graphs['graph' + state.options.data.graph],
        state.network.clusterChange.merge.nodes,
        parentIndex
      );
      state.network.clusterChange.merge.nodes = [];
      state.network.clusterChange.compute = false;
    },
    NETWORK_MERGE_NODES: (state, nodeIndex) => {
      state.network.clusterChange.compute = true;
      networkService.mergeNodes(
        state.originalGraphData.graphs['graph' + state.options.data.graph],
        state.network.clusterChange.merge.nodes,
        nodeIndex,
        state.network.nodes,
        state.network.edges
      );
      state.network.clusterChange.split.possible = false;
      state.network.clusterChange.merge.mergePossible = false;
      state.network.clusterChange.merge.assignmentPossible = false;
      state.network.clusterChange.compute = false;
    },
    NETWORK_SPLIT_CLUSTER: state => {
      state.network.clusterChange.compute = true;
      state.network.clusterChange.split.possible = false;
      state.network.clusterChange.merge.mergePossible = false;
      state.network.clusterChange.merge.assignmentPossible = false;
      networkService.splitCluster(
        state.originalGraphData.graphs['graph' + state.options.data.graph],
        state.network.clusterChange.split.newGroup,
        state.network.clusterChange.split.oldGroup
      );
      state.network.clusterChange.split.newGroup = [];
      state.network.clusterChange.split.oldGroup = [];
      state.network.clusterChange.compute = false;
    },
    OPTIONS_IMAGE_UPDATE: (state, { data }) => {
      state.options.image = data;
    },
    OPTIONS_STATE_UPDATE: (state, data) => {
      state.options.state = {
        ...state.options.state,
        ...data,
      };
    },
    OPTIONS_IMAGE_MERGE_METHODS_UPDATE: (state, data) => {
      state.options.image.mergeMethods = data;
      state.options.image.mergeMethod = data[0];
    },
    OPTIONS_MZLIST_TOOGLE_ASC: state => {
      state.options.mzList.asc = !state.options.mzList.asc;
    },
    OPTIONS_MZLIST_TOOGLE_SHOW_ALL: state => {
      state.options.mzList.showAll = !state.options.mzList.showAll;
    },
    OPTIONS_MZLIST_TOOGLE_SHOW_ANNOTATION: state => {
      state.options.mzList.showAnnotation = !state.options.mzList
        .showAnnotation;
    },
    OPTIONS_IMAGE_CHANGE_MERGE_METHOD: (state, mergeMethod) => {
      state.options.image.mergeMethod = mergeMethod;
    },
    OPTIONS_IMAGE_CHANGE_COLOR_SCALE: (state, colorScale) => {
      state.options.image.colorScale = colorScale;
    },
    OPTIONS_IMAGE_CHANGE_IMAGE_SCALE_FACTOR: (state, data) => {
      state.options.image.imageScaleFactor = data;
    },
    OPTIONS_IMAGE_CHANGE_MIN_INTENSITY: (state, data) => {
      state.options.image.minIntensity = data;
    },
    OPTIONS_IMAGE_DIM_RED_CHANGE_THRESHOLD: (state, data) => {
      state.options.image.dimred.threshold = data;
    },
    OPTIONS_IMAGE_DIM_RED_CHANGE_RELATIVE: (state, data) => {
      state.options.image.dimred.relative = data;
    },
    OPTIONS_IMAGE_DIM_RED_CHANGE_SHOW: (state, data) => {
      state.options.image.dimred.show = data;
    },
    OPTIONS_IMAGE_CHANGE_MIN_OVERLAP: (state, data) => {
      state.options.image.minOverlap = data;
    },
    MZLIST_SORT_MZ: state => {
      state.mzList.visibleMz = mzListService.sortMzList(state.mzList.visibleMz);
    },
    MZLIST_UPDATE_SELECTED_MZ: (state, data) => {
      state.network.nodeTrix.nodeTrixPossible = true;
      state.network.clusterChange.split.possible = false;
      state.network.clusterChange.merge.mergePossible = false;
      state.network.clusterChange.merge.assignmentPossible = false;
      state.mzList.selectedMz = data;
      state.mzList.visibleMz = mzListService.sortMzList(state.mzList.visibleMz);
      networkService.highlightNodesByMz(state.network.nodes, data);
    },
    MZLIST_UPDATE_NAME: (state, data) => {
      if (data.name != null) {
        state.originalGraphData.graphs[
          'graph' + state.options.data.graph
        ].graph['hierarchy' + state.meta.maxHierarchy].nodes[data.nodeKey][
          'annotation'
        ] = data.name;
      } else {
        delete state.originalGraphData.graphs[
          'graph' + state.options.data.graph
        ].graph['hierarchy' + state.meta.maxHierarchy].nodes[data.nodeKey]
          .annotation;
      }
    },
    MZLIST_UPDATE_HIGHLIGHTED_MZ: (state, mzValues) => {
      state.network.nodeTrix.nodeTrixPossible = true;
      state.network.clusterChange.split.possible = false;
      state.network.clusterChange.merge.mergePossible = false;
      state.network.clusterChange.merge.assignmentPossible = false;
      const tuple = mzListService.updateHighlightedMz(
        state.mzList.visibleMz,
        state.mzList.notVisibleMz,
        mzValues,
        state.options.mzList.showAll
      );
      state.mzList.visibleMz = tuple[0];
      state.mzList.notVisibleMz = tuple[1];
      state.mzList.visibleMz = mzListService.sortMzList(state.mzList.visibleMz);
      if (mzValues.length === 1) {
        state.images.imageData[imageIndex.SELECTED_MZ].mzValues = mzValues;
      }
    },
    MZLIST_LOAD_GRAPH: state => {
      state.mzList.notVisibleMz = [];
      state.mzList.visibleMz = mzListService.loadGraph(
        state.options.data.graph,
        state.originalGraphData.graphs
      );
    },
    RESET_SELECTION: (state, keepLasso) => {
      state.images.imageData[imageIndex.HIST].showOverlay =
        state.images.imageData[imageIndex.HIST].overlayDimRed;
      state.network.nodeTrix.nodeTrixPossible = false;
      state.network.clusterChange.split.possible = false;
      state.network.clusterChange.merge.mergePossible = false;
      state.network.clusterChange.merge.assignmentPossible = false;
      state.network.clusterChange.split.newGroup = [];
      state.network.clusterChange.split.oldGroup = [];
      state.images.imageData[imageIndex.LASSO].selectedPoints = [];
      const tuple = mzListService.resetHighlightedMz(
        state.mzList.visibleMz,
        state.mzList.notVisibleMz,
        state.options.mzList.showAll
      );
      state.mzList.notVisibleMz = [];
      mzListService.resetPermutation(
        state.mzList.visibleMz,
        state.mzList.notVisibleMz
      );
      state.mzList.visibleMz = mzListService.sortMzList(tuple[0]);
      if (state.network.nodeTrix.oldElements.oldNodes.length > 0) {
        NetworkService.clearHighlightNodeTrixNodes();
      }
      networkService.clearHighlight(state.network.nodes);
      state.images.imageData[imageIndex.COMMUNITY].mzValues = [];
      state.images.imageData[imageIndex.COMMUNITY].base64Image = null;
      state.images.imageData[imageIndex.SELECTED_MZ].mzValues = [];
      state.images.imageData[imageIndex.SELECTED_MZ].base64Image = null;
      state.images.imageData[imageIndex.AGGREGATED].mzValues = [];
      state.images.imageData[imageIndex.AGGREGATED].base64Image = null;
      state.images.imageData[imageIndex.DIM_RED].mzValues = [];
      if (!keepLasso) {
        state.images.imageData[imageIndex.LASSO].mzValues = [];
        state.images.imageData[imageIndex.LASSO].base64Image = null;
      }
    },
    MZLIST_CALCULATE_VISIBLE_MZ: state => {
      const tuple = mzListService.calculateVisibleMz(
        state.options.mzList.showAll,
        state.mzList.notVisibleMz,
        state.mzList.visibleMz
      );
      state.mzList.visibleMz = tuple[0];
      state.mzList.notVisibleMz = tuple[1];
    },
    MZ_IMAGE_LASSO_END: () => {
      networkService.simulationUpdate();
    },
  },
  actions: {
    fetchMergeMethods: context => {
      const url = API_URL + '/mz-merge-methods';
      axios
        .get(url)
        .then(response => {
          context.commit('OPTIONS_IMAGE_MERGE_METHODS_UPDATE', response.data);
        })
        .catch(function() {
          alert('Error while loading available mz merge methods from api.');
        });
    },
    fetchGraphData: context => {
      context.commit('SET_LOADING_GRAPH_DATA', true);
      const url = API_URL + '/datasets/graphdata';
      axios
        .get(url)
        .then(response => {
          context.commit('SET_ORIGINAL_GRAPH_DATA', response.data);
          context.state.meta.threshold =
            context.state.originalGraphData.graphs[
              'graph' + context.state.options.data.graph
            ].threshold;
          context.state.meta.maxHierarchy =
            Object.keys(
              context.state.originalGraphData.graphs[
                'graph' + context.state.options.data.graph
              ].graph
            ).length - 1;
          context.dispatch('fetchAvailableImages');
          context.commit('MZLIST_LOAD_GRAPH');
          context.commit('MZLIST_CALCULATE_VISIBLE_MZ');
          context.commit('SET_LOADING_GRAPH_DATA', false);
          context.commit('MZLIST_SORT_MZ');
        })
        .catch(function(err) {
          console.error(err);
          alert('Error while loading graph data from api.');
          context.commit('SET_LOADING_GRAPH_DATA', false);
        });
    },
    updateOptionsImage: (context, data) => {
      let calculatedImageOptions = optionsService.calculateImageOptions(data);
      context.commit('OPTIONS_IMAGE_UPDATE', calculatedImageOptions);
    },
    changeGraph: (context, graph) => {
      context.state.options.data.graph = graph;
      context.state.meta.threshold =
        context.state.originalGraphData.graphs[
          'graph' + context.state.options.data.graph
        ].threshold;
      const datasetName = context.state.options.data.graphChoices[graph];
      const patchData = {
        name: datasetName,
        threshold: context.state.meta.threshold,
      };
      axios
        .patch(API_URL + '/graph/change_graph', patchData)
        .then(() => {
          context.dispatch('updateGraphCluster');
        })
        .catch(function() {
          console.error('Change Graph NOT OK');
        });
      context.state.images.imageData[imageIndex.COMMUNITY].mzValues = [];
      context.state.images.imageData[imageIndex.SELECTED_MZ].mzValues = [];
      context.state.images.imageData[imageIndex.AGGREGATED].mzValues = [];
      context.state.images.imageData[imageIndex.LASSO].mzValues = [];
      context.state.images.imageData[imageIndex.DIM_RED].mzValues = [];
      context.state.images.imageData[imageIndex.COMMUNITY].base64Image = null;
      context.state.images.imageData[imageIndex.SELECTED_MZ].base64Image = null;
      context.state.images.imageData[imageIndex.AGGREGATED].base64Image = null;
      context.state.images.imageData[imageIndex.LASSO].base64Image = null;
      context.state.images.imageData[imageIndex.DIM_RED].base64Image = null;
      context.state.meta.threshold =
        context.state.originalGraphData.graphs[
          'graph' + context.state.options.data.graph
        ].threshold;
      context.state.meta.maxHierarchy =
        Object.keys(
          context.state.originalGraphData.graphs[
            'graph' + context.state.options.data.graph
          ].graph
        ).length - 1;
      context.state.network.nodeTrix.nodeTrixPossible = false;
      context.state.network.clusterChange.split.possible = false;
      context.state.network.clusterChange.merge.mergePossible = false;
      context.state.network.clusterChange.merge.assignmentPossible = false;
      context.state.network.nodeTrix.nodeTrixActive = false;
      context.dispatch('fetchImageDimensions');
      context.commit('MZLIST_LOAD_GRAPH');
      context.commit('MZLIST_CALCULATE_VISIBLE_MZ');
      context.commit('MZLIST_SORT_MZ');
      context.commit('NETWORK_LOAD_GRAPH');
      context.commit('NETWORK_INIT_SVG');
      context.commit('NETWORK_CENTER_CAMERA');
      context.commit('NETWORK_SIMULATION_INIT');
      context.commit('NETWORK_NODETRIX_CHANGE_COLORSCALE');
      context.commit('SET_IMAGE_DATA_VALUES', [imageIndex.DIM_RED, []]);
      context.dispatch('fetchAvailableImages');
    },
    fetchImageDimensions: context => {
      const datasetName =
        context.state.options.data.graphChoices[
          context.state.options.data.graph
        ];

      const url = API_URL + '/datasets/' + datasetName + '/imagedimensions';

      axios
        .get(url)
        .then(response => {
          context.commit('SET_IMAGE_DIMENSIONS', response.data);
        })
        .catch(function() {
          console.error('Image Dimensions NOT OK');
        });
    },
    fetchImageData: (context, index) => {
      if (!context.state.images.imageData[index]) {
        return;
      }
      let mzValues = context.state.images.imageData[index].mzValues;
      // do an api fetch for a combination image of multiple mz values
      if (mzValues.length > 0) {
        context.commit('SET_LOADING_IMAGE_DATA', true);
        const datasetName =
          context.state.options.data.graphChoices[
            context.state.options.data.graph
          ];
        const mergeMethod = context.state.options.image.mergeMethod;
        const colorscale = context.state.options.image.colorScale;
        const url = API_URL + '/datasets/' + datasetName + '/mzimage';
        const postData = {
          mzValues: mzValues,
          colorscale: context.state.options.image.colorScales[colorscale],
          method: mergeMethod,
        };
        axios
          .post(url, postData)
          .then(response => {
            context.commit('SET_IMAGE_DATA_VALUES', [index, response.data]);
            context.commit('SET_LOADING_IMAGE_DATA', false);
          })
          .catch(function() {
            context.commit('SET_LOADING_IMAGE_DATA', false);
          });
      }
      context.dispatch('imagesSelectPoints', [index, []]);
    },
    fetchHistoImage: context => {
      if (
        context.state.images.imageData[imageIndex.HIST].availableImages
          .length === 0
      ) {
        return;
      }
      const datasetName =
        context.state.options.data.graphChoices[
          context.state.options.data.graph
        ];
      const url = `${API_URL}/datasets/${datasetName}/hist?index=${context.state.images.imageData[imageIndex.HIST].histoImageIndex}`;
      axios
        .get(url)
        .then(response => {
          context.commit('SET_IMAGE_DATA_VALUES', [
            imageIndex.HIST,
            response.data,
          ]);
          context.commit('SET_LOADING_IMAGE_DATA', false);
        })
        .catch(function() {
          context.commit('SET_LOADING_IMAGE_DATA', false);
        });
    },
    imagesSelectPoints: (context, payload) => {
      let index = payload[0];
      let selectedPoints = payload[1];
      context.commit('SET_IMAGE_DATA_SELECTED_POINTS', [index, selectedPoints]);
      context.dispatch('fetchLassoSimilar', index);


      /*let imageData = imageService.markSelectedPoints(
        context.state.images.imageData[index],
        selectedPoints
      );
      let imageData = context.state.images.imageData[index];
      //imageData = imageService.calculateColors(
      //  imageData,
      //  context.state.options.image.colorScale
      //);
      context.commit('SET_IMAGE_DATA_VALUES', [index, imageData]);
      */
    },
    fetchLassoSimilar: (context, index) => {
      const selectedPoints =
        context.state.images.imageData[index].selectedPoints;

      if (selectedPoints.length > 0) {
        context.state.images.imageData[index].lassoFetching = true;
        const mergeMethod = context.state.options.image.mergeMethod;
        const datasetName =
          context.state.options.data.graphChoices[
            context.state.options.data.graph
          ];
        const url = API_URL + '/datasets/' + datasetName + '/imagedata/match';
        const visibleNodes = [];
        context.state.network.nodes.forEach(function(node) {
          visibleNodes.push({ name: node.name, mzs: node.mzs });
        });
        let counter = 0;
        for (const node of context.state.network.nodeTrix.newElements
          .newNodes) {
          if (
            counter >=
            context.state.network.nodeTrix.newElements.newNodes.length / 4
          ) {
            break;
          }
          visibleNodes.push({ name: node.name, mzs: node.mzs });
          counter++;
        }
        const postData = {
          visibleNodes: visibleNodes,
          selectedMzs: context.state.images.imageData[index].mzValues,
          selectedPoints: selectedPoints,
          method: mergeMethod,
          minIntensity: context.state.options.image.minIntensity,
          minOverlap: context.state.options.image.minOverlap,
        };
        axios
          .post(url, postData)
          .then(response => {
            context.state.images.imageData[index].lassoFetching = false;
            networkService.highlightNodesByName(
              context.state.network.nodes,
              response.data
            );
            context.commit('IMAGE_DATA_UPDATE_FROM_SELECTED_NODES');
          })
          .catch(function() {
            context.state.images.imageData[index].lassoFetching = false;
            alert(
              'Error while loading similar nodes based on lasso selection from api.'
            );
          });
      }
    },
    rescaleImages: (context) => {
      let scaleFactor = context.state.images.ScaleFactorObject[context.state.options.image.imageScaleFactor];
      context.state.images.width = Math.ceil(context.state.images.originalWidth * scaleFactor);
      context.state.images.height = Math.ceil(context.state.images.originalHeight * scaleFactor);
    },
    mzlistUpdatedMzs: (context, data) => {
      if (data.length === 1) {
        context.state.images.imageData[imageIndex.SELECTED_MZ].mzValues = data;
      } else {
        context.state.images.imageData[imageIndex.SELECTED_MZ].mzValues = [];
      }
      context.commit('MZLIST_UPDATE_SELECTED_MZ', data);
      setTimeout(function() {
        context.commit('IMAGE_DATA_UPDATE_FROM_SELECTED_NODES');
      }, 700);
    },
    graphQuery: context => {
      axios
        .get(API_URL + '/graph/' + context.state.options.graphStatistic)
        .then(response => {
          mzListService.applyQueryPermutation(
            response.data,
            context.state.mzList.visibleMz,
            context.state.mzList.notVisibleMz
          );
          context.state.mzList.visibleMz = mzListService.sortMzList(
            context.state.mzList.visibleMz
          );
        })
        .catch(err => {
          console.error(err);
        });
    },
    updateGraphCluster: context => {
      const nodes =
        context.state.originalGraphData.graphs[
          'graph' + context.state.options.data.graph
        ].graph['hierarchy' + context.state.meta.maxHierarchy].nodes;
      const clusters = [];
      for (const node of Object.keys(nodes)) {
        clusters.push([nodes[node].index, nodes[node].membership]);
      }
      clusters.sort((a, b) => (a[0] > b[0] ? 1 : -1));
      axios
        .patch(API_URL + '/graph/update_cluster', clusters.map(c => c[1]))
        .then(() => {})
        .catch(() => {
          console.error('NOT OK');
        });
    },
    mzlistUpdateHighlightedMz: (context, data) => {
      context.commit('MZLIST_UPDATE_HIGHLIGHTED_MZ', data);
      context.commit('IMAGE_DATA_UPDATE_FROM_SELECTED_NODES');
    },
    fetchAvailableImages: context => {
      /*
        Check if dimreduce and histo images are available
       */
      const datasetName =
        context.state.options.data.graphChoices[
          context.state.options.data.graph
        ];
      const url = `${API_URL}/datasets/${datasetName}/images_info`;
      axios
        .get(url)
        .then(response => {
          context.commit('SET_AVAILABLE_IMAGES', response.data);
          context.dispatch('fetchDimRedImage');
          context.dispatch('fetchHistoImage');
        })
        .catch(err => console.error(err));
    },
    fetchDimRedImage: context => {
      if (!context.state.images.imageData[imageIndex.DIM_RED].available) {
        return;
      }
      context.commit('SET_LOADING_IMAGE_DATA', true);
      const datasetName =
        context.state.options.data.graphChoices[
          context.state.options.data.graph
        ];
      let url = `${API_URL}/datasets/${datasetName}/dimreduceimage`;
      const mzValues =
        context.state.images.imageData[imageIndex.DIM_RED].mzValues;
      const postData = {};
      if (mzValues.length > 0) {
        postData['method'] = context.state.options.image.mergeMethod;
        postData['mzValues'] = mzValues;
        if (!context.state.options.image.dimred.relative) {
          postData['alpha'] = context.state.options.image.dimred.threshold;
        }
      }
      axios
        .post(url, postData)
        .then(response => {
          context.commit('SET_LOADING_IMAGE_DATA', false);
          context.commit('SET_IMAGE_DATA_VALUES', [
            imageIndex.DIM_RED,
            response.data,
          ]);
        })
        .catch(function(err) {
          context.commit('SET_LOADING_IMAGE_DATA', false);
          context.commit('SET_IMAGE_DATA_VALUES', [imageIndex.DIM_RED, []]);
          console.error(err);
        });
    },
  },
});
