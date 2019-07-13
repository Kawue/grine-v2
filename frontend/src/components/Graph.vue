<template>
  <div class="graph">
    <!-- Press Ctrl and click on node to expand community -->
    <!-- Press Ctrl+Alt and click node to shrink community -->
    <svg
      v-bind:width="this.width"
      v-bind:height="this.height"
      class="graphd3 links"
    ></svg>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import store from '@/store';
import * as d3 from 'd3';
import * as d3annotate from '../../node_modules/d3-svg-annotation';

export default {
  name: 'Graph',
  data: function() {
    return {
      height: window.innerHeight,
      width: window.innerWidth,
      flag: true,
      annotations: null,
    };
  },
  computed: {
    ...mapGetters({
      graph: 'getGraph',
      selMz: 'mzListOptionsSelectedMz',
      networkSvg: 'networkSVGElements',
      simulation: 'networkSimulation',
      links: 'networkEdges',
      nodes: 'networkNodes',
    }),
  },
  methods: {
    simulationUpdate: function() {
      this.networkSvg.linkElements
        .attr('x1', function(d) {
          return d.source.x;
        })
        .attr('y1', function(d) {
          return d.source.y;
        })
        .attr('x2', function(d) {
          return d.target.x;
        })
        .attr('y2', function(d) {
          return d.target.y;
        });

      this.networkSvg.nodeElements
        .attr('cx', function(d) {
          return d.x;
        })
        .attr('cy', function(d) {
          return d.y;
        });

      let selected = d3.select('.selected');

      if (!selected.empty()) {
        d3.select('.annotations').remove();
        let annotationText =
          'numMzs: ' +
          selected.data()[0].mzs.length +
          '\n' +
          'numChilds: ' +
          selected.data()[0].childs.length;
        const annotations = [
          {
            note: {
              label: annotationText,
              // create a newline whenever you read this symbol
              wrapSplitter: '\n',
            },
            subject: {
              radius: selected.data()[0].radius + 10,
            },
            x: selected.data()[0].x,
            y: selected.data()[0].y,
            dx: selected.data()[0].radius + 20,
            dy: selected.data()[0].radius + 20,
            color: 'teal',
            type: d3annotate.annotationCalloutCircle,
          },
        ];
        let makeAnnotations = d3annotate.annotation().annotations(annotations);

        d3.select('.annotation-group').call(makeAnnotations);
      }
    },
    dragstarted: function(d) {
      if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();

      d.fx = d3.event.x;
      d.fy = d3.event.y;
      this.networkSvg.linkElements
        .filter(function(l) {
          return l.source === d;
        })
        .attr('x1', d.x)
        .attr('y1', d.y);
      this.networkSvg.linkElements
        .filter(function(l) {
          return l.target === d;
        })
        .attr('x2', d.x)
        .attr('y2', d.y);
    },
    dragged: function(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
      this.networkSvg.linkElements
        .filter(function(l) {
          return l.source === d;
        })
        .attr('x1', d.x)
        .attr('y1', d.y);
      this.networkSvg.linkElements
        .filter(function(l) {
          return l.target === d;
        })
        .attr('x2', d.x)
        .attr('y2', d.y);
    },
    dragended: function(d) {
      if (!d3.event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    },
    zoomed: function() {
      this.networkSvg.svg.attr(
        'transform',
        'translate(' +
          d3.event.transform.x +
          ', ' +
          d3.event.transform.y +
          ') scale(' +
          d3.event.transform.k +
          ')'
      );
    },
    testClick: function(d) {
      for (let i = 0; i < this.nodes.length; i++) {
        this.nodes[i]['selected'] = false;
      }
      d.selected = true;
      this.networkSvg.nodeElements.style('fill', function(d) {
        return d.selected ? '#f00' : d.color;
      });
      this.simulationUpdate();
    },
  },
  mounted() {
    store.commit('NETWORK_LOAD_GRAPH');

    const lSvg = d3
      .select('.graphd3')
      .append('g')
      .attr('class', 'beepboop');

    const lLink = lSvg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.links)
      .enter()
      .append('line');

    const lNode = lSvg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.nodes)
      .enter()
      .append('circle')
      .attr('r', d => d.radius)
      .style('fill', d => d.color)
      .attr('numMz', d => d.mzs)
      .attr('childs', d => d.childs)
      .on('click', this.testClick)
      .on('mouseover', function() {
        // console.log('mouse over')
        d3.select(this)
          .attr('r', this['__data__'].radius + 5)
          .attr('class', 'selected');
        let annotationText =
          'numMzs: ' +
          this['__data__'].mzs.length +
          '\n' +
          'numChilds: ' +
          this['__data__'].childs.length;
        const annotations = [
          {
            note: {
              label: annotationText,
              // create a newline whenever you read this symbol
              wrapSplitter: '\n',
            },
            subject: {
              radius: this['__data__'].radius + 10,
            },
            x: this['__data__'].x,
            y: this['__data__'].y,
            dx: this['__data__'].radius + 20,
            dy: this['__data__'].radius + 20,
            color: 'teal',
            type: d3annotate.annotationCalloutCircle,
          },
        ];
        let makeAnnotations = d3annotate.annotation().annotations(annotations);

        d3.select('.beepboop')
          .append('g')
          .attr('class', 'annotation-group')
          .style('pointer-events', 'none')
          .call(makeAnnotations);
      })
      .on('mouseout', function() {
        // Add interactivity
        // console.log('mouse out')
        d3.select(this)
          .style('fill', d => (d.selected ? '#f00' : d.color))
          .attr('r', d => d.radius)
          .attr('class', '');
        d3.select('.annotation-group').remove();
        this.annotations = null;
      })
      .call(
        d3
          .drag()
          .on('start', this.dragstarted)
          .on('drag', this.dragged)
          .on('end', this.dragended)
      );

    store.commit('NETWORK_INIT_SVG', {
      svg: lSvg,
      nodeElements: lNode,
      linkElements: lLink,
    });

    const lSimulation = d3
      .forceSimulation(this.nodes)
      .force('charge', d3.forceManyBody().strength(-50))
      .force('link', d3.forceLink(this.links).id(l => l.name))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('forceCollide', d3.forceCollide().radius(d => d.radius))
      .on('tick', this.simulationUpdate);

    store.commit('NETWORK_SIMULATION_INIT', lSimulation);

    d3.select('.graphd3').call(
      d3
        .zoom()
        .scaleExtent([1 / 3, 8])
        .on('zoom', this.zoomed)
    );
    console.log('svg fertig');
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
  background-color: rgba(231, 231, 231, 0.51);
  z-index: 100;
  color: white;
}

.links {
  stroke: #999;
}
</style>
