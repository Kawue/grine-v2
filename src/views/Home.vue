<template>
  <div class="home">
    <SidebarLeft />
    <SidebarRight v-if="showPanels" />
    <Graph />
  </div>
</template>

<script>
import SidebarLeft from '@/components/SidebarLeft.vue';
import SidebarRight from '@/components/SidebarRight.vue';
import Graph from '@/components/Graph.vue';
import store from '@/store';

export default {
  name: 'home',
  components: {
    SidebarLeft,
    SidebarRight,
    Graph,
  },
  data: function() {
    return {
      showPanels: false,
    };
  },
  mounted: function() {
    console.log('home component mounted');
    store.dispatch('fetchData');
    this.showPanels = true;
  },
};
</script>
