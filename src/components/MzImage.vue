<template>
  <div>
    <svg width="250" height="250">
      <g style="transform: translate(0, 10px)">
        <rect
          v-for="point in points"
          v-bind:x="getPosX(point)"
          v-bind:y="getPosY(point)"
          v-bind:width="getWidth()"
          v-bind:height="getHeight()"
          v-bind:fill="pointColor(point)"
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
    };
  },
  mounted() {
    this.calculateImageData();
  },
  methods: {
    pointColor(point) {
      let myColor = d3.scaleLinear()
        .range(['white', '#69b3a2'])
        .domain([1, 100]);
      return myColor(point[2]);
    },
    getScaleBandX() {
      var myGroups = [];
      for (var i = 0; i <= 250; i++) {
        myGroups.push(i);
      }

      var x = d3.scaleBand()
        .range([0, 250])
        .domain(myGroups)
        .padding(0.01);

      return x;
    },
    getPosX(point) {
      let scaleBand = this.getScaleBandX();
      return scaleBand(point[0]);
    },
    getWidth() {
      let scaleBand = this.getScaleBandX();
      return scaleBand.bandwidth();
    },

    getScaleBandY() {
      var myGroups = [];
      for (var i = 0; i <= 250; i++) {
        myGroups.push(i);
      }

      var y = d3.scaleBand()
        .range([250, 0])
        .domain(myGroups)
        .padding(0.01);

      return y;
    },
    getPosY(point) {
      let scaleBand = this.getScaleBandY();
      return scaleBand(point[1]);
    },
    getHeight() {
      let scaleBand = this.getScaleBandY();
      return scaleBand.bandwidth();
    },


    /*pointY(point) {

    },*/
    /*pointStyle(point) {
      return 'transform: translate(' + point[0] + 'px, ' + point[1] + 'px)';
    },*/
    /*getScales() {
      const x = d3.scaleTime().range([0, 430]);
      const y = d3.scaleLinear().range([210, 0]);
      d3.axisLeft().scale(x);
      d3.axisBottom().scale(y);
      x.domain(d3.extent(this.data, (d, i) => i));
      y.domain([0, d3.max(this.data, d => d)]);
      return { x, y };
    },*/
    calculateImageData() {
      for (let i = 0; i < 10000; i++) {
        let x = Math.floor(Math.random() * 250) + 0;
        let y = Math.floor(Math.random() * 250) + 0;
        let d = Math.floor(Math.random() * 100) + 0;
        this.points.push([x, y, d]);
      }
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
