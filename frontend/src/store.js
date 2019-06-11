import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
Vue.config.devtools = true;

import OptionsService from './services/OptionsService';
import MzListService from './services/MzListService';
import ImageService from './services/ImageService';
let optionsService = new OptionsService();
let mzListService = new MzListService();
let imageService = new ImageService();
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export default new Vuex.Store({
  state: {
    loadingGraphData: true,
    originalGraphData: {},
    dataSets: [],
    images: {
      originalImageData: {},
      imageData: [],
      mzValue: null,
      loadingImageData: true,
    },
    options: {
      state: {
        tabActive: null,
        tabLocked: null,
        tabsExpanded: false,
      },
      network: {},
      image: {
        showMz: true,
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
        graph: 0,
        graphChoices: {},
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
      return state.originalGraphData.graphs['graph' + state.options.data.graph].mzs;
    },
    getGraphData: state => {
      return state.originalGraphData.graphs;
    },
    getImageData: state => {
      return state.images.imageData;
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
    stateOptionsGraph: state => {
      return state.options.data.graph;
    },
    optionsDataGraphChoices: state => {
      return state.options.data.graphChoices;
    },
  },
  mutations: {
    SET_LOADING_IMAGE_DATA: (state, loading) => {
      state.images.loadingImageData = loading;
    },
    SET_ORIGINAL_IMAGE_DATA: (state, originalData) => {
      state.images.originalImageData = originalData;
    },
    SET_IMAGE_DATA: (state, data) => {
      state.images.imageData = data;
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
    OPTIONS_MZLIST_SORT_MZ: state => {
      state.options.mzList.visibleMz = mzListService.sortMzList(
        state.options.mzList.visibleMz,
        state.options.mzList.asc
      );
    },
    OPTIONS_MZLIST_UPDATE_SELECTED_MZ: (state, data) => {
      state.options.mzList.selectedMz = data;
    },
    OPTIONS_MZLIST_LOAD_GRAPH: state => {
      state.options.mzList.notVisibleMz = [];
      state.options.mzList.visibleMz = mzListService.loadGraph(
        state.options.data.graph,
        state.originalGraphData.graphs
      );
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
      axios.get(url).then(response => {
        context.commit('SET_ORIGINAL_GRAPH_DATA', response.data);
        context.commit('OPTIONS_MZLIST_LOAD_GRAPH');
        context.commit('OPTIONS_MZLIST_CALCULATE_VISIBLE_MZ');
        context.commit('SET_LOADING_GRAPH_DATA', false);
        context.dispatch('fetchImageData');
      });
    },
    fetchImageData: context => {
      context.commit('SET_LOADING_IMAGE_DATA', true);
      const datasetName =
        context.state.options.data.graphChoices[
          context.state.options.data.graph
        ];
      const url = API_URL + '/datasets/' + datasetName + '/imagedata';
      axios.get(url).then(response => {
        context.commit('SET_ORIGINAL_IMAGE_DATA', response.data);
        context.commit('SET_LOADING_IMAGE_DATA', false);
      });
    },
    updateOptionsImage: (context, data) => {
      let calculatedImageOptions = optionsService.calculateImageOptions(data);
      context.commit('OPTIONS_IMAGE_UPDATE', calculatedImageOptions);
    },
    imagesMzImageRender: (context, mzValue) => {
      context.state.images.mzValue = mzValue;
      if (
        typeof context.state.images.originalImageData[
          context.state.images.mzValue
        ] === 'undefined'
      ) {
        context.commit('SET_IMAGE_DATA', []);
        return;
      }
      let imageData = imageService.calculateColors(
        context.state.images.originalImageData[context.state.images.mzValue]
      );
      context.commit('SET_IMAGE_DATA', imageData);
      context.dispatch('imagesMzImageSelectPoints', []);
    },
    imagesMzImageSelectPoints: (context, selectedPoints) => {
      let imageData = imageService.markSelectedPoints(
        context.state.images.imageData,
        selectedPoints
      );
      imageData = imageService.calculateColors(imageData);
      context.commit('SET_IMAGE_DATA', imageData);
    },
  },
});
