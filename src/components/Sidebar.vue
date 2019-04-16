<template>
  <div class="sidebar">
    <div class="row">
      <div class="col-sm">
        <Images></Images>
      </div>
      <div class="col-sm">
        <MzList></MzList>
      </div>
    </div>
  </div>
</template>

<script>
import Images from '@/components/Images.vue';
import MzList from '@/components/MzList.vue';

export default {
  name: 'Sidebar',
  components: {
    Images,
    MzList,
  },
};
</script>

<style scoped lang="scss">
.sidebar {
  position: absolute;
  right: 0;
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

  .sidebar-widget {
    width: 20px;
    min-height: 100vh;
    overflow: hidden;
  }
}
</style>
