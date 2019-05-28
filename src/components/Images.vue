<template>
  <SidebarWidget
    v-bind:side="side"
    v-bind:initial-expanded="initialExpanded"
    title="Images"
  >
    <div slot="content">
      <mz-image v-if="options.showMz"></mz-image>
      <MzImageLasso></MzImageLasso>
    </div>
  </SidebarWidget>
</template>

<script>
import SidebarWidget from './SidebarWidget';
import MzImage from './MzImage';
import MzImageLasso from './MzImageLasso';
import { mapGetters } from 'vuex';

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
    MzImage,
    MzImageLasso,
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
    width: 800px !important;
  }
}
</style>
