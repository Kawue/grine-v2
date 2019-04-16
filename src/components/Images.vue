<template>
  <div
    class="sidebar-widget"
    v-bind:class="{ expanded: expanded }"
    v-on:click="toggleView()"
  >
    IMAGES
  </div>
</template>

<script>
export default {
  name: 'Images',
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
  background-color: red;
}

.sidebar-widget {
  &.expanded {
    width: 300px !important;
  }
}
</style>
