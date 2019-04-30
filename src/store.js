import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

//import testData from './data/0.70854_barley';
import testData from './data/test_new_json';

export default new Vuex.Store({
  state: {
    originalData: {},
    options: {
      network: {},
      image: {
        headline: true,
      },
      data: {},
    },
  },
  getters: {
    getMzValues: state => {
      return state.originalData.mz_values;
    },
    getData: state => {
      return state.originalData;
    },
    getOptionsImage: state => {
      return state.options.image;
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
