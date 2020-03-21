<template>
  <div class="flex-container">
    <vue-slider
      v-model="alpha"
      v-bind="sliderOptions"
      :dragOnClick="true"
      :disabled="!disableSlider"
      class="slider"
    ></vue-slider>
    <span>{{ alpha.toFixed(0) }}%</span>
  </div>
</template>

<script>
import store from '@/store';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';
import * as imageIndex from '../constants';

export default {
  name: 'OptionsHistoAlpha',
  components: {
    VueSlider,
  },
  data: function() {
    return {
      sliderOptions: {
        min: 0,
        max: 100,
        tooltipFormatter: '{value}%',
        lazy: false,
      },
    };
  },
  computed: {
    disableSlider: function() {
      return store.getters.getImageData(imageIndex.HIST).showOverlay;
    },
    alpha: {
      get() {
        return Math.round(store.getters.getHistoAlpha * 100);
      },
      set(alpha) {
        store.commit('SET_HISTO_ALPHA', alpha / 100);
      },
    },
  },
};
</script>

<style scoped>
.slider {
  width: 80% !important;
}
.flex-container {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
}
</style>
