<template>
  <div class="home">
    <SidebarLeft />
    <SidebarRight v-if="!loading" />
    <Graph v-if="!loading" />
    <div class="mode-container text-center" @click="toggleMode">
      <div class="selected-mode">{{ lassoMode ? 'Free' : 'Lasso' }} Mode</div>
    </div>
  </div>
</template>

<script>
import SidebarLeft from '@/components/SidebarLeft.vue';
import SidebarRight from '@/components/SidebarRight.vue';
import Graph from '@/components/Graph.vue';
import store from '@/store';
import { mapGetters } from 'vuex';

export default {
  name: 'home',
  components: {
    SidebarLeft,
    SidebarRight,
    Graph,
  },
  computed: {
    ...mapGetters({
      loading: 'getLoadingGraphData',
      lassoMode: 'networkLassoMode',
    }),
  },
  mounted: function() {
    store.dispatch('fetchGraphData');
    store.dispatch('fetchMergeMethods');
  },
  methods: {
    toggleMode() {
      store.commit('NETWORK_TOGGLE_MODE');
    },
  },
};
</script>
<style scoped lang="scss">
.selected-mode {
  width: 150px;
  font-size: 1.4em;
  border: 1px solid black;
  padding-bottom: 5px;
}
.mode-container {
  position: absolute;
  left: 3vw;
  background-color: rgba(231, 231, 231, 0.5);
  top: 0;
  z-index: 100;
  cursor: pointer;
}
</style>
