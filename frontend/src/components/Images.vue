<template>
  <SidebarWidget
    v-bind:side="side"
    v-bind:initial-expanded="initialExpanded"
    title="Images"
    v-on:change-expand="logEvent($event)"
  >
    <div slot="content" style="margin: 30px 10px 25px 10px">
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
            <span
              v-b-tooltip.hover.top="'Expand'"
              class="margin-left20"
              @click="modalIndex = communityIndex"
            >
              <v-icon
                v-bind:class="{ invisible: !showCommunity }"
                name="expand"
                scale="1.5"
                class="custom-col clickable"
              ></v-icon>
            </span>
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
            <span
              v-b-tooltip.hover.top="'Expand'"
              class="margin-left20"
              @click="modalIndex = mzIndex"
            >
              <v-icon
                v-bind:class="{ invisible: !showMz }"
                name="expand"
                scale="1.5"
                class="custom-col clickable"
              ></v-icon>
            </span>
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
            <span
              v-b-tooltip.hover.top="'Expand'"
              class="margin-left20"
              @click="modalIndex = aggregatedIndex"
            >
              <v-icon
                v-bind:class="{ invisible: !showAggregated }"
                name="expand"
                scale="1.5"
                class="custom-col clickable"
              ></v-icon>
            </span>
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
            <span
              v-b-tooltip.hover.top="'Expand'"
              class="margin-left20"
              @click="modalIndex = lassoIndex"
            >
              <v-icon
                v-bind:class="{ invisible: !showLasso }"
                name="expand"
                scale="1.5"
                class="custom-col clickable"
              ></v-icon>
            </span>
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
            <span
              v-b-tooltip.hover.top="'Expand'"
              class="margin-left20"
              @click="modalIndex = dimRedIndex"
            >
              <v-icon
                v-bind:class="{ invisible: !showDimRed }"
                name="expand"
                scale="1.5"
                class="custom-col clickable"
              ></v-icon>
            </span>
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
      <!-- Histo Image -->
      <div class="vertical-flex-container">
        <div class="horizontal-flex-container">
          <div>
            <span
              class="text-primary clickable"
              v-on:click="toggleShowHisto"
              v-b-tooltip.hover.top="'Show Histo Image'"
            >
              <v-icon name="eye" scale="1.5" v-if="showHisto"></v-icon>
              <v-icon
                name="eye-slash"
                scale="1.5"
                v-else
                class="inactive"
              ></v-icon>
            </span>
            <span
              v-b-tooltip.hover.top="'Expand'"
              class="margin-left20"
              @click="modalIndex = histoIndex"
            >
              <v-icon
                v-bind:class="{ invisible: !showHisto }"
                name="expand"
                scale="1.5"
                class="custom-col clickable"
              ></v-icon>
            </span>
          </div>
          <p>Histo</p>
          <div style="min-width: 10%" v-on:click="deleteHistoOverlay()">
            <v-icon
              name="trash-alt"
              scale="1.5"
              v-if="showHistoTrash"
              class="clickable"
            ></v-icon>
          </div>
        </div>
        <div style="margin: auto">
          <mz-image
            :imageDataIndex="5"
            v-bind:enableClickCopyToLassoImage="false"
            v-bind:hidden="!showHisto"
          ></mz-image>
        </div>
      </div>
      <!-- Image Modal -->
      <b-modal
        ref="image-modal"
        size="huge"
        @close="hideModal"
        @hide="hideModal"
        hide-footer
      >
        <template v-slot:modal-header="{ close }">
          <div
            style="width: 100%; display: flex; flex-direction: row; justify-content: space-between; align-items: center"
          >
            <h2>{{ modalTitle }}</h2>
            <options-image-dim-red
              v-if="modalIndex === dimRedIndex"
              style="width: 40%"
            ></options-image-dim-red>
            <div v-else-if="modalIndex === histoIndex" style="width: 40%">
              <span>Alpha</span>
              <options-histo-alpha></options-histo-alpha>
            </div>
            <div>
              <a
                class="clickable"
                v-if="showDownloadIcon"
                :href="blobUrl"
                :download="'grineV2.png'"
              >
                <v-icon name="download" scale="1.5"></v-icon>
              </a>
              <span
                class="clickable"
                style="margin-left: 30px"
                @click="close()"
              >
                <v-icon name="times"></v-icon>
              </span>
            </div>
          </div>
        </template>
        <template slot="default">
          <div
            style="display: flex; flex-direction: row; align-items: center; justify-content: space-around; padding-bottom: 30px;"
          >
            <span
              class="clickable"
              v-bind:class="{ invisible: !showModalLeft }"
              @click="modalArrowClick(false)"
            >
              <v-icon name="arrow-left" scale="2"></v-icon>
            </span>

            <div>
              <mz-image
                v-if="modalIndex != null"
                :imageDataIndex="modalIndex"
                :enableClickCopyToLassoImage="false"
                :modal-image="true"
                :modal-height="modalCanvasHeight"
                :modal-width="modalCanvasWidth"
                v-on:canvas-blob="handleCanvasBlob($event)"
              ></mz-image>
            </div>
            <span
              class="clickable"
              v-bind:class="{ invisible: !showModalRight }"
              @click="modalArrowClick(true)"
            >
              <v-icon name="arrow-right" scale="2"></v-icon>
            </span>
          </div>
        </template>
      </b-modal>
    </div>
  </SidebarWidget>
