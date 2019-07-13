<template>
  <div class="graph">
    <!-- Press Ctrl and click on node to expand community -->
    <!-- Press Ctrl+Alt and click node to shrink community -->
    <svg
      v-bind:width="this.width"
      v-bind:height="this.height"
      class="graphd3 links"
    ></svg>
  </div>
</template>

<script>
import store from '@/store';
import * as d3 from 'd3';
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
  methods: {
    zoomed: function() {
      this.networkSvg.svg.attr(
        'transform',
        'translate(' +
          d3.event.transform.x +
          ', ' +
          d3.event.transform.y +
          ') scale(' +
          d3.event.transform.k +
          ')'
      );
    },
  },
  mounted() {
    store.commit('NETWORK_LOAD_GRAPH');
    store.commit('NETWORK_INIT_SVG');
    store.commit('NETWORK_SIMULATION_INIT');

    d3.select('.graphd3').call(
      d3
        .zoom()
        .scaleExtent([1 / 3, 5])
        .on('zoom', this.zoomed)
    );
    console.log('svg fertig');
  },
};
</script>

<style scoped lang="scss">
.graph {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(231, 231, 231, 0.51);
  z-index: 100;
  color: white;
}

.links {
  stroke: #999;
}
</style>
