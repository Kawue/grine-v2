<template>
  <div>
    <svg v-bind:width="width" v-bind:height="height">
      <g>
        <rect
          v-for="point in points"
          v-bind:x="getPosX(point)"
          v-bind:y="getPosY(point)"
          v-bind:width="getWidth()"
          v-bind:height="getHeight()"
          v-bind:fill="getPointColor(point)"
        ></rect>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'MzImage',
  data() {
    return {
      points: [],
      width: 250,
      height: 250,
    };
  },
  mounted() {
    for (let i = 0; i < 250; i++) {
      for (let j = 0; j < 250; j++) {
        let d = Math.floor(Math.random() * 100) + 30;
        this.points.push([i, j, d]);
      }
    }
  },
  computed: {
    domainX: function() {
      let domain = [];
      for (let i = 0; i < 250; i++) {
        domain.push(i);
      }
      return domain;
    },
    domainY: function() {
      let domain = [];
      for (let i = 0; i < 250; i++) {
        domain.push(i);
      }
      return domain;
    },
    scaleBandX: function() {
      return d3
        .scaleBand()
        .range([0, this.width])
        .domain(this.domainX)
        .padding(0.01);
    },
    scaleBandY: function() {
      return d3
        .scaleBand()
        .range([this.height, 0])
        .domain(this.domainY)
        .padding(0.01);
    },
    pointColor: function() {
      return d3
        .scaleLinear()
        .range(['white', '#69b3a2'])
        .domain([0, 100]);
    },
  },
  methods: {
    getPointColor(point) {
      return this.pointColor(point[2]);
    },
    getPosX(point) {
      let scaleBand = this.scaleBandX;
      return scaleBand(point[0]);
    },
    getWidth() {
      let scaleBand = this.scaleBandX;
      return scaleBand.bandwidth();
    },
    getPosY(point) {
      let scaleBand = this.scaleBandY;
      return scaleBand(point[1]);
    },
    getHeight() {
      let scaleBand = this.scaleBandY;
      return scaleBand.bandwidth();
    },
  },
};
</script>

<style lang="scss" scoped>
svg {
  margin: 25px;
  border: 1px solid lightgrey;
}
</style>
