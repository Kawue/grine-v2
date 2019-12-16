<template>
  <div
    v-bind:style="widgetStyle()"
    v-bind:id="widgetUniqueId()"
    v-if="height"
    v-on:click="imageClick()"
  >
    <div
      class="canvas-root"
      v-bind:style="{ width: width + 'px', height: height + 'px' }"
      style="position: relative;"
    >
      <canvas
        v-bind:width="width"
        v-bind:height="height"
        style="position: absolute;top: 0; left: 0;"
        v-bind:class="{ pulse: lassoFetching === true }"
      ></canvas>
      <svg
        v-if="enableLasso"
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
import * as imageIndex from '../constants';

export default {
  name: 'MzImage',
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
  watch: {
    base64Image() {
      this.drawMzImage();
    },
    imageValues() {
      if (this.imageDataIndex === imageIndex.DIM_RED) {
        this.$store.dispatch('fetchDimRedImage');
      } else if (
        !this.enableLasso &&
        this.imageDataIndex !== imageIndex.DIM_RED
      ) {
        this.$store.dispatch('fetchImageData', this.imageDataIndex);
      }
    },
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
  },
  computed: {
    base64Image: function() {
      return this.$store.getters.getImageData(this.imageDataIndex).base64Image;
    },
    imageValues: function() {
      return this.$store.getters.getImageData(this.imageDataIndex).mzValues;
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
      return (
        this.enableClickCopyToLassoImage &&
        !this.isMzLassoActive() &&
        this.base64Image != null
      );
    },
    imageClick() {
      if (this.isAbleToCopyDataIntoSelectionImage()) {
        store.commit('IMAGE_COPY_INTO_SELECTION_IMAGE', this.imageDataIndex);
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
      let bbox = d3
        .select('#lassopath')
        .node()
        .getBBox();

      const selectedPoints = [];
      for (let i = bbox.x; i < bbox.x + bbox.width; i++) {
        for (let j = bbox.y; j < bbox.y + bbox.height; j++) {
          if (d3.polygonContains(lassoPolygon, [i, j])) {
            // TODO: May use ~~(i/this.scale), ~~(j/this.scale)
            //selectedPoints.push([i/this.scaler,j/this.scaler])
            selectedPoints.push([i, j]);
          }
        }
      }

      console.log(selectedPoints);

      store.dispatch('imagesSelectPoints', [
        this.imageDataIndex,
        selectedPoints,
      ]);

      /*
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
      */
    },
    handleLassoStart() {
      /*
      this.removeLassoAfterPointsDrawn = false;
      if (store.getters.isMzLassoSelectionActive) {
        store.commit('RESET_SELECTION', true);
      }
      store.dispatch('imagesSelectPoints', [this.imageDataIndex, []]);
      */
    },
    drawMzImage() {
      if (this.base64Image != null) {
        if (this.enableLasso) {
          d3.select('#' + this.widgetUniqueId() + ' .canvas-root svg')
            .select('g')
            .select('rect')
            .attr('width', this.width)
            .attr('height', this.height);
        }
        let image = new Image();

        image.onload = () => {
          const context = this.canvas.node().getContext('2d');
          context.save();
          if (this.imageDataIndex === imageIndex.DIM_RED) {
            context.fillRect(0, 0, this.width, this.height);
          } else {
            context.clearRect(0, 0, this.width, this.height);
          }
          context.imageSmoothingEnabled = false;
          context.scale(this.scaler, this.scaler);
          context.drawImage(image, 0, 0);
          context.restore();
        };

        image.src = this.base64Image;

        if (this.removeLassoAfterPointsDrawn) {
          if (this.enableLasso) {
            this.lassoInstance.reset();
          }
        } else {
          this.removeLassoAfterPointsDrawn = true;
        }
      } else {
        const context = this.canvas.node().getContext('2d');
        context.clearRect(0, 0, this.width, this.height);
      }
    },
    /*drawMzImage() {
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
  width: 100%;

  canvas {
    border: 1px solid lightgrey;
    background: white;
  }
}
</style>
