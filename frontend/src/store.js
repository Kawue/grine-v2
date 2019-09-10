import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
Vue.config.devtools = true;

import OptionsService from './services/OptionsService';
import MzListService from './services/MzListService';
import ImageService from './services/ImageService';
import NetworkService from './services/NetworkService';
const optionsService = new OptionsService();
const mzListService = new MzListService();
const imageService = new ImageService();
const networkService = new NetworkService();
import axios from 'axios';

const API_URL = 'http://localhost:5000';
export const IMAGE_INDEX_COMMUNITY = 0;
export const IMAGE_INDEX_SELECTED_MZ = 1;
export const IMAGE_INDEX_AGGREGATED = 2;
export const IMAGE_INDEX_LASSO = 3;
export const IMAGE_INDEX_PCA = 4;

export default new Vuex.Store({
  state: {
    loadingGraphData: true, // api fetch for graph data is running
    originalGraphData: {}, // graph data api return
    meta: {
      maxHierarchy: 1,
      maxGraphs: 1,
    },
    images: {
      imageData: [
        {
          // IMAGE_INDEX_COMMUNITY data used to render community image
          mzValues: [],
          points: [], // points that are displayed as mz image
          selectedPoints: [], // points that are selected by the lasso
          max: {
            // max image coors, used to scale/cut image according
            x: null,
            y: null,
          },
          min: {
            // min image coors, used to scale/cut image according
            x: null,
            y: null,
          },
          lassoFetching: false, // true during api call of lasso matching
        },
        {
          // IMAGE_INDEX_SELECTED_MZ data used to render image from selected mz values
          mzValues: [],
          points: [], // points that are displayed as mz image
          selectedPoints: [], // points that are selected by the lasso
          max: {
            // max image coors, used to scale/cut image according
            x: null,
            y: null,
          },
          min: {
            // min image coors, used to scale/cut image according
            x: null,
            y: null,
          },
          lassoFetching: false, // true during api call of lasso matching
        },
        {
          // IMAGE_INDEX_AGGREGATED data used to render image from multiple selected nodes
          mzValues: [],
          points: [], // points that are displayed as mz image
          selectedPoints: [], // points that are selected by the lasso
          max: {
            // max image coors, used to scale/cut image according
            x: null,
            y: null,
          },
          min: {
            // min image coors, used to scale/cut image according
            x: null,
            y: null,
          },
          lassoFetching: false, // true during api call of lasso matching
        },
        {
          // IMAGE_INDEX_LASSO data used to render image copied from other images
          mzValues: [],
          points: [], // points that are displayed as mz image
          selectedPoints: [], // points that are selected by the lasso
          max: {
            // max image coors, used to scale/cut image according
            x: null,
            y: null,
          },
          min: {
            // min image coors, used to scale/cut image according
            x: null,
            y: null,
          },
          lassoFetching: false, // true during api call of lasso matching
        },
        {
          // IMAGE_INDEX_PCA data used to render the pca image
          mzValues: [],
          points: [], // points that are displayed as mz image
          selectedPoints: [], // points that are selected by the lasso
          max: {
            // max image coors, used to scale/cut image according
            x: null,
            y: null,
          },
          min: {
            // min image coors, used to scale/cut image according
            x: null,
            y: null,
          },
          lassoFetching: false, // true during api call of lasso matching
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
      image: {
        mergeMethod: null, // default will be first in array returned from api
        mergeMethods: [], // queries from api
        minIntensity: 20, // in %
        minOverlap: 80, // in %
        colorScale: 'interpolateMagma',
        colorScales: {
          interpolateMagma: 'Magma',
          interpolateCool: 'Cool',
          interpolatePiYG: 'PiYG',
          interpolateViridis: 'Viridis',
          interpolatePlasma: 'Plasma',
          interpolateInferno: 'Inferno',
        },
        pca: {
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
    getImageData: state => index => {
      return state.images.imageData[index];
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
      return (
        state.images.imageData[IMAGE_INDEX_LASSO].selectedPoints.length > 0
      );
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
      state.images.imageData[index].points = [];
    },
    CLEAR_IMAGES: state => {
      state.images.imageData[IMAGE_INDEX_COMMUNITY].mzValues = [];
      state.images.imageData[IMAGE_INDEX_COMMUNITY].points = [];
      state.images.imageData[IMAGE_INDEX_SELECTED_MZ].mzValues = [];
      state.images.imageData[IMAGE_INDEX_SELECTED_MZ].points = [];
      state.images.imageData[IMAGE_INDEX_AGGREGATED].mzValues = [];
      state.images.imageData[IMAGE_INDEX_AGGREGATED].points = [];
    },
    SET_IMAGE_DATA_VALUES: (state, payload) => {
      let index = payload[0];
      let data = payload[1];
      let mzImageData = state.images.imageData[index];
      mzImageData.points = data;

      let maxX = 0;
      let maxY = 0;
      let minX = Number.MAX_SAFE_INTEGER;
      let minY = Number.MAX_SAFE_INTEGER;
      for (let point in data) {
        if (data.hasOwnProperty(point)) {
          if (data[point].x > maxX) {
            maxX = data[point].x;
          }
          if (data[point].y > maxY) {
            maxY = data[point].y;
          }
          if (data[point].x < minX) {
            minX = data[point].x;
          }
          if (data[point].y < minY) {
            minY = data[point].y;
          }
        }
      }
      mzImageData.max.x = maxX;
      mzImageData.max.y = maxY;
      mzImageData.min.x = minX;
      mzImageData.min.y = minY;
    },
    IMAGE_DATA_UPDATE_FROM_SELECTED_NODES: state => {
      let nodesSelected = NetworkService.getSelectedNodes(
        state.network.nodes,
        false
      );
      if (nodesSelected) {
        if (nodesSelected.length === 0) {
          state.images.imageData[IMAGE_INDEX_COMMUNITY].mzValues = [];
          state.images.imageData[IMAGE_INDEX_COMMUNITY].points = [];
          state.images.imageData[IMAGE_INDEX_AGGREGATED].mzValues = [];
          state.images.imageData[IMAGE_INDEX_AGGREGATED].points = [];
        } else if (nodesSelected.length === 1) {
          state.images.imageData[IMAGE_INDEX_AGGREGATED].mzValues = [];
          state.images.imageData[IMAGE_INDEX_AGGREGATED].points = [];

          if (nodesSelected[0].mzs.length > 1) {
            state.images.imageData[IMAGE_INDEX_COMMUNITY].mzValues =
              nodesSelected[0].mzs;
          } else if (nodesSelected[0].parent) {
            // find mzs of highest parent community
            const graph =
              state.originalGraphData.graphs['graph' + state.options.data.graph]
                .graph;
            let parentNode = NetworkService.getRootParentNodeFromNode(
              nodesSelected[0],
              graph
            );
            state.images.imageData[IMAGE_INDEX_COMMUNITY].mzValues =
              parentNode.mzs;
          }
        } else if (nodesSelected.length > 1) {
          state.images.imageData[IMAGE_INDEX_SELECTED_MZ].mzValues = [];
          state.images.imageData[IMAGE_INDEX_SELECTED_MZ].points = [];
          state.images.imageData[IMAGE_INDEX_COMMUNITY].mzValues = [];
          state.images.imageData[IMAGE_INDEX_COMMUNITY].points = [];
          let mzs = [];
          nodesSelected.forEach(function(node) {
            mzs = mzs.concat(node.mzs);
          });
          state.images.imageData[IMAGE_INDEX_AGGREGATED].mzValues = mzs;
        }
      }
    },
    IMAGE_COPY_INTO_SELECTION_IMAGE: (state, index) => {
      state.images.imageData[IMAGE_INDEX_LASSO].mzValues = [];
      state.images.imageData[IMAGE_INDEX_LASSO].points = [];
      state.images.imageData[IMAGE_INDEX_LASSO].mzValues =
        state.images.imageData[index].mzValues;
      state.images.imageData[IMAGE_INDEX_LASSO].points =
        state.images.imageData[index].points;
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
      const hierarchy = parseInt(node.name.split('n')[0].slice(1), 10);
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
      const hierarchy = parseInt(node.name.split('n')[0].slice(1), 10);
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
    NETWORK_COMPUTE_NODETRIX: state => {
      state.network.nodeTrix.nodeTrixPossible = false;
      state.network.nodeTrix.nodeTrixActive = true;
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
    OPTIONS_IMAGE_CHANGE_MIN_INTENSITY: (state, data) => {
      state.options.image.minIntensity = data;
    },
    OPTIONS_IMAGE_PCA_CHANGE_THRESHOLD: (state, data) => {
      state.options.image.pca.threshold = data;
    },
    OPTIONS_IMAGE_PCA_CHANGE_RELATIVE: (state, data) => {
      state.options.image.pca.relative = data;
    },
    OPTIONS_IMAGE_PCA_CHANGE_SHOW: (state, data) => {
      state.options.image.pca.show = data;
    },
    OPTIONS_IMAGE_CHANGE_MIN_OVERLAP: (state, data) => {
      state.options.image.minOverlap = data;
    },
    MZLIST_SORT_MZ: state => {
      state.mzList.visibleMz = mzListService.sortMzList(
        state.mzList.visibleMz,
        state.options.mzList.asc
      );
    },
    MZLIST_UPDATE_SELECTED_MZ: (state, data) => {
      state.network.nodeTrix.nodeTrixPossible = true;
      state.mzList.selectedMz = data;
      state.mzList.visibleMz = mzListService.sortMzList(
        state.mzList.visibleMz,
        state.options.mzList.asc
      );
      networkService.highlightNodesByMz(state.network.nodes, data);
    },
    MZLIST_UPDATE_NAME: (state, data) => {
      state.originalGraphData.graphs['graph' + state.options.data.graph].graph[
        'hierarchy' + state.meta.maxHierarchy
      ].nodes[data.nodeKey].name = data.name;
    },
    MZLIST_UPDATE_HIGHLIGHTED_MZ: (state, mzValues) => {
      state.network.nodeTrix.nodeTrixPossible = true;
      const tuple = mzListService.updateHighlightedMz(
        state.mzList.visibleMz,
        state.mzList.notVisibleMz,
        mzValues,
        state.options.mzList.showAll,
        state.options.mzList.asc
      );
      state.mzList.visibleMz = tuple[0];
      state.mzList.notVisibleMz = tuple[1];
      state.mzList.visibleMz = mzListService.sortMzList(
        state.mzList.visibleMz,
        state.options.mzList.asc
      );
      if (mzValues.length === 1) {
        state.images.imageData[IMAGE_INDEX_SELECTED_MZ].mzValues = mzValues;
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
      state.network.nodeTrix.nodeTrixPossible = false;
      const tuple = mzListService.resetHighlightedMz(
        state.mzList.visibleMz,
        state.mzList.notVisibleMz,
        state.options.mzList.showAll,
        state.options.mzList.asc
      );
      state.mzList.notVisibleMz = tuple[1];
      state.mzList.visibleMz = mzListService.sortMzList(
        tuple[0],
        state.options.mzList.asc
      );
      if (state.network.nodeTrix.oldElements.oldNodes.length > 0) {
        NetworkService.clearHighlightNodeTrixNodes();
      }
      networkService.clearHighlight(state.network.nodes);
      state.images.imageData[IMAGE_INDEX_COMMUNITY].mzValues = [];
      state.images.imageData[IMAGE_INDEX_COMMUNITY].points = [];
      state.images.imageData[IMAGE_INDEX_SELECTED_MZ].mzValues = [];
      state.images.imageData[IMAGE_INDEX_SELECTED_MZ].points = [];
      state.images.imageData[IMAGE_INDEX_AGGREGATED].mzValues = [];
      state.images.imageData[IMAGE_INDEX_AGGREGATED].points = [];
      state.images.imageData[IMAGE_INDEX_PCA].mzValues = [];
      state.images.imageData[IMAGE_INDEX_PCA].points = [];
      if (!keepLasso) {
        state.images.imageData[IMAGE_INDEX_LASSO].mzValues = [];
        state.images.imageData[IMAGE_INDEX_LASSO].points = [];
      }
    },
    MZLIST_CALCULATE_VISIBLE_MZ: state => {
      const tuple = mzListService.calculateVisibleMz(
        state.options.mzList.showAll,
        state.mzList.notVisibleMz,
        state.mzList.visibleMz,
        state.options.mzList.asc
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
          context.state.meta.maxHierarchy =
            Object.keys(
              context.state.originalGraphData.graphs[
                'graph' + context.state.options.data.graph
              ].graph
            ).length - 1;
          context.commit('MZLIST_LOAD_GRAPH');
          context.commit('MZLIST_CALCULATE_VISIBLE_MZ');
          context.commit('SET_LOADING_GRAPH_DATA', false);
          context.commit('MZLIST_SORT_MZ');
        })
        .catch(function() {
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
      context.state.images.imageData[IMAGE_INDEX_COMMUNITY].mzValues = [];
      context.state.images.imageData[IMAGE_INDEX_SELECTED_MZ].mzValues = [];
      context.state.images.imageData[IMAGE_INDEX_AGGREGATED].mzValues = [];
      context.state.images.imageData[IMAGE_INDEX_LASSO].mzValues = [];
      context.state.images.imageData[IMAGE_INDEX_PCA].mzValues = [];
      context.state.images.imageData[IMAGE_INDEX_COMMUNITY].points = [];
      context.state.images.imageData[IMAGE_INDEX_SELECTED_MZ].points = [];
      context.state.images.imageData[IMAGE_INDEX_AGGREGATED].points = [];
      context.state.images.imageData[IMAGE_INDEX_LASSO].points = [];
      context.state.images.imageData[IMAGE_INDEX_PCA].points = [];
      context.dispatch('fetchImageData', IMAGE_INDEX_COMMUNITY);
      context.dispatch('fetchImageData', IMAGE_INDEX_SELECTED_MZ);
      context.dispatch('fetchImageData', IMAGE_INDEX_AGGREGATED);
      context.dispatch('fetchImageData', IMAGE_INDEX_LASSO);
      context.state.meta.maxHierarchy =
        Object.keys(
          context.state.originalGraphData.graphs[
            'graph' + context.state.options.data.graph
          ].graph
        ).length - 1;
      context.state.network.nodeTrix.nodeTrixPossible = false;
      context.state.network.nodeTrix.nodeTrixActive = false;
      context.commit('MZLIST_LOAD_GRAPH');
      context.commit('MZLIST_CALCULATE_VISIBLE_MZ');
      context.commit('MZLIST_SORT_MZ');
      context.commit('NETWORK_LOAD_GRAPH');
      context.commit('NETWORK_INIT_SVG');
      context.commit('NETWORK_CENTER_CAMERA');
      context.commit('NETWORK_SIMULATION_INIT');
      context.commit('NETWORK_NODETRIX_CHANGE_COLORSCALE');
      context.commit('SET_IMAGE_DATA_VALUES', [IMAGE_INDEX_PCA, []]);
    },
    fetchImageData: (context, index) => {
      if (!context.state.images.imageData[index]) {
        return;
      }
      let mzValues = context.state.images.imageData[index].mzValues;
      // do an api fetch for a combination image of multiple mz values
      context.commit('SET_IMAGE_DATA_VALUES', [index, []]);
      if (mzValues.length > 0) {
        context.commit('SET_LOADING_IMAGE_DATA', true);
        const datasetName =
          context.state.options.data.graphChoices[
            context.state.options.data.graph
          ];
        const mergeMethod = context.state.options.image.mergeMethod;
        const url =
          API_URL +
          '/datasets/' +
          datasetName +
          '/mzvalues/imagedata/method/' +
          mergeMethod;
        const postData = { mzValues: mzValues };
        axios
          .post(url, postData)
          .then(response => {
            let imageData = imageService.calculateColors(
              response.data,
              context.state.options.image.colorScale
            );
            context.commit('SET_IMAGE_DATA_VALUES', [index, imageData]);
            context.commit('SET_LOADING_IMAGE_DATA', false);
          })
          .catch(function() {
            context.commit('SET_LOADING_IMAGE_DATA', false);
          });
      }
      context.dispatch('imagesSelectPoints', [index, []]);
    },
    imagesSelectPoints: (context, payload) => {
      let index = payload[0];
      let selectedPoints = payload[1];
      let imageData = imageService.markSelectedPoints(
        context.state.images.imageData[index].points,
        selectedPoints
      );
      imageData = imageService.calculateColors(
        imageData,
        context.state.options.image.colorScale
      );
      context.commit('SET_IMAGE_DATA_VALUES', [index, imageData]);
      context.commit('SET_IMAGE_DATA_SELECTED_POINTS', [index, selectedPoints]);
      context.dispatch('fetchLassoSimilar', index);
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
        const url =
          API_URL +
          '/datasets/' +
          datasetName +
          '/imagedata/method/' +
          mergeMethod +
          '/match';
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
          selectedPoints: selectedPoints,
          selectedMzs: context.state.images.imageData[index].mzValues,
          visibleNodes: visibleNodes,
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
    mzlistUpdatedMzs: (context, data) => {
      if (data.length === 1) {
        context.state.images.imageData[IMAGE_INDEX_SELECTED_MZ].mzValues = data;
      } else {
        context.state.images.imageData[IMAGE_INDEX_SELECTED_MZ].mzValues = [];
      }
      context.commit('MZLIST_UPDATE_SELECTED_MZ', data);
      setTimeout(function() {
        context.commit('IMAGE_DATA_UPDATE_FROM_SELECTED_NODES');
      }, 700);
    },
    mzlistUpdateHighlightedMz: (context, data) => {
      context.commit('MZLIST_UPDATE_HIGHLIGHTED_MZ', data);
      setTimeout(function() {
        context.commit('IMAGE_DATA_UPDATE_FROM_SELECTED_NODES');
      }, 700);
    },
    imageCopyIntoSelectionImage: (context, index) => {
      context.commit('IMAGE_COPY_INTO_SELECTION_IMAGE', index);
      context.dispatch('fetchPcaImageData', index);
    },
    fetchPcaImageData: (context, index) => {
      let mzValues = [];
      if (context.state.images.imageData[index]) {
        mzValues = context.state.images.imageData[index].mzValues;
      } else {
        context.commit('SET_IMAGE_DATA_VALUES', [IMAGE_INDEX_PCA, []]);
        return;
      }
      context.commit('SET_LOADING_IMAGE_DATA', true);
      const datasetName =
        context.state.options.data.graphChoices[
          context.state.options.data.graph
        ];
      const mergeMethod = context.state.options.image.mergeMethod;
      const url =
        API_URL +
        '/datasets/' +
        datasetName +
        '/pcaimagedata/method/' +
        mergeMethod;
      const postData = { mzValues: mzValues, threshold: null };
      if (!context.state.options.image.pca.relative) {
        postData.threshold = context.state.options.image.pca.threshold;
      }
      axios
        .post(url, postData)
        .then(response => {
          context.commit('SET_LOADING_IMAGE_DATA', false);
          context.commit('SET_IMAGE_DATA_VALUES', [
            IMAGE_INDEX_PCA,
            response.data,
          ]);
        })
        .catch(function() {
          context.commit('SET_IMAGE_DATA_VALUES', [IMAGE_INDEX_PCA, []]);
          context.commit('SET_LOADING_IMAGE_DATA', false);
          alert('Error while loading pca image data from api.');
        });
    },
  },
});
