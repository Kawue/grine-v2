<template>
  <div class="flex-container">
    <div class="row">
      <div class="col">
        <b-form-checkbox
          v-bind:class="{ clickable: !disableRelativeCheckbox }"
          v-model="relative"
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
import store from '@/store';

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
        store.commit('OPTIONS_IMAGE_DIM_RED_CHANGE_RELATIVE', value);
        store.dispatch('fetchDimRedImage');
      },
    },
    disableRelativeCheckbox: {
      get() {
        return (
          store.getters.getImageData(imageIndex.DIM_RED).mzValues
            .length === 0
        );
      },
    },
  },
};
</script>

<style scoped lang="scss">
.clickable {
  cursor: pointer;
}
</style>
