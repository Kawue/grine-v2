<template>
  <SidebarWidget
    v-bind:side="side"
    v-bind:initial-expanded="initialExpanded"
    title="Images"
  >
    <div slot="content" style="margin-top: 30px">
      <div class="image-options text-left">
        <div class="row">
          <div class="col-md-12">
            <div class="row">
              <div class="col-md-4">
                <span class="font12px">Merge by:</span>
              </div>
              <div class="col-md-7">
                <OptionsImageMergeMethod></OptionsImageMergeMethod>
              </div>
            </div>
          </div>
        </div>
        <div class="row" style="margin-top: 10px">
          <div class="col-md-12">
            <div class="row">
              <div class="col-md-4">
                <span class="font12px">Min Intensity:</span>
              </div>
              <div class="col-md-8 font12px">
                <OptionsImageMinIntensity></OptionsImageMinIntensity>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-12">
            <div class="row">
              <div class="col-md-4">
                <span class="font12px">Min Overlap:</span>
              </div>
              <div class="col-md-8 font12px">
                <OptionsImageMinOverlap></OptionsImageMinOverlap>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <mz-image :imageDataIndex="0"></mz-image>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <mz-image :imageDataIndex="1" v-bind:enable-lasso="true"></mz-image>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12">
          <mz-image :imageDataIndex="2"></mz-image>
        </div>
      </div>
    </div>
  </SidebarWidget>
</template>

<script>
import SidebarWidget from './SidebarWidget';
import MzImage from './MzImage';
import { mapGetters } from 'vuex';
import OptionsImageMergeMethod from './OptionsImageMergeMethod';
import OptionsImageMinIntensity from './OptionsImageMinIntensity';
import OptionsImageMinOverlap from './OptionsImageMinOverlap';
import * as constants from '../store';

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
    MzImage,
    OptionsImageMergeMethod,
    OptionsImageMinIntensity,
    OptionsImageMinOverlap,
  },
  mounted: function() {
    this.$store.subscribe(mutation => {
      switch (mutation.type) {
        case 'OPTIONS_IMAGE_CHANGE_MERGE_METHOD':
        case 'MZLIST_UPDATE_HIGHLIGHTED_MZ':
        case 'OPTIONS_IMAGE_CHANGE_COLOR_SCALE':
        case 'RESET_SELECTION':
          this.$store.dispatch(
            'fetchImageData',
            constants.IMAGE_INDEX_COMMUNITY
          );
          this.$store.dispatch(
            'fetchImageData',
            constants.IMAGE_INDEX_SELECTED_MZ
          );
          this.$store.dispatch(
            'fetchImageData',
            constants.IMAGE_INDEX_AGGREGATED
          );
          break;
        case 'NETWORK_HIGHLIGHT_NODE':
        case 'MZLIST_UPDATE_SELECTED_MZ':
          this.$store.dispatch(
            'fetchImageData',
            constants.IMAGE_INDEX_COMMUNITY
          );
          this.$store.dispatch(
            'fetchImageData',
            constants.IMAGE_INDEX_SELECTED_MZ
          );
          this.$store.dispatch(
            'fetchImageData',
            constants.IMAGE_INDEX_AGGREGATED
          );
          break;
        case 'IMAGE_DATA_UPDATE_FROM_SELECTED_NODES':
          this.$store.dispatch(
            'fetchImageData',
            constants.IMAGE_INDEX_COMMUNITY
          );
          this.$store.dispatch(
            'fetchImageData',
            constants.IMAGE_INDEX_AGGREGATED
          );
          break;
      }
    });
  },
  name: 'Images',
  computed: mapGetters({
    data: 'getData',
    options: 'getOptionsImage',
  }),
};
</script>

<style scoped lang="scss">
.image-options {
  margin-left: 10px;
}

.font12px {
  font-size: 12px;
}

.sidebar-widget {
  background-color: white;
}

.sidebar-widget {
  &.expanded {
    width: 300px !important;
  }
}
</style>
