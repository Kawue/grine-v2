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
        this.$store.commit('OPTIONS_IMAGE_CHANGE_IMAGE_SCALE_FACTOR', value)

        let self = this;
        this.updateValue = value;
        // why timeout?
        setTimeout(function() {
          // loop reasons?
          if (self.updateValue === value) {
            self.$store.dispatch('rescaleImages')
          }
        }, 500);
      },
    },
  },
  data() {
    return {
      updateValue: null,
      sliderOptions: {
        marks: {'Smallest': '- - -', 'Smaller': '- -', 'Small': '-', 'Original': '0', 'Large': '+', 'Larger': '+ +', 'Largest': '+ + +'},
        data: ['Smallest', 'Smaller', 'Small', 'Original', 'Large', 'Larger', 'Largest'],
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
