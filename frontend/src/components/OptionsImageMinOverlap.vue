<template>
  <div>
    <input type="range" min="0" max="100" v-model="minOverlap" />
    <span class="percentage">{{ minOverlap }}%</span>
  </div>
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
  data() {
    return {
      updateValue: null,
    };
  },
  mounted: function() {
    this.$store.subscribe(mutation => {
      if (mutation.type === 'OPTIONS_IMAGE_CHANGE_MIN_OVERLAP') {
        let self = this;
        const value = this.minOverlap;
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
