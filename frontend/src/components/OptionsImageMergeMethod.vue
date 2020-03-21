<template>
  <b-form-select
    v-model="mergeMethod"
    :options="optionsImageMergeMethodChoices"
    size="sm"
    class="clickable"
  >
  </b-form-select>
</template>

<script>
import { mapGetters } from 'vuex';
import store from '@/store';

export default {
  name: 'OptionsImageMergeMethod',
  computed: {
    ...mapGetters({
      optionsImageMergeMethodChoices: 'optionsImageMergeMethodChoices',
      state: 'getOptionsImage',
    }),
    mergeMethod: {
      get() {
        return this.state.mergeMethod;
      },
      set(value) {
        store.commit('OPTIONS_IMAGE_CHANGE_MERGE_METHOD', value);
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
