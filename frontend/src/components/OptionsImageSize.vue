<template>
  <div class="flex-container">
    <vue-slider
      v-model="imageScaleFactor"
      v-bind="sliderOptions"
      :dragOnClick="true"
      class="sliderCategorical"
    ></vue-slider>
    <!--<span class="scalefactor">{{ imageScaleFactor }}</span>-->
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/default.css';
import * as imageIndex from '../constants';
import store from '@/store';

export default {
  components: {
    VueSlider,
  },
  name: 'OptionsImageSize',
  computed: {
    ...mapGetters({
      state: 'getOptionsImage',
    }),
    imageScaleFactor: {
      get() {
        return this.state.imageScaleFactor;
      },
      set(value) {
        store.commit('OPTIONS_IMAGE_CHANGE_IMAGE_SCALE_FACTOR', value);
        store.dispatch('rescaleImages');
      },
    },
  },
  data() {
    return {
      updateValue: null,
      sliderOptions: {
        marks: {
          Smallest: '- - -',
          Smaller: '- -',
          Small: '-',
          Original: '0',
          Large: '+',
          Larger: '+ +',
          Largest: '+ + +',
        },
        data: [
          'Smallest',
          'Smaller',
          'Small',
          'Original',
          'Large',
          'Larger',
          'Largest',
        ],
        tooltipFormatter: '{value}',
      },
    };
  },
};
</script>

<style scoped lang="scss">
.sizefactor {
  margin-left: 10px;
}
.sliderCategorical {
  width: 75% !important;
}
.flex-container {
  display: flex;
  flex-direction: row;
  margin-bottom: 40px;
}
</style>
