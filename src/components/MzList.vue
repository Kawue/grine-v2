<template>
  <SidebarWidget v-bind:side="side" v-bind:initial-expanded="initialExpanded">
    <div slot="content">
      <div style="margin-top: 4px; display: inline-block">
        <i>m/z</i> Values
      </div>
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
          v-on:dblclick="doubleClick(mzObject)"
        >
          {{ mzObject.name }}
        </option>
      </select>
      <b-modal
        id="nameModal"
        ref="nameModal"
        @ok="handleOk"
        @cancel="handleCancel"
        title="Rename m/z Value"
      >
        <template slot="default">
          m/z Value: {{ nameModalMz.mz }}
          <form ref="form" @submit.stop.prevent="handleOk(null)">
            <b-form-input
              v-model="nameModalMz.name"
              placeholder="Name"
              required
              maxlength="30"
              invalid-feedback="Name is required"
            ></b-form-input>
          </form>
        </template>
        <template slot="modal-footer" slot-scope="{ cancel, ok }">
          <b>Custom Footer</b>
          <b-button
            variant="outline-danger"
            @click="cancel()"
            v-if="nameModalMz.mz !== nameModalMz.name"
          >
            Reset
          </b-button>
          <b-button
            variant="success"
            @click="ok()"
            v-bind:disabled="nameModalMz.name.length === 0"
          >
            Save
          </b-button>
        </template>
      </b-modal>
    </div>
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
      nameModalMz: {},
    };
  },
  methods: {
    mzClicked: function() {
      // console.log(`Selected mz: ${this.selectedMz.join(', ')}`);
    },
    sortMZ: function() {
      if (this.asc) {
        this.currentMz = this.currentMz.sort((a, b) => a.mz - b.mz);
      } else {
        this.currentMz = this.currentMz.sort((a, b) => b.mz - a.mz);
      }
    },
    doubleClick: function(des) {
      this.nameModalMz = {
        mz: des.mz,
        name: des.name,
      };
      this.$refs['nameModal'].show();
    },
    handleOk: function(bvModalEvt) {
      bvModalEvt.preventDefault();
      if (!this.$refs.form.checkValidity()) {
        return;
      }
      const mz = this.nameModalMz.mz;
      const index = this.currentMz.findIndex(function(val) {
        return val.mz === mz;
      });
      console.log(this.currentMz[index][3]['hierarchy' + 3]);
      this.currentMz[index].name = this.nameModalMz.name;
      store.getters.getData.graph0.graph['hierarchy' + 3].nodes[
        this.currentMz[index][3]['hierarchy' + 3]
      ].name = this.nameModalMz.name;
      this.nameModalMz = {};
      this.$nextTick(() => {
        this.$refs['nameModal'].hide();
      });
    },
    handleCancel: function() {
      const mz = this.nameModalMz.mz;
      const index = this.currentMz.findIndex(function(val) {
        return val.mz === mz;
      });
      this.currentMz[index].name = this.nameModalMz.mz.toString();
      store.getters.getData.graph0.graph['hierarchy' + 3].nodes[
        this.currentMz[index][3]['hierarchy' + 3]
      ].name = this.nameModalMz.mz.toString();
      this.nameModalMz = {};
    },
    calculateCurrentMz: function() {
      if (!this.showAll) {
        if (this.notVisibleMz.length > 0) {
          this.currentMz.push(...this.notVisibleMz);
          this.notVisibleMz = [];
          this.sortMZ();
        }
      } else {
        for (let i = this.currentMz.length - 1; i >= 0; i--) {
          if (!this.currentMz[i].highlight) {
            this.notVisibleMz.push(this.currentMz[i]);
            this.currentMz.splice(i, 1);
          }
        }
      }
    },
  },
  created() {
    const numberOfLayers =
      Object.keys(store.getters.getData.graph0.graph).length - 1;
    const t = [];
    Object.keys(store.getters.getMzValues).forEach(function(mz) {
      t.push({
        highlight: Math.random() > 0.3,
        ...store.getters.getMzValues[mz],
        name:
          store.getters.getData.graph0.graph['hierarchy' + numberOfLayers]
            .nodes[
            store.getters.getMzValues[mz][numberOfLayers][
              'hierarchy' + numberOfLayers
            ]
          ].name,
        mz: mz,
      });
    });
    this.currentMz.push(...t);
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
