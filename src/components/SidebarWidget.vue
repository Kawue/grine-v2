<template>
  <div class="sidebar-widget" v-bind:class="{ expanded: expanded }">
    <span v-on:click="toggleView()" class="float-right">
      <v-icon name="arrow-right" v-if="expanded"></v-icon>
      <v-icon name="arrow-left" v-if="!expanded"></v-icon>
    </span>
    <div class="content">
      <slot></slot>
    </div>
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

    .content {
      display: block;
    }
  }

  .content {
    display: none;
  }
}
</style>
