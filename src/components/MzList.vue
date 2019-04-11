<template>
  <div class="mz-list">
    <div>
      MZ
    </div>
  </div>
</template>

<script>
export default {
  name: 'MzList',
  props: {
    msg: String,
  },
};
</script>

<style scoped lang="scss">
.mz-list > div {
  background-color: yellow;
  width: 100px;
  min-height: 100vh;
}
</style>
