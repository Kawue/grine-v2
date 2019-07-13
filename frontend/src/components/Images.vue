<template>
  <SidebarWidget
    v-bind:side="side"
    v-bind:initial-expanded="initialExpanded"
    title="Images"
  >
    <div slot="content">
      <div class="row" style="margin-top: 30px">
        <div class="col-md-2"></div>
        <div class="col-md-8">
          <OptionsImageMergeMethod></OptionsImageMergeMethod>
        </div>
      </div>
      <div class="row" style="margin-top: 30px">
        <div class="col-md-12">
          <mz-image :imageDataIndex="0"></mz-image>
        </div>
      </div>
      <div class="row" style="margin-top: 30px">
        <div class="col-md-12">
          <mz-image :imageDataIndex="1"></mz-image>
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

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
    MzImage,
    OptionsImageMergeMethod,
  },
  mounted: function() {
    this.$store.subscribe(mutation => {
      switch (mutation.type) {
        case 'OPTIONS_IMAGE_CHANGE_MERGE_METHOD':
        case 'MZLIST_RESET_HIGHLIGHTED_MZ':
        case 'NETWORK_HIGHLIGHT_NODE':
        case 'MZLIST_UPDATE_SELECTED_MZ':
          this.$store.dispatch('fetchImageData', 1);
          break;
      }
    });
    this.$store.subscribeAction(action => {
      if (action.type === 'changeGraph') {
        this.$store.dispatch('fetchImageData', 0);
        this.$store.dispatch('fetchImageData', 1);
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
.sidebar-widget {
  background-color: white;
}

.sidebar-widget {
  &.expanded {
    width: 300px !important;
  }
}
</style>
