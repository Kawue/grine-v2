<template>
  <div class="flex-container">
    <vue-slider
      v-model="minIntensity"
      v-bind="sliderOptions"
      :dragOnClick="true"
      class="slider"
    ></vue-slider>
    <span class="percentage">{{ minIntensity }}%</span>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';

export default {
  components: {
    VueSlider,
  },
  name: 'OptionsImageMinIntensity',
  computed: {
    ...mapGetters({
      state: 'getOptionsImage',
    }),
    minIntensity: {
      get() {
        return this.state.minIntensity;
      },
      set(value) {
        this.$store.commit('OPTIONS_IMAGE_CHANGE_MIN_INTENSITY', value);

        let self = this;
        this.updatedValue = value;
        setTimeout(function() {
          if (self.updatedValue === value) {
            self.$store.dispatch('fetchLassoSimilar', 3);
          }
        }, 500);
      },
    },
  },
  data() {
    return {
      updateValue: null,
      sliderOptions: {
        min: 0,
        max: 100,
        tooltipFormatter: '{value}%',
      },
    };
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
