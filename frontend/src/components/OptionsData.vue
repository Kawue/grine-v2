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
    <div class="row">
      <div class="col-md-12">
        <b-form-select
          v-model="selectedStatistic"
          :options="statisticOptions"
        ></b-form-select>
        <b-button variant="primary" @click="executeQuery">
          Query
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import store from '@/store';

export default {
  name: 'OptionsData',
  mounted: function() {
    this.$store.subscribeAction(action => {
      if (action.type === 'changeGraph') {
        this.$store.dispatch('fetchImageData');
      }
    });
  },
  data: function() {
    return {
      statisticOptions: [
        { value: 'centrality', text: 'Centrality' },
        { value: 'degree', text: 'Degree' },
        { value: 'eccentricity', text: 'Eccentricity' },
        { value: 'cluster_coefficient', text: 'Cluster coefficient' },
        { value: 'between_group_degree', text: 'Between Group Degree' },
        { value: 'within_group_degree', text: 'Within Group Degree' },
        { value: 'avg_edge_weights', text: 'Average Edge Weight' },
      ],
    };
  },
  computed: {
    ...mapGetters({
      optionsDataGraphChoices: 'optionsDataGraphChoices',
      state: 'getOptionsData',
      wholeData: 'getWholeData',
      stat: 'networkGraphStatistic',
    }),
    selectedGraph: {
      get() {
        return this.state.graph;
      },
      set(value) {
        this.$store.dispatch('changeGraph', value);
      },
    },
    selectedStatistic: {
      get() {
        return this.stat;
      },
      set(value) {
        store.commit('NETWORK_GRAPH_STATISTIC', value);
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
  methods: {
    executeQuery() {
      store.dispatch('graphQuery');
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
