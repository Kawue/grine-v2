<template>
  <div class="image">
    <input type="checkbox" id="headline" v-model="options.showMz" />
    <label for="headline">Show MZ Values</label>
  </div>
</template>

<script>
import store from '@/store';
import { mapGetters } from 'vuex';

export default {
  name: 'OptionsImage',
  computed: mapGetters({
    options: 'getOptionsImage',
  }),
  watch: {
    test: function(val) {
      console.log(val);
      store.dispatch('updateOptionsImage', this.options);
    },
  },
};
</script>

<style scoped lang="scss">
.network {
}
</style>
