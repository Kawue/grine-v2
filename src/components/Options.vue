<template>
  <SidebarWidget v-bind:side="side" v-bind:initial-expanded="initialExpanded">
    <div>OPTIONS</div>
  </SidebarWidget>
</template>

<script>
import SidebarWidget from './SidebarWidget';

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
  },
  name: 'Options',
};
</script>

<style scoped lang="scss">
.sidebar-widget {
  background-color: green;
}

.sidebar-widget {
  &.expanded {
    width: 200px !important;
  }
}
</style>
