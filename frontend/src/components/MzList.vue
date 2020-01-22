<template>
  <SidebarWidget
    v-bind:side="side"
    v-bind:initial-expanded="initialExpanded"
    v-on:change-expand="transmitEvent($event)"
    title="m/z List"
  >
    <div slot="content">
      <div
        style="display: flex; flex-direction: row; justify-content: space-between; padding: 10px"
      >
        <div>
          <span
            class="text-primary clickable"
            v-on:click="toggleShowAll()"
            v-b-tooltip.hover.top="'Show all'"
          >
            <v-icon name="eye" v-if="showAll"></v-icon>
            <v-icon name="eye-slash" v-else class="inactive"></v-icon>
          </span>
          <span
            class="text-primary clickable"
            style="padding: 0 10px"
            v-on:click="toggleShowAnnotation"
            v-b-tooltip.hover.top="'Show Annotations'"
          >
            <v-icon
              name="sticky-note"
              v-bind:class="{ inactive: !showAnnotation }"
            ></v-icon>
          </span>
          <span
            v-if="queryActive"
            class="text-primary clickable"
            v-on:click="toggleShowRaw"
            v-b-tooltip.hover.top="'Show Raw Query Values'"
          >
            <v-icon name="microscope" v-bind:class="{ inactive: !showRaw }"></v-icon>
          </span>
        </div>
        <span
          v-on:click="toggleAsc()"
          class="clickable"
          v-b-tooltip.hover.top="'Sort'"
        >
          <v-icon
            v-bind:name="asc ? 'sort-amount-down' : 'sort-amount-up'"
          ></v-icon>
        </span>
      </div>
      <div style="display: flex; flex-direction: row-reverse">
        <select
          v-model="localSelectedMz"
          v-on:change="mzClicked"
          class="list"
          :class="{
            'full-width': !queryActive || !showRaw,
            'half-width': queryActive && showRaw,
          }"
          multiple
          :disabled="isMzLassoActive()"
        >
          <option
            v-for="mzObject in currentMz"
            v-bind:class="{ inactive: !mzObject.highlight }"
            v-bind:title="'mz: ' + mzObject.mz"
            v-bind:value="mzObject.mz"
            v-bind:key="mzObject.mz"
            v-on:dblclick="doubleClick(mzObject)"
          >
            {{
              showAnnotation && mzObject.annotation != null
                ? mzObject.annotation
                : mzObject.mz.toFixed(3)
            }}
          </option>
        </select>
        <select
          v-if="queryActive && showRaw"
          v-model="localSelectedMz"
          v-on:change="mzClicked"
          class="list half-width"
          multiple
          :disabled="isMzLassoActive()"
        >
          <option
            v-for="mzObject in currentMz"
            v-bind:class="{ inactive: !mzObject.highlight }"
            v-bind:title="'mz: ' + mzObject.mz"
            v-bind:value="mzObject.mz"
            v-bind:key="mzObject.mz"
            v-on:dblclick="doubleClick(mzObject)"
          >
            {{ mzObject.queryValue }}
          </option>
        </select>
      </div>
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
                  placeholder="Annotation"
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
            v-if="nameModalMz.resetable"
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
import * as d3 from 'd3';

export default {
  extends: SidebarWidget,
  components: {
    SidebarWidget,
  },
  name: 'MzList',
  data: function() {
    return {
      localSelectedMz: [],
      showRaw: false,
      nameModalMz: {
        name: '',
        mz: 0,
        resetable: false,
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
      graph: 'stateOptionsGraph',
      meta: 'meta',
      queryActive: 'getGraphQueryActive',
    }),
  },
  watch: {
    queryActive: function(newValue) {
      if (newValue && this.showRaw) {
        d3.select('#mzlist').style('min-width', 2 * 120 + 'px');
      } else {
        d3.select('#mzlist').style('min-width', 120 + 'px');
      }
    },
  },
  methods: {
    isMzLassoActive() {
      return store.getters.isMzLassoSelectionActive;
    },
    mzClicked: function() {
      if (this.localSelectedMz.length > 0) {
        store.dispatch('mzlistUpdatedMzs', this.localSelectedMz);
      }
    },
    transmitEvent(expanded) {
      this.$emit('change-expand', {
        expanded: expanded,
        expandBig: this.showRaw && this.queryActive,
      });
    },
    sortMZ: function() {
      store.commit('MZLIST_SORT_MZ');
    },
    toggleAsc: function() {
      store.commit('OPTIONS_MZLIST_TOOGLE_ASC');
      this.sortMZ();
    },
    toggleShowAll: function() {
      store.commit('OPTIONS_MZLIST_TOOGLE_SHOW_ALL');
      this.calculateCurrentMz();
    },
    toggleShowRaw: function() {
      this.showRaw = !this.showRaw;
      if (this.showRaw) {
        d3.select('#mzlist').style('min-width', 2 * 120 + 'px');
      } else {
        d3.select('#mzlist').style('min-width', 120 + 'px');
      }
    },
    toggleShowAnnotation: function() {
      store.commit('OPTIONS_MZLIST_TOOGLE_SHOW_ANNOTATION');
    },
    doubleClick: function(mzObject) {
      this.nameModalMz = {
        mz: mzObject.mz,
        name: mzObject.annotation != null ? mzObject.annotation : '',
        resetable: mzObject.annotation != null,
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
    handleSubmit: function() {
      if (!this.$refs.form.checkValidity()) {
        return;
      }
      const mz = this.nameModalMz.mz;
      const index = this.currentMz.findIndex(mzObject => mzObject.mz === mz);
      this.currentMz[index].annotation = this.nameModalMz.name;
      store.commit('MZLIST_UPDATE_NAME', {
        nodeKey: this.currentMz[index]['hierarchy' + this.meta.maxHierarchy],
        name: this.nameModalMz.name,
      });
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
      const index = this.currentMz.findIndex(val => val.mz === mz);
      this.currentMz[index].annotation = null;
      store.commit('MZLIST_UPDATE_NAME', {
        nodeKey: this.currentMz[index]['hierarchy' + this.meta.maxHierarchy],
        name: null,
      });
      setTimeout(() => {
        this.nameModalMz = {
          name: '',
          mz: 0,
        };
      }, 1000);
    },
    calculateCurrentMz: function() {
      store.commit('MZLIST_CALCULATE_VISIBLE_MZ');
    },
  },
};
</script>

<style scoped lang="scss">
.sidebar-widget {
  background: inherit;
  &.expanded {
    width: 120px !important;
    overflow: hidden !important;
  }
}

.inactive {
  color: darkgray;
}

.clickable {
  cursor: pointer;
}

.list {
  padding: 0;
  font-size: 0.9em;
  min-height: 92vh;
  text-align: center;
}

.full-width {
  width: 100%;
}

.half-width {
  width: 50%;
}

select {
  background-color: #4f5050;
  color: white;
  border: 1px solid #737374;
  margin: 0 0 5px 0;
}

#annotation-mz-value {
  float: left;
  padding-left: 13px !important;
}
</style>
