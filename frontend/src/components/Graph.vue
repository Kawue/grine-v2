<template>
  <div class="graph">
    <!-- Press Ctrl and click on node to expand community -->
    <!-- Press Ctrl+Alt and click node to shrink community -->
    <svg
      v-bind:width="this.width"
      v-bind:height="this.height"
      class="graphd3"
    ></svg>
  </div>
</template>

<script>
import store from '@/store';
import { mapGetters } from 'vuex';

export default {
  name: 'Graph',
  data: function() {
    return {
      height: window.innerHeight,
      width: window.innerWidth,
    };
  },
  computed: mapGetters({
    networkSvg: 'networkSVGElements',
  }),
  mounted() {
    store.commit('NETWORK_LOAD_GRAPH');
    store.commit('NETWORK_INIT_SVG');
    store.commit('NETWORK_SIMULATION_INIT');
    store.commit('NETWORK_NODETRIX_CHANGE_COLORSCALE');
    store.subscribe(mutation => {
      if (mutation.type === 'OPTIONS_IMAGE_CHANGE_COLOR_SCALE') {
        store.commit('NETWORK_NODETRIX_CHANGE_COLORSCALE');
      }
    });
    console.log('svg fertig');
  },
};
</script>

<style lang="scss">
@import '../../node_modules/bootstrap/scss/bootstrap';

.graph {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(231, 231, 231, 0.5);
  z-index: 100;
  color: white;
}
.lasso path {
  stroke: rgb(80, 80, 80);
  stroke-width: 2px;
}
.lasso .drawn {
  fill-opacity: 0.05;
}
.lasso .loop_close {
  fill: none;
  stroke-dasharray: 4, 4;
}
.lasso .origin {
  fill: $primary;
  fill-opacity: 0.5;
}
#nodeTrix:hover {
  --beepboop: 1;
}
#nodeTrix:not(:hover) {
  --beepboop: 0;
}
</style>
