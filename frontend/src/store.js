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
    images: {
      imageData: [
        {
          // data used to render community image
          mzValues: [],
          points: [], // points that are displayed as mz image
          max: {
            // max image coors, used to scale image according
            x: null,
            y: null,
          },
        },
        {
          // data used to render image from selected mz values
          mzValues: [],
          points: [], // points that are displayed as mz image
          max: {
            // max image coors, used to scale image according
            x: null,
            y: null,
          },
        },
      ],
      loadingImageData: false, // api fetch for image data is running
    },
    network: {
      title: {
        text: 'Graph Test',
      },
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          label: {
            normal: {
              show: false,
            },
          },
          categories: [
            {
              name: 'Community 1',
            },
            {
              name: 'Community 2',
            },
            {
              name: 'Community 3',
            },
            {
              name: 'Community 4',
            },
            {
              name: 'Community 5',
            },
            {
              name: 'Community 6',
            },
            {
              name: 'Community 7',
            },
            {
              name: 'Community 8',
            },
            {
              name: 'Community 9',
            },
            {
              name: 'Community 10',
            },
            {
              name: 'Community 11',
            },
            {
              name: 'Community 12',
            },
          ],
          edgeSymbolSize: [4, 10],
          force: {
            repulsion: 2000,
            edgeLength: 30,
            gravity: 0.1,
          },
          data: [],
          // links: [],
          links: [],
          lineStyle: {
            normal: {
              opacity: 0.9,
              width: 2,
              curveness: 0,
            },
          },
        },
      ],
    },
    options: {
      state: {
        // state of options widget
        tabActive: null,
        tabLocked: null,
        tabsExpanded: false,
      },
      network: {
        force: {
          repulsion: 1000,
          gravity: 0.1,
          edgeLength: 30,
        },
      },
      image: {
        mergeMethod: 'max',
        mergeMethods: ['min', 'max', 'median'],
      },
      mzList: {
        selectedMz: [],
        visibleMz: [],
        notVisibleMz: [],
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
      return state.originalGraphData.graphs;
    },
    getGraph: state => {
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
    mzListGraph: state => {
      return state.options.mzList;
    },
    mzListOptions: state => {
      return state.options.graph;
    },
    mzListOptionsSelectedMz: state => {
      return state.options.mzList.selectedMz;
    },
    mzListOptionsVisibleMz: state => {
      return state.options.mzList.visibleMz;
    },
    mzListOptionsNotVisibleMz: state => {
      return state.options.mzList.notVisibleMz;
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
    network: state => {
      return state.network;
    },
    networkForceOptions: state => {
      return state.options.network.force;
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

      let max = 0;
      for (let point in data) {
        if (data.hasOwnProperty(point)) {
          if (data[point].x > max) {
            max = data[point].x;
          }
        }
      }
      max += 10;
      mzImageData.max.x = max;
      mzImageData.max.y = max;
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
      state.options.data.graph = 0;
    },
    SET_NETWORK_REPULSION: (state, repulsion) => {
      state.options.network.force.repulsion = repulsion;
      state.network.series[0].force = state.options.network.force;
    },
    SET_NETWORK_GRAVITY: (state, gravity) => {
      state.options.network.force.gravity = gravity;
      state.network.series[0].force = state.options.network.force;
    },
    SET_NETWORK_EDGELENGTH: (state, edgeLength) => {
      state.options.network.force.edgeLength = edgeLength;
      state.network.series[0].force = state.options.network.force;
    },
    NETWORK_LOAD: state => {
      const nodeEdges = networkService.loadGraph(
        state.originalGraphData.graphs['graph' + state.options.data.graph].graph
      );
      state.network.series[0].data = nodeEdges[0];
      state.network.series[0].links = nodeEdges[1];
    },
    NETWORK_EXPAND_NODE: (state, event) => {
      const hierarchy = parseInt(event.data.name.split('n')[0].slice(1), 10);
      if (hierarchy < 3) {
        state.network.series[0].data.splice(event.dataIndex, 1);
        const nextNodes = networkService.expandNode(
          state.originalGraphData.graphs['graph' + state.options.data.graph]
            .graph,
          event.data
        );
        state.network.series[0].data.push(...nextNodes);
      }
    },
    NETWORK_SHRINK_NODE: (state, oldNode) => {
      const hierarchy = parseInt(oldNode.name.split('n')[0].slice(1), 10);
      if (hierarchy > 0) {
        state.network.series[0].data = state.network.series[0].data.filter(
          item => {
            const itemHierarchy = parseInt(
              item.name.split('n')[0].slice(1),
              10
            );
            if (
              item.value.parent === oldNode.value.parent &&
              hierarchy === itemHierarchy
            ) {
              return false;
            } else {
              return !(
                oldNode.category === item.category && hierarchy < itemHierarchy
              );
            }
          }
        );
        const nextNode = networkService.shrinkNode(
          state.originalGraphData.graphs['graph' + state.options.data.graph]
            .graph,
          oldNode
        );
        state.network.series[0].data.push(nextNode);
      }
    },
    NETWORK_HIGHLIGHT_NODE: (state, indices) => {
      state.network.series[0].data = networkService.highlightNodes(
        state.network.series[0].data,
        indices
      );
      // we need a list of all visible mz values to render the community image
      let visibleMz = state.options.mzList.visibleMz;
      let mzValues = [];
      for (let i in visibleMz) {
        mzValues.push(visibleMz[i].mz);
      }
      state.images.imageData[0].mzValues = mzValues;
      state.images.imageData[1].mzValues = [];
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
    OPTIONS_DATA_CHANGE_GRAPH: (state, graph) => {
      state.options.data.graph = graph;
    },
    OPTIONS_IMAGE_CHANGE_MERGE_METHOD: (state, mergeMethod) => {
      state.options.image.mergeMethod = mergeMethod;
    },
    OPTIONS_MZLIST_SORT_MZ: state => {
      state.options.mzList.visibleMz = mzListService.sortMzList(
        state.options.mzList.visibleMz,
        state.options.mzList.asc
      );
    },
    OPTIONS_MZLIST_UPDATE_SELECTED_MZ: (state, data) => {
      state.options.mzList.selectedMz = data;
      state.images.imageData[1].mzValues = data;
      state.network.series[0].data = networkService.highlightNodesByMz(
        state.network.series[0].data,
        data
      );
    },
    OPTIONS_MZLIST_UPDATE_HIGHLIGHTED_MZ: (state, mzValues) => {
      const tuple = mzListService.updateHighlightedMz(
        state.options.mzList.visibleMz,
        state.options.mzList.notVisibleMz,
        mzValues,
        state.options.mzList.showAll,
        state.options.mzList.asc
      );
      state.options.mzList.visibleMz = tuple[0];
      state.options.mzList.notVisibleMz = tuple[1];
    },
    OPTIONS_MZLIST_LOAD_GRAPH: state => {
      state.options.mzList.notVisibleMz = [];
      state.options.mzList.visibleMz = mzListService.loadGraph(
        state.options.data.graph,
        state.originalGraphData.graphs
      );
    },
    OPTIONS_MZLIST_RESET_HIGHLIGHTED_MZ: state => {
      const tuple = mzListService.resetHighlightedMz(
        state.options.mzList.visibleMz,
        state.options.mzList.notVisibleMz,
        state.options.mzList.showAll,
        state.options.mzList.asc
      );
      state.options.mzList.notVisibleMz = tuple[1];
      state.options.mzList.visibleMz = mzListService.sortMzList(
        tuple[0],
        state.options.mzList.asc
      );
      state.network.series[0].data = networkService.highlightNodes(
        state.network.series[0].data,
        []
      );
      state.images.imageData[0].mzValues = [];
      state.images.imageData[1].mzValues = [];
    },
    OPTIONS_MZLIST_CALCULATE_VISIBLE_MZ: state => {
      const tuple = mzListService.calculateVisibleMz(
        state.options.mzList.showAll,
        state.options.mzList.notVisibleMz,
        state.options.mzList.visibleMz,
        state.options.mzList.asc
      );
      state.options.mzList.visibleMz = tuple[0];
      state.options.mzList.notVisibleMz = tuple[1];
    },
  },
  actions: {
    fetchGraphData: context => {
      context.commit('SET_LOADING_GRAPH_DATA', true);
      const url = API_URL + '/datasets/graphdata';
      axios
        .get(url)
        .then(response => {
          context.commit('SET_ORIGINAL_GRAPH_DATA', response.data);
          context.commit('OPTIONS_MZLIST_LOAD_GRAPH');
          context.commit('OPTIONS_MZLIST_CALCULATE_VISIBLE_MZ');
          context.commit('SET_LOADING_GRAPH_DATA', false);
          context.commit('OPTIONS_MZLIST_SORT_MZ');
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
    fetchImageData: (context, index) => {
      /*let mzValues = context.state.options.mzList.selectedMz;
      if (index === 0) {
        mzValues = [381.079];
      }*/
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
