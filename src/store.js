import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import testData from './data/0.70854_barley';

export default new Vuex.Store({
  state: {
    originalData: {},
  },
  getters: {
    getMzValues: state => {
      return state.originalData.mz_values;
    },
    getData: state => {
      return state.originalData;
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
