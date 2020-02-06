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
      <img
        v-if="surprise"
        style="z-index: 10;"
        class="absolute-position"
        src="https://media.giphy.com/media/CLrEXbY34xfPi/giphy.gif"
        alt="something funny"
        :width="width"
        :height="height"
      />
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
import lasso from '../services/Lasso';
import { mapGetters } from 'vuex';
import * as imageIndex from '../constants';
import store from '@/store';

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
        d3.select(this.$el)
          .select('.lasso-group path')
          .remove();
        this.drawHistoOverlay();
      }
    },
    imageScaleFactor: function() {
      this.drawMzImage();
      if (this.imageDataIndex === imageIndex.HIST) {
        this.drawHistoOverlay();
      }
      d3.select(d3.selectAll('.canvas-root').nodes()[this.imageDataIndex])
        .select('.lasso-group')
        .attr('transform', 'scale(' + this.imageScaleFactor + ')');
    },
    imageValues() {
      if (this.imageDataIndex === imageIndex.DIM_RED) {
        store.dispatch('fetchDimRedImage');
      } else if (
        !this.enableLasso &&
        this.imageDataIndex !== imageIndex.DIM_RED
      ) {
        store.dispatch('fetchImageData', this.imageDataIndex);
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
    store.subscribe(mutation => {
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
      return store.getters.getImageData(imageIndex.HIST).showOverlay;
    },
    base64Image: function() {
      return store.getters.getImageData(this.imageDataIndex).base64Image;
    },
    imageValues: function() {
      return store.getters.getImageData(this.imageDataIndex).mzValues;
    },
    histoAlpha: function() {
      if (this.imageDataIndex !== imageIndex.HIST) {
        return 0;
      }
      return store.getters.getHistoAlpha;
    },
    lassoBase64: function() {
      return store.getters.getImageData(imageIndex.LASSO).base64Image;
    },
    lassoFetching: function() {
      return store.getters.getImageData(this.imageDataIndex).lassoFetching;
    },
    imageScaleFactor: function() {
      return store.getters.getImageScaleFactorValue;
    },
    histoDimRedOverlay: function() {
      return store.getters.getHistoDimRedOverlay;
    },
    ...mapGetters({
      loading: 'getLoadingImageData',
      surprise: 'getSurprise',
    }),
    height: function() {
      if (this.modalImage) {
        return this.modalHeight;
      }
      let height = store.getters.getImageHeight;
      if (height == null) {
        height = 10;
      }
      return height;
    },
    width: function() {
      if (this.modalImage) {
        return this.modalWidth;
      }
      let width = store.getters.getImageWidth;
      if (width == null) {
        width = 10;
      }
      return width;
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
      if (lassoPolygon.length < 2) {
        store.commit('SET_CACHE_IMAGE_LASSO_ACTIVE', false);
        store.commit('SET_HISTO_IMAGE_LASSO_ACTIVE', false);
        if (
          this.imageDataIndex === imageIndex.HIST &&
          !store.getters.getImageData(imageIndex.HIST).showOverlay
        ) {
          store.commit('RESET_SELECTION');
        }
      } else {
        if (this.imageDataIndex === imageIndex.LASSO) {
          store.commit('SET_CACHE_IMAGE_LASSO_ACTIVE', true);
          store.commit('SET_HISTO_IMAGE_LASSO_ACTIVE', false);
        } else if (this.imageDataIndex === imageIndex.HIST) {
          store.commit('SET_CACHE_IMAGE_LASSO_ACTIVE', false);
          store.commit('SET_HISTO_IMAGE_LASSO_ACTIVE', true);
        }
      }

      let bbox = d3
        .select('#lassopath')
        .node()
        .getBBox();

      const selectedPoints = [];

      for (
        let i = Math.floor(bbox.x);
        i < Math.min(store.getters.getImageOriginalWidth, Math.ceil(bbox.x + bbox.width));
        i++
      ) {
        for (
          let j = Math.floor(bbox.y);
          j < Math.min(store.getters.getImageOriginalHeight, Math.ceil(bbox.y + bbox.height));
          j++
        ) {
          if (d3.polygonContains(lassoPolygon, [i, j])) {
            selectedPoints.push([j, i]);
          }
        }
      }

      store.dispatch('imagesSelectPoints', [
        this.imageDataIndex,
        selectedPoints,
      ]);
    },
    drawHistoOverlay() {
      if (store.getters.getImageData(imageIndex.HIST).showOverlay) {
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
          // context.scale(this.imageScaleFactor, this.imageScaleFactor);
          context.drawImage(image, 0, 0);
          context.restore();
        };
        if (this.histoDimRedOverlay) {
          image.src = store.getters.getImageData(
            imageIndex.DIM_RED
          ).base64Image;
        } else if (
          store.getters.getImageData(imageIndex.LASSO).base64Image != null
        ) {
          image.src = store.getters.getImageData(imageIndex.LASSO).base64Image;
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
            .attr('width', store.getters.getImageOriginalWidth)
            .attr('height', store.getters.getImageOriginalHeight);
        }
        const image = new Image();

        image.onload = () => {
          const context = this.canvas.node().getContext('2d');
          context.save();
          context.clearRect(0, 0, this.width, this.height);
          if (this.imageDataIndex === imageIndex.DIM_RED) {
            context.fillRect(0, 0, this.width, this.height);
          } else if (this.imageDataIndex !== imageIndex.HIST){
            context.clearRect(0, 0, this.width, this.height);
          }
          const scale = this.width / image.width;
          context.scale(scale, scale);

          context.imageSmoothingEnabled = false;
          context.drawImage(image, 0, 0);
          context.restore();
        };

        image.src = this.base64Image;
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
