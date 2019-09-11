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
    <div class="row">
      <div class="col-md-12">
        <a
          id="json-export"
          :download="'grineV2.json'"
          class="btn btn-primary"
          :href="downloadJson"
        >
          Export JSON
        </a>
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
      wholeData: 'getWholeData',
    }),
    selectedGraph: {
      get() {
        return this.state.graph;
      },
      set(value) {
        this.$store.dispatch('changeGraph', value);
      },
    },
    downloadJson() {
      return window.URL.createObjectURL(
        new Blob([JSON.stringify(this.wholeData, null, 2)], {
          type: 'application/json',
        })
      );
    },
  },
};
</script>

<style scoped lang="scss">
.network {
}
#json-export {
  margin: 10px;
}
</style>
