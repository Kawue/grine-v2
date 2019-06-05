<template>
  <div>
    <div class="canvas-root" style="position: relative;">
      <canvas
        v-bind:width="width"
        v-bind:height="height"
        style="position: absolute;top: 0; left: 0;"
      ></canvas>
      <svg
        v-bind:width="width"
        v-bind:height="height"
        style="position: absolute; top: 0; left: 0;"
      ></svg>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import lasso from '../services/Lasso';

export default {
  name: 'MzImage',
  data() {
    return {
      points: [],
      width: 250,
      height: 250,
      render: false,
      canvas: null,
    };
  },
  mounted: function() {
    this.canvas = d3.select('.canvas-root canvas');
    const interactionSvg = d3.select('.canvas-root svg');

    const lassoInstance = lasso()
      .on('end', this.handleLassoEnd)
      .on('start', this.handleLassoStart);

    interactionSvg.call(lassoInstance);

    this.generateRandomImageData();
    this.drawPoints();
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
        .padding(0);
    },
    scaleBandY: function() {
      return d3
        .scaleBand()
        .range([this.height, 0])
        .domain(this.domainY)
        .padding(0);
    },
    pointColor: function() {
      return d3
        .scaleLinear()
        .range(['white', '#69b3a2'])
        .domain([0, 100]);
    },
  },
  methods: {
    handleLassoEnd(lassoPolygon) {
      const selectedPoints = this.points.filter(d => {
        let x = this.getPosX(d.x);
        let y = this.getPosY(d.y);
        return d3.polygonContains(lassoPolygon, [x, y]);
      });
      this.updateSelectedPoints(selectedPoints);
    },
    handleLassoStart() {
      this.updateSelectedPoints([]);
    },
    updateSelectedPoints(selectedPoints) {
      if (!selectedPoints.length) {
        this.points.forEach(point => {
          point.color = this.getPointColor(point.intensity);
        });
      } else {
        this.points.forEach(point => {
          point.color = this.getPointColor(point.intensity - 20);
        });
        selectedPoints.forEach(point => {
          point.color = this.getPointColor(point.intensity + 20);
        });
      }
      this.drawPoints();
    },
    generateRandomImageData() {
      for (let i = 0; i < 250; i++) {
        for (let j = 0; j < 250; j++) {
          let d = Math.floor(Math.random() * 100) + 30;
          this.points.push({
            x: i,
            y: j,
            intensity: d,
            color: this.getPointColor(d),
          });
        }
      }
    },
    drawPoints() {
      const context = this.canvas.node().getContext('2d');
      context.save();
      context.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.points.length; ++i) {
        const point = this.points[i];
        context.fillStyle = point.color;
        context.fillRect(
          this.getPosX(point.x),
          this.getPosY(point.y),
          this.getWidth(),
          this.getHeight()
        );
      }

      context.restore();
    },
    getPointColor(intensity) {
      return this.pointColor(intensity);
    },
    getPosX(x) {
      let scaleBand = this.scaleBandX;
      return scaleBand(x);
    },
    getWidth() {
      let scaleBand = this.scaleBandX;
      return scaleBand.bandwidth();
    },
    getPosY(y) {
      let scaleBand = this.scaleBandY;
      return scaleBand(y);
    },
    getHeight() {
      let scaleBand = this.scaleBandY;
      return scaleBand.bandwidth();
    },
  },
};
</script>

<style lang="scss" scoped>
.canvas-root {
  margin: 25px;

  canvas {
    border: 1px solid lightgrey;
  }
}
</style>
