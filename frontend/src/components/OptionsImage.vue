<template>
  <div class="data">
    <div class="row">
      <div class="col-md-12">
        Merge Method:
        <b-form-select
          v-model="mergeMethod"
          :options="optionsImageMergeMethodChoices"
          size="sm"
        >
        </b-form-select>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'OptionsData',
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
        this.$store.commit('OPTIONS_IMAGE_CHANGE_MERGE_METHOD', value);
      },
    },
  },
};
</script>

<style scoped lang="scss">
.network {
}
</style>
