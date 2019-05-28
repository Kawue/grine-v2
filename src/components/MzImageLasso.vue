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
  name: 'LassoTest',
  data() {
    return {
      width: 250,
      height: 250,
      points: {},
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

    // make up fake data
    this.points = d3.range(500).map(() => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      r: Math.random() * 5 + 2,
      color: 'tomato',
    }));

    this.drawPoints();
  },
  methods: {
    handleLassoEnd(lassoPolygon) {
      const selectedPoints = this.points.filter(d => {
        return d3.polygonContains(lassoPolygon, [d.x, d.y]);
      });
      this.updateSelectedPoints(selectedPoints);
    },
    handleLassoStart() {
      this.updateSelectedPoints([]);
    },
    updateSelectedPoints(selectedPoints) {
      if (!selectedPoints.length) {
        this.points.forEach(d => {
          d.color = 'tomato';
        });
      } else {
        this.points.forEach(d => {
          d.color = '#eee';
        });
        selectedPoints.forEach(d => {
          d.color = '#000';
        });
      }
      this.drawPoints();
    },
    drawPoints() {
      const context = this.canvas.node().getContext('2d');
      context.save();
      context.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.points.length; ++i) {
        const point = this.points[i];
        context.fillStyle = point.color;
        context.fillRect(point.x, point.y, 2, 2);
      }

      context.restore();
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
