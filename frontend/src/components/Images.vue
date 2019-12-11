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
        <div class="col-md-12" style="margin-top: 25px; margin-bottom: 25px">
          Community:
          <mz-image :imageDataIndex="0"></mz-image>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12" style="margin-bottom: 25px">
          MZ:
          <mz-image :imageDataIndex="1"></mz-image>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12" style="margin-bottom: 25px">
          Aggregate:
          <mz-image :imageDataIndex="2"></mz-image>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12" style="margin-bottom: 25px;">
          Cache/Lasso:
          <span v-on:click="deleteLassoImage()">
            <v-icon name="trash-alt" style="cursor: pointer"></v-icon>
          </span>
          <mz-image
            :imageDataIndex="3"
            v-bind:enable-lasso="true"
            v-bind:enableClickCopyToLassoImage="false"
          ></mz-image>
        </div>
      </div>
      <div class="row" v-if="options.pca.show">
        <div class="col-md-12" style="margin-bottom: 25px;">
          DR:
          <span v-on:click="deleteDrImage()">
            <v-icon name="trash-alt" style="cursor: pointer"></v-icon>
          </span>
          <mz-image
            :imageDataIndex="4"
            v-bind:enableClickCopyToLassoImage="false"
          ></mz-image>
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
import * as imageIndex from '../constants';

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
    MzImage,
    OptionsImageMergeMethod,
    OptionsImageMinIntensity,
    OptionsImageMinOverlap,
  },
  methods: {
    deleteLassoImage() {
      this.$store.commit('CLEAR_IMAGE', imageIndex.LASSO);
      this.$store.commit('RESET_SELECTION');
    },
    deleteDrImage() {
      this.$store.commit('CLEAR_IMAGE', imageIndex.DIM_RED);
    },
  },
  mounted: function() {
    this.$store.subscribe(mutation => {
      switch (mutation.type) {
        case 'OPTIONS_IMAGE_CHANGE_MERGE_METHOD':
          this.$store.dispatch('fetchImageData', imageIndex.COMMUNITY);
          this.$store.dispatch('fetchImageData', imageIndex.AGGREGATED);
          this.$store.dispatch('fetchDimRedImage');
          break;
        case 'OPTIONS_IMAGE_CHANGE_COLOR_SCALE':
          this.$store.dispatch('fetchImageData', imageIndex.COMMUNITY);
          this.$store.dispatch('fetchImageData', imageIndex.SELECTED_MZ);
          this.$store.dispatch('fetchImageData', imageIndex.AGGREGATED);
          this.$store.dispatch('fetchImageData', imageIndex.LASSO);
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

select {
  background-color: #4f5050;
  color: white;
  border: 1px solid #737374;
  margin: 0 0 5px 0;
}

.font12px {
  font-size: 12px;
}

.sidebar-widget {
  background-color: inherit;
}

.sidebar-widget {
  &.expanded {
    width: 300px !important;
  }
}
</style>
