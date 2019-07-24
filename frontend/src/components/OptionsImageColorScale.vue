<template>
  <b-form-select
    v-model="colorScale"
    :options="optionsImageColorScaleChoices"
    size="sm"
  >
  </b-form-select>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'OptionsImageColorScale',
  computed: {
    ...mapGetters({
      optionsImageColorScaleChoices: 'optionsImageColorScaleChoices',
      state: 'getOptionsImage',
    }),
    colorScale: {
      get() {
        return this.state.colorScale;
      },
      set(value) {
        this.$store.commit('OPTIONS_IMAGE_CHANGE_COLOR_SCALE', value);
      },
    },
  },
};
</script>

<style scoped lang="scss">
</style>
