<template>
  <SidebarWidget
    v-bind:side="side"
    v-bind:initial-expanded="initialExpanded"
    title="Images"
  >
    <div slot="content">
      <mz-image></mz-image>
    </div>
  </SidebarWidget>
</template>

<script>
import SidebarWidget from './SidebarWidget';
import MzImage from './MzImage';
import { mapGetters } from 'vuex';

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
    MzImage,
  },
  mounted: function() {
    this.$store.subscribe(mutation => {
      switch (mutation.type) {
        case 'OPTIONS_MZLIST_UPDATE_SELECTED_MZ':
        case 'OPTIONS_IMAGE_CHANGE_MERGE_METHOD':
          this.$store.dispatch('fetchImageData');
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
.sidebar-widget {
  background-color: white;
}

.sidebar-widget {
  &.expanded {
    width: 300px !important;
  }
}
</style>
