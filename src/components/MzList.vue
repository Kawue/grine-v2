<template>
  <SidebarWidget
    v-bind:side="side"
    v-bind:initial-expanded="initialExpanded"
    title="m/z List"
  >
    <div slot="content">
      <div style="padding: 4px 8px 0 8px;">
        <span
          style="float: left; color: #dc3b9e"
          v-on:click="
            toggleShowAll();
            calculateCurrentMz();
          "
          v-b-tooltip.hover.top="'Show all'"
        >
          <v-icon name="bong" v-bind:class="{ inactive: !showAll }"></v-icon>
        </span>
        <span
          style="float: left;margin-left: 15px; color: #dc3b9e"
          v-on:click="toggleShowAnnotation"
          v-b-tooltip.hover.top="'Show Annotations'"
        >
          <v-icon
            name="jedi"
            v-bind:class="{ inactive: !showAnnotation }"
          ></v-icon>
        </span>
        <span
          v-on:click="
            toggleAsc();
            sortMZ();
          "
          style="float: right; padding: 0"
          v-b-tooltip.hover.top="'Sort'"
        >
          <v-icon
            v-bind:name="asc ? 'sort-amount-down' : 'sort-amount-up'"
          ></v-icon>
        </span>
      </div>
      <div style="width: 100%; position: absolute; top: 20px; right: 0;">
        <div v-on:click="loadGraph(0)" style="display: inline-block">0</div>
        <div v-on:click="loadGraph(1)" style="display: inline-block">1</div>
        <div v-on:click="loadGraph(2)" style="display: inline-block">2</div>
      </div>

      <select
        v-model="localSelectedMz"
        v-on:click="mzClicked"
        class="list"
        multiple
      >
        <option
          v-for="mzObject in currentMz"
          v-bind:class="{ inactive: !mzObject.highlight }"
          v-bind:title="'mz: ' + mzObject.mz"
          v-bind:value="mzObject.mz"
          v-bind:key="mzObject.mz"
          v-on:dblclick="doubleClick(mzObject)"
        >
          {{ showAnnotation ? mzObject.name : mzObject.mz }}
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
          <b-row>
            <b-col sm="3" class="align-self-center">
              <p>m/z Value:</p>
            </b-col>
            <b-col sm="9">
              <p id="annotation-mz-value">{{ nameModalMz.mz }}</p>
            </b-col>
            <b-col sm="3" class="align-self-center">
              <label for="annotation-input">Annotation:</label>
            </b-col>
            <b-col sm="9">
              <b-form ref="form" @submit.stop.prevent="handleSubmit">
                <b-input
                  v-model="nameModalMz.name"
                  placeholder="Moin"
                  required
                  maxlength="30"
                  :state="nameModalMz.name.length > 0 ? null : false"
                  id="annotation-input"
                  trim
                  ref="annotationinput"
                ></b-input>
              </b-form>
            </b-col>
          </b-row>
          <b-row>
            <b-col offset-sm="3">
              <b-form-invalid-feedback
                :state="nameModalMz.name.length > 0 ? null : false"
              >
                The Annotation can't be empty
              </b-form-invalid-feedback>
            </b-col>
          </b-row>
        </template>
        <template
          slot="modal-footer"
          style="display: block !important;"
          slot-scope="{ cancel, ok }"
        >
          <b-button
            variant="outline-danger"
            @click="cancel()"
            v-bind:disabled="nameModalMz.mz === nameModalMz.name"
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
import { mapGetters } from 'vuex';

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
  },
  name: 'MzList',
  data: function() {
    return {
      localSelectedMz: [],
      nameModalMz: {
        name: '',
        mz: 0,
      },
    };
  },
  computed: {
    ...mapGetters({
      options: 'mzListOptions',
      currentMz: 'mzListOptionsVisibleMz',
      notVisibleMz: 'mzListOptionsNotVisibleMz',
      showAll: 'mzListOptionsShowAll',
      showAnnotation: 'mzListOptionsShowAnnotation',
      asc: 'mzListOptionsAsc',
      graph: 'mzListOptionsGraph',
    }),
  },
  methods: {
    mzClicked: function() {
      console.log(`Selected mz: ${this.localSelectedMz.join(', ')}`);
      store.commit('OPTIONS_MZLIST_UPDATE_SELECTED_MZ', this.localSelectedMz);
    },
    sortMZ: function() {
      store.commit('OPTIONS_MZLIST_SORT_MZ');
    },
    toggleAsc: function() {
      store.commit('OPTIONS_MZLIST_TOOGLE_ASC');
    },
    toggleShowAll: function() {
      store.commit('OPTIONS_MZLIST_TOOGLE_SHOW_ALL');
    },
    toggleShowAnnotation: function() {
      store.commit('OPTIONS_MZLIST_TOOGLE_SHOW_ANNOTATION');
    },
    doubleClick: function(mzObject) {
      this.nameModalMz = {
        mz: mzObject.mz,
        name: mzObject.name,
      };
      this.$refs['nameModal'].show();
      setTimeout(() => {
        this.$refs['annotationinput'].focus();
      }, 500);
    },
    handleOk: function(bvModalEvt) {
      bvModalEvt.preventDefault();
      this.handleSubmit();
    },
    loadGraph(graphNumber) {
      store.commit('OPTIONS_MZLIST_CHANGE_GRAPH', graphNumber);
      store.commit('OPTIONS_MZLIST_LOAD_GRAPH');
      store.commit('OPTIONS_MZLIST_CALCULATE_VISIBLE_MZ');
    },
    handleSubmit: function() {
      if (!this.$refs.form.checkValidity()) {
        return;
      }
      const mz = this.nameModalMz.mz;
      const index = this.currentMz.findIndex(function(val) {
        return val.mz === mz;
      });
      this.currentMz[index].name = this.nameModalMz.name;
      store.getters.getData['graph' + this.graph.toString()].graph[
        'hierarchy' + 3
      ].nodes[
        this.currentMz[index]['hierarchy' + 3]
      ].name = this.nameModalMz.name;
      this.$nextTick(() => {
        this.$refs['nameModal'].hide();
      });
      setTimeout(() => {
        this.nameModalMz = {
          name: '',
          mz: 0,
        };
      }, 1000);
    },
    handleCancel: function() {
      const mz = this.nameModalMz.mz;
      const index = this.currentMz.findIndex(function(val) {
        return val.mz === mz;
      });
      this.currentMz[index].name = this.nameModalMz.mz.toString();
      store.getters.getData['graph' + this.graph.toString()].graph[
        'hierarchy' + 3
      ].nodes[
        this.currentMz[index]['hierarchy' + 3]
      ].name = this.nameModalMz.mz.toString();
      setTimeout(() => {
        this.nameModalMz = {
          name: '',
          mz: 0,
        };
      }, 1000);
    },
    calculateCurrentMz: function() {
      store.commit('OPTIONS_MZLIST_CALCULATE_VISIBLE_MZ');
    },
  },
  created() {
    store.commit('OPTIONS_MZLIST_LOAD_GRAPH');
    store.commit('OPTIONS_MZLIST_CALCULATE_VISIBLE_MZ');
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

#annotation-mz-value {
  float: left;
  padding-left: 13px !important;
}
</style>
