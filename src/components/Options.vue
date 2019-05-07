<template>
  <div
    class="options"
    v-bind:class="getExpandedClass()"
    @mouseleave="mouseLeave()"
  >
    <div class="options-nav float-left">
      <div @mouseover="mouseOverTab('network')" v-bind:class="getTabActiveClass('network')" class="options-nav-btn">
        <p>Network</p>
      </div>
      <div @mouseover="mouseOverTab('image')" v-bind:class="getTabActiveClass('image')" class="options-nav-btn">
        <p>Image</p>
      </div>
      <div @mouseover="mouseOverTab('data')" v-bind:class="getTabActiveClass('data')" class="options-nav-btn">
        <p>Data</p>
      </div>
    </div>

    <div class="options-content" v-if="showOptionsContent()">
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
</template>

<script>
import OptionsNetwork from './OptionsNetwork';
import OptionsImage from './OptionsImage';
import OptionsData from './OptionsData';

export default {
  components: {
    OptionsData,
    OptionsImage,
    OptionsNetwork,
  },
  name: 'Options',
  props: {},
  data: function() {
    return {
      tabActive: null,
    };
  },
  methods: {
    mouseOverTab: function(tab) {
      this.tabActive = tab;
    },
    mouseLeave: function() {
      this.tabActive = null;
    },
    showOptionsContent: function() {
      return this.tabActive !== null;
    },
    getExpandedClass: function() {
      return this.showOptionsContent() ? 'expanded' : '';
    },
    getTabActiveClass: function(tab) {
      return this.tabActive === tab ? 'active' : '';
    },
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
.options {
  min-height: 450px;
  max-height: 450px;
  width: 40px;
  overflow: hidden;
  border-radius: 0 0 10px 0;

  &.expanded {
    width: 600px !important;
    background-color: #3e3f40;
  }
  .options-content {
    color: white;
  }
}

.options-nav {
  .options-nav-btn {
    &.active {
      background-color: #3e3f40;
      border: 1px solid #4c4c4d;
    }
    &:not(.active) {
      background-image: linear-gradient(-90deg, #4f5051, #565656);
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
