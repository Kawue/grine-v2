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
          radius:
            graph['hierarchy0'].nodes[nodeKey].mzs.length > 1
              ? this.biggestNodeRadius
              : this.smallestNodeRadius,
          color: d3.interpolateRainbow(counter / nodeKeys.length),
          childs: graph['hierarchy0'].nodes[nodeKey].childs,
          mzs: graph['hierarchy0'].nodes[nodeKey].mzs,
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
      .attr('x', function(d) {
        return d.x - d.radius;
      })
      .attr('y', function(d) {
        return d.y - d.radius;
      });

    let selected = d3.select('.selected');

    if (!selected.empty()) {
      d3.select('.annotations').remove();
      let annotationText = '';
      if (
        selected.data()[0].childs != null &&
        selected.data()[0].mzs.length > 1
      ) {
        annotationText =
          'numMzs: ' +
          selected.data()[0].mzs.length +
          '\n' +
          'numChilds: ' +
          selected.data()[0].childs.length;
      } else {
        annotationText = 'mz Value: ' + selected.data()[0].mzs[0];
      }
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

  mouseOver(d) {
    d3.select('#' + d.name)
      .attr('r', d.radius + 5)
      .attr('class', 'selected');
    let annotationText = '';
    if (d.childs != null && d.mzs.length > 1) {
      annotationText =
        'numMzs: ' + d.mzs.length + '\n' + 'numChilds: ' + d.childs.length;
    } else {
      annotationText = 'mz Value: ' + d.mzs[0];
    }

    const annotations = [
      {
        note: {
          label: annotationText,
          // create a newline whenever you read this symbol
          wrapSplitter: '\n',
        },
        subject: {
          radius: d.radius + 10,
        },
        x: d.x,
        y: d.y,
        dx: d.radius + 20,
        dy: d.radius + 20,
        color: 'teal',
        type: d3annotate.annotationCalloutCircle,
      },
    ];
    let makeAnnotations = d3annotate.annotation().annotations(annotations);
    d3.select('#graph-container')
      .append('g')
      .attr('class', 'annotation-group')
      .style('pointer-events', 'none')
      .call(makeAnnotations);
  }

  mouseOut(d) {
    d3.select('#' + d.name)
      .style('fill', n => n.color)
      .attr('r', n => n.radius)
      .attr('class', 'node');
    d3.selectAll('.annotation-group').remove();
    d.annotations = null;
  }

  initSVG(nodes, edges) {
    d3.select('#graph-container').remove();

    const lSvg = d3
      .select('.graphd3')
      .append('g')
      .attr('id', 'graph-container');

    const lLink = lSvg
      .append('g')
      .attr('id', 'link-container')
      .selectAll('line')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('id', l => l.name);

    const lNode = lSvg
      .append('g')
      .attr('id', 'node-container')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('rect')
      .attr('class', 'node')
      .attr('rx', d => d.radius)
      .attr('id', d => d.name)
      .attr('ry', d => d.radius)
      .attr('width', d => 2 * d.radius)
      .attr('height', d => 2 * d.radius)
      .style('fill', d => d.color)
      .attr('numMz', d => d.mzs)
      .attr('childs', d => d.childs)
      .on('click', this.nodeClick)
      .on('mouseover', this.mouseOver)
      .on('mouseout', this.mouseOut)
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

  updateSimulationParameters(simulation, parameters) {
    simulation.force('charge').strength(parameters.repulsion);
    simulation.force('link').distance(parameters.edgeLength);
    simulation
      .alphaDecay(1 - Math.pow(0.001, 1 / parameters.iterations))
      .alpha(0.5)
      .alphaTarget(0)
      .restart();
  }

  initSimulation(oldSimulation, nodes, edges, parameters) {
    if (oldSimulation != null) {
      oldSimulation.stop();
    }
    return d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(parameters.repulsion))
      .force(
        'link',
        d3
          .forceLink(edges)
          .id(l => l.name)
          .distance(parameters.edgeLength)
      )
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('forceCollide', d3.forceCollide().radius(d => d.radius))
      .alphaDecay(1 - Math.pow(0.001, 1 / parameters.iterations))
      .alpha(1)
      .on('tick', this.simulationUpdate);
  }

  nodeClick(n) {
    if ((d3.event.ctrlKey || d3.event.metaKey) && d3.event.shiftKey) {
      store.commit('NETWORK_SHRINK_NODE', n);
    } else if (d3.event.ctrlKey || d3.event.metaKey) {
      store.commit('NETWORK_EXPAND_NODE', n);
    } else {
      for (let i = 0; i < store.getters.networkNodes.length; i++) {
        if (store.getters.networkNodes[i].name === n.name) {
          if (!n.selected) {
            n.selected = true;
            store.commit('MZLIST_UPDATE_HIGHLIGHTED_MZ', n.mzs);
            d3.select('#' + n.name)
              .transition()
              .duration(250)
              .attr('rx', 0)
              .attrTween('transform', function() {
                return d3.interpolateString(
                  'rotate(0 ' + n.x + ' ' + n.y + ')',
                  'rotate(90 ' + n.x + ' ' + n.y + ')'
                );
              })
              .attr('ry', 0)
              .on('end', function() {
                d3.select(this).attr('transform', null);
              });
          }
        } else {
          if (store.getters.networkNodes[i]['selected']) {
            store.getters.networkNodes[i]['selected'] = false;
            d3.select('#' + store.getters.networkNodes[i].name)
              .transition()
              .duration(250)
              .attr('rx', store.getters.networkNodes[i].radius)
              .attr('ry', store.getters.networkNodes[i].radius)
              .attrTween('transform', function() {
                return d3.interpolateString(
                  'rotate(0 ' +
                    store.getters.networkNodes[i].x +
                    ' ' +
                    store.getters.networkNodes[i].y +
                    ')',
                  'rotate(-90 ' +
                    store.getters.networkNodes[i].x +
                    ' ' +
                    store.getters.networkNodes[i].y +
                    ')'
                );
              })
              .on('end', function() {
                d3.select(this).attr('transform', null);
              });
          }
        }
      }
    }
  }

  shrinkNode(graph, oldNode, nodes, edges) {
    d3.select('.annotation-group').remove();
    const previousHierarchy =
      parseInt(oldNode.name.split('n')[0].slice(1), 10) - 1;
    const nextNodeName =
      'h' + previousHierarchy.toString() + 'n' + oldNode.parent.toString();
    const maxH = store.getters.meta.maxHierarchy;
    const nextNode = {
      name: nextNodeName,
      x: oldNode.x,
      y: oldNode.y,
      selected: false,
      radius:
        this.biggestNodeRadius -
        (this.smallestNodeRadius / maxH) * previousHierarchy,
      color: oldNode.color,
      mzs: graph['hierarchy' + previousHierarchy].nodes[nextNodeName].mzs,
      childs: graph['hierarchy' + previousHierarchy].nodes[nextNodeName].childs,
    };
    if (previousHierarchy > 0) {
      nextNode['parent'] =
        graph['hierarchy' + previousHierarchy].nodes[nextNodeName][
          'membership'
        ];
    }
    let selectNextNode = false;
    const nodesToRemove = [];

    // remove all removable nodes from datastructure and svg
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].color === oldNode.color) {
        const nodeHierarchy = parseInt(
          nodes[i].name.split('n')[0].slice(1),
          10
        );
        if (nodeHierarchy > previousHierarchy) {
          nodesToRemove.push(nodes[i].name);
          selectNextNode = selectNextNode || nodes[i].selected;
          d3.select('#' + nodes[i].name).remove();
          nodes.splice(i, 1);
        }
      }
    }
    nextNode.selected = selectNextNode;
    nodes.push(nextNode);

    // remove old edges from datastructure and svg
    for (let i = edges.length - 1; i >= 0; i--) {
      if (
        nodesToRemove.findIndex(n => n === edges[i].source.name) >= 0 ||
        nodesToRemove.findIndex(n => n === edges[i].target.name) >= 0
      ) {
        d3.select('#' + edges[i].name).remove();
        edges.splice(i, 1);
      }
    }

    // add new edges to datastructure
    const newEdges = [];
    Object.keys(graph['hierarchy' + previousHierarchy]['edges']).forEach(l => {
      const sourceIndex = nodes.findIndex(d => {
        return (
          d.name === graph['hierarchy' + previousHierarchy]['edges'][l].source
        );
      });
      if (sourceIndex >= 0) {
        const targetIndex = nodes.findIndex(d => {
          return (
            d.name === graph['hierarchy' + previousHierarchy]['edges'][l].target
          );
        });
        if (targetIndex >= 0) {
          newEdges.push({
            source: nodes[sourceIndex],
            target: nodes[targetIndex],
            weight: graph['hierarchy' + previousHierarchy].edges[l]['weight'],
            name: graph['hierarchy' + previousHierarchy].edges[l]['name'],
          });
        }
      }
    });
    edges.push(...newEdges);

    // add new edges to svg
    d3.select('#link-container')
      .selectAll('newEdges')
      .data(newEdges)
      .enter()
      .append('line')
      .attr('class', 'edge')
      .attr('id', l => l.name);
    store.getters.networkSVGElements.linkElements = d3
      .select('#link-container')
      .selectAll('line');

    // add new node to svg
    d3.select('#node-container')
      .selectAll('newNodes')
      .data([nextNode])
      .enter()
      .append('rect')
      .attr('class', 'node')
      .attr('rx', nextNode.selected ? 0 : nextNode.radius)
      .attr('id', nextNode.name)
      .attr('ry', nextNode.selected ? 0 : nextNode.radius)
      .attr('width', 2 * nextNode.radius)
      .attr('height', 2 * nextNode.radius)
      .style('fill', nextNode.color)
      .attr('numMz', nextNode.mzs)
      .attr('childs', nextNode.childs)
      .on('click', this.nodeClick)
      .on('mouseover', this.mouseOver)
      .on('mouseout', this.mouseOut)
      .call(
        d3
          .drag()
          .on('start', this.dragstarted)
          .on('drag', this.dragged)
          .on('end', this.dragended)
      );
    store.getters.networkSVGElements.nodeElements = d3
      .select('#node-container')
      .selectAll('rect');
  }

  expandNode(graph, oldNode, nodes, edges) {
    const index = nodes.findIndex(d => d.name === oldNode.name);

    // remove old node from datastructure and svg
    nodes.splice(index, 1);
    d3.select('.annotation-group').remove();
    d3.select('#' + oldNode.name).remove();
    const newNodes = [];
    const nextHierarchy = parseInt(oldNode.name.split('n')[0].slice(1), 10) + 1;
    const maxH = store.getters.meta.maxHierarchy;

    // add nodes to datastructure
    for (let child of oldNode.childs) {
      const nextNodeName =
        'h' + nextHierarchy.toString() + 'n' + child.toString();
      const nextNode = {
        name: nextNodeName,
        x: oldNode.x + Math.random() * 10,
        y: oldNode.y + Math.random() * 10,
        selected: oldNode.selected,
        radius:
          graph['hierarchy' + nextHierarchy].nodes[nextNodeName].mzs.length > 1
            ? this.biggestNodeRadius -
              (this.smallestNodeRadius / maxH) * nextHierarchy
            : this.smallestNodeRadius,
        color: oldNode.color,
        mzs: graph['hierarchy' + nextHierarchy].nodes[nextNodeName].mzs,
        parent:
          graph['hierarchy' + nextHierarchy].nodes[nextNodeName].membership,
      };
      if (nextHierarchy < maxH) {
        nextNode['childs'] =
          graph['hierarchy' + nextHierarchy].nodes[nextNodeName].childs;
      }
      newNodes.push(nextNode);
    }

    // add new nodes to datastructure
    nodes.push(...newNodes);

    // remove old edges from datastructure and svg
    for (let i = edges.length - 1; i >= 0; i--) {
      if (
        edges[i].source.name === oldNode.name ||
        edges[i].target.name === oldNode.name
      ) {
        d3.select('#' + edges[i].name).remove();
        edges.splice(i, 1);
      }
    }

    // add new edges to datastructure
    const newEdges = [];
    Object.keys(graph['hierarchy' + nextHierarchy]['edges']).forEach(l => {
      const sourceIndex = nodes.findIndex(d => {
        return d.name === graph['hierarchy' + nextHierarchy]['edges'][l].source;
      });
      if (sourceIndex >= 0) {
        const targetIndex = nodes.findIndex(d => {
          return (
            d.name === graph['hierarchy' + nextHierarchy]['edges'][l].target
          );
        });
        if (targetIndex >= 0) {
          newEdges.push({
            source: nodes[sourceIndex],
            target: nodes[targetIndex],
            weight: graph['hierarchy' + nextHierarchy].edges[l]['weight'],
            name: graph['hierarchy' + nextHierarchy].edges[l]['name'],
          });
        }
      }
    });
    edges.push(...newEdges);

    // add new edges to svg
    d3.select('#link-container')
      .selectAll('newEdges')
      .attr('class', 'edge')
      .data(newEdges)
      .enter()
      .append('line')
      .attr('id', l => l.name);
    store.getters.networkSVGElements.linkElements = d3
      .select('#link-container')
      .selectAll('line');
    // add new nodes to svg
    d3.select('#node-container')
      .selectAll('newNodes')
      .data(newNodes)
      .enter()
      .append('rect')
      .attr('class', 'node')
      .attr('rx', d => (d.selected ? 0 : d.radius))
      .attr('id', d => d.name)
      .attr('ry', d => (d.selected ? 0 : d.radius))
      .attr('width', d => 2 * d.radius)
      .attr('height', d => 2 * d.radius)
      .style('fill', d => d.color)
      .attr('numMz', d => d.mzs)
      .attr('childs', d => d.childs)
      .on('click', this.nodeClick)
      .on('mouseover', this.mouseOver)
      .on('mouseout', this.mouseOut)
      .call(
        d3
          .drag()
          .on('start', this.dragstarted)
          .on('drag', this.dragged)
          .on('end', this.dragended)
      );
    store.getters.networkSVGElements.nodeElements = d3
      .select('#node-container')
      .selectAll('rect');
  }

  highlightNodesByName(nodes, nodeNames) {
    this.clearHighlight(nodes);
    for (let i = 0; i < nodes.length; i++) {
      if (nodeNames.indexOf(nodes[i].name) !== -1) {
        this.highlightNode(nodes[i]);
      }
    }
  }

  highlightNodesByMz(nodes, mzValuesStrings) {
    const mzValuesFloats = mzValuesStrings.map(mz => parseFloat(mz));
    for (let i = 0; i < nodes.length; i++) {
      let hit = false;
      for (let j = 0; j < mzValuesFloats.length; j++) {
        if (nodes[i].mzs.findIndex(mz => mz === mzValuesFloats[j]) > -1) {
          hit = true;
          mzValuesFloats.splice(j, 1);
          break;
        }
      }
      if (hit) {
        this.highlightNode(nodes[i]);
      } else {
        if (nodes[i].selected) {
          nodes[i].selected = false;
          d3.select('#' + nodes[i].name)
            .transition()
            .duration(500)
            .attr('rx', nodes[i].radius)
            .attr('ry', nodes[i].radius)
            .attrTween('transform', function() {
              return d3.interpolateString(
                'rotate(0 ' + nodes[i].x + ' ' + nodes[i].y + ')',
                'rotate(-90 ' + nodes[i].x + ' ' + nodes[i].y + ')'
              );
            })
            .on('end', function() {
              d3.select(this).attr('transform', null);
            });
        }
      }
    }
  }

  highlightNode(node) {
    if (!node.selected) {
      node.selected = true;
      const selection = d3.select('#' + node.name);
      selection
        .transition()
        .duration(250)
        .attr('rx', node.radius * 0.5)
        .attr('ry', node.radius * 0.5)
        .attrTween('transform', function() {
          return function(t) {
            /*
              interpolate linear between two values
              t between 0 and 1
              startValue + (endValue - startValue) * t
              scaling factor k and rotation angle beta
              k: 1 to 1.5
              beta: 0° to 90°
             */
            const kTimesCosBeta = (1 + 0.5 * t) * Math.cos(Math.PI * t * 0.5);
            const kTimesSinBeta = (1 + 0.5 * t) * Math.sin(Math.PI * t * 0.5);
            return (
              'matrix(' +
              kTimesCosBeta +
              ' ' +
              kTimesSinBeta +
              ' ' +
              -kTimesSinBeta +
              ' ' +
              kTimesCosBeta +
              ' ' +
              (-node.x * kTimesCosBeta +
                node.y * kTimesSinBeta +
                node.x) +
              ' ' +
              (-node.x * kTimesSinBeta -
                node.y * kTimesCosBeta +
                node.y) +
              ')'
            );
          };
        });

      selection
        .transition()
        .duration(250)
        .delay(250)
        .attr('rx', 0)
        .attr('ry', 0)
        .ease(function(t) {
          // inverse of cubic easing
          return Math.pow(t, 1 / 3);
        })
        .attrTween('transform', function() {
          return function(t) {
            /*
              interpolate linear between two values
              t between 0 and 1
              startValue + (endValue - startValue) * t
              scaling factor k and rotation angle beta
              k: 1.5 to 1
              beta: 90° to 180°
             */
            const kTimesCosBeta =
              (1.5 - 0.5 * t) * Math.cos(Math.PI * 0.5 * (1 + t));
            const kTimesSinBeta =
              (1.5 - 0.5 * t) * Math.sin(Math.PI * 0.5 * (1 + t));
            return (
              'matrix(' +
              kTimesCosBeta +
              ' ' +
              kTimesSinBeta +
              ' ' +
              -kTimesSinBeta +
              ' ' +
              kTimesCosBeta +
              ' ' +
              (-node.x * kTimesCosBeta +
                node.y * kTimesSinBeta +
                node.x) +
              ' ' +
              (-node.x * kTimesSinBeta -
                node.y * kTimesCosBeta +
                node.y) +
              ')'
            );
          };
        })
        .on('end', function() {
          d3.select(this).attr('transform', null);
        });
    }
  }

  clearHighlight(nodes) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].selected) {
        nodes[i].selected = false;
        d3.select('#' + nodes[i].name)
          .transition()
          .duration(250)
          .attr('rx', nodes[i].radius)
          .attr('ry', nodes[i].radius)
          .attrTween('transform', function() {
            return d3.interpolateString(
              'rotate(0 ' + nodes[i].x + ' ' + nodes[i].y + ')',
              'rotate(-90 ' + nodes[i].x + ' ' + nodes[i].y + ')'
            );
          })
          .on('end', function() {
            d3.select(this).attr('transform', null);
          });
      }
    }
  }

  getSelectedNodes(nodes) {
    let nodesSelected = [];
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].selected) {
        nodesSelected.push(nodes[i]);
      }
    }
    return nodesSelected;
  }
}
export default NetworkService;
