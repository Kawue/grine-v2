<template>
  <SidebarWidget v-bind:side="side" v-bind:initial-expanded="initialExpanded">
    <div style="position: sticky; top: 0;display: inline-block;">MZ</div>
    <div style="overflow: auto;  min-height: 100vh; max-height: 100vh;">
      <ul style="padding: 0; font-size: 0.7em;">
        <li v-for="mz in mzValues">
          {{ mz }}
        </li>
      </ul>
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
    width: 120px !important;
  }
}
</style>
