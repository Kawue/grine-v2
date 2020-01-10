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
        class="image-canvas absolute-position"
        v-bind:width="width"
        v-bind:height="height"
      ></canvas>
      <canvas
        v-bind:hidden="imageDataIndex !== histIndex"
        v-bind:width="width"
        v-bind:height="height"
        class="histo-overlay-canvas absolute-position"
      ></canvas>
      <svg
        class="lasso-svg absolute-position"
        v-if="enableLasso"
        v-bind:width="width"
        v-bind:height="height"
      ></svg>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import lasso from '../services/Lasso';
import { mapGetters } from 'vuex';
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
    modalImage: {
      type: Boolean,
      default: false,
    },
    modalWidth: {
      type: Number,
      default: 1,
    },
    modalHeight: {
      type: Number,
      default: 1,
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
      histIndex: imageIndex.HIST,
    };
  },
  watch: {
    base64Image() {
      this.drawMzImage();
    },
    histoAlpha() {
      this.drawHistoOverlay();
    },
    imageDataIndex() {
      this.drawMzImage();
    },
    showHistoOverlay(newValue) {
      if (!newValue) {
        console.log("TRIGGER")
        d3.select(this.$el).select(".lasso-group path").remove();
        this.drawHistoOverlay();
      }
    },
    lassoActive(value) {
      if (!value) {
        d3.select(this.$el).select(".lasso-group path").remove();
      }
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
    lassoBase64() {
      this.drawHistoOverlay();
    },
    histoDimRedOverlay() {
      if (this.imageDataIndex === imageIndex.HIST) {
        this.drawHistoOverlay();
      }
    },
  },
  mounted: function() {
    const componentId = '#' + this.widgetUniqueId();
    this.canvas = d3.select(componentId + ' .canvas-root .image-canvas');
    const interactionSvg = d3.select(componentId + ' .canvas-root .lasso-svg');
    this.lassoInstance = lasso();
    if (this.enableLasso) {
      this.lassoInstance.on('end', this.handleLassoEnd);
      interactionSvg.call(this.lassoInstance);
    }
    if (this.modalImage) {
      this.drawMzImage();
      if (this.imageDataIndex === imageIndex.HIST) {
        this.drawHistoOverlay();
      }
    }
    /*
    if (
      this.imageDataIndex === imageIndex.HIST &&
      this.$store.getters.getImageData(imageIndex.HIST).base64Image == null
    ) {
      this.$store.dispatch('fetchHistoImage');
    } else if (
      this.imageDataIndex === imageIndex.DIM_RED &&
      this.$store.getters.getImageData(imageIndex.DIM_RED).base64Image == null
    ) {
      this.$store.dispatch('fetchDimRedImage');
    }
    */
    this.$store.subscribe(mutation => {
      if (
        mutation.type === 'CLEAR_IMAGE' &&
        this.imageDataIndex === imageIndex.HIST &&
        mutation.payload === imageIndex.DIM_RED
      ) {
        setTimeout(() => this.drawHistoOverlay(), 1000);
      }
    });
  },
  computed: {
    showHistoOverlay: function() {
      return this.$store.getters.getImageData(imageIndex.HIST).showOverlay;
    },
    base64Image: function() {
      return this.$store.getters.getImageData(this.imageDataIndex).base64Image;
    },
    imageValues: function() {
      return this.$store.getters.getImageData(this.imageDataIndex).mzValues;
    },
    histoAlpha: function() {
      if (this.imageDataIndex !== imageIndex.HIST) {
        return 0;
      }
      return this.$store.getters.getHistoAlpha;
    },
    lassoBase64: function() {
      return this.$store.getters.getImageData(imageIndex.LASSO).base64Image;
    },
    lassoFetching: function() {
      return this.$store.getters.getImageData(this.imageDataIndex)
        .lassoFetching;
    },
    lassoActive: function() {
      console.log(this.$store.getters.getHistoImageLassoActive)
      return this.$store.getters.getHistoImageLassoActive;
    },
    histoDimRedOverlay: function() {
      return this.$store.getters.getHistoDimRedOverlay;
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
      if (this.modalImage) {
        return this.modalHeight;
      }
      let height = this.$store.getters.getImageHeight;
      if (height == null) {
        height = 10;
      }
      return height;
    },
    width: function() {
      if (this.modalImage) {
        return this.modalWidth;
      }
      let width = this.$store.getters.getImageWidth;
      if (width == null) {
        width = 10;
      }
      return width;
    },
  },
  methods: {
    isMzLassoActive() {
      return this.$store.getters.isMzLassoSelectionActive;
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
        this.$store.commit(
          'IMAGE_COPY_INTO_SELECTION_IMAGE',
          this.imageDataIndex
        );
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
      if (lassoPolygon.length < 2) {
        this.$store.commit('SET_HISTO_IMAGE_LASSO_ACTIVE', false);
      } else {
        this.$store.commit('SET_HISTO_IMAGE_LASSO_ACTIVE', true);
      }
      
      let bbox = d3
        .select('#lassopath')
        .node()
        .getBBox();

      const selectedPoints = [];
      
      let canvasWidth = null;
      let canvasHeight = null;
      let imageScaleFactor = null;
      if (this.modalImage) {
        canvasWidth = this.modalWidth;
        canvasHeight = this.modalHeight;
        imageScaleFactor = this.modalWidth / this.$store.getters.getImageWidth;
      } else {
        canvasWidth = this.width;
        canvasHeight = this.height;
        imageScaleFactor = this.$store.getters.getImageScaleFactorValue;
      }

      // Lasso group can be outside of the canvas. Therefore the bbox needs to be restricted in those cases.
      for (let i = Math.floor(bbox.x); i < Math.min(canvasWidth, Math.ceil(bbox.x + bbox.width)); i++) {
        for (let j = Math.floor(bbox.y); j < Math.min(canvasHeight, Math.ceil(bbox.y + bbox.height)); j++) {
          if (d3.polygonContains(lassoPolygon, [i, j])) {
            // i is width, which is axis 1, aka j, in the backend array. Vice versa for j. Therefore it needs to be switched to be consistent with the backend.
            // floor to avoid index out of bounds exception due to rounding.
            let y = Math.floor(j/imageScaleFactor);
            let x = Math.floor(i/imageScaleFactor);
            selectedPoints.push([y, x]);
          }
        }
      }
      
      //console.log(selectedPoints)

      this.$store.dispatch('imagesSelectPoints', [
        this.imageDataIndex,
        selectedPoints,
      ]);
    },
    drawHistoOverlay() {
      if (this.$store.getters.getImageData(imageIndex.HIST).showOverlay) {
        const image = new Image();

        image.onload = () => {
          const componentId = '#' + this.widgetUniqueId();
          const context = d3
            .select(componentId + ' .canvas-root .histo-overlay-canvas')
            .node()
            .getContext('2d');
          context.save();
          context.globalAlpha = this.histoAlpha;
          context.clearRect(0, 0, this.width, this.height);
          const scale = this.width / image.width;
          context.scale(scale, scale);
          context.drawImage(image, 0, 0);
          context.restore();
        };
        if (this.histoDimRedOverlay) {
          image.src = this.$store.getters.getImageData(
            imageIndex.DIM_RED
          ).base64Image;
        } else if (
          this.$store.getters.getImageData(imageIndex.LASSO).base64Image != null
        ) {
          image.src = this.$store.getters.getImageData(
            imageIndex.LASSO
          ).base64Image;
        }
      } else {
        const componentId = '#' + this.widgetUniqueId();
        const context = d3
          .select(componentId + ' .canvas-root .histo-overlay-canvas')
          .node()
          .getContext('2d');
        context.save();
        context.clearRect(0, 0, this.width, this.height);
        context.restore();
      }
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
        const image = new Image();

        image.onload = () => {
          const context = this.canvas.node().getContext('2d');
          context.save();
          context.clearRect(0, 0, this.width, this.height);
          if (this.imageDataIndex === imageIndex.HIST) {
            const scale = this.width / image.width;
            context.scale(scale, scale);
          } else {
            if (this.imageDataIndex === imageIndex.DIM_RED) {
              context.fillRect(0, 0, this.width, this.height);
            } else {
              context.clearRect(0, 0, this.width, this.height);
            }
            const scale = this.width / image.width;
            context.scale(scale, scale);
          }
          context.imageSmoothingEnabled = false;
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
  },
};
</script>

<style lang="scss" scoped>
.canvas-root {
  width: 100%;

  canvas {
    //border: 1px solid lightgrey;
    background: white;
  }
}
.absolute-position {
  position: absolute;
  top: 0;
  left: 0;
}
.histo-overlay-canvas {
  background: transparent !important;
}
.invisible {
  visibility: hidden;
}
</style>
