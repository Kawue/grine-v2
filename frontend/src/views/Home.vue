<template>
  <div class="home">
    <SidebarLeft />
    <SidebarRight v-if="!loading" />
    <Graph v-if="!loading" />
    <div class="mode-container text-center" @click="toggleMode">
      <div class="selected-mode">{{ lassoMode ? 'Free' : 'Lasso' }} Mode</div>
    </div>
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
  data: function() {
    return {
      easterEggFlag1: false,
      easterEggFlag2: false,
      easterEggFlag3: false,
      easterEggFlag4: false,
      easterEggFlag5: false,
    };
  },
  computed: {
    ...mapGetters({
      loading: 'getLoadingGraphData',
      lassoMode: 'networkLassoMode',
    }),
  },
  mounted: function() {
    store.dispatch('fetchGraphData');
    store.dispatch('fetchMergeMethods');
    window.addEventListener('keyup', event => {
      this.easterEgg(event);
    });
  },
  methods: {
    toggleMode() {
      store.commit('NETWORK_TOGGLE_MODE');
    },
    easterEgg(evt) {
      switch (evt.keyCode) {
        case 71:
          this.easterEggFlag1 = true;
          break;
        case 82:
          if (this.easterEggFlag1) {
            this.easterEggFlag2 = true;
          } else {
            store.commit('SET_SURPRISE', false);
          }
          break;
        case 73:
          if (this.easterEggFlag2) {
            this.easterEggFlag3 = true;
          } else {
            store.commit('SET_SURPRISE', false);
          }
          break;
        case 78:
          if (this.easterEggFlag3) {
            this.easterEggFlag4 = true;
          } else {
            store.commit('SET_SURPRISE', false);
          }
          break;
        case 69:
          if (this.easterEggFlag4) {
            store.commit('SET_SURPRISE', true);
            this.easterEggFlag1 = false;
            this.easterEggFlag2 = false;
            this.easterEggFlag3 = false;
            this.easterEggFlag4 = false;
          } else {
            store.commit('SET_SURPRISE', false);
          }
          break;
        default:
          this.easterEggFlag1 = false;
          this.easterEggFlag2 = false;
          this.easterEggFlag3 = false;
          this.easterEggFlag4 = false;
          this.easterEggFlag5 = false;
          store.commit('SET_SURPRISE', false);
      }
    },
  },
};
</script>
<style scoped lang="scss">
.selected-mode {
  width: 150px;
  font-size: 1.4em;
  border: 1px solid black;
  padding-bottom: 5px;
}
.mode-container {
  position: absolute;
  left: 3vw;
  background-color: rgba(231, 231, 231, 0.5);
  top: 0;
  z-index: 100;
  cursor: pointer;
}
</style>
