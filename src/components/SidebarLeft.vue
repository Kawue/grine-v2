<template>
  <div class="sidebar">
    <div class="row">
      <div class="col-sm">
        <Options side="left" v-bind:initialExpanded="false"></Options>
      </div>
    </div>
  </div>
</template>

<script>
import Options from '@/components/Options.vue';

export default {
  name: 'Sidebar',
  components: {
    Options,
  },
};
</script>

<style scoped lang="scss">
.sidebar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 101;
  background-color: blue;

  .row {
    padding: 0;
    margin: 0;

    .col-sm {
      padding: 0;
      margin: 0;
    }
  }
}
</style>
