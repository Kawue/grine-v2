<template>
  <div
    class="sidebar-widget"
    v-bind:class="{ expanded: expanded }"
    v-on:click="toggleView()"
  >
    Sidebar Widget
  </div>
</template>

<script>
export default {
  name: 'SidebarWidget',
  data: function() {
    return {
      expanded: true,
    };
  },
  methods: {
    toggleView: function() {
      this.expanded = !this.expanded;
    },
  },
};
</script>

<style scoped lang="scss">
.sidebar-widget {
  background-color: white;
}

.sidebar-widget {
  &.expanded {
    width: 200px !important;
  }
}
</style>
