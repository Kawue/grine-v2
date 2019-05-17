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
      },
      network: {},
      image: {
        showMz: true,
      },
      data: {},
    },
  },
  getters: {
    getMzValues: state => {
      return state.originalData.graphs.graph0.mzs;
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
