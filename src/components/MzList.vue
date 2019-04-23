<template>
  <SidebarWidget v-bind:side="side">
    <div>MZ</div>
  </SidebarWidget>
</template>

<script>
import SidebarWidget from './SidebarWidget';

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
  },
  name: 'MzList',
};
</script>

<style scoped lang="scss">
.sidebar-widget {
  background-color: yellow;
}

.sidebar-widget {
  &.expanded {
    width: 100px !important;
  }
}
</style>
