<template>
  <div class="home">
    <SidebarLeft />
    <SidebarRight v-if="!loading" />
    <Graph v-if="!loading" />
    <b-button
      id="clear-button"
      variant="warning"
      size="lg"
      @click="clearSelection"
      >Clear</b-button
    >
  </div>
</template>

<script>
import SidebarLeft from '@/components/SidebarLeft.vue';
import SidebarRight from '@/components/SidebarRight.vue';
import Graph from '@/components/Graph.vue';
import store from '@/store';
import { mapGetters } from 'vuex';

export default {
  name: 'home',
  components: {
    SidebarLeft,
    SidebarRight,
    Graph,
  },
  computed: {
    ...mapGetters({
      loading: 'getLoadingGraphData',
    }),
  },
  mounted: function() {
    console.log('home component mounted');
    store.dispatch('fetchGraphData');
    store.dispatch('fetchMergeMethods');
  },
  methods: {
    clearSelection() {
      store.commit('RESET_SELECTION');
    },
  },
};
</script>
<style scoped lang="scss">
#clear-button {
  position: absolute;
  left: 3vw;
  bottom: 5vh;
  font-size: 1.2em;
  z-index: 100;
}
</style>
