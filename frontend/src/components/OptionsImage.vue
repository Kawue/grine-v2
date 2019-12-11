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
          <div class="col-md-6">
            <OptionsImageMinIntensity></OptionsImageMinIntensity>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">Min Overlap:</div>
          <div class="col-md-6">
            <OptionsImageMinOverlap></OptionsImageMinOverlap>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="row">
          <div class="col-md-4">Color Scale:</div>
          <div class="col-md-4">
            <OptionsImageColorScale></OptionsImageColorScale>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
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
  </div>
</template>

<script>
import OptionsImageMergeMethod from './OptionsImageMergeMethod';
import OptionsImageMinIntensity from './OptionsImageMinIntensity';
import OptionsImageMinOverlap from './OptionsImageMinOverlap';
import OptionsImageColorScale from './OptionsImageColorScale';
import OptionsImageDimRed from './OptionsImageDimRed';

export default {
  name: 'OptionsImage',
  components: {
    OptionsImageMergeMethod,
    OptionsImageMinIntensity,
    OptionsImageMinOverlap,
    OptionsImageColorScale,
    OptionsImageDimRed,
  },
};
</script>

<style scoped lang="scss"></style>
