<template>
  <SidebarWidget v-bind:side="side" v-bind:initial-expanded="initialExpanded">
    <div slot="content">
      <div>IMAGES</div>
      <div>{{ data }}</div>
    </div>
  </SidebarWidget>
</template>

<script>
import SidebarWidget from './SidebarWidget';
import { mapGetters } from 'vuex';

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
  },
  name: 'Images',
  computed: mapGetters({
    data: 'getData',
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
