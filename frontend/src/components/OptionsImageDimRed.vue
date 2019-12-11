<template>
  <div class="flex-container">
    <div class="row">
      <div class="col">
        <b-form-checkbox v-model="show" class="clickable">show</b-form-checkbox>
      </div>
      <div class="col">
        <b-form-checkbox
          v-bind:class="{ clickable: !disableRelativeCheckbox }"
          v-model="relative"
          v-if="show"
          v-bind:disabled="disableRelativeCheckbox"
          >relative</b-form-checkbox
        >
      </div>
    </div>

    <OptionsImageDimRedThreshold></OptionsImageDimRedThreshold>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import OptionsImageDimRedThreshold from './OptionsImageDimRedThreshold';
import * as imageIndex from '../constants';

export default {
  components: {
    OptionsImageDimRedThreshold,
  },
  name: 'OptionsImageDimRed',
  computed: {
    ...mapGetters({
      state: 'getOptionsImage',
    }),
    relative: {
      get() {
        return this.state.dimred.relative;
      },
      set(value) {
        this.$store.commit('OPTIONS_IMAGE_DIM_RED_CHANGE_RELATIVE', value);
        this.$store.dispatch('fetchDimRedImage');
      },
    },
    show: {
      get() {
        return this.state.dimred.show;
      },
      set(value) {
        this.$store.commit('OPTIONS_IMAGE_DIM_RED_CHANGE_SHOW', value);
        if (this.firstTime) {
          this.firstTime = false;
          this.$store.dispatch('fetchDimRedImage');
        }
      },
    },
    disableRelativeCheckbox: {
      get() {
        return (
          this.$store.getters.getImageData(imageIndex.DIM_RED).mzValues
            .length === 0
        );
      },
    },
  },
  data() {
    return {
      firstTime: true,
    };
  },
};
</script>

<style scoped lang="scss">
.clickable {
  cursor: pointer;
}
</style>
