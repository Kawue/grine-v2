<template>
  <div class="home">
    <SidebarLeft />
    <SidebarRight v-if="!loading" />
    <Graph v-if="!loading" />
    <b-button
      id="clear-button"
      variant="warning"
      size="lg"
      @click="clearSelection"
      >Clear</b-button
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
      id="nodeTrix-reset-button"
      variant="warning"
      size="lg"
      :disabled="!(nodeTrixActive && !lassoActive)"
      @click="resetNodeTrix"
      >Reset NodeTrix</b-button
    >
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
    }),
  },
  mounted: function() {
    console.log('home component mounted');
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
  },
};
</script>
<style scoped lang="scss">
#clear-button {
  position: absolute;
  left: 3vw;
  bottom: 5vh;
  font-size: 1.2em;
  z-index: 100;
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
  position: absolute;
  left: 20vw;
  bottom: 5vh;
  font-size: 1.2em;
  z-index: 100;
}
#nodeTrix-reset-button {
  position: absolute;
  left: 10vw;
  bottom: 5vh;
  font-size: 1.2em;
  z-index: 100;
}
</style>
