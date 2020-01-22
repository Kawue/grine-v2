<template>
  <div class="sidebar">
    <div class="row">
      <div class="col-sm">
        <Images
          id="images"
          side="right"
          v-on:change-expand="handleImageEvent($event)"
        ></Images>
      </div>
      <div class="col-sm">
        <MzList
          id="mzlist"
          side="right"
          v-on:change-expand="handleMzListEvent($event)"
        ></MzList>
      </div>
    </div>
  </div>
</template>

<script>
import Images from '@/components/Images.vue';
import MzList from '@/components/MzList.vue';
import store from '@/store';
import * as d3 from 'd3';
import { mapGetters } from 'vuex';

export default {
  name: 'Sidebar',
  components: {
    Images,
    MzList,
  },
  data: function() {
    return {
      minWidth: '20px',
      imagesExpanded: true,
    };
  },
  watch: {
    imageWidth() {
      this.updateMinWidth(true);
    },
  },
  computed: {
    ...mapGetters({
      imageWidth: 'getImageWidth',
    }),
  },
  methods: {
    handleImageEvent: function(imagesExpanded) {
      this.imagesExpanded = imagesExpanded;
      this.updateMinWidth();
    },
    handleMzListEvent: function(payload) {
      if (payload['expanded']) {
        if (payload['showRaw']) {
          d3.select('#mzlist').style('min-width', '240px');
        } else {
          d3.select('#mzlist').style('min-width', '120px');
        }
      } else {
        d3.select('#mzlist').style('min-width', '20px');
      }
    },
    updateMinWidth: function() {
      if (this.imagesExpanded) {
        this.imagesMinWidth = this.imageWidth + 70 + 'px';
      } else {
        this.imagesMinWidth = '30px';
      }
      d3.select('#images').style('min-width', this.imagesMinWidth);
    },
  },
  created: function() {
    store.dispatch('fetchImageDimensions');
  },
};
</script>

<style scoped lang="scss">
.sidebar {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 101;
  background: #4f5050;
  color: white;
  height: 100%;

  .row {
    padding: 0;
    margin: 0;

    .col-sm {
      padding: 0;
      margin: 0;
    }
  }
}
</style>
