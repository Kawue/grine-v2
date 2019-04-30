<template>
  <SidebarWidget v-bind:side="side" v-bind:initial-expanded="initialExpanded">
    <div slot="content">
      <div>OPTIONS</div>
    </div>

    <div slot="nav">
      lll
    </div>
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
  min-height: 50vh;
  max-height: 50vh;
}

.sidebar-widget {
  &.expanded {
    width: 600px !important;
  }
}
</style>
