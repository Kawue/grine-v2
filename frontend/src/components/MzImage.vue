<template>
  <div>
    <div class="canvas-root" style="position: relative;">
      <ScaleOut class="spinner" v-if="loading"></ScaleOut>
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
import { mapGetters } from 'vuex';
import store from '@/store';
import { ScaleOut } from 'vue-loading-spinner';

export default {
  name: 'MzImage',
  components: {
    ScaleOut,
  },
  data() {
    return {
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
    this.$store.subscribe(mutation => {
      switch (mutation.type) {
        case 'SET_IMAGE_DATA_MZ_VALUES':
          this.drawPoints();
          break;
      }
    });
    this.drawPoints();
  },
  computed: {
    ...mapGetters({
      points: 'getMzImageDataPoints',
      max: 'getMzImageDataMax',
      loading: 'getLoadingImageData',
    }),
    domainX: function() {
      let domain = [];
      for (let i = 0; i < this.max.x; i++) {
        domain.push(i);
      }
      return domain;
    },
    domainY: function() {
      let domain = [];
      for (let i = this.max.y; i >= 0; i--) {
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
  },
  methods: {
    handleLassoEnd(lassoPolygon) {
      const selectedPoints = this.points.filter(d => {
        let x = this.getPosX(d.x);
        let y = this.getPosY(d.y);
        return d3.polygonContains(lassoPolygon, [x, y]);
      });

      store.dispatch('imagesMzImageSelectPoints', selectedPoints);
    },
    handleLassoStart() {
      store.dispatch('imagesMzImageSelectPoints', []);
    },
    drawPoints() {
      const context = this.canvas.node().getContext('2d');
      context.save();
      context.clearRect(0, 0, this.width, this.height);

      let data = this.points;

      for (let i = 0; i < data.length; ++i) {
        const point = data[i];
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

  .spinner {
    position: absolute;
    top: 0;
    margin: 0 auto;
    margin-left: -20px;
  }
}
</style>
