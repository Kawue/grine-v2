<template>
  <div class="network">
    <div class="row">
      <div class="col-md-12">
        <div class="slider-label">Repulsion: {{ repulsion }}</div>
        <vue-slider
          v-model="repulsion"
          v-bind="optionsRepulsionSlider"
          @change="updateParameters"
          class="slider"
        ></vue-slider>
        <div class="slider-label">Iterations: {{ parameters.iterations }}</div>
        <vue-slider
          v-model="parameters.iterations"
          v-bind="optionsIterationSlider"
          @change="updateParameters"
          class="slider"
        ></vue-slider>
        <div class="slider-label">Edge Length: {{ parameters.edgeLength }}</div>
        <vue-slider
          v-model="parameters.edgeLength"
          v-bind="optionsEdgelengthSlider"
          @change="updateParameters"
          class="slider"
        ></vue-slider>
        <div class="button-container">
          <b-button
            class="center-buttons"
            variant="primary"
            @click="centerCamera"
            v-bind:disabled="!this.lassoMode"
          >
            Center Camera
          </b-button>
          <b-button
            class="center-buttons"
            variant="warning"
            @click="centerNodes"
            v-bind:disabled="!this.lassoMode"
          >
            Center Nodes
          </b-button>
          <b-button
            variant="primary"
            @click="toggleMode"
            id="toggle-button"
            v-if="canToggleMode()"
          >
            Toggle Mode
          </b-button>
        </div>
        <div class="mode-container text-center">
          <div v-if="this.lassoMode" class="selected-mode">
            Free Mode
          </div>
          <div v-else class="selected-mode">
            Lasso Mode
          </div>
        </div>
      </div>
    </div>
    <hr />
  </div>
</template>

<script>
import store from '@/store';
import { mapGetters } from 'vuex';
import * as _ from 'lodash';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

export default {
  components: {
    VueSlider,
  },
  name: 'OptionsNetwork',
  data() {
    return {
      parameters: {
        repulsion: 50,
        iterations: 100,
        edgeLength: 50,
      },
      optionsRepulsionSlider: {
        min: -100,
        max: 500,
        interval: 10,
        lazy: true,
        marks: val => (val + 100) % 120 === 0,
      },
      optionsEdgelengthSlider: {
        min: 50,
        max: 500,
        interval: 10,
        lazy: true,
        marks: val => (val - 50) % 90 === 0,
      },
      optionsIterationSlider: {
        min: 100,
        max: 1000,
        interval: 20,
        lazy: true,
        marks: val => (val - 100) % 180 === 0,
      },
    };
  },
  computed: {
    ...mapGetters({
      force: 'networkOptions',
      lassoMode: 'networkLassoMode',
    }),
    repulsion: {
      get() {
        return -this.parameters.repulsion;
      },
      set(value) {
        this.parameters.repulsion = -value;
      },
    },
  },
  methods: {
    canToggleMode() {
      return !store.getters.isMzLassoSelectionActive;
    },
    updateParameters() {
      store.commit('SET_NETWORK_OPTIONS', this.parameters);
    },
    centerNodes() {
      store.commit('NETWORK_CENTER_NODES');
    },
    centerCamera() {
      store.commit('NETWORK_CENTER_CAMERA');
    },
    toggleMode() {
      store.commit('NETWORK_TOGGLE_MODE');
    },
  },
  mounted() {
    this.parameters = _.cloneDeep(this.force);
    this.repulsion = -this.force.repulsion;
  },
};
</script>

<style scoped lang="scss">
.network {
}
.slider-label {
  margin-bottom: 10px;
  font-size: 1.2em;
}
.slider {
  margin: 0 15px 50px 15px;
}
.button-container {
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 20px;
}
.center-buttons {
  margin-left: -30px;
}
.selected-mode {
  width: 175px;
  font-size: 1.5em;
  border: 1px solid white;
  padding-bottom: 5px;
}
.mode-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  margin-right: 15px;
}
#toggle-button {
  margin-left: 30px;
}
</style>
