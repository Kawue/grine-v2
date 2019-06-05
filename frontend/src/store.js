import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import OptionsService from './services/OptionsService';
import MzListService from './services/MzListService';
let optionsService = new OptionsService();
let mzListService = new MzListService();
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export default new Vuex.Store({
  state: {
    loading: true,
    originalData: {},
    options: {
      state: {
        tabActive: null,
        tabLocked: null,
        tabsExpanded: false,
        graph: 0,
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
      data: {},
    },
    images: {},
  },
  getters: {
    getMzValues: state => {
      if (state.loading) {
        return;
      }
      return state.originalData.graphs['graph' + state.options.state.graph].mzs;
    },
    getData: state => {
      return state.originalData.graphs;
    },
    getOptionsImage: state => {
      return state.options.image;
    },
    getOptionsState: state => {
      return state.options.state;
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
      return state.options.state.graph;
    },
  },
  mutations: {
    SET_LOADING: (state, loading) => {
      state.loading = loading;
    },
    SET_ORIGINAL_DATA: (state, originalData) => {
      state.originalData = originalData;
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
    OPTIONS_STATE_CHANGE_GRAPH: (state, graph) => {
      state.options.state.graph = graph;
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
        state.options.state.graph,
        state.originalData.graphs
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
    fetchData: context => {
      const url = API_URL + '/datasets/graphdata';
      axios.get(url).then(response => {
        context.commit('SET_ORIGINAL_DATA', response.data);
        context.commit('OPTIONS_MZLIST_LOAD_GRAPH');
        context.commit('OPTIONS_MZLIST_CALCULATE_VISIBLE_MZ');
        context.commit('SET_LOADING', false);
      });
    },
    updateOptionsImage: (context, data) => {
      let calculatedImageOptions = optionsService.calculateImageOptions(data);
      context.commit('OPTIONS_IMAGE_UPDATE', calculatedImageOptions);
    },
  },
});
