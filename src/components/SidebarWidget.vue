<template>
  <div class="sidebar-widget" v-bind:class="{ expanded: expanded }">
    <span v-on:click="toggleView()" class="float-right">
      <v-icon name="arrow-right" v-if="showRightArrow()"></v-icon>
      <v-icon name="arrow-left" v-if="showLeftArrow()"></v-icon>
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
    showLeftArrow: function() {
      return this.side === 'right' ? !this.expanded : this.expanded;
    },
    showRightArrow: function() {
      return this.side === 'right' ? this.expanded : !this.expanded;
    },
  },
};
</script>

<style scoped lang="scss">
.sidebar-widget {
  width: 20px;
  min-height: 100vh;
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
