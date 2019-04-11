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
  right: 0px;
  top: 0px;
  bottom: 0px;
  z-index: 101;
  background-color: blue;
}
</style>
