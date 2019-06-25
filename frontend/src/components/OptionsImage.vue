<template>
  <div class="data">
    <div class="row">
      <div class="col-md-12">
        Merge Method:
        <OptionsImageMergeMethod></OptionsImageMergeMethod>
      </div>
    </div>
  </div>
</template>

<script>
import OptionsImageMergeMethod from './OptionsImageMergeMethod';

export default {
  name: 'OptionsImage',
  components: {
    OptionsImageMergeMethod,
  },
};
</script>

<style scoped lang="scss">
</style>
