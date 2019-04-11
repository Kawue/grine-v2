<template>
  <div class="images">
    <div v-on:click="toggleView()" v-bind:class="{ expanded: expanded }">
      images
    </div>
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
.images > div {
  background-color: red;
  width: 20px;
  min-height: 100vh;
  overflow: hidden;

  &.expanded {
    width: 300px;
  }
}
</style>
