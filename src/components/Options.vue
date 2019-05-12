<template>
  <div
    class="options"
    v-bind:class="getExpandedClass()"
    @mouseleave="mouseLeave"
  >
    <div class="options-nav float-left">
      <div @click="tabsExpanded = !tabsExpanded" class="options-tab-toggle" v-bind:class="{ active: tabsExpanded }">
        <img src="images/options.svg" />
      </div>

      <div v-if="tabsExpanded">
        <div
          @mouseover="mouseTabOver('network')"
          @mousedown="mouseTabDown('network')"
          v-bind:class="getTabClass('network')"
          class="options-nav-tab"
        >
          <p>Network</p>
        </div>
        <div
          @mouseover="mouseTabOver('image')"
          @mousedown="mouseTabDown('image')"
          v-bind:class="getTabClass('image')"
          class="options-nav-tab"
        >
          <p>Image</p>
        </div>
        <div
          @mouseover="mouseTabOver('data')"
          @mousedown="mouseTabDown('data')"
          v-bind:class="getTabClass('data')"
          class="options-nav-tab"
        >
          <p>Data</p>
        </div>
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
      tabLocked: null,
      tabsExpanded: false,
    };
  },
  methods: {
    mouseTabOver: function(tab) {
      if (this.tabLocked === null) {
        this.tabActive = tab;
      }
    },
    mouseTabDown: function(tab) {
      this.tabLocked = this.tabLocked === tab ? null : tab;
      this.tabActive = tab;
    },
    mouseLeave: function(event) {
      if (event.relatedTarget === null) {
        return;
      }
      if (this.tabLocked === null) {
        this.tabActive = null;
      }
    },
    showOptionsContent: function() {
      return this.tabActive !== null && this.tabsExpanded;
    },
    getExpandedClass: function() {
      return this.showOptionsContent() ? 'expanded' : '';
    },
    getTabClass: function(tab) {
      let classes = this.tabActive === tab ? 'active' : '';
      classes += this.tabLocked === tab ? ' locked' : '';
      return classes;
    },
  },
};
</script>

<style lang="scss">
.options {
  hr {
    background-color: #737374;
  }
  input,
  select {
    background-color: #4f5051;
    color: white;
    border: 1px solid #737374;
    margin: 0 0 5px 0;
  }
  input[type='checkbox'] {
    margin-right: 5px;
  }
  label {
    font-size: 14px;
    margin: 0;
  }
  .btn-secondary {
    background-color: #4f5051;
    border: 1px solid #737374;
    color: white;
    &.active {
      background-color: #3e3f40 !important;
      border: 1px solid #cbcbcb !important;
    }
  }
}
</style>

<style scoped lang="scss">
.options {
  height: 490px;
  width: 40px;
  overflow: hidden;
  border-radius: 0 0 10px 0;
  text-align: left;

  &.expanded {
    width: 600px !important;
    background-color: #3e3f40;
    border-right: 1px solid #737374;
    border-bottom: 1px solid #737374;
  }
  .options-content {
    color: white;
    padding: 10px 10px 10px 50px;
  }
  .options-tab-toggle {
    width: 40px;
    height: 40px;
    background-color: #4f5051;
    border: 1px solid #737374;
    border-top: 0;
    border-left: 0;
    border-radius: 0 0 10px 0;
    position: relative;
    cursor: pointer;
    &.active {
      background-color: #3e3f40;
    }

    img {
      width: 25px;
      height: 25px;
      position: absolute;
      margin: auto;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
}

.options-nav {
  .options-nav-tab {
    &.locked {
      border: 1px solid white !important;
    }
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
    color: white;
    background-color: #4f5051;
    border: 1px solid #737374;
    border-top: 0;
    border-left: 0;
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
