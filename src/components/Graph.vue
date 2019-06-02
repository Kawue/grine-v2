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
    <button
      @click="printLinks"
      style="position: absolute; top: 20px; left: 800px;z-index: 10;"
    >
      Print Links
    </button>
    <ol
      multiple
      style="position: absolute; top: 10px;left: 100px;height: 80vh; overflow: auto; background: white; color: black; width: 150px; z-index: 10"
      start="0"
    >
      <li
        v-for="(link, index) of optionsV.series[0].links"
        class="text-center"
        v-bind:class="{ orga: index === selectIndex }"
      >
        {{ link.source }} -> {{ link.target }}
      </li>
    </ol>
    <v-chart
      :options="optionsV"
      style="width: 100vw; height: 100vh;"
      @click="onClick"
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
      selectIndex: null,
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
                source: 'n',
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
    onClick(event) {
      if (event.dataType === 'node' && event.value != null) {
        /*
        const nodeNames = this.communityNodes[event.value.self.toString()].map(
          item => item.name
        );

        this.optionsV.series[0].links = this.optionsV.series[0].links.filter(
          item =>
            !nodeNames.includes(item.target) && !nodeNames.includes(item.source)
        );
        */
        this.optionsV.series[0].data = this.optionsV.series[0].data.filter(
          item => item.value == null || item.value.self !== event.value.self
        );
        this.optionsV.series[0].data.push(
          ...this.communityNodes[event.value.relative.toString()]
        );
      } else if (event.dataType === 'edge') {
        console.log(event);
        console.log('Link Index', event.dataIndex);
        console.log(
          `Delete Link ${
            this.optionsV.series[0].links[event.dataIndex].source
          } -> ${this.optionsV.series[0].links[event.dataIndex].target}`
        );
        this.selectIndex = event.dataIndex;
        // this.optionsV.series[0].links.splice(event.dataIndex, 1);
      }
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
    printLinks: function() {
      for (let link of this.optionsV.series[0].links.sort(
        (a, b) => parseInt(a.source, 10) - parseInt(b.source, 10)
      )) {
        console.log(`${link.source} -> ${link.target}`);
      }
      console.log('Number of Links', this.optionsV.series[0].links.length);
      console.log('-------------------------------------------');
    },
    randCalc: function(old) {
      let numb = Math.round(Math.random() * 1000) % (this.counter - 1);
      console.log(old + ' -- ' + numb);
      return numb.toString();
    },
  },
  mounted() {
    console.log('App loaded');
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
</style>
