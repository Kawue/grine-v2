<template>
  <div
    class="sidebar-widget"
    v-bind:class="[getExpandedClass()]"
    @mouseover="eventMouseOver()"
    @mouseleave="eventMouseLeave()"
  >
    <slot name="nav" v-if="iconExpandEnabled">
      <span v-if="expanded" class="horizontal-title">{{ title }}</span>
      <span v-on:click="toggleView()" class="clickable">
        <v-icon
          name="arrow-right"
          class="icon-open"
          v-if="showExpandRightIcon()"
        ></v-icon>
        <v-icon
          name="arrow-left"
          class="icon-collapsed"
          v-if="showExpandLeftIcon()"
        ></v-icon>
      </span>
      <span
        class="vertical-title clickable"
        v-on:click="toggleView()"
        v-if="!expanded"
        style="writing-mode: vertical-rl;text-orientation: mixed;"
        >{{ title }}</span
      >
    </slot>
    <div class="content-collapsed" v-bind:class="{ hidden: expanded }">
      <slot name="content-collapsed"></slot>
    </div>
    <div
      class="content"
      v-bind:class="{ hidden: !expanded }"
      style="height: 100vw;"
    >
      <slot name="content"></slot>
    </div>
    <div class="content-always">
      <slot name="content-always"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SidebarWidget',
  props: {
    side: {
      type: String,
      required: true,
    },
    title: {
      type: String,
    },
    initialExpanded: {
      type: Boolean,
      required: false,
      default: true,
    },
    hoverExpandEnabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    iconExpandEnabled: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data: function() {
    return {
      expanded: this.hoverExpandEnabled ? false : this.initialExpanded,
      hoverActive: false,
    };
  },
  methods: {
    eventMouseOver: function() {
      if (this.hoverExpandEnabled) {
        this.expanded = true;
      }
    },
    eventMouseLeave: function() {
      if (this.hoverExpandEnabled) {
        this.expanded = false;
      }
    },
    toggleView: function() {
      this.expanded = !this.expanded;
      this.$emit('change-expand', this.expanded);
    },
    getExpandedClass: function() {
      return this.expanded ? 'expanded' : '';
    },
    getExpandIconClass: function() {
      return this.side === 'right' ? 'float-right' : 'float-left';
    },
    showExpandLeftIcon: function() {
      return this.side === 'right' ? !this.expanded : this.expanded;
    },
    showExpandRightIcon: function() {
      return this.side === 'right' ? this.expanded : !this.expanded;
    },
  },
};
</script>

<style scoped lang="scss">
.sidebar-widget {
  width: 20px;
  min-height: 100vh;
  max-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: white;
  border: #717273 1px solid;

  &.expanded {
  }
}

.vertical-title {
  padding-top: 10px;
}

.horizontal-title {
  display: inline-block;
  padding-top: 5px;
  padding-bottom: 0;
}

.clickable {
  cursor: pointer;
}

.icon-collapsed {
  width: 100%;
  margin: auto;
  margin-top: 10px !important;
}

.icon-open {
  margin-top: 12px;
  margin-right: 5px;
  float: right;
}
</style>
