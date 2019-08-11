<template>
  <div class="flex-container">
    <b-form-checkbox v-model="show">show</b-form-checkbox>
    <b-form-checkbox v-model="relative" v-if="show">relative</b-form-checkbox>

    <OptionsImagePcaThreshold
      v-if="!relative && show"
    ></OptionsImagePcaThreshold>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import OptionsImagePcaThreshold from './OptionsImagePcaThreshold';

export default {
  components: {
    OptionsImagePcaThreshold,
  },
  name: 'OptionsImagePca',
  computed: {
    ...mapGetters({
      state: 'getOptionsImage',
    }),
    relative: {
      get() {
        return this.state.pca.relative;
      },
      set(value) {
        this.$store.commit('OPTIONS_IMAGE_PCA_CHANGE_RELATIVE', value);
      },
    },
    show: {
      get() {
        return this.state.pca.show;
      },
      set(value) {
        this.$store.commit('OPTIONS_IMAGE_PCA_CHANGE_SHOW', value);
      },
    },
  },
  data() {
    return {};
  },
};
</script>

<style scoped lang="scss"></style>
