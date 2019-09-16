<template>
  <div class="home">
    <SidebarLeft />
    <SidebarRight v-if="!loading" />
    <Graph v-if="!loading" />
    <div id="bottom-button-container">
      <b-button
        id="clear-button"
        variant="warning"
        size="lg"
        @click="clearSelection"
        >Clear</b-button
      >

      <b-button
        variant="warning"
        size="lg"
        :disabled="!(nodeTrixActive && !lassoActive)"
        @click="resetNodeTrix"
        >Reset NodeTrix</b-button
      >
      <b-button
        id="nodeTrix-button"
        variant="primary"
        size="lg"
        :disabled="!(nodeTrixPossible && !lassoActive)"
        @click="computeNodeTrix"
        >NodeTrix</b-button
      >

      <b-button
        style="margin-left: 50px;"
        variant="primary"
        size="lg"
        v-if="splitPossible"
        @click="splitCluster"
        >Split</b-button
      >
    </div>
    <div class="mode-container text-center" @click="toggleMode">
      <div v-if="lassoMode" class="selected-mode">
        Free Mode
      </div>
      <div v-else class="selected-mode">
        Lasso Mode
      </div>
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
      nodeTrixPossible: 'networkNodeTrixPossible',
      nodeTrixActive: 'networkNodeTrixActive',
      lassoActive: 'isMzLassoSelectionActive',
      splitPossible: 'networkClusterSplitPossible',
    }),
  },
  mounted: function() {
    store.dispatch('fetchGraphData');
    store.dispatch('fetchMergeMethods');
  },
  methods: {
    clearSelection() {
      store.commit('RESET_SELECTION');
    },
    computeNodeTrix() {
      store.commit('NETWORK_COMPUTE_NODETRIX');
    },
    resetNodeTrix() {
      store.commit('NETWORK_NODETRIX_RESET');
    },
    toggleMode() {
      store.commit('NETWORK_TOGGLE_MODE');
    },
    splitCluster() {
      store.commit('NETWORK_SPLIT_CLUSTER');
    },
  },
};
</script>
<style scoped lang="scss">
#clear-button {
  margin-right: 50px;
}
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
#nodeTrix-button {
  margin-left: 15px;
}
#bottom-button-container {
  position: absolute;
  left: 3vw;
  bottom: 5vh;
  z-index: 100;
  font-size: 1.2em;
}
</style>
