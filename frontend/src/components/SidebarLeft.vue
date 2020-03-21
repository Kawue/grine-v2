<template>
  <div class="sidebar">
    <div class="row">
      <div class="col-sm">
        <Options></Options>
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
  z-index: 102;

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
