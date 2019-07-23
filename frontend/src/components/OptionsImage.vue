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
  </div>
</template>

<script>
import OptionsImageMergeMethod from './OptionsImageMergeMethod';
import OptionsImageMinIntensity from './OptionsImageMinIntensity';
import OptionsImageMinOverlap from './OptionsImageMinOverlap';

export default {
  name: 'OptionsImage',
  components: {
    OptionsImageMergeMethod,
    OptionsImageMinIntensity,
    OptionsImageMinOverlap,
  },
};
</script>

<style scoped lang="scss">
</style>
