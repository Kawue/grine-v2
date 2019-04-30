<template>
  <div class="image">
    <p>Image Options</p>

    <input type="checkbox" id="jack" value="Jack" v-model="test">
    <label for="jack">Jack</label>
  </div>
</template>

<script>
export default {
  name: 'OptionsImage',
  data: function() {
    return {
      test: false,
    };
  },
};
</script>

<style scoped lang="scss">
.network {
}
</style>
