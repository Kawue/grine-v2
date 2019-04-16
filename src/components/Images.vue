<template>
  <SidebarWidget>
    <div>IMAGES</div>
  </SidebarWidget>
</template>

<script>
import SidebarWidget from './SidebarWidget';

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
  },
  name: 'Images',
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
