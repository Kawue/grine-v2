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
    lassoFetching: function() {
      return this.$store.getters.getImageData(this.imageDataIndex)
        .lassoFetching;
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
        height = 10;
      }
      return height;
    },
    width: function() {
      let width = this.$store.getters.getImageWidth;
      if (width == null) {
        width = 10;
      }
      return width;
    },
    scaler: function() {
      let scaler = this.$store.getters.getImageScaler;
      if (scaler == null) {
        scaler = 1;
      }
      return scaler;
    },
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
      console.log('lasso start');
      const selectedPoints = this.points.filter(d => {
        return d3.polygonContains(lassoPolygon, [
          d.x * this.scaler,
          d.y * this.scaler,
        ]);
      });
      this.removeLassoAfterPointsDrawn = false;
      store.dispatch('imagesSelectPoints', [
        this.imageDataIndex,
        selectedPoints,
      ]);
      console.log('lasso end');
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
      if ((this.width && this.height) != null && this.points != null) {
        if (this.enableLasso) {
          d3.select('#' + this.widgetUniqueId() + ' .canvas-root svg')
            .select('g')
            .select('rect')
            .attr('width', this.width)
            .attr('height', this.height);
        }
        let tmpCanvas = document.createElement('canvas');
        let tmpWidth = this.width / this.scaler;
        let tmpHeight = this.height / this.scaler;
        tmpCanvas.width = tmpWidth;
        tmpCanvas.height = tmpHeight;
        let tmpCtx = tmpCanvas.getContext('2d');
        //let imageData = tmpCtx.createImageData(tmpWidth, tmpHeight);
        //let tmpBitArray = Uint8ClampedArray.of(this.points);
        // imageData.data.set(tmpBitArray);
        console.log('Points', typeof this.points);
        //debugger
        let img = new Image();
        img.src = this.points;
        tmpCtx.drawImage(img, 0, 0);

        //points ist immer länge 0, auch nach klick auf knoten in chrome!
        //console.log(this.points.length)
        let context = this.canvas.node().getContext('2d');
        context.save();
        context.scale(this.scaler, this.scaler);
        context.drawImage(tmpCanvas, 0, 0);
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
    /*drawPoints() {
      let context = this.canvas.node().getContext('2d');

      let detachedContainer = document.createElement('custom');
      let dataContainer = d3.select(detachedContainer);
      let dataBinding = dataContainer.selectAll('cusom.pixel').data(this.points);

      dataBinding
        .enter()
        .append('custom')
        .attr('class', 'pixel')
        .attr('size', 1)
        .attr('fillStyle', (d) => {return 'rgba('+[...d.color]+')'})
        .attr('x', (d) => {return d.x})
        .attr('y', (d) => {return d.y})
      .merge(dataBinding)
        .attr('size', 1)
        .attr('fillStyle', (d) => {return 'rgba('+[...d.color]+')'})
        .attr('x', (d) => {return d.x})
        .attr('y', (d) => {return d.y})


      let pixels = dataContainer.selectAll('custom.pixel');
      pixels.each(function() {
        let pixel = d3.select(this);
        context.beginPath();
        context.fillStyle = pixel.attr('fillStyle');
        context.rect(pixel.attr('x'), pixel.attr('y'), pixel.attr('size'), pixel.attr('size'))
        context.fill();
        context.closePath()
      });

    },*/
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
