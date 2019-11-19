<template>
  <div
    v-bind:style="widgetStyle()"
    v-bind:id="widgetUniqueId()"
    v-if="height"
    v-on:click="imageClick()"
  >
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
    enableClickCopyToLassoImage: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
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
            if (this.height > 1) {
              this.drawPoints();
            }
          }
          break;
        case 'CLEAR_IMAGE':
          if (mutation.payload === this.imageDataIndex) {
            if (this.height > 1) {
              this.drawPoints();
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
    pointsPos: function() {
      return this.$store.getters.getImageData(this.imageDataIndex).pointsPos;
    },
    lassoFetching: function() {
      return this.$store.getters.getImageData(this.imageDataIndex).lassoFetching;
    },
    ...mapGetters({
      loading: 'getLoadingImageData',
    }),
    /*height: function() {
      let height = this.$store.getters.getImageData(this.imageDataIndex).max.y;
      if (height != undefined){
        // TODO: Dirty fix to update the lasso SVG height consistently when the canvas height is changed. Needs to be resolved more clean!
        d3.selectAll('.canvas-root svg').attr('height', height);
        d3.selectAll('.canvas-root svg g rect').attr('height', height);
      } else {
        height = 10;
      }
      return height;
    },
    width: function() {
      let width = this.$store.getters.getImageData(this.imageDataIndex).max.x;
      if (width != undefined){
        d3.selectAll('.canvas-root svg').attr('width', width);
        d3.selectAll('.canvas-root svg g rect').attr('width', width);
      } else {
        width = 10;
      }
      return width;
    },*/
    height: function() {
      let height = this.$store.getters.getImageHeight;
      if (height == null) {
        height = 10
      }
      return height;
    },
    width: function() {
      let width = this.$store.getters.getImageWidth;
      if (width == null) {
        width = 10
      }
      return width;
    }
  },
  methods: {
    isMzLassoActive() {
      return store.getters.isMzLassoSelectionActive;
    },
    isAbleToCopyDataIntoSelectionImage() {
      return this.enableClickCopyToLassoImage && !this.isMzLassoActive();
    },
    imageClick() {
      if (this.isAbleToCopyDataIntoSelectionImage()) {
        store.dispatch('imageCopyIntoSelectionImage', this.imageDataIndex);
      }
    },
    widgetUniqueId() {
      return 'component-' + this._uid;
    },
    widgetStyle() {
      let style = 'height: ' + this.height + 'px;';
      if (this.isAbleToCopyDataIntoSelectionImage()) {
        style += 'cursor: pointer';
      }
      return style;
    },
    handleLassoEnd(lassoPolygon) {
      const selectedPoints = this.pointsPos.filter(d => {
        return d3.polygonContains(lassoPolygon, [d.x, d.y]);
      });
      this.removeLassoAfterPointsDrawn = false;
      store.dispatch('imagesSelectPoints', [
        this.imageDataIndex,
        selectedPoints,
      ]);
      store.commit('NETWORK_FREE_MODE');
    },
    handleLassoStart() {
      this.removeLassoAfterPointsDrawn = false;
      if (store.getters.isMzLassoSelectionActive) {
        store.commit('RESET_SELECTION', true);
      }
      store.dispatch('imagesSelectPoints', [this.imageDataIndex, []]);
    },
    drawPoints() {
      if ( (this.width && this.height) != null ) {
        if (this.enableLasso) {
          d3.select('#' + this.widgetUniqueId() + ' .canvas-root svg').select('g').select('rect')
            .attr('width', this.width)
            .attr('height', this.height)
        }

        const context = this.canvas.node().getContext('2d');
        this.canvas.node().width = this.width;
        this.canvas.node().height = this.height;
        let data = this.points;
        context.save();
        context.clearRect(0, 0, this.width, this.height);
        if (data.length > 0){
          let imageData = context.createImageData(this.width, this.height);
          let tmp = new Uint8ClampedArray(data);
          imageData.data.set(tmp);
          context.putImageData(imageData, 0, 0);
        }

        //points ist immer länge 0, auch nach klick auf knoten in chrome!
        console.log(this.points.length)
        
        context.restore();

        if (this.removeLassoAfterPointsDrawn) {
          if (this.enableLasso) {
            this.lassoInstance.reset();
          }
        } else {
          this.removeLassoAfterPointsDrawn = true;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.canvas-root {
  margin-top: 0;
  margin-left: 25px;
  margin-right: 25px;

  canvas {
    border: 1px solid lightgrey;
    background: white;
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
