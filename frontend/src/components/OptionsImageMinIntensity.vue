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
  data() {
    return {
      updateValue: null,
    };
  },
  mounted: function() {
    this.$store.subscribe(mutation => {
      if (mutation.type === 'OPTIONS_IMAGE_CHANGE_MIN_INTENSITY') {
        let self = this;
        const value = this.minIntensity;
        this.updatedValue = value;
        setTimeout(function() {
          if (self.updatedValue === value) {
            self.$store.dispatch('fetchLassoSimilar', 1);
          }
        }, 500);
      }
    });
  },
};
</script>

<style scoped lang="scss">
.percentage {
  margin-left: 10px;
}
</style>
