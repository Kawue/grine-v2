<template>
  <SidebarWidget v-bind:side="side" v-bind:initial-expanded="initialExpanded">
    <div slot="content">
      <div>MZ</div>
      {{ mzValues }}
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
  name: 'MzList',
  computed: mapGetters({
    mzValues: 'getMzValues',
  }),
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
