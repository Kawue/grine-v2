<template>
  <div class="sidebar">
    <div class="row">
      <div class="col-sm">
        <Images
          id="images"
          side="right"
          v-on:change-expand="handleEvent($event)"
        ></Images>
      </div>
      <div class="col-sm">
        <MzList id="mzlist" side="right"></MzList>
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
      imagesMinWidth: '20px',
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
    handleEvent: function(imagesExpanded) {
      this.imagesExpanded = imagesExpanded;
      this.updateMinWidth();
    },
    updateMinWidth: function() {
      if (this.imagesExpanded) {
        this.imagesMinWidth = (this.imageWidth + 70) + 'px';
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
