<template>
  <div class="data">
    <div class="row">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">Merge Method:</div>
          <div class="col-md-4">
            <OptionsImageMergeMethod></OptionsImageMergeMethod>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">Min Intensity:</div>
          <div class="col-md-8">
            <OptionsImageMinIntensity></OptionsImageMinIntensity>
          </div>
        </div>
      </div>
    </div>
    <div class="row top-row">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">Min Overlap:</div>
          <div class="col-md-8">
            <OptionsImageMinOverlap></OptionsImageMinOverlap>
          </div>
        </div>
      </div>
    </div>
    <div class="row top-row">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">Color Scale:</div>
          <div class="col-md-4">
            <OptionsImageColorScale></OptionsImageColorScale>
          </div>
        </div>
      </div>
    </div>
    <div class="row top-row">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">Image Size:</div>
          <div class="col-md-8">
            <OptionsImageSize></OptionsImageSize>
          </div>
        </div>
      </div>
    </div>
    <div class="row top-row" v-if="dimredAvailable">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">
            <span class="font12px">DR:</span>
          </div>
          <div class="col-md-8 font12px">
            <OptionsImageDimRed></OptionsImageDimRed>
          </div>
        </div>
      </div>
    </div>
    <div class="row top-row" v-if="availableHistoImages.length > 0">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">Histo Alpha</div>
          <div class="col-md-6">
            <OptionsHistoAlpha></OptionsHistoAlpha>
          </div>
        </div>
      </div>
    </div>
    <div class="row top-row" v-if="availableHistoImages.length > 1">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">Histo Image</div>
          <div class="col-md-6">
            <b-form-select
              v-model="histoImageIndex"
              :options="histoImageOptions"
              size="sm"
            ></b-form-select>
          </div>
        </div>
      </div>
    </div>
    <div
      class="row top-row"
      v-if="dimredAvailable && availableHistoImages.length > 0"
    >
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">Use DimRed as Overlay</div>
          <div class="col-md-6">
            <b-button
              @click="setDimRedOverlay"
              :disabled="dimRedOverlay"
              variant="primary"
              >Overlay</b-button
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OptionsImageMergeMethod from './OptionsImageMergeMethod';
import OptionsImageMinIntensity from './OptionsImageMinIntensity';
import OptionsImageMinOverlap from './OptionsImageMinOverlap';
import OptionsImageColorScale from './OptionsImageColorScale';
import OptionsImageSize from './OptionsImageSize';
import OptionsImageDimRed from './OptionsImageDimRed';
import OptionsHistoAlpha from './OptionsHistoAlpha';
import store from '@/store';
import { mapGetters } from 'vuex';
import * as imageIndex from '../constants';

export default {
  name: 'OptionsImage',
  components: {
    OptionsImageMergeMethod,
    OptionsImageMinIntensity,
    OptionsImageMinOverlap,
    OptionsImageColorScale,
    OptionsImageSize,
    OptionsImageDimRed,
    OptionsHistoAlpha,
  },
  methods: {
    setDimRedOverlay: function() {
      store.commit('SET_DIMRED_AS_HISTO_OVERLAY');
    },
  },
  computed: {
    ...mapGetters({
      dimRedOverlay: 'getHistoDimRedOverlay',
      availableHistoImages: 'getHistoImages',
      dimredAvailable: 'getDimRedAvailable',
    }),
    histoImageIndex: {
      get() {
        return store.getters.getHistoImageIndex;
      },
      set(index) {
        store.commit('SET_HISTO_IMAGE_INDEX', index);
        store.dispatch('fetchHistoImage');
      },
    },
    histoImageOptions: function() {
      return store.getters
        .getImageData(imageIndex.HIST)
        .availableImages.map((imageName, index) => {
          return {
            value: index,
            text: imageName,
          };
        });
    },
  },
};
</script>

<style scoped lang="scss">
.top-row {
  padding-bottom: 15px;
}
</style>
