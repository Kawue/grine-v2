import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon';
import * as d3 from 'd3';

Vue.component('v-icon', Icon);
Vue.use(BootstrapVue);
Vue.config.productionTip = false;
window['d3'] = d3;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
