<template>
  <div class="sidebar-widget" v-bind:class="{ expanded: expanded }">
    <span v-on:click="toggleView()" v-bind:class="getExpandIconClass()">
      <v-icon name="arrow-right" v-if="showExpandRightIcon()"></v-icon>
      <v-icon name="arrow-left" v-if="showExpandLeftIcon()"></v-icon>
    </span>
    <div class="content">
      <slot></slot>
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
    initialExpanded: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data: function() {
    return {
      expanded: this.initialExpanded,
    };
  },
  methods: {
    toggleView: function() {
      this.expanded = !this.expanded;
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
  overflow: hidden;
  background-color: white;

  &.expanded {
    width: 200px;

    .content {
      display: block;
    }
  }

  .content {
    display: none;
  }
}
</style>
