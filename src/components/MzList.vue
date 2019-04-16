<template>
  <div
    class="sidebar-widget"
    v-bind:class="{ expanded: expanded }"
    v-on:click="toggleView()"
  >
    MZ
  </div>
</template>

<script>
export default {
  name: 'MzList',
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
  background-color: yellow;
}

.sidebar-widget {
  &.expanded {
    width: 100px !important;
  }
}
</style>
