import * as d3 from 'd3';
import * as d3annotate from '../../node_modules/d3-svg-annotation';
import store from '@/store';

class NetworkService {
  biggestNodeRadius = 25;
  smallestNodeRadius = 10;
  height = window.innerHeight;
  width = window.innerWidth;

  loadGraph(graph) {
    const tupel = [[], []];
    let counter = -1;
    const nodeKeys = Object.keys(graph['hierarchy0'].nodes);
    tupel[0].push(
      ...nodeKeys.map(nodeKey => {
        counter += 1;
        return {
          name: nodeKey.toString(),
          x: null,
          y: null,
          selected: false,
          radius: this.biggestNodeRadius,
          color: d3.interpolateRainbow(counter / nodeKeys.length),
          childs: graph['hierarchy0'].nodes[nodeKey].childs,
          mzs: graph['hierarchy0'].nodes[nodeKey].mzs,
          parentIntraCommunityNumbers: [],
        };
      })
    );
    tupel[1].push(
      ...Object.keys(graph['hierarchy0']['edges']).map(l => {
        return {
          source: tupel[0].find(d => {
            return d.name === graph['hierarchy0']['edges'][l].source;
          }),
          target: tupel[0].find(d => {
            return d.name === graph['hierarchy0']['edges'][l].target;
          }),
          weight: graph['hierarchy0'].edges[l]['weight'],
          name: graph['hierarchy0'].edges[l]['name'],
        };
      })
    );
    return tupel;
  }

  simulationUpdate() {
    store.getters.networkSVGElements.linkElements
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

    store.getters.networkSVGElements.nodeElements
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
  }

  dragstarted(d) {
    if (!d3.event.active)
      store.getters.networkSimulation.alphaTarget(0.3).restart();

    d.fx = d3.event.x;
    d.fy = d3.event.y;
    store.getters.networkSVGElements.linkElements
      .filter(function(l) {
        return l.source === d;
      })
      .attr('x1', d.x)
      .attr('y1', d.y);
    store.getters.networkSVGElements.linkElements
      .filter(function(l) {
        return l.target === d;
      })
      .attr('x2', d.x)
      .attr('y2', d.y);
  }

  dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    store.getters.networkSVGElements.linkElements
      .filter(function(l) {
        return l.source === d;
      })
      .attr('x1', d.x)
      .attr('y1', d.y);
    store.getters.networkSVGElements.linkElements
      .filter(function(l) {
        return l.target === d;
      })
      .attr('x2', d.x)
      .attr('y2', d.y);
  }

  dragended(d) {
    if (!d3.event.active) store.getters.networkSimulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  initSVG(nodes, edges) {
    d3.select('.beepboop').remove();

    const lSvg = d3
      .select('.graphd3')
      .append('g')
      .attr('class', 'beepboop');

    const lLink = lSvg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line');

    const lNode = lSvg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', d => d.radius)
      .style('fill', d => d.color)
      .attr('numMz', d => d.mzs)
      .attr('childs', d => d.childs)
      .on('click', this.nodeClick)
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
    return {
      svg: lSvg,
      nodeElements: lNode,
      linkElements: lLink,
    };
  }

  initSimulation(oldSimulation, nodes, edges) {
    if (oldSimulation != null) {
      oldSimulation.stop();
    }
    return d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-50))
      .force('link', d3.forceLink(edges).id(l => l.name))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('forceCollide', d3.forceCollide().radius(d => d.radius))
      .on('tick', this.simulationUpdate);
  }

  nodeClick(d) {
    if (d3.event.ctrlKey && d3.event.shiftKey) {
      console.log('Shrink');
    } else if (d3.event.ctrlKey) {
      console.log('Expand');
    } else {
      for (let i = 0; i < this.nodes.length; i++) {
        this.nodes[i]['selected'] = false;
      }
      d.selected = true;
      store.getters.networkSVGElements.nodeElements.style('fill', function(d) {
        return d.selected ? '#f00' : d.color;
      });
    }
  }

  shrinkNode(graph, oldNode) {
    /*
    const previousHierarchy =
      parseInt(oldNode.name.split('n')[0].slice(1), 10) - 1;
    const nextNodeName =
      'h' +
      previousHierarchy.toString() +
      'n' +
      oldNode.value.parent.toString();
    const nextNode = {
      name: nextNodeName,
      x: null,
      y: null,
      label: {
        formatter: function(params) {
          return params.data.value.intraCommunityNumber;
        },
      },
      symbolSize:
        this.biggestNodeRadius -
        (this.smallestNodeRadius / 3) * previousHierarchy,
      draggable: true,
      category: oldNode.category,
      value: {
        mzs: graph['hierarchy' + previousHierarchy].nodes[nextNodeName].mzs,
        childs:
          graph['hierarchy' + previousHierarchy].nodes[nextNodeName].childs,
      },
    };
    if (previousHierarchy > 0) {
      nextNode.value['parent'] =
        graph['hierarchy' + previousHierarchy].nodes[nextNodeName][
          'membership'
        ];
      nextNode.value[
        'intraCommunityNumber'
      ] = oldNode.value.parentIntraCommunityNumbers.pop();
      nextNode.value['parentIntraCommunityNumbers'] = [
        ...oldNode.value.parentIntraCommunityNumbers,
      ];
    } else {
      nextNode.value['parentIntraCommunityNumbers'] = [];
    }
    return nextNode;
     */
  }

  expandNode(graph, oldNode) {
    /*
    const nextHierarchy = parseInt(oldNode.name.split('n')[0].slice(1), 10) + 1;
    const nextNodes = [];
    let counter = 0;
    for (let child of oldNode.value.childs) {
      counter++;
      const nextNodeName =
        'h' + nextHierarchy.toString() + 'n' + child.toString();
      const nextNode = {
        name: nextNodeName,
        x: null,
        y: null,
        draggable: true,
        label: {
          formatter: function(params) {
            return params.data.value.intraCommunityNumber;
          },
        },
        itemStyle: oldNode.itemStyle,
        symbolSize:
          this.biggestNodeRadius -
          (this.smallestNodeRadius / 3) * nextHierarchy,
        category: oldNode.category,
        value: {
          mzs: graph['hierarchy' + nextHierarchy].nodes[nextNodeName].mzs,
          parent:
            graph['hierarchy' + nextHierarchy].nodes[nextNodeName][
              'membership'
            ],
          intraCommunityNumber: counter,
          parentIntraCommunityNumbers: [
            ...oldNode.value['parentIntraCommunityNumbers'],
          ],
        },
      };
      if (nextHierarchy < 3) {
        nextNode.value['childs'] =
          graph['hierarchy' + nextHierarchy].nodes[nextNodeName].childs;
      }
      if (nextHierarchy > 1) {
        nextNode.value['parentIntraCommunityNumbers'].push(
          oldNode.value.intraCommunityNumber
        );
      }
      nextNodes.push(nextNode);
    }
    return nextNodes;
     */
  }

  highlightNodesByMz(nodes, mzValuesStrings) {
    /*
    const mzValuesFloats = mzValuesStrings.map(mz => parseFloat(mz));
    const indices = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < mzValuesFloats.length; j++) {
        if (nodes[i].value.mzs.findIndex(mz => mz === mzValuesFloats[j]) > -1) {
          indices.push(i);
          mzValuesFloats.splice(j, 1);
          break;
        }
      }
    }
    return this.highlightNodes(nodes, indices);
     */
  }

  highlightNodes(nodes, indices) {
    /*
    const localNodes = [...nodes];
    for (const node of localNodes) {
      node.itemStyle = null;
    }
    if (indices.length > 0) {
      for (const index of [...new Set(indices)]) {
        localNodes[index].itemStyle = this.highlightedNodeStyle;
      }
    }
    return localNodes;

     */
  }
}
export default NetworkService;
