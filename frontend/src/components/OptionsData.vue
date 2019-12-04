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
  data: function() {
    return {
      statisticOptions: [
        { value: 'degree', text: 'Degree (Dominant Pattern)' },
        // { value: 'eccentricity', text: 'Eccentricity' },
        {
          value: 'cluster_coefficient',
          text: 'Cluster coefficient (Core Nodes)',
        },
        {
          value: 'within_group_degree',
          text: 'Within Group Degree (Core Nodes)',
        },
        {
          value: 'between_group_degree',
          text: 'Between Group Degree (Potential Misclustering)',
        },
        { value: 'group_degree', text: 'Group degree (Potential Singletons)' },
        {
          value: 'within_cluster_centrality',
          text: 'Within cluster centrality (Potential Bridges)',
        },
        { value: 'centrality', text: 'Centrality (Central in Molecule-flow)' },
        { value: 'avg_edge_weights', text: 'Average Edge Weight' },
        // { value: 'spanning_tree_degree', text: 'Minimum spanning tree degree' },
        { value: 'avg_neighbor_degree', text: 'Avg neighbor degree' },
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
