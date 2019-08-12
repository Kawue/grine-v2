<template>
  <div>
    Lasso Test
    <div class="vis-root" style="position: relative;">
      <canvas width="500" height="500" style="position: absolute;top: 0;left: 0;"></canvas>
      <svg width="250" height="250" style="position: absolute; top: 0px; left: 0px;">
      </svg>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import lasso from '../services/Lasso';

export default {
  name: 'LassoTest',
  data() {
    return {};
  },
  mounted: function() {
    // general size parameters for the vis
    const width = 250;
    const height = 250;
    const padding = { top: 40, right: 40, bottom: 40, left: 40 };
    const plotAreaWidth = width - padding.left - padding.right;
    const plotAreaHeight = height - padding.top - padding.bottom;

    // when a lasso is completed, filter to the points within the lasso polygon
    function handleLassoEnd(lassoPolygon) {
      const selectedPoints = points.filter(d => {
        // note we have to undo any transforms done to the x and y to match with the
        // coordinate system in the svg.
        const x = d.x + padding.left;
        const y = d.y + padding.top;

        return d3.polygonContains(lassoPolygon, [x, y]);
      });

      updateSelectedPoints(selectedPoints);
    }

    // reset selected points when starting a new polygon
    function handleLassoStart() {
      updateSelectedPoints([]);
    }

    // when we have selected points, update the colors and redraw
    function updateSelectedPoints(selectedPoints) {
      // if no selected points, reset to all tomato
      if (!selectedPoints.length) {
        // reset all
        points.forEach(d => {
          d.color = 'tomato';
        });

        // otherwise gray out selected and color selected black
      } else {
        points.forEach(d => {
          d.color = '#eee';
        });
        selectedPoints.forEach(d => {
          d.color = '#000';
        });
      }

      // redraw with new colors
      drawPoints();
    }

    // helper to actually draw points on the canvas
    function drawPoints() {
      const context = canvas.node().getContext('2d');
      context.save();
      context.clearRect(0, 0, width, height);
      context.translate(padding.left, padding.top);

      // draw each point as a rectangle
      for (let i = 0; i < points.length; ++i) {
        const point = points[i];

        // draw circles
        context.fillStyle = point.color;
        context.beginPath();
        context.arc(point.x, point.y, point.r, 0, 2 * Math.PI);
        context.fill();
      }

      context.restore();
    }

    const canvas = d3.select('.vis-root canvas');
    const interactionSvg = d3.select('.vis-root svg');

    // attach lasso to interaction SVG
    const lassoInstance = lasso()
      .on('end', handleLassoEnd)
      .on('start', handleLassoStart);

    interactionSvg.call(lassoInstance);

    // make up fake data
    const points = d3.range(500).map(() => ({
      x: Math.random() * plotAreaWidth,
      y: Math.random() * plotAreaHeight,
      r: Math.random() * 5 + 2,
      color: 'tomato',
    }));

    // initial draw of points
    drawPoints();
  },
};
</script>

<style lang="scss" scoped>
.canvas {
  margin: 25px;
  border: 1px solid lightgrey;
}
</style>
