<template>
  <div class="images">
    <h3>TEST</h3>
  </div>
</template>

<script>
export default {
  name: 'Images',
  props: {
    msg: String,
  },
};
</script>

<style scoped lang="scss">
h3 {
  margin: 140px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
