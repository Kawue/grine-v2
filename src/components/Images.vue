<template>
  <SidebarWidget v-bind:side="side" v-bind:initial-expanded="initialExpanded">
    <div slot="content">
      <div>IMAGES</div>
      <!--<div v-if="options.showMz">{{ data }}</div>-->
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
