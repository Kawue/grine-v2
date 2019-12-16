<template>
  <SidebarWidget
    v-bind:side="side"
    v-bind:initial-expanded="initialExpanded"
    title="Images"
    v-on:change-expand="logEvent($event)"
  >
    <div slot="content" style="margin: 30px 10px 25px 10px">
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
      <!-- Community Image -->
      <div class="vertical-flex-container">
        <div class="horizontal-flex-container">
          <div>
            <span
              class="text-primary clickable"
              v-on:click="showCommunity = !showCommunity"
              v-b-tooltip.hover.top="'Show Community Image'"
            >
              <v-icon name="eye" scale="1.5" v-if="showCommunity"></v-icon>
              <v-icon
                name="eye-slash"
                scale="1.5"
                v-else
                class="inactive"
              ></v-icon>
            </span>
            <v-icon
              v-bind:class="{ invisible: !showCommunity }"
              name="expand"
              scale="1.5"
              class="custom-col clickable margin-left20"
              v-b-tooltip.hover.top="'Expand'"
            ></v-icon>
          </div>
          <p>Community</p>
          <div style="width: 10%"></div>
        </div>
        <div style="margin: auto">
          <mz-image
            :imageDataIndex="0"
            v-bind:hidden="!showCommunity"
          ></mz-image>
        </div>
      </div>
      <!-- Mz Image -->
      <div class="vertical-flex-container">
        <div class="horizontal-flex-container">
          <div>
            <span
              class="text-primary clickable"
              v-on:click="showMz = !showMz"
              v-b-tooltip.hover.top="'Show MZ Image'"
            >
              <v-icon name="eye" scale="1.5" v-if="showMz"></v-icon>
              <v-icon
                name="eye-slash"
                scale="1.5"
                v-else
                class="inactive"
              ></v-icon>
            </span>
            <v-icon
              v-bind:class="{ invisible: !showMz }"
              name="expand"
              scale="1.5"
              class="custom-col clickable margin-left20"
              v-b-tooltip.hover.top="'Expand'"
            ></v-icon>
          </div>
          <p>MZ</p>
          <div style="width: 10%"></div>
        </div>
        <div style="margin: auto">
          <mz-image :imageDataIndex="1" v-bind:hidden="!showMz"></mz-image>
        </div>
      </div>
      <!-- Aggregated Image -->
      <div class="vertical-flex-container">
        <div class="horizontal-flex-container">
          <div>
            <span
              class="text-primary clickable"
              v-on:click="showAggregated = !showAggregated"
              v-b-tooltip.hover.top="'Show Aggregated Image'"
            >
              <v-icon name="eye" scale="1.5" v-if="showAggregated"></v-icon>
              <v-icon
                name="eye-slash"
                scale="1.5"
                v-else
                class="inactive"
              ></v-icon>
            </span>
            <v-icon
              v-bind:class="{ invisible: !showAggregated }"
              name="expand"
              scale="1.5"
              class="custom-col clickable margin-left20"
              v-b-tooltip.hover.top="'Expand'"
            ></v-icon>
          </div>
          <p>Aggregated</p>
          <div style="width: 10%"></div>
        </div>
        <div style="margin: auto">
          <mz-image
            :imageDataIndex="2"
            v-bind:hidden="!showAggregated"
          ></mz-image>
        </div>
      </div>
      <!-- Lasso Image -->
      <div class="vertical-flex-container">
        <div class="horizontal-flex-container">
          <div>
            <span
              class="text-primary clickable"
              v-on:click="showLasso = !showLasso"
              v-b-tooltip.hover.top="'Show Lasso Image'"
            >
              <v-icon name="eye" scale="1.5" v-if="showLasso"></v-icon>
              <v-icon
                name="eye-slash"
                scale="1.5"
                v-else
                class="inactive"
              ></v-icon>
            </span>
            <v-icon
              v-bind:class="{ invisible: !showLasso }"
              name="expand"
              scale="1.5"
              class="custom-col clickable margin-left20"
              v-b-tooltip.hover.top="'Expand'"
            ></v-icon>
          </div>
          <p>Cache / Lasso</p>
          <div style="min-width: 10%" v-on:click="deleteLassoImage()">
            <v-icon
              name="trash-alt"
              scale="1.5"
              v-if="showLassoTrash"
              class="clickable"
            ></v-icon>
          </div>
        </div>
        <div style="margin: auto">
          <mz-image
            :imageDataIndex="3"
            v-bind:enable-lasso="true"
            v-bind:enableClickCopyToLassoImage="false"
            v-bind:hidden="!showLasso"
          ></mz-image>
        </div>
      </div>
      <!-- Dim Red Image -->
      <div class="vertical-flex-container">
        <div class="horizontal-flex-container">
          <div>
            <span
              class="text-primary clickable"
              v-on:click="showDimRed = !showDimRed"
              v-b-tooltip.hover.top="'Show Dimension Reduction Image'"
            >
              <v-icon name="eye" scale="1.5" v-if="showDimRed"></v-icon>
              <v-icon
                name="eye-slash"
                scale="1.5"
                v-else
                class="inactive"
              ></v-icon>
            </span>
            <v-icon
              v-bind:class="{ invisible: !showDimRed }"
              name="expand"
              scale="1.5"
              class="custom-col clickable margin-left20"
              v-b-tooltip.hover.top="'Expand'"
            ></v-icon>
          </div>
          <p>DR</p>
          <div style="min-width: 10%" v-on:click="deleteDrImage()">
            <v-icon
              name="trash-alt"
              scale="1.5"
              v-if="showDimredTrash"
              class="clickable"
            ></v-icon>
          </div>
        </div>
        <div style="margin: auto">
          <mz-image
            :imageDataIndex="4"
            v-bind:enableClickCopyToLassoImage="false"
            v-bind:hidden="!showDimRed"
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
  data: function() {
    return {
      showCommunity: true,
      showMz: true,
      showAggregated: true,
      showLasso: true,
      firstTimeDimRed: true,
    };
  },
  methods: {
    deleteLassoImage() {
      store.commit('CLEAR_IMAGE', imageIndex.LASSO);
      store.commit('RESET_SELECTION');
    },
    logEvent(expanded) {
      this.$emit('change-expand', expanded);
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
    showDimRed: {
      get() {
        return this.options.dimred.show;
      },
      set(value) {
        this.$store.commit('OPTIONS_IMAGE_DIM_RED_CHANGE_SHOW', value);
        if (this.firstTimeDimRed) {
          this.firstTimeDimRed = false;
          this.$store.dispatch('fetchDimRedImage');
        }
      },
    },
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
  font-size: 0.9em;
}

.sidebar-widget {
  background-color: inherit;
}

.sidebar-widget {
  &.expanded {
    width: 300px !important;
  }
}

.clickable {
  cursor: pointer;
}

.margin-left20 {
  margin-left: 20px;
}

.inactive {
  color: darkgray;
}
.invisible {
  visibility: hidden;
}
.vertical-flex-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid darkgrey;
  padding-bottom: 10px;
}
.custom-col {
  color: hotpink;
}
.horizontal-flex-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 90%;
  align-items: baseline;
}
p {
  font-size: 1.6em;
}
</style>
