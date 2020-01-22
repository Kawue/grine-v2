<template>
  <div class="flex-container">
    <vue-slider
      v-model="threshold"
      v-bind="sliderOptions"
      @change="updateThreshold"
      :dragOnClick="true"
      class="slider"
      v-bind:disabled="state.dimred.relative || disableRelativeCheckbox"
    ></vue-slider>
    <span class="percentage">{{ threshold }}%</span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';
import store from '@/store';
import * as imageIndex from '../constants';

export default {
  components: {
    VueSlider,
  },
  name: 'OptionsImageDimRedThreshold',
  computed: {
    ...mapGetters({
      state: 'getOptionsImage',
    }),
    disableRelativeCheckbox: {
      get() {
        return (
          store.getters.getImageData(imageIndex.DIM_RED).mzValues.length === 0
        );
      },
    },
  },
  data() {
    return {
      threshold: 50,
      sliderOptions: {
        min: 0,
        max: 100,
        tooltipFormatter: '{value}%',
        lazy: true,
      },
    };
  },
  methods: {
    updateThreshold() {
      store.commit('OPTIONS_IMAGE_DIM_RED_CHANGE_THRESHOLD', this.threshold);
      store.dispatch('fetchDimRedImage');
    },
  },
  mounted() {
    this.threshold = this.state.dimred.threshold;
  },
};
</script>

<style scoped lang="scss">
.percentage {
  margin-left: 10px;
}
.slider {
  width: 75% !important;
}
.flex-container {
  display: flex;
  flex-direction: row;
}
</style>
