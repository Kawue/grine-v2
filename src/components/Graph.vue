<template>
  <div class="graph">
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
import { mapGetters } from 'vuex';

export default {
  name: 'Graph',
  data: function() {
    return {
      numHier: 3,
      counter: 12,
      ctrl: false,
      alt: false,
      selectIndex: null,
      trueIndex: null,
      optionsV: {
        title: {
          text: 'Graph Test',
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'graph',
            layout: 'force',
            roam: true,
            label: {
              normal: {
                show: false,
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
                name: 'Community 3',
              },
              {
                name: 'Community 4',
              },
              {
                name: 'Community 5',
              },
              {
                name: 'Community 6',
              },
              {
                name: 'Community 7',
              },
              {
                name: 'Community 8',
              },
              {
                name: 'Community 9',
              },
              {
                name: 'Community 10',
              },
              {
                name: 'Community 11',
              },
              {
                name: 'Community 12',
              },
            ],
            edgeSymbolSize: [4, 10],
            force: {
              repulsion: 1000,
            },
            data: [],
            // links: [],
            links: [],
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
  computed: {
    ...mapGetters({
      graph: 'getGraph',
    }),
  },
  methods: {
    onClickGraph(event) {
      if (event.dataType === 'node' && event.value != null) {
        // Expand community
        const hierarchy = parseInt(event.data.name.split('n')[0].slice(1), 10);
        if (this.ctrl && !this.alt) {
          const nextHierarchy = hierarchy + 1;
          if (hierarchy < this.numHier) {
            this.optionsV.series[0].data.splice(event.dataIndex, 1);
            for (let child of event.value.childs) {
              const nextNodeName =
                'h' + nextHierarchy.toString() + 'n' + child.toString();
              const nextNode = {
                name: nextNodeName,
                x: null,
                y: null,
                draggable: true,
                label: {
                  formatter: function(params) {
                    return params.data.category.toString();
                  },
                },
                symbolSize: 50 - (30 / this.numHier) * nextHierarchy,
                category: event.data.category,
                value: {
                  mzs: this.graph['hierarchy' + nextHierarchy].nodes[
                    nextNodeName
                  ].mzs,
                  parent: this.graph['hierarchy' + nextHierarchy].nodes[
                    nextNodeName
                  ]['membership'],
                },
              };
              if (nextHierarchy < this.numHier) {
                nextNode.value['childs'] = this.graph[
                  'hierarchy' + nextHierarchy
                ].nodes[nextNodeName].childs;
              }
              this.optionsV.series[0].data.push(nextNode);
            }
          }
        } // shrink community
        else if (this.alt && this.ctrl) {
          if (hierarchy > 0) {
            const previousHierarchy = hierarchy - 1;

            this.optionsV.series[0].data = this.optionsV.series[0].data.filter(
              item => item.value.parent !== event.value.parent
            );
            const nextNodeName =
              'h' +
              previousHierarchy.toString() +
              'n' +
              event.value.parent.toString();
            const nextNode = {
              name: nextNodeName,
              x: null,
              y: null,
              label: {
                formatter: function(params) {
                  return params.data.category.toString();
                },
              },
              symbolSize: 50 - (30 / this.numHier) * previousHierarchy,
              draggable: true,
              category: event.data.category,
              value: {
                mzs: this.graph['hierarchy' + previousHierarchy].nodes[
                  nextNodeName
                ].mzs,
                childs: this.graph['hierarchy' + previousHierarchy].nodes[
                  nextNodeName
                ].childs,
              },
            };
            if (previousHierarchy > 0) {
              nextNode.value['parent'] = this.graph[
                'hierarchy' + previousHierarchy
              ].nodes[nextNodeName]['membership'];
            }
            this.optionsV.series[0].data.push(nextNode);
          }
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
        // this.optionsV.series[0].links.splice(this.trueIndex, 1);
      }
    },
    getEdgeIndex: function(source, target) {
      return this.optionsV.series[0].links.findIndex(link => {
        return link.source === source && link.target === target;
      });
    },
    keyDownHandler: function(event) {
      switch (event.which) {
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
      switch (event.which) {
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
    const n = [];
    const nodeNames = Object.keys(this.graph['hierarchy0'].nodes);
    nodeNames.forEach(nodeKey => {
      n.push({
        name: nodeKey.toString(),
        x: null,
        y: null,
        draggable: true,
        symbolSize: 50,
        label: {
          formatter: function(params) {
            return params.data.category.toString();
          },
        },
        category: parseInt(nodeKey.toString().split('n')[1], 10),
        value: {
          childs: this.graph['hierarchy0'].nodes[nodeKey].childs,
          mzs: this.graph['hierarchy0'].nodes[nodeKey].mzs,
        },
      });
    });
    this.optionsV.series[0].data = [...n];
    const e = [];
    Object.keys(this.graph).forEach(hierarchy => {
      Object.keys(this.graph[hierarchy]['edges']).forEach(edgeKey => {
        e.push({
          source: this.graph[hierarchy].edges[edgeKey]['source'],
          target: this.graph[hierarchy].edges[edgeKey]['target'],
          value: this.graph[hierarchy].edges[edgeKey]['weight'],
        });
      });
    });
    this.optionsV.series[0].links = [...e];
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
