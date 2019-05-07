<template>
  <SidebarWidget
    v-bind:side="side"
    v-bind:hoverExpandEnabled="hoverExpandEnabled"
    v-bind:iconExpandEnabled="iconExpandEnabled"
    v-bind:initialExpanded="initialExpanded"
  >
    <div slot="content-always">
      <div class="option-nav">
        <div @mouseover="tabActive = 'network'" class="option-nav-btn">
          <p>Network</p>
        </div>
        <div @mouseover="tabActive = 'image'" class="option-nav-btn">
          <p>Image</p>
        </div>
        <div @mouseover="tabActive = 'data'" class="option-nav-btn">
          <p>Data</p>
        </div>
      </div>
    </div>

    <div slot="content">
      <div class="options">
        <div v-if="tabActive === 'network'">
          <OptionsNetwork></OptionsNetwork>
        </div>

        <div v-if="tabActive === 'image'">
          <OptionsImage></OptionsImage>
        </div>

        <div v-if="tabActive === 'data'">
          <OptionsData></OptionsData>
        </div>
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
      default: 'image',
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
  background-color: transparent;
  min-height: 450px;
  max-height: 450px;
  width: 40px;
}

.sidebar-widget {
  &.expanded {
    width: 600px !important;
  }

  .content {
    display: block !important;
  }
}

.option-nav {
  .option-nav-btn {
    &:hover {
      background-color: #3e3f40;
      border: 1px solid #4c4c4d;
    }
    height: 150px;
    width: 40px;
    margin: 0 0 0 -1px;
    padding: 0;
    cursor: pointer;
    background-color: #4f5051;
    color: white;
    border: 1px solid #737374;
    border-top: 0;
    border-radius: 0 10px 10px 0;

    p {
      writing-mode: tb-rl;
      transform: rotate(-180deg);
      padding: 5px;
      margin: 0;
      text-align: center;
      height: 100%;
      font-size: 18px;
    }
  }
}
</style>
