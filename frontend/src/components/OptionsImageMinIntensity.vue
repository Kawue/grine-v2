<template>
  <!--<b-form-select-->
    <!--v-model="mergeMethod"-->
    <!--:options="optionsImageMergeMethodChoices"-->
    <!--size="sm"-->
  <!--&gt;-->
  <!--</b-form-select>-->
  <input type="text" v-model="minIntensity" />
</template>

<script>
import { mapGetters } from 'vuex';

export default {
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
      },
    },
  },
};
</script>

<style scoped lang="scss">
</style>
