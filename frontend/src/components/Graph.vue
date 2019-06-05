<template>
  <div class="graph">
    <h1>GRAPH</h1>
    <PackChart :tweetData="loadData"></PackChart>
  </div>
</template>

<script>
import tweets from '../data/tweets.json';
import PackChart from './PackChart';

export default {
  name: 'Graph',
  components: {
    PackChart,
  },
  data: function() {
    return {
      loadData: [],
    };
  },
  mounted() {
    console.log('App loaded');
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loadData = tweets;
    },
  },
};
</script>

<style scoped lang="scss">
.graph {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  background-color: lightblue;
  z-index: 100;
  color: white;
}
</style>
