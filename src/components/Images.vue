<template>
  <SidebarWidget v-bind:side="side" v-bind:initial-expanded="initialExpanded">
    <div>IMAGES</div>
    <div>{{ originalData }}</div>
  </SidebarWidget>
</template>

<script>
import SidebarWidget from './SidebarWidget';
import { mapState } from 'vuex';

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
  },
  name: 'Images',
  computed: mapState({
    originalData: 'originalData',
  }),
};
</script>

<style scoped lang="scss">
.sidebar-widget {
  background-color: red;
}

.sidebar-widget {
  &.expanded {
    width: 200px !important;
  }
}
</style>
