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
          style="margin-bottom: 20px !important"
        ></vue-slider>
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
    updateParameters() {
      store.commit('SET_NETWORK_OPTIONS', this.parameters);
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
  margin: 0 15px 70px 15px;
}
</style>
