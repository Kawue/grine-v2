<template>
  <div class="network">
    <div class="row">
      <div class="col-md-12">
        <b-form-select
          v-on:change="updateRepulsion"
          v-model="selectedRepulsion"
          class="mb-3"
        >
          <option value="500">500</option>
          <option value="1000">1000</option>
          <option selected value="2000">2000</option>
          <option value="5000">5000</option>
        </b-form-select>
        <b-form-select
          v-on:change="updateGravity"
          v-model="selectedGravity"
          class="mb-3"
        >
          <option value="0.01">0.01</option>
          <option selected value="0.1">0.1</option>
          <option value="0.3">0.3</option>
          <option value="0.5">0.5</option>
        </b-form-select>
        <b-form-select
          v-on:change="updateEdgeLength"
          v-model="selectedEdgeLength"
          class="mb-3"
        >
          <option value="10">10</option>
          <option selected value="30">30</option>
          <option value="50">50</option>
          <option value="70">70</option>
        </b-form-select>
        <b-button variant="outline-danger" @click="clearList">Clear</b-button>
      </div>
    </div>
    <hr />
  </div>
</template>

<script>
import store from '@/store';

export default {
  name: 'OptionsNetwork',
  data() {
    return {
      selectedRepulsion: 2000,
      selectedGravity: 0.1,
      selectedEdgeLength: 30,
    };
  },
  methods: {
    clearList() {
      store.commit('MZLIST_RESET_HIGHLIGHTED_MZ');
    },
    updateRepulsion() {
      store.commit(
        'SET_NETWORK_REPULSION',
        parseInt(this.selectedRepulsion, 10)
      );
    },
    updateGravity() {
      store.commit('SET_NETWORK_REPULSION', parseFloat(this.selectedGravity));
    },
    updateEdgeLength() {
      store.commit(
        'SET_NETWORK_EDGELENGTH',
        parseInt(this.selectedEdgeLength, 10)
      );
    },
  },
};
</script>

<style scoped lang="scss">
.network {
}
</style>
