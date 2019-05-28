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
      style="position: absolute; top: 20px; left: 700px;z-index: 10;"
    >
      Add High Node
    </button>
    <v-chart
      :options="optionsV"
      :init-options="{ renderer: 'svg' }"
      style="width: 100vw; height: 100vh;"
    />
  </div>
</template>

<script>
export default {
  name: 'Graph',
  data: function() {
    return {
      counter: 6,
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
                name: '1',
                x: null,
                y: null,
                draggable: true,
              },
              {
                name: '2',
                x: null,
                y: null,
                draggable: true,
              },
              {
                name: '3',
                x: null,
                y: null,
                draggable: true,
              },
              {
                name: '4',
                x: null,
                y: null,
                draggable: true,
              },
              {
                name: '5',
                x: null,
                y: null,
                draggable: true,
              },
            ],
            // links: [],
            links: [
              {
                source: 0,
                target: 1,
                symbolSize: [5, 20],
                lineStyle: {
                  normal: {
                    width: 3,
                    curveness: 0.2,
                  },
                },
              },
              {
                source: '2',
                target: '5',
                lineStyle: {
                  normal: { curveness: 0.2 },
                },
              },
              {
                source: '1',
                target: '3',
              },
              {
                source: '2',
                target: '3',
              },
              {
                source: '1',
                target: '4',
              },
              {
                source: '4',
                target: '5',
              },
              {
                source: '3',
                target: '5',
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
        name: this.counter,
        x: null,
        y: null,
        draggable: true,
      });
      this.optionsV.series[0].links.push({
        source: this.counter.toString(),
        target:
          Math.round(Math.random() * 1000) % (this.counter - 1).toString(),
      });
      this.counter++;
    },
    addHighNode: function() {
      this.optionsV.series[0].data.push({
        name: this.counter,
        x: null,
        y: null,
        draggable: true,
      });
      this.optionsV.series[0].links.push({
        source: this.counter.toString(),
        target:
          Math.round(Math.random() * 1000) % (this.counter - 1).toString(),
      });
      this.optionsV.series[0].links.push({
        target: this.counter.toString(),
        source:
          Math.round(Math.random() * 1000) % (this.counter - 1).toString(),
      });
      this.counter++;
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
</style>
