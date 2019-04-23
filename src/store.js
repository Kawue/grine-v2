import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import data from './data/0.70854_barley';

export default new Vuex.Store({
  state: {
    originalData: data,
  },
  mutations: {},
  actions: {
    getData() {
      return {
        test1: '1',
        test2: '2',
      };
    },
  },
});