</template>

<script>
import SidebarWidget from './SidebarWidget';
import MzImage from './MzImage';
import { mapGetters } from 'vuex';
import * as imageIndex from '../constants';
import store from '@/store';
import OptionsImageDimRed from './OptionsImageDimRed';
import OptionsHistoAlpha from './OptionsHistoAlpha';

export default {
  extends: SidebarWidget,
  components: {
    OptionsHistoAlpha,
    SidebarWidget,
    MzImage,
    OptionsImageDimRed,
  },
  data: function() {
    return {
      showCommunity: true,
      showMz: true,
      showAggregated: true,
      showLasso: true,
      firstTimeDimRed: true,
      showHisto: false,
      firstTimeHisto: true,
      modalIndex: null,
      modalTitle: '',
      modalCanvasWidth: 0,
      modalCanvasHeight: 0,
      showDownloadIcon: false,
      blobUrl: '#',
      mzIndex: imageIndex.SELECTED_MZ,
      communityIndex: imageIndex.COMMUNITY,
      aggregatedIndex: imageIndex.AGGREGATED,
      lassoIndex: imageIndex.LASSO,
      dimRedIndex: imageIndex.DIM_RED,
      histoIndex: imageIndex.HIST,
    };
  },
  watch: {
    modalIndex(newValue, oldValue) {
      if (newValue != null) {
        this.showDownloadIcon =
          store.getters.getImageData(newValue).base64Image != null;
        switch (newValue) {
          case imageIndex.COMMUNITY:
            this.modalTitle = 'Community Image';
            break;
          case imageIndex.SELECTED_MZ:
            this.modalTitle = 'Mz Image';
            break;
          case imageIndex.AGGREGATED:
            this.modalTitle = 'Aggregated Image';
            break;
          case imageIndex.LASSO:
            this.modalTitle = 'Lasso Image';
            break;
          case imageIndex.DIM_RED:
            this.modalTitle = 'Dimension Reduction Image';
            break;
          case imageIndex.HIST:
            this.modalTitle = 'Histopathology Image';
            break;
        }
        if (oldValue == null) {
          this.showModal();
        }
      }
    },
  },
  methods: {
    modalArrowClick(toRight) {
      if (toRight) {
        this.modalIndex++;
      } else {
        this.modalIndex--;
      }
      if (this.modalIndex === imageIndex.HIST) {
        this.downloadHisto();
      } else if (this.modalIndex === imageIndex.DIM_RED) {
        this.downloadDimRed();
      }
    },
    showModal() {
      this.computeDims();
      this.$refs['image-modal'].show();
    },
    hideModal() {
      this.$refs['image-modal'].hide();
      this.modalIndex = null;
    },
    toggleShowHisto() {
      this.downloadHisto();
      this.showHisto = !this.showHisto;
    },
    computeDims() {
      const w =
        0.8 *
        Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      const h =
        0.75 *
        Math.max(
          document.documentElement.clientHeight,
          window.innerHeight || 0
        );
      const iw = store.getters.getImageWidth;
      const ih = store.getters.getImageHeight;
      if (ih < iw) {
        this.modalCanvasHeight = h;
        this.modalCanvasWidth = Math.round((h * iw) / ih);
      } else {
        this.modalCanvasHeight = Math.round((w * ih) / iw);
        this.modalCanvasWidth = w;
      }
    },
    downloadHisto() {
      if (this.firstTimeHisto) {
        this.firstTimeHisto = false;
        this.$store.dispatch('fetchHistoImage');
      }
    },
    downloadDimRed() {
      if (this.firstTimeDimRed) {
        this.firstTimeDimRed = false;
        this.$store.dispatch('fetchDimRedImage');
      }
    },
    deleteLassoImage() {
      store.commit('CLEAR_IMAGE', imageIndex.LASSO);
      store.commit('RESET_SELECTION');
    },
    deleteHistoOverlay() {
      store.commit('SET_SHOW_HISTO_OVERLAY', false);
    },
    logEvent(expanded) {
      this.$emit('change-expand', expanded);
    },
    handleCanvasBlob(blob) {
      this.blobUrl = window.URL.createObjectURL(blob);
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
    showModalRight() {
      return this.modalIndex < imageIndex.HIST;
    },
    showModalLeft() {
      return this.modalIndex > imageIndex.COMMUNITY;
    },
    showDimRed: {
      get() {
        return this.options.dimred.show;
      },
      set(value) {
        this.$store.commit('OPTIONS_IMAGE_DIM_RED_CHANGE_SHOW', value);
        this.downloadDimRed();
      },
    },
    showDimredTrash: function() {
      return store.getters.getImageData(imageIndex.DIM_RED).mzValues.length > 0;
    },
    showLassoTrash: function() {
      return store.getters.getImageData(imageIndex.LASSO).mzValues.length > 0;
    },
    showHistoTrash: function() {
      return store.getters.getImageData(imageIndex.HIST).showOverlay;
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
