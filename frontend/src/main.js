import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vue-awesome/icons';
import Icon from 'vue-awesome/components/Icon';
import ECharts from 'vue-echarts';
import 'echarts/lib/chart/graph';
import 'zrender/lib/svg/svg';

Vue.component('v-icon', Icon);
Vue.component('v-chart', ECharts);
Vue.use(BootstrapVue);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
