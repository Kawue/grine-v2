<template>
  <SidebarWidget
    v-bind:side="side"
    v-bind:hoverExpandEnabled="hoverExpandEnabled"
    v-bind:iconExpandEnabled="iconExpandEnabled"
  >
    <div slot="content">
      <div>OPTIONS</div>
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
