<template>
  <div class="data">
    <div class="row">
      <div class="col-md-12">
        DataSet:
        <b-form-select
          v-model="selectedGraph"
          :options="optionsDataGraphChoices"
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
  mounted: function() {
    this.$store.subscribeAction(action => {
      if (action.type === 'changeGraph') {
        this.$store.dispatch('fetchImageData');
      }
    });
  },
  computed: {
    ...mapGetters({
      optionsDataGraphChoices: 'optionsDataGraphChoices',
      state: 'getOptionsData',
    }),
    selectedGraph: {
      get() {
        return this.state.graph;
      },
      set(value) {
        this.$store.dispatch('changeGraph', value);
      },
    },
  },
};
</script>

<style scoped lang="scss">
.network {
}
</style>
