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
          // data used to render community image
          mzValues: [],
          points: [], // points that are displayed as mz image
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
        },
        {
          // data used to render image from selected mz values
          mzValues: [],
          points: [], // points that are displayed as mz image
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
      },
      simulation: null,
      nodes: [],
      edges: [],
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
    stateOptionsGraph: state => {
      return state.options.data.graph;
    },
    optionsDataGraphChoices: state => {
      return state.options.data.graphChoices;
    },
    optionsImageMergeMethodChoices: state => {
      return state.options.image.mergeMethods;
    },
  },
  mutations: {
    SET_LOADING_IMAGE_DATA: (state, loading) => {
      state.images.loadingImageData = loading;
    },
    SET_IMAGE_DATA_VALUES: (state, payload) => {
      let index = payload[0];
      let data = payload[1];
      let mzImageData = state.images.imageData[index];
      mzImageData.points = data;

      let maxX = 0;
      let maxY = 0;
      for (let point in data) {
        if (data.hasOwnProperty(point)) {
          if (data[point].x > maxX) {
            maxX = data[point].x;
          }
          if (data[point].y > maxY) {
            maxY = data[point].y;
          }
        }
      }
      mzImageData.max.x = maxX;
      mzImageData.max.y = maxY;
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
      networkService.updateSimulationParameters(
        state.network.simulation,
        options
      );
    },
    NETWORK_INIT_SVG: state => {
      state.network.svgElements = networkService.initSVG(
        state.network.nodes,
        state.network.edges
      );
    },
    NETWORK_SIMULATION_INIT: state => {
      state.network.simulation = networkService.initSimulation(
        state.network.simulation,
        state.network.nodes,
        state.network.edges,
        state.options.network
      );
    },
    NETWORK_LOAD_GRAPH: state => {
      const tupel = networkService.loadGraph(
        state.originalGraphData.graphs['graph' + state.options.data.graph].graph
      );
      state.network.nodes = tupel[0];
      state.network.edges = tupel[1];
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
        state.network.simulation = networkService.initSimulation(
          state.network.simulation,
          state.network.nodes,
          state.network.edges,
          state.options.network
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
        state.network.simulation = networkService.initSimulation(
          state.network.simulation,
          state.network.nodes,
          state.network.edges,
          state.options.network
        );
      }
    },
    NETWORK_HIGHLIGHT_NODE_BY_MZ: state => {
      networkService.highlightNodesByMz(state.network.nodes);
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
    MZLIST_SORT_MZ: state => {
      state.mzList.visibleMz = mzListService.sortMzList(
        state.mzList.visibleMz,
        state.options.mzList.asc
      );
    },
    MZLIST_UPDATE_SELECTED_MZ: (state, data) => {
      state.mzList.selectedMz = data;
      state.images.imageData[1].mzValues = data;
      networkService.highlightNodesByMz(state.network.nodes, data);
    },
    MZLIST_UPDATE_NAME: (state, data) => {
      state.originalGraphData.graphs['graph' + state.options.data.graph].graph[
        'hierarchy' + state.meta.maxHierarchy
      ].nodes[data.nodeKey].name = data.name;
    },
    MZLIST_UPDATE_HIGHLIGHTED_MZ: (state, mzValues) => {
      const tuple = mzListService.updateHighlightedMz(
        state.mzList.visibleMz,
        state.mzList.notVisibleMz,
        mzValues,
        state.options.mzList.showAll,
        state.options.mzList.asc
      );
      state.mzList.visibleMz = tuple[0];
      state.mzList.notVisibleMz = tuple[1];
      state.images.imageData[0].mzValues = mzValues;
    },
    MZLIST_LOAD_GRAPH: state => {
      state.mzList.notVisibleMz = [];
      state.mzList.visibleMz = mzListService.loadGraph(
        state.options.data.graph,
        state.originalGraphData.graphs
      );
    },
    MZLIST_RESET_HIGHLIGHTED_MZ: state => {
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
      networkService.clearHighlight(state.network.nodes);
      state.images.imageData[0].mzValues = [];
      state.images.imageData[1].mzValues = [];
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
      context.state.images.imageData[0].mzValues = [];
      context.state.images.imageData[1].mzValues = [];
      context.state.meta.maxHierarchy =
        Object.keys(
          context.state.originalGraphData.graphs[
            'graph' + context.state.options.data.graph
          ].graph
        ).length - 1;
      context.commit('MZLIST_LOAD_GRAPH');
      context.commit('MZLIST_CALCULATE_VISIBLE_MZ');
      context.commit('MZLIST_SORT_MZ');
      context.commit('NETWORK_LOAD_GRAPH');
      context.commit('NETWORK_INIT_SVG');
      context.commit('NETWORK_SIMULATION_INIT');
    },
    fetchImageData: (context, index) => {
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
            let imageData = imageService.calculateColors(response.data);
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
      imageData = imageService.calculateColors(imageData);
      context.commit('SET_IMAGE_DATA_VALUES', [index, imageData]);
    },
  },
});
