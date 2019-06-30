<template>
  <div class="graph">
    <!-- Press Ctrl and click on node to expand community -->
    <!-- Press Ctrl+Alt and click node to shrink community -->
    <v-chart
      :options="network"
      style="width: 100vw; height: 100vh;"
      @click="onClickGraph"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import store from '@/store';

export default {
  name: 'Graph',
  data: function() {
    return {
      ctrl: false,
      alt: false,
    };
  },
  computed: {
    ...mapGetters({
      graph: 'getGraph',
      selMz: 'mzListOptionsSelectedMz',
      network: 'network',
    }),
  },
  methods: {
    onClickGraph(event) {
      if (event.dataType === 'node' && event.value != null) {
        // Expand community
        if (this.ctrl && !this.alt) {
          store.commit('NETWORK_EXPAND_NODE', event);
        } // shrink community
        else if (this.alt && this.ctrl) {
          store.commit('NETWORK_SHRINK_NODE', event.data);
        } else {
          store.commit('MZLIST_UPDATE_HIGHLIGHTED_MZ', event.value.mzs);
          store.commit('NETWORK_HIGHLIGHT_NODE', [event.dataIndex]);
        }
      } /*else if (event.dataType === 'edge') {

        this.selectIndex = event.dataIndex;
        this.trueIndex = this.getEdgeIndex(
          event.data.source,
          event.data.target
        );
        console.log(
          `Delete Link ${
            this.optionsV.series[0].links[this.trueIndex].source
          } -> ${this.optionsV.series[0].links[this.trueIndex].target}`
        );
        // this.optionsV.series[0].links.splice(this.trueIndex, 1);
      } */ else {
        store.commit('MZLIST_RESET_HIGHLIGHTED_MZ');
      }
    },
    getEdgeIndex: function(source, target) {
      return this.network.series[0].links.findIndex(link => {
        return link.source === source && link.target === target;
      });
    },
    keyDownHandler: function(event) {
      switch (event.which) {
        case 17:
          this.ctrl = true;
          break;
        case 18:
          this.alt = true;
          break;
        default:
      }
    },
    keyUpHandler: function(event) {
      switch (event.which) {
        case 17:
          this.ctrl = false;
          break;
        case 18:
          this.alt = false;
          break;
        default:
      }
    },
  },
  mounted() {
    window.addEventListener('keyup', this.keyUpHandler);
    window.addEventListener('keydown', this.keyDownHandler);
    store.commit('NETWORK_LOAD');
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
</style>
