<template>
  <div class="network">
    <div class="row">
      <div class="col-md-12">
        <b-form-select
          v-on:change="updateParameters"
          v-model="parameters.repulsion"
          class="mb-3"
          :options="repulsionOptions"
        >
        </b-form-select>
        <b-form-select
          v-on:change="updateParameters"
          v-model="parameters.iterations"
          class="mb-3"
          :options="iterationOptions"
        >
        </b-form-select>
        <b-form-select
          v-on:change="updateParameters"
          v-model="parameters.edgeLength"
          class="mb-3"
          :options="edgeLengthOptions"
        >
        </b-form-select>
        <b-button variant="outline-danger" @click="clearList">Clear</b-button>
      </div>
    </div>
    <hr />
  </div>
</template>

<script>
import store from '@/store';
import { mapGetters } from 'vuex';
import * as _ from 'lodash';

export default {
  name: 'OptionsNetwork',
  data() {
    return {
      parameters: {
        repulsion: 0,
        iterations: 0,
        edgeLength: 0,
      },
      repulsionOptions: [
        {
          value: -50,
          text: '50',
        },
        {
          value: -150,
          text: '150',
        },
        {
          value: -300,
          text: '300',
        },
        {
          value: -500,
          text: '500',
        },
      ],
      iterationOptions: [
        {
          value: 200,
          text: '200',
        },
        {
          value: 300,
          text: '300',
        },
        {
          value: 500,
          text: '500',
        },
        {
          value: 1000,
          text: '1000',
        },
      ],
      edgeLengthOptions: [
        {
          value: 10,
          text: '10',
        },
        {
          value: 30,
          text: '30',
        },
        {
          value: 75,
          text: '75',
        },
        {
          value: 150,
          text: '150',
        },
      ],
    };
  },
  computed: mapGetters({
    force: 'networkOptions',
  }),
  methods: {
    clearList() {
      store.commit('MZLIST_RESET_HIGHLIGHTED_MZ');
    },
    updateParameters() {
      store.commit('SET_NETWORK_OPTIONS', this.parameters);
    },
  },
  mounted() {
    this.parameters = _.cloneDeep(this.force);
    for (const o of this.repulsionOptions) {
      if (o.value === this.force.repulsion) {
        o['selected'] = true;
      }
    }
    for (const o of this.iterationOptions) {
      if (o.value === this.force.iterations) {
        o['selected'] = true;
      }
    }
    for (const o of this.edgeLengthOptions) {
      if (o.value === this.force.edgeLength) {
        o['selected'] = true;
      }
    }
  },
};
</script>

<style scoped lang="scss">
.network {
}
</style>
