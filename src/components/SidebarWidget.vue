<template>
  <div class="sidebar-widget" v-bind:class="{ expanded: expanded }">
    <span v-on:click="toggleView()" class="float-right">
      <font-awesome-icon icon="coffee" />
    </span>
    <slot></slot>
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
