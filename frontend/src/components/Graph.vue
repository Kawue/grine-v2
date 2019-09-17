<template>
  <div class="graph">
    <!-- Press Ctrl and click on node to expand community -->
    <!-- Press Ctrl+Alt and click node to shrink community -->
    <svg
      v-bind:width="this.width"
      v-bind:height="this.height"
      class="graphd3"
    ></svg>

    <!-- Modal for selection of assignment parent -->
    <b-modal
      id="assignmentModal"
      ref="assignmentModal"
      title="Select Parent for all"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <template slot="default">
        <b-form-group style="margin-bottom: 0;">
          <b-form-radio-group
            v-model="selected"
            name="radios-stacked"
            class="radio-selection"
            v-bind:style="{
              maxHeight: 70 * Math.ceil(myList.length / 3) + 'px',
            }"
          >
            <div
              v-for="node in myList"
              class="radio-selection-node"
              v-bind:key="node.name"
            >
              <svg
                width="50px"
                height="50px"
                style="margin-right: 10px"
                @click="selected = parseInt(node.name.split('n')[1], 10)"
              >
                <circle :fill="node.color" cx="25" cy="25" r="25" />
              </svg>
              <b-form-radio :value="parseInt(node.name.split('n')[1], 10)">
                {{ node.name }}</b-form-radio
              >
            </div>
          </b-form-radio-group>
        </b-form-group>
      </template>
      <template slot="modal-footer" slot-scope="{ cancel, ok }">
        <b-button variant="danger" @click="testDelete">
          Delete
        </b-button>
        <b-button variant="primary" @click="testAdd">
          Add
        </b-button>
        <b-button variant="outline-danger" @click="cancel()">
          Cancel
        </b-button>
        <b-button variant="success" @click="ok()" :disabled="!state">
          Confirm
        </b-button>
      </template>
    </b-modal>

    <!-- Bottom Bar -->
    <div id="bottom-button-container">
      <b-button variant="warning" size="lg" @click="clearSelection"
        >Clear</b-button
      >

      <b-button
        class="large-left-margin"
        variant="warning"
        size="lg"
        :disabled="!(nodeTrixActive && !lassoActive)"
        @click="resetNodeTrix"
        >Reset NodeTrix</b-button
      >
      <b-button
        class="small-left-margin"
        variant="primary"
        size="lg"
        :disabled="!(nodeTrixPossible && !lassoActive)"
        @click="computeNodeTrix"
        >NodeTrix</b-button
      >

      <b-button
        class="large-left-margin"
        variant="primary"
        size="lg"
        :disabled="!splitPossible"
        @click="splitCluster"
        >Split</b-button
      >
      <b-button
        v-b-modal="'assignmentModal'"
        variant="primary"
        size="lg"
        class="small-left-margin"
        >Change Assignment</b-button
      >
      <b-button
        v-b-modal="'assignmentModal'"
        variant="primary"
        size="lg"
        class="small-left-margin"
        >Merge Nodes</b-button
      >
    </div>
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
      selected: null,
      myList: [
        { name: 'h0n11', color: '#AAFFAA' },
        { name: 'h0n12', color: '#ff433f' },
      ],
      counter: 13,
    };
  },
  computed: {
    ...mapGetters({
      networkSvg: 'networkSVGElements',
      nodeTrixPossible: 'networkNodeTrixPossible',
      nodeTrixActive: 'networkNodeTrixActive',
      lassoActive: 'isMzLassoSelectionActive',
      splitPossible: 'networkClusterSplitPossible',
    }),
    state() {
      return Boolean(this.selected);
    },
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
    splitCluster() {
      store.commit('NETWORK_SPLIT_CLUSTER');
    },
    handleOk() {
      console.log('Modal Ok');
      console.log(this.selected);
      this.selected = null;
    },
    handleCancel() {
      console.log('Modal cancel');
      this.selected = null;
    },
    testAdd() {
      this.myList.push({
        name: 'h0n' + this.counter,
        color: d3.interpolateRainbow(Math.random()),
      });
      this.counter++;
    },
    testDelete() {
      if (this.myList.length > 2) {
        this.myList.splice(0, 1);
      }
    },
  },
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
  background-color: #404040;
  z-index: 100;
  color: white;
}
#bottom-button-container {
  position: absolute;
  left: 3vw;
  bottom: 5vh;
  z-index: 100;
  font-size: 1.2em;
}
.lasso path {
  stroke: rgb(239, 235, 220);
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
.custom-control {
  display: inline-block;
}
.radio-selection {
  display: flex;
  flex-flow: row wrap;
  align-content: space-evenly;
}
.radio-selection-node {
  margin: 10px 5px;
  display: inline-block;
}
.small-left-margin {
  margin-left: 15px;
}
.large-left-margin {
  margin-left: 50px;
}
</style>
