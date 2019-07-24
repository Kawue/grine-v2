<template>
  <div v-bind:style="widgetStyle()" v-bind:id="widgetUniqueId()" v-if="height">
    <div class="canvas-root" style="position: relative;">
      <ScaleOut class="spinner" v-if="loading"></ScaleOut>
      <canvas
        v-bind:width="width"
        v-bind:height="height"
        style="position: absolute;top: 0; left: 0;"
        :class="{ pulse: lassoFetching === true }"
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
  props: {
    imageDataIndex: {
      // this prob defines which image data from the store is displayed
      // store.images.imageData[imageDataIndex]
      type: Number,
      required: true,
    },
    enableLasso: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      width: 250,
      heightLast: 200,
      render: false,
      canvas: null,
      lassoInstance: null,
      removeLassoAfterPointsDrawn: true,
    };
  },
  mounted: function() {
    let componentId = '#' + this.widgetUniqueId();
    this.canvas = d3.select(componentId + ' .canvas-root canvas');
    const interactionSvg = d3.select(componentId + ' .canvas-root svg');

    this.lassoInstance = lasso();
    if (this.enableLasso) {
      this.lassoInstance
        .on('end', this.handleLassoEnd)
        .on('start', this.handleLassoStart);
      interactionSvg.call(this.lassoInstance);
    }
    this.$store.subscribe(mutation => {
      switch (mutation.type) {
        case 'SET_IMAGE_DATA_VALUES':
          if (mutation.payload[0] === this.imageDataIndex) {
            if (this.height) {
              this.heightLast = this.height;
              let self = this;
              setTimeout(function() {
                self.drawPoints();
              }, 10);
            }
          }
          break;
      }
    });
    this.drawPoints();
  },
  computed: {
    points: function() {
      return this.$store.getters.getImageData(this.imageDataIndex).points;
    },
    max: function() {
      return this.$store.getters.getImageData(this.imageDataIndex).max;
    },
    lassoFetching: function() {
      return this.$store.getters.getImageData(this.imageDataIndex)
        .lassoFetching;
    },
    ...mapGetters({
      loading: 'getLoadingImageData',
    }),
    height: function() {
      let height = this.$store.getters.getImageData(0).max.y;
      height = height ? height : this.$store.getters.getImageData(1).max.y;
      height = height ? height : this.$store.getters.getImageData(2).max.y;
      height = height ? height : this.heightLast;
      return height;
    },
    domainX: function() {
      let domain = [];
      for (let i = 0; i < this.max.x; i++) {
        domain.push(i);
      }
      return domain;
    },
    domainY: function() {
      let domain = [];
      for (let i = this.max.x; i >= 0; i--) {
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
    widgetUniqueId() {
      return 'component-' + this._uid;
    },
    widgetStyle() {
      return 'height: ' + this.height + 'px';
    },
    handleLassoEnd(lassoPolygon) {
      const selectedPoints = this.points.filter(d => {
        let x = this.getPosX(d.x);
        let y = this.getPosY(d.y);
        return d3.polygonContains(lassoPolygon, [x, y]);
      });
      this.removeLassoAfterPointsDrawn = false;
      store.dispatch('imagesSelectPoints', [
        this.imageDataIndex,
        selectedPoints,
      ]);
    },
    handleLassoStart() {
      this.removeLassoAfterPointsDrawn = false;
      store.dispatch('imagesSelectPoints', [this.imageDataIndex, []]);
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
      if (this.removeLassoAfterPointsDrawn) {
        if (this.enableLasso) {
          this.lassoInstance.reset();
        }
      } else {
        this.removeLassoAfterPointsDrawn = true;
      }
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
.pulse {
  animation: pulsating 1s infinite; /* IE 10+, Fx 29+ */
}
@keyframes pulsating {
  0% {
    border-color: lightgrey;
  }
  80% {
    border-color: darkcyan;
  }
}
</style>
