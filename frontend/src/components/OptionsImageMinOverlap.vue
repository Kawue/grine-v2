<template>
  <input type="text" v-model="minOverlap" />
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'OptionsImageMinOverlap',
  computed: {
    ...mapGetters({
      state: 'getOptionsImage',
    }),
    minOverlap: {
      get() {
        return this.state.minOverlap;
      },
      set(value) {
        this.$store.commit('OPTIONS_IMAGE_CHANGE_MIN_OVERLAP', value);
      },
    },
  },
};
</script>

<style scoped lang="scss">
</style>
