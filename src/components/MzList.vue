<template>
  <SidebarWidget v-bind:side="side" v-bind:initial-expanded="initialExpanded">
    <div style="margin-top: 4px; display: inline-block"><i>m/z</i> Values</div>
    <div style="padding: 4px 8px 0 8px;">
      <input
        style="float: left"
        type="checkbox"
        v-model="showAll"
        v-on:click="calculateCurrentMz"
        v-b-tooltip.hover.top="'Show all'"
      />
      <span
        v-on:click="
          asc = !asc;
          sortMZ();
        "
        style="float: right; padding: 0"
      >
        <v-icon v-bind:name="asc ? 'arrow-down' : 'arrow-up'"></v-icon>
      </span>
    </div>

    <select v-model="selectedMz" v-on:click="mzClicked" class="list" multiple>
      <option
        v-for="mzObject in currentMz"
        v-bind:class="{ inactive: !mzObject.highlight }"
        v-bind:title="'mz: ' + mzObject.mz"
        v-bind:value="mzObject.mz"
        v-bind:key="mzObject.mz"
      >
        {{ mzObject.mz }}
      </option>
    </select>
  </SidebarWidget>
</template>

<script>
import SidebarWidget from './SidebarWidget';
import store from '@/store';

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
  },
  name: 'MzList',
  data: function() {
    return {
      selectedMz: [],
      currentMz: [],
      asc: true,
      showAll: true,
      notVisibleMz: [],
    };
  },
  methods: {
    mzClicked: function() {
      console.log(`Selected mz: ${this.selectedMz.join(', ')}`);
    },
    sortMZ: function() {
      if (this.asc) {
        this.currentMz = this.currentMz.sort((a, b) => a.mz - b.mz);
      } else {
        this.currentMz = this.currentMz.sort((a, b) => b.mz - a.mz);
      }
    },
    calculateCurrentMz: function() {
      if (!this.showAll) {
        if (this.notVisibleMz.length > 0) {
          this.currentMz.push(
            ...this.notVisibleMz.map(mz => {
              return {
                highlight: false,
                mz,
              };
            })
          );
          this.notVisibleMz = [];
          this.sortMZ();
        }
      } else {
        for (let i = this.currentMz.length - 1; i >= 0; i--) {
          if (!this.currentMz[i].highlight) {
            this.notVisibleMz.push(this.currentMz[i].mz);
            this.currentMz.splice(i, 1);
          }
        }
      }
    },
  },
  created() {
    for (const mz of store.getters.getMzValues) {
      this.currentMz.push({
        highlight: Math.random() > 0.3,
        mz,
      });
    }
  },
};
</script>

<style scoped lang="scss">
.sidebar-widget {
  &.expanded {
    width: 120px !important;
  }
}

.inactive {
  color: darkgray;
}

.list {
  padding: 0;
  font-size: 0.9em;
  min-height: 93vh;
  width: 100%;
  text-align: center;
  margin-top: 8px;
}
</style>
