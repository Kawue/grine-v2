<template>
  <div class="graph">
    <button
      @click="addLowNode"
      style="position: absolute; top: 20px; left: 400px;z-index: 10;"
    >
      Add Low Node
    </button>
    <button
      @click="addHighNode"
      style="position: absolute; top: 20px; left: 600px;z-index: 10;"
    >
      Add High Node
    </button>
    <ol
      multiple
      style="position: absolute; top: 10px;left: 100px;height: 80vh; overflow: auto; background: white; color: black; width: 150px; z-index: 10"
      start="0"
    >
      <li
        v-for="(link, index) of optionsV.series[0].links"
        class="text-center"
        v-bind:class="{
          orga: index === selectIndex,
          brog: index === trueIndex,
        }"
      >
        {{ link.source }} -> {{ link.target }}
      </li>
    </ol>
    <!-- Press Ctrl and click on node to expand community -->
    <!-- Press Ctrl+Alt and click node to shrink community -->
    <v-chart
      :options="optionsV"
      style="width: 100vw; height: 100vh;"
      @click="onClickGraph"
    />
    <!-- :init-options="{ renderer: 'svg' }" -->
  </div>
</template>

<script>
export default {
  name: 'Graph',
  data: function() {
    return {
      counter: 12,
      ctrl: false,
      alt: false,
      selectIndex: null,
      trueIndex: null,
      communityNodes: {
        c0: [
          {
            name: 'n1',
            x: null,
            y: null,
            draggable: true,
            category: 0,
            value: {
              self: 'c0',
              relative: 'h0',
            },
          },
        ],
        c1: [
          {
            name: 'n3',
            x: null,
            y: null,
            draggable: true,
            category: 1,
            value: {
              self: 'c1',
              relative: 'h1',
            },
          },
        ],
        h0: [
          {
            name: 'n6',
            x: null,
            y: null,
            draggable: true,
            category: 0,
            value: {
              self: 'h0',
              relative: 'c0',
            },
          },
          {
            name: 'n7',
            x: null,
            y: null,
            draggable: true,
            category: 0,
            value: {
              self: 'h0',
              relative: 'c0',
            },
          },
          {
            name: 'n8',
            x: null,
            y: null,
            draggable: true,
            category: 0,
            value: {
              self: 'h0',
              relative: 'c0',
            },
          },
        ],
        h1: [
          {
            name: 'n9',
            x: null,
            y: null,
            draggable: true,
            category: 1,
            value: {
              self: 'h1',
              relative: 'c1',
            },
          },
          {
            name: 'n10',
            x: null,
            y: null,
            draggable: true,
            category: 1,
            value: {
              self: 'h1',
              relative: 'c1',
            },
          },
          {
            name: 'n11',
            x: null,
            y: null,
            draggable: true,
            category: 1,
            value: {
              self: 'h1',
              relative: 'c1',
            },
          },
        ],
      },
      optionsV: {
        title: {
          text: 'Graph Test',
        },
        tooltip: {},
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'graph',
            symbolSize: 50,
            layout: 'force',
            roam: true,
            label: {
              normal: {
                show: true,
              },
            },
            categories: [
              {
                name: 'Community 1',
              },
              {
                name: 'Community 2',
              },
              {
                name: 'Others',
              },
            ],
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 10],
            force: {
              repulsion: 1000,
            },
            edgeLabel: {
              normal: {
                textStyle: {
                  fontSize: 20,
                },
              },
            },
            data: [
              {
                name: 'n1',
                x: null,
                y: null,
                draggable: true,
                category: 0,
                value: {
                  self: 'c0',
                  relative: 'h0',
                },
              },
              {
                name: 'n2',
                x: null,
                y: null,
                draggable: true,
                category: 2,
              },
              {
                name: 'n3',
                x: null,
                y: null,
                draggable: true,
                category: 1,
                value: {
                  self: 'c1',
                  relative: 'h1',
                },
              },
              {
                name: 'n4',
                x: null,
                y: null,
                draggable: true,
                category: 2,
              },
              {
                name: 'n5',
                x: null,
                y: null,
                draggable: true,
                category: 2,
              },
            ],
            // links: [],
            links: [
              {
                source: 'n1',
                target: 'n2',
                symbolSize: [5, 20],
                lineStyle: {
                  normal: {
                    width: 3,
                    curveness: 0.2,
                  },
                },
              },
              {
                source: 'n8',
                target: 'n5',
                lineStyle: {
                  normal: { curveness: 0.2 },
                },
              },
              {
                source: 'n1',
                target: 'n3',
              },
              {
                source: 'n2',
                target: 'n3',
              },
              {
                source: 'n1',
                target: 'n4',
              },
              {
                source: 'n4',
                target: 'n5',
              },
              {
                source: 'n5',
                target: 'n2',
              },
              {
                source: 'n9',
                target: 'n10',
              },
              {
                source: 'n10',
                target: 'n11',
              },
              {
                source: 'n11',
                target: 'n9',
              },
            ],
            lineStyle: {
              normal: {
                opacity: 0.9,
                width: 2,
                curveness: 0,
              },
            },
          },
        ],
      },
    };
  },
  methods: {
    addLowNode: function() {
      this.optionsV.series[0].data.push({
        name: 'n' + this.counter.toString(),
        x: null,
        y: null,
        draggable: true,
        category: 2,
      });
      this.optionsV.series[0].links.push({
        source: 'n' + this.counter.toString(),
        target: 'n' + this.randCalc(this.counter.toString()),
      });
      this.counter++;
    },
    onClickGraph(event) {
      if (event.dataType === 'node' && event.value != null) {
        // Expand community
        if (this.ctrl && !this.alt && event.value.self.startsWith('c')) {
          this.optionsV.series[0].data = this.optionsV.series[0].data.filter(
            item => item.value == null || item.value.self !== event.value.self
          );
          this.optionsV.series[0].data.push(
            ...this.communityNodes[event.value.relative.toString()]
          );
        } // shrink community
        else if (this.alt && this.ctrl && event.value.self.startsWith('h')) {
          this.optionsV.series[0].data = this.optionsV.series[0].data.filter(
            item => item.value == null || item.value.self !== event.value.self
          );
          this.optionsV.series[0].data.push(
            ...this.communityNodes[event.value.relative.toString()]
          );
        }
      } else if (event.dataType === 'edge') {
        this.selectIndex = event.dataIndex;
        this.trueIndex = this.getEdgeIndex(
          event.data.source,
          event.data.target
        );
        console.log(
          `Delete Link ${
            this.optionsV.series[0].links[this.trueIndex].source
          } -> ${this.optionsV.series[0].links[this.trueIndex].target}`
        );
        /*
        this.optionsV.series[0].links.splice(
          this.optionsV.series[0].links.findIndex(link => {
            return (
              link.source === event.data.source &&
              link.target === event.data.target
            );
          }),
          1
        );*/
      }
    },
    getEdgeIndex: function(source, target) {
      return this.optionsV.series[0].links.findIndex(link => {
        return link.source === source && link.target === target;
      });
    },
    addHighNode: function() {
      this.optionsV.series[0].data.push({
        name: 'n' + this.counter.toString(),
        x: null,
        y: null,
        draggable: true,
        category: 2,
      });
      this.optionsV.series[0].links.push({
        source: 'n' + this.counter.toString(),
        target: 'n' + this.randCalc(this.counter.toString()),
      });
      this.optionsV.series[0].links.push({
        target: 'n' + this.counter.toString(),
        source: 'n' + this.randCalc(this.counter.toString()),
      });
      this.counter++;
    },
    randCalc: function(old) {
      let numb = Math.round(Math.random() * 1000) % (this.counter - 1);
      return numb.toString();
    },
    keyDownHandler: function(event) {
      switch(event.which) {
        case 17:
          this.ctrl = true;
          break;
        case 18:
          this.alt = true;
          break;
        default:
      }
    },
    keyUpHandler: function(event) {
      switch(event.which) {
        case 17:
          this.ctrl = false;
          break;
        case 18:
          this.alt = false;
          break;
        default:
      }
    },
  },
  created() {
    window.addEventListener('keyup', this.keyUpHandler);
    window.addEventListener('keydown', this.keyDownHandler);
  },
};
</script>

<style scoped lang="scss">
.graph {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: lightblue;
  z-index: 100;
  color: white;
}

.orga {
  color: #dc8534;
}

.brog {
  border: 1px solid black;
}
</style>
