<template>
  <div class="flex-container">
    <vue-slider
      v-model="threshold"
      v-bind="sliderOptions"
      class="slider"
      v-bind:disabled="!state.pca.show || state.pca.relative"
    ></vue-slider>
    <span class="percentage">{{ threshold }}%</span>
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
  name: 'OptionsImagePcaThreshold',
  computed: {
    ...mapGetters({
      state: 'getOptionsImage',
    }),
    threshold: {
      get() {
        return this.state.pca.threshold;
      },
      set(value) {
        this.$store.commit('OPTIONS_IMAGE_PCA_CHANGE_THRESHOLD', value);

        let self = this;
        this.updatedValue = value;
        setTimeout(function() {
          if (self.updatedValue === value) {
            self.$store.dispatch('fetchPcaImageData', 3);
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
