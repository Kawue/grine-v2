<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <Images msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
import Images from '@/components/Images.vue';

export default {
  name: 'home',
  components: {
    Images,
  },
};
</script>
