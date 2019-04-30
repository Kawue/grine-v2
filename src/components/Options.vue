<template>
  <SidebarWidget
    v-bind:side="side"
    v-bind:hoverExpandEnabled="hoverExpandEnabled"
    v-bind:iconExpandEnabled="iconExpandEnabled"
  >
    <div slot="content-collapsed">
      <v-icon name="tools"></v-icon>
    </div>

    <div slot="content">
      <div class="options">
        <b-tabs content-class="mt-3">
          <b-tab title="Network" v-bind:active="tabActive === 'network'">
            <OptionsNetwork></OptionsNetwork>
          </b-tab>
          <b-tab title="Images" v-bind:active="tabActive === 'image'">
            <OptionsImage></OptionsImage>
          </b-tab>
          <b-tab title="Data" v-bind:active="tabActive === 'data'">
            <OptionsData></OptionsData>
          </b-tab>
        </b-tabs>
      </div>
    </div>
  </SidebarWidget>
</template>

<script>
import SidebarWidget from './SidebarWidget';
import OptionsNetwork from './OptionsNetwork';
import OptionsImage from './OptionsImage';
import OptionsData from './OptionsData';

export default {
  extends: SidebarWidget,
  components: {
    OptionsData,
    OptionsImage,
    OptionsNetwork,
    SidebarWidget,
  },
  name: 'Options',
  props: {
    initialTabActive: {
      type: String,
      required: false,
      default: 'images',
    },
  },
  data: function() {
    return {
      tabActive: this.initialTabActive,
      hoverActive: false,
    };
  },
};
</script>

<style lang="scss">
/* don't know why this style is only accepted non-scoped? */
.nav-link {
  color: #495057;
  border: 0 !important;

  &:hover {
    border: 0 !important;
  }

  &.active {
    background-color: darkgrey !important;
    border: 0 !important;
  }
}
</style>

<style scoped lang="scss">
.sidebar-widget {
  background-color: lightgrey;
  min-height: 50vh;
  max-height: 50vh;
}

.sidebar-widget {
  &.expanded {
    width: 600px !important;
  }

  .content {
    display: block !important;
  }
}
</style>
