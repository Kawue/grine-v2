import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import testData from './data/test_new_json';

export default new Vuex.Store({
  state: {
    originalData: {},
  },
  getters: {
    getMzValues: state => {
      return state.originalData.graphs.graph0.mzs;
    },
    getData: state => {
      return state.originalData.graphs;
    },
  },
  mutations: {
    FETCH_ALL: state => {
      console.log('fetching json data');
      // later we will call api here
      state.originalData = testData;
    },
  },
  actions: {
    fetchData: context => {
      context.commit('FETCH_ALL');
    },
  },
});
