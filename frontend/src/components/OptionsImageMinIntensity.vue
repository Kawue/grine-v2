<template>
  <div>
    <input type="range" min="0" max="100" v-model="minIntensity" />
    <span class="percentage">{{ minIntensity }}%</span>
  </div>
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
.percentage {
  margin-left: 10px;
}
</style>
