import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import ApiService from './services/ApiService';
import OptionsService from './services/OptionsService';
let apiService = new ApiService();
let optionsService = new OptionsService();

export default new Vuex.Store({
  state: {
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
  },
  getters: {
    getMzValues: state => {
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
      return state.options.mzList.graph;
    },
  },
  mutations: {
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
      if (state.options.mzList.asc) {
        state.options.mzList.visibleMz = state.options.mzList.visibleMz.sort(
          (a, b) => a.mz - b.mz
        );
      } else {
        state.options.mzList.visibleMz = state.options.mzList.visibleMz.sort(
          (a, b) => b.mz - a.mz
        );
      }
    },
    OPTIONS_MZLIST_UPDATE_SELECTED_MZ: (state, data) => {
      state.options.mzList.selectedMz = data;
    },
    OPTIONS_MZLIST_LOAD_GRAPH: state => {
      const graphString = 'graph' + state.options.state.graph.toString();
      const numberOfLayers =
        Object.keys(state.originalData.graphs[graphString].graph).length - 1;
      const t = [];
      state.options.mzList.visibleMz = [];
      state.options.mzList.notVisibleMz = [];
      Object.keys(state.originalData.graphs[graphString].mzs).forEach(function(
        mz
      ) {
        t.push({
          highlight: Math.random() > 0.3,
          ...state.originalData.graphs[graphString].mzs[mz],
          name: state.originalData.graphs[graphString].graph[
            'hierarchy' + numberOfLayers
          ].nodes[
            state.originalData.graphs[graphString].mzs[mz][
              'hierarchy' + numberOfLayers
            ]
          ].name.toString(),
          mz: mz,
        });
      });
      state.options.mzList.visibleMz.push(...t);
    },
    OPTIONS_MZLIST_CALCULATE_VISIBLE_MZ: state => {
      if (state.options.mzList.showAll) {
        if (state.options.mzList.notVisibleMz.length > 0) {
          state.options.mzList.visibleMz.push(
            ...state.options.mzList.notVisibleMz
          );
          state.options.mzList.notVisibleMz = [];
          if (state.options.mzList.asc) {
            state.options.mzList.visibleMz = state.options.mzList.visibleMz.sort(
              (a, b) => a.mz - b.mz
            );
          } else {
            state.options.mzList.visibleMz = state.options.mzList.visibleMz.sort(
              (a, b) => b.mz - a.mz
            );
          }
        }
      } else {
        for (let i = state.options.mzList.visibleMz.length - 1; i >= 0; i--) {
          if (!state.options.mzList.visibleMz[i].highlight) {
            state.options.mzList.notVisibleMz.push(
              state.options.mzList.visibleMz[i]
            );
            state.options.mzList.visibleMz.splice(i, 1);
          }
        }
      }
    },
  },
  actions: {
    fetchData: context => {
      context.commit('SET_ORIGINAL_DATA', apiService.fetchData());
    },
    updateOptionsImage: (context, data) => {
      let calculatedImageOptions = optionsService.calculateImageOptions(data);
      context.commit('OPTIONS_IMAGE_UPDATE', calculatedImageOptions);
    },
  },
});
