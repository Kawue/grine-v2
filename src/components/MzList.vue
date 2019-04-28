<template>
  <SidebarWidget v-bind:side="side" v-bind:initial-expanded="initialExpanded">
    <div style="margin-top: 20px; display: inline-block">
      <i>m/z</i> Values
    </div>
    <div>
      Sort by:
      <select>
        <option>
          Community
        </option>
        <option>m/z Value</option>
      </select>
    </div>
    <div>
      Show all:
      <input type="checkbox" v-model="showAll" v-on:click="calculateCurrentMz">
    </div>
    <span v-on:click="asc=!asc;sortMZ()">
      <v-icon v-bind:name="asc ? 'arrow-down' : 'arrow-up'"></v-icon>
    </span>
    <div style="overflow: auto; max-height: 85vh;">
      <ul style="flex: 40; padding: 0; font-size: 0.7em;">
        <li v-bind:key="mzObject.mz" v-for="mzObject in currentMz" v-bind:class="{ inactive: !mzObject.highlight }"
            v-bind:title="'mz: ' + mzObject.mz" v-on:click="mzClicked(mzObject.mz)">
          {{ mzObject.mz }}
        </li>
      </ul>
    </div>
  </SidebarWidget>
</template>

<script>
import SidebarWidget from './SidebarWidget';
import { mapGetters } from 'vuex';

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
  },
  name: 'MzList',
  data: function() {
    return {
      currentMz: [],
      asc: true,
      showAll: true,
      notVisibleMz: {}
    };
},
  computed: mapGetters({
    mzValues: 'getMzValues',
  }),
  methods: {
    mzClicked: function(mz) {
      console.log(mz);
    },
    sortMZ: function() {
      if (this.asc) {
        this.currentMz = this.currentMz.sort(function(a, b){return a - b});
      } else {
        this.currentMz = this.currentMz.sort(function(a, b){return b - a});
      }
    },
    calculateCurrentMz: function() {
      if(this.showAll) {
        if(this.notVisibleMz > 0) {
          this.currentMz.push(...(this.notVisibleMz.map(mz => {
            return {
              highlight: false,
              mz
            };
          })));
          this.notVisibleMz = [];
        }
      } else {
        const indicesToRemove = [];
        for(let i=0; i<this.currentMz.length; i++) {
          const currentMZObject = this.currentMz[i];
          if(!currentMZObject.highlight) {
            indicesToRemove.push(i);
            this.notVisibleMz.push(currentMZObject.mz)
          }
          if(indicesToRemove.length > 0) {
            for(const index of indicesToRemove) {
              this.currentMz = this.currentMz.slice(index, 1);
            }
            this.sortMZ();
          }

        }
      }
    }
  },
  created() {
    for(const mz of this.mzValues) {
      this.currentMz.push({
        highlight: true,
        mz
      });
    }
  },
};
</script>

<style scoped lang="scss">
.sidebar-widget {
  background-color: yellow;
}

.sidebar-widget {
  &.expanded {
    width: 150px !important;
  }
}

  .inactive {
    color: darkgray;
  }
</style>
