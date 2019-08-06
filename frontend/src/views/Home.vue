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
      v-if="nodeTrix"
      @click="computeNodeTrix"
      >NodeTrix</b-button
    >
    <div class="mode-container text-center">
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
      nodeTrix: 'networkNodeTrixPossible',
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
}
#nodeTrix-button {
  position: absolute;
  left: 3vw;
  top: 55vh;
  font-size: 1.2em;
  z-index: 100;
}
</style>
