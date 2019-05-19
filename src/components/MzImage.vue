<template>
  <div>
    <svg width="250" height="250">
      <g style="transform: translate(0, 10px)">
        <circle
          v-for="point in points"
          r="1"
          v-bind:style="pointStyle(point)"
        ></circle>
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
      points: [[10, 10], [20, 20], [30, 30], [40, 40], [50, 50], [500, 500]],
    };
  },
  mounted() {
    this.calculatePath();
  },
  methods: {
    pointStyle(point) {
      return 'transform: translate(' + point[0] + 'px, ' + point[1] + 'px)';
    },
    /*getScales() {
      const x = d3.scaleTime().range([0, 430]);
      const y = d3.scaleLinear().range([210, 0]);
      d3.axisLeft().scale(x);
      d3.axisBottom().scale(y);
      x.domain(d3.extent(this.data, (d, i) => i));
      y.domain([0, d3.max(this.data, d => d)]);
      return { x, y };
    },*/
    calculatePath() {
      const x = d3.scaleTime().range([0, 250]);
      const y = d3.scaleLinear().range([250, 0]);

      d3.axisLeft().scale(x);
      d3.axisBottom().scale(y);

      //console.log(scale.x(1));

      /*const path = d3.line()
        .x((d, i) => scale.x(i))
        .y(d => scale.y(d));*/


      //this.line = path(this.data);
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
