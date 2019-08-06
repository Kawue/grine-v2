import * as d3 from 'd3';
import * as d3lasso from 'd3-lasso';
import * as d3annotate from '../../node_modules/d3-svg-annotation';
import store from '@/store';

class NetworkService {
  biggestNodeRadius = 30;
  smallestNodeRadius = 15;
  height = window.innerHeight;
  width = window.innerWidth;
  normalEdgeColor = '#111';
  hybridEdgeColor = '#999';
  hybridEdgeCounter = 0;
  centerTransitionTime = 1000;

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
      annotationText = annotationText + '\n' + selected.data()[0].name;

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
    annotationText = annotationText + '\n' + d.name;

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

  initSVG(nodes, edges, lassoMode) {
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
      .attr('id', l => l.name)
      .attr('stroke', this.normalEdgeColor);

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

    if (lassoMode) {
      return {
        svg: lSvg,
        nodeElements: lNode,
        linkElements: lLink,
        zoom: this.initZoom(),
        lasso: this.initLasso(lNode),
      };
    } else {
      return {
        svg: lSvg,
        nodeElements: lNode,
        linkElements: lLink,
        lasso: this.initLasso(lNode),
        zoom: this.initZoom(),
      };
    }
  }

  toggleNetworkMode(lassoMode, networkSVG) {
    /*
    DO NOT TOUCH !!!
    Mode is reversed because of event queue by d3
     */
    if (!lassoMode) {
      networkSVG.zoom = this.initZoom();
    } else {
      networkSVG.lasso = this.initLasso(networkSVG.nodeElements);
    }
  }

  initZoom() {
    const svg = d3.select('.graphd3');
    const zoom = d3.zoom().scaleExtent([1 / 4, 5]);
    svg.call(zoom.on('zoom', this.zoomed));
    return zoom;
  }

