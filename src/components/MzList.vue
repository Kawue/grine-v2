<template>
  <div class="mz-list">
    <div v-on:click="toggleView()" v-bind:class="{ expanded: expanded }">
      MZ
    </div>
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
.mz-list > div {
  background-color: yellow;
  width: 20px;
  min-height: 100vh;
  overflow: hidden;

  &.expanded {
    width: 100px;
  }
}
</style>
