<template>
  <div class="home">
    <Sidebar />
    <Graph />
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue';
import Graph from '@/components/Graph.vue';

export default {
  name: 'home',
  components: {
    Sidebar,
    Graph,
  },
};
</script>