  zoomed() {
    store.getters.networkSVGElements.svg.attr(
      'transform',
      'translate(' +
        d3.event.transform.x +
        ', ' +
        d3.event.transform.y +
        ') scale(' +
        d3.event.transform.k +
        ')'
    );
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
          .strength(function strength(link) {
            return link.name.startsWith('edge') ? 0.001 : 1;
          })
      )
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('forceCollide', d3.forceCollide().radius(d => d.radius))
      .alphaDecay(1 - Math.pow(0.001, 1 / parameters.iterations))
      .alpha(1)
      .on('tick', this.simulationUpdate);
  }

  centerCamera(zoom) {
    d3.select('.graphd3')
      .transition()
      .duration(this.centerTransitionTime - 500)
      .ease(d3.easeCubicInOut)
      .call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1));
  }

  centerNodes(nodes, simulation, zoom) {
    const center = [this.width * 0.5, this.height * 0.5];
    simulation.stop();
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].x = center[0];
      nodes[i].y = center[1];
    }
    this.centerCamera(zoom);

    let functionFlag = true;

    d3.select('#link-container')
      .selectAll('line')
      .transition()
      .duration(this.centerTransitionTime)
      .ease(d3.easeCubicInOut)
      .attr('x1', center[0])
      .attr('x2', center[0])
      .attr('y1', center[1])
      .attr('y2', center[1]);
    d3.selectAll('.node')
      .transition()
      .duration(this.centerTransitionTime)
      .ease(d3.easeCubicInOut)
      .attr('x', d => center[0] - d.radius)
      .attr('y', d => center[1] - d.radius)
      .on('end', function() {
        if (functionFlag) {
          functionFlag = false;
          simulation.force('forceCollide').strength(0.01);
          simulation.force('charge').strength(50);
          simulation
            .alpha(0.5)
            .alphaDecay(1 - Math.pow(0.001, 1 / 100))
            .alphaTarget(0)
            .restart()
            .on('end', () => {
              simulation.force('forceCollide').strength(0.7);
              simulation.on('end', null);
              store.commit('SET_NETWORK_OPTIONS', store.getters.networkOptions);
            });
        }
      });
  }

  // Lasso functions
  lassoStart() {
    const lasso = store.getters.networkSVGElements.lasso;

    lasso.items().style('fill', n =>
      d3
        .color(n.color)
        .darker(1)
        .toString()
    );
  }

  lassoDraw() {
    const lasso = store.getters.networkSVGElements.lasso;

    // Style the possible dots
    lasso.possibleItems().style('fill', n =>
      d3
        .color(n.color)
        .darker(0.2)
        .toString()
    );

    // Style the not possible dot
    lasso.notPossibleItems().style('fill', n =>
      d3
        .color(n.color)
        .darker(1)
        .toString()
    );
  }

  lassoEnd() {
    // Reset the color of all dots
    const lasso = store.getters.networkSVGElements.lasso;
    lasso.items().style('fill', n => n.color);

    if (!lasso.selectedItems().empty()) {
      const mzs = lasso
        .selectedItems()
        .data()
        .map(d => d.mzs)
        .flat();

      store.commit('MZLIST_UPDATE_SELECTED_MZ', mzs.map(f => f.toString()));
      store.dispatch('mzlistUpdateHighlightedMz', mzs);
    }
  }

  initLasso(nodes) {
    const svg = d3.select('.graphd3');
    const lasso = d3lasso
      .lasso()
      .closePathSelect(true)
      .closePathDistance(100)
      .items(nodes)
      .targetArea(svg)
      .on('start', this.lassoStart)
      .on('draw', this.lassoDraw)
      .on('end', this.lassoEnd);

    svg.call(lasso);
    return lasso;
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
            store.dispatch('mzlistUpdateHighlightedMz', n.mzs);
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
        if (nodeHierarchy === previousHierarchy + 1) {
          if (nodes[i].parent === oldNode.parent) {
            nodesToRemove.push(nodes[i].name);
            selectNextNode = selectNextNode || nodes[i].selected;
            d3.select('#' + nodes[i].name).remove();
            nodes.splice(i, 1);
          }
        } else if (nodeHierarchy > previousHierarchy + 1) {
          let hierarchyCounter = 0;
          let parent = nodes[i].parent;
          while (nodeHierarchy - hierarchyCounter > previousHierarchy + 1) {
            hierarchyCounter++;
            const investigatedNodePrefix =
              'h' + (nodeHierarchy - hierarchyCounter) + 'n';
            parent =
              graph['hierarchy' + (nodeHierarchy - hierarchyCounter)].nodes[
                investigatedNodePrefix + parent
              ].membership;
          }
          if (parent === oldNode.parent) {
            nodesToRemove.push(nodes[i].name);
            selectNextNode = selectNextNode || nodes[i].selected;
            d3.select('#' + nodes[i].name).remove();
            nodes.splice(i, 1);
          }
        }
      }
    }
    nextNode.selected = selectNextNode;

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

    const newEdges = [];

    // hybrid edges
    // go through all nodes
    for (const node of nodes) {
      const nodeHierarchy = parseInt(node.name.split('n')[0].slice(1), 10);
      let hierarchyCounter = 1;
      // hierarchy of current node is less than hierarchy of next node
      if (nodeHierarchy < previousHierarchy) {
        let childs = [...node.childs];
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const investigatesNodePrefix =
            'h' + (nodeHierarchy + hierarchyCounter) + 'n';
          // hierarchy of current node is still less than hierarchy of next node
          // go one hierarchy deeper
          if (nodeHierarchy + hierarchyCounter < previousHierarchy) {
            childs.map(c => {
              return graph['hierarchy' + (nodeHierarchy + hierarchyCounter)]
                .nodes[investigatesNodePrefix + c].childs;
            });
            childs = childs.flat();
            hierarchyCounter++;
          } else {
            // current hierarchy is equal with hierarchy of nextNode
            let hit = false;
            const edgeKeys = Object.keys(
              graph['hierarchy' + previousHierarchy]['edges']
            );
            for (const l of edgeKeys) {
              if (hit) break;
              // search all edges where source or target is nextNode
              if (
                graph['hierarchy' + previousHierarchy]['edges'][l].target ===
                  nextNode.name ||
                graph['hierarchy' + previousHierarchy]['edges'][l].source ===
                  nextNode.name
              ) {
                for (const c of childs) {
                  // search all edges where source or target is a child of current node in current hierarchy
                  if (
                    graph['hierarchy' + previousHierarchy]['edges'][l]
                      .target ===
                      investigatesNodePrefix + c ||
                    graph['hierarchy' + previousHierarchy]['edges'][l]
                      .source ===
                      investigatesNodePrefix + c
                  ) {
                    /// draw hybrid edge
                    newEdges.push({
                      source: node,
                      target: nextNode,
                      name: 'edge' + this.hybridEdgeCounter,
                    });
                    this.hybridEdgeCounter += 1;
                    hit = true;
                    break;
                  }
                }
              }
            }
            break;
          }
        }
      } else if (nodeHierarchy > previousHierarchy) {
        let childs = [...nextNode.childs];
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const investigatesNodePrefix =
            'h' + (previousHierarchy + hierarchyCounter) + 'n';
          // hierarchy of nextNode is still less than hierarchy of current node
          // go one hierarchy deeper
          if (previousHierarchy + hierarchyCounter < nodeHierarchy) {
            childs = childs.map(c => {
              return graph['hierarchy' + (previousHierarchy + hierarchyCounter)]
                .nodes[investigatesNodePrefix + c].childs;
            });
            childs = childs.flat();
            hierarchyCounter++;
          } else {
            // current hierarchy is equal with hierarchy of current node
            const edgeKeys = Object.keys(
              graph['hierarchy' + nodeHierarchy]['edges']
            );
            for (const l of edgeKeys) {
              // search all edges where source or target is current node
              if (
                graph['hierarchy' + nodeHierarchy]['edges'][l].target ===
                  node.name ||
                graph['hierarchy' + nodeHierarchy]['edges'][l].source ===
                  node.name
              ) {
                for (const c of childs) {
                  // search all edges where source or target is a child of nextNode in current hierarchy
                  if (
                    graph['hierarchy' + nodeHierarchy]['edges'][l].target ===
                      investigatesNodePrefix + c ||
                    graph['hierarchy' + nodeHierarchy]['edges'][l].source ===
                      investigatesNodePrefix + c
                  ) {
                    //draw hybrid edge
                    newEdges.push({
                      source: node,
                      target: nextNode,
                      name: 'edge' + this.hybridEdgeCounter,
                    });
                    this.hybridEdgeCounter += 1;
                    break;
                  }
                }
              }
            }
            break;
          }
        }
      }
    }

    nodes.push(nextNode);
    // add new edges to datastructure
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
      .attr('id', l => l.name)
      .attr('stroke-dasharray', l => (l.name.startsWith('edge') ? 4 : 0))
      .attr('stroke', l =>
        l.name.startsWith('edge') ? this.hybridEdgeColor : this.normalEdgeColor
      );
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

    const newEdges = [];

    // hybrid edges
    // go through all nodes
    for (const node of nodes) {
      const nodeHierarchy = parseInt(node.name.split('n')[0].slice(1), 10);
      let hierarchyCounter = 1;
      if (nodeHierarchy < nextHierarchy) {
        let childs = [...node.childs];
        // eslint-disable-next-line no-constant-condition
        while (true) {
          // hierarchy of current node is still less than hierarchy of newNodes
          // go one hierarchy deeper
          const investigatesNodePrefix =
            'h' + (nodeHierarchy + hierarchyCounter) + 'n';
          if (nodeHierarchy + hierarchyCounter < nextHierarchy) {
            childs = childs.map(c => {
              return graph['hierarchy' + (nodeHierarchy + hierarchyCounter)]
                .nodes[investigatesNodePrefix + c].childs;
            });
            childs = childs.flat();
            hierarchyCounter++;
          } else {
            // current hierarchy is equal with hierarchy of newNodes
            const edgeKeys = Object.keys(
              graph['hierarchy' + nextHierarchy]['edges']
            );
            for (const l of edgeKeys) {
              for (const newNode of newNodes) {
                // search all edges where source or target is a newNode
                if (
                  graph['hierarchy' + nextHierarchy]['edges'][l].target ===
                    newNode.name ||
                  graph['hierarchy' + nextHierarchy]['edges'][l].source ===
                    newNode.name
                ) {
                  for (const c of childs) {
                    // search all edges where source or target is a child of current node in current hierarchy
                    if (
                      graph['hierarchy' + nextHierarchy]['edges'][l].target ===
                        investigatesNodePrefix + c ||
                      graph['hierarchy' + nextHierarchy]['edges'][l].source ===
                        investigatesNodePrefix + c
                    ) {
                      newEdges.push({
                        source: node,
                        target: newNode,
                        name: 'edge' + this.hybridEdgeCounter,
                      });
                      this.hybridEdgeCounter += 1;
                      break;
                    }
                  }
                }
              }
            }
            break;
          }
        }
      } else if (nodeHierarchy > nextHierarchy) {
        for (const newNode of newNodes) {
          let childs = [...newNode.childs];
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const investigatesNodePrefix =
              'h' + (nextHierarchy + hierarchyCounter) + 'n';
            // hierarchy of newNodes is still less than hierarchy of current node
            // go one hierarchy deeper
            if (nextHierarchy + hierarchyCounter < nodeHierarchy) {
              childs.map(c => {
                return graph['hierarchy' + (nextHierarchy + hierarchyCounter)]
                  .nodes[investigatesNodePrefix + c].childs;
              });
              childs = childs.flat();
              hierarchyCounter++;
            } else {
              // current hierarchy is equal with hierarchy of current node
              let hit = false;
              const edgeKeys = Object.keys(
                graph['hierarchy' + nodeHierarchy]['edges']
              );
              // search all edges where source or target is current node
              for (const l of edgeKeys) {
                if (hit) break;
                if (
                  graph['hierarchy' + nodeHierarchy]['edges'][l].target ===
                    node.name ||
                  graph['hierarchy' + nodeHierarchy]['edges'][l].source ===
                    node.name
                ) {
                  for (const c of childs) {
                    // search all edges where source or target is a child of a newNode in current hierarchy
                    if (
                      graph['hierarchy' + nodeHierarchy]['edges'][l].target ===
                        investigatesNodePrefix + c ||
                      graph['hierarchy' + nodeHierarchy]['edges'][l].source ===
                        investigatesNodePrefix + c
                    ) {
                      // draw hybrid edge
                      newEdges.push({
                        source: node,
                        target: newNode,
                        name: 'edge' + this.hybridEdgeCounter,
                      });
                      hit = true;
                      this.hybridEdgeCounter += 1;
                      break;
                    }
                  }
                }
              }
              break;
            }
          }
        }
      }
    }

    // add new nodes to datastructure
    nodes.push(...newNodes);

    // add new edges to datastructure
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
      .attr('id', l => l.name)
      .attr('stroke-dasharray', l => (l.name.startsWith('edge') ? 4 : 0))
      .attr('stroke', l =>
        l.name.startsWith('edge') ? this.hybridEdgeColor : this.normalEdgeColor
      );
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
    let mzValuesFloats = mzValuesStrings.map(mz => parseFloat(mz));
    for (let i = 0; i < nodes.length; i++) {
      let hit = false;
      for (let j = 0; j < mzValuesFloats.length; j++) {
        if (nodes[i].mzs.findIndex(mz => mz === mzValuesFloats[j]) > -1) {
          // remove all mz values in the array which are from the current node
          mzValuesFloats = mzValuesFloats.filter(
            f => nodes[i].mzs.findIndex(m => m === f) === -1
          );
          hit = true;
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
      const scalingConstant = this.biggestNodeRadius + 10;
      selection
        .transition()
        .duration(250)
        .ease(function(t) {
          // quadratic easing
          return d3.easePolyIn(t, 2);
        })
        .attr('rx', node.radius * 0.5)
        .attr('ry', node.radius * 0.5)
        .attrTween('transform', function() {
          return function(t) {
            /*
            interpolate linear between two values
            t between 0 and 1
            startValue + (endValue - startValue) * t
            scaling factor k and rotation angle beta
            k: 1 to maximal radius + 10
            beta: 0° to 90°
           */
            const kTimesCosBeta =
              (1 + (scalingConstant / node.radius - 1) * t) *
              Math.cos(Math.PI * t * 0.5);
            const kTimesSinBeta =
              (1 + (scalingConstant / node.radius - 1) * t) *
              Math.sin(Math.PI * t * 0.5);
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
              (-node.x * kTimesCosBeta + node.y * kTimesSinBeta + node.x) +
              ' ' +
              (-node.x * kTimesSinBeta - node.y * kTimesCosBeta + node.y) +
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
          // inverse of quadratic easing
          return d3.easePolyOut(t, 2);
        })
        .attrTween('transform', function() {
          return function(t) {
            /*
            interpolate linear between two values
            t between 0 and 1
            startValue + (endValue - startValue) * t
            scaling factor k and rotation angle beta
            k: maximal radius + 10 to 1
            beta: 90° to 180°
           */
            const kTimesCosBeta =
              (scalingConstant / node.radius -
                (scalingConstant / node.radius - 1) * t) *
              Math.cos(Math.PI * 0.5 * (1 + t));
            const kTimesSinBeta =
              (scalingConstant / node.radius -
                (scalingConstant / node.radius - 1) * t) *
              Math.sin(Math.PI * 0.5 * (1 + t));
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
              (-node.x * kTimesCosBeta + node.y * kTimesSinBeta + node.x) +
              ' ' +
              (-node.x * kTimesSinBeta - node.y * kTimesCosBeta + node.y) +
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
      if (nodes[i].selected === true) {
        nodesSelected.push(nodes[i]);
      }
    }
    return nodesSelected;
  }
}
export default NetworkService;
