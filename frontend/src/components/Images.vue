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
          <span v-on:click="deleteLassoImage()" v-if="showLassoTrash">
            <v-icon name="trash-alt" style="cursor: pointer"></v-icon>
          </span>
          <mz-image
            :imageDataIndex="3"
            v-bind:enable-lasso="true"
            v-bind:enableClickCopyToLassoImage="false"
          ></mz-image>
        </div>
      </div>
      <div class="row" v-bind:hidden="!options.dimred.show">
        <div class="col-md-12" style="margin-bottom: 25px;">
          DR:
          <span v-on:click="deleteDrImage()" v-if="showDimredTrash">
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
import store from '@/store';

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
      store.commit('CLEAR_IMAGE', imageIndex.LASSO);
      store.commit('RESET_SELECTION');
    },
    deleteDrImage() {
      if (!store.getters.getOptionsImage.dimred.relative) {
        store.commit('OPTIONS_IMAGE_DIM_RED_CHANGE_RELATIVE', true);
      }
      store.commit('CLEAR_IMAGE', imageIndex.DIM_RED);
    },
  },
  mounted: function() {
    store.subscribe(mutation => {
      switch (mutation.type) {
        case 'OPTIONS_IMAGE_CHANGE_MERGE_METHOD':
          store.dispatch('fetchImageData', imageIndex.COMMUNITY);
          store.dispatch('fetchImageData', imageIndex.AGGREGATED);
          store.dispatch('fetchDimRedImage');
          break;
        case 'OPTIONS_IMAGE_CHANGE_COLOR_SCALE':
          store.dispatch('fetchImageData', imageIndex.COMMUNITY);
          store.dispatch('fetchImageData', imageIndex.SELECTED_MZ);
          store.dispatch('fetchImageData', imageIndex.AGGREGATED);
          store.dispatch('fetchImageData', imageIndex.LASSO);
          break;
      }
    });
  },
  name: 'Images',
  computed: {
    ...mapGetters({
      options: 'getOptionsImage',
    }),
    showDimredTrash: {
      get() {
        return (
          store.getters.getImageData(imageIndex.DIM_RED).mzValues.length > 0
        );
      },
    },
    showLassoTrash: {
      get() {
        return store.getters.getImageData(imageIndex.LASSO).mzValues.length > 0;
      },
    },
  },
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
