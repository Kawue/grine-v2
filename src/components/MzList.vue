<template>
  <div
    class="sidebar-widget"
    v-bind:class="{ expanded: expanded }"
    v-on:click="toggleView()"
  >
    MZ
  </div>
</template>

<script>
import SidebarWidget from './SidebarWidget';

export default {
  extends: SidebarWidget,
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
