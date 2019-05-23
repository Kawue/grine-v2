<template>
  <div>
    <svg width="250" height="250">
      <g style="transform: translate(0, 10px)">
        <!--<circle-->
          <!--v-for="point in points"-->
          <!--r="1"-->
          <!--v-bind:style="pointStyle(point)"-->
        <!--&gt;</circle>-->
        <rect
          v-for="point in points"
          r="1"
          v-bind:x="point[0]"
          v-bind:y="point[1]"
          width="10"
          height="10"
          v-bind:fill="pointColor(point[2])"
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
      points: [
        /*[10, 10, 55],
        [20, 20, 0],
        [30, 30, 33],
        [40, 40, 89],
        [50, 50, 80],
        [500, 500, 4],*/
      ],
    };
  },
  mounted() {
    this.calculateImageData();
  },
  methods: {
    pointColor(intensity) {
      let myColor = d3.scaleLinear()
        .range(['white', '#69b3a2'])
        .domain([1, 100]);
      return myColor(intensity);
    },
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
