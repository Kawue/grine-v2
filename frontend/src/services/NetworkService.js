import * as d3 from 'd3';
import * as d3lasso from 'd3-lasso';
import * as d3annotate from '../../node_modules/d3-svg-annotation';
import * as _ from 'lodash';
import store from '@/store';

class NetworkService {
  biggestNodeRadius = 30;
  smallestNodeRadius = 15;
  height = window.innerHeight;
  width = window.innerWidth;
  normalEdgeColor = '#e1ddcd';
  hybridEdgeColor = '#cdc9ba';
  hybridEdgeCounter = 0;
  annotationColor = '#f0ecdd';
  centerTransitionTime = 1000;
  darkCoefficient = 1.8;
  gradientScale = {
    x: this.width * 0.5 - 300,
    y: 10,
    width: 600,
    height: 20,
    minWeight: 0,
    maxWeight: 1,
    linearScaler: null,
  };

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
          weight: graph['hierarchy0'].edges[l]['weight'],
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

    if (store.getters.networkNodeTrixNewElements.newEdges.length > 0) {
      d3.select('#nodeTrix-edges')
        .selectAll('line')
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
    }

    store.getters.networkSVGElements.nodeElements
      .attr('x', function(d) {
        return d.x - d.radius;
      })
      .attr('y', function(d) {
        return d.y - d.radius;
      });

    let selected = d3.select('.selected');

    if (!selected.empty()) {
      d3.select('#graph-container')
        .select('.annotations')
        .remove();
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
          color: this.annotationColor,
          type: d3annotate.annotationCalloutCircle,
        },
      ];
      let makeAnnotations = d3annotate.annotation().annotations(annotations);

      d3.select('#node-annotation-group').call(makeAnnotations);
    }
  }

  dragstarted(d) {
    if (!d3.event.active)
      store.getters.networkSimulation.alphaTarget(0.3).restart();

    d3.select('#node-container')
      .select('#' + d.name)
      .attr('cursor', 'grabbing');

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

  static dragEnded(d) {
    if (!d3.event.active) store.getters.networkSimulation.alphaTarget(0);

    d3.select('#node-container')
      .select('#' + d.name)
      .attr('cursor', 'grab');
    d.fx = null;
    d.fy = null;
  }

  mouseOver(d) {
    d3.select('#' + d.name).attr('class', 'selected');
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
        color: this.annotationColor,
        type: d3annotate.annotationCalloutCircle,
      },
    ];
    d3.select('#graph-container')
      .append('g')
      .attr('id', 'node-annotation-group')
      .style('pointer-events', 'none')
      .call(d3annotate.annotation().annotations(annotations));
  }

  static mouseOut(d) {
    d3.select('#' + d.name).attr('class', 'node');
    d3.selectAll('#node-annotation-group').remove();
    d.annotations = null;
  }

  mouseOverNodeTrixCell(d) {
    d3.select('#' + d.name).attr('class', 'selected');
    const annotationText = 'mz Value: ' + d.mzs[0] + '\n' + d.name;

    let delta = d.radius + 20;
    if (d.position === 'L' || d.position === 'T') {
      delta = -1 * delta;
    }
    const annotations = [
      {
        note: {
          label: annotationText,
          // create a newline whenever you read this symbol
          wrapSplitter: '\n',
        },
        subject: {
          radius: d.radius + 5,
        },
        x: d.x,
        y: d.y,
        dx: delta,
        dy: delta,
        color: this.annotationColor,
        type: d3annotate.annotationCalloutCircle,
      },
    ];
    let makeAnnotations = d3annotate.annotation().annotations(annotations);
    d3.select('#graph-container')
      .append('g')
      .attr('id', 'node-annotation-group')
      .style('pointer-events', 'none')
      .call(makeAnnotations);
  }

  initSVG(nodes, edges, lassoMode) {
    d3.select('#graph-container').remove();
    d3.select('#gradient-container').remove();

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
      .attr('cursor', 'grab')
      .attr('fill', d => d.color)
      .attr('numMz', d => d.mzs)
      .attr('childs', d => d.childs)
      .on('click', this.nodeClick)
      .on('mouseover', this.mouseOver.bind(this))
      .on('mouseout', NetworkService.mouseOut)
      .call(
        d3
          .drag()
          .on('start', this.dragstarted)
          .on('drag', this.dragged)
          .on('end', NetworkService.dragEnded)
      );

    if (lassoMode) {
      return {
        svg: lSvg,
        nodeElements: lNode,
        linkElements: lLink,
        zoom: NetworkService.initZoom(),
        lasso: this.initLasso(),
      };
    } else {
      return {
        svg: lSvg,
        nodeElements: lNode,
        linkElements: lLink,
        lasso: this.initLasso(),
        zoom: NetworkService.initZoom(),
      };
    }
  }

  toggleNetworkMode(lassoMode, networkSVG) {
    /*
    DO NOT TOUCH !!!
    Mode is reversed because of event queue by d3
     */
    if (!lassoMode) {
      networkSVG.zoom = NetworkService.initZoom();
    } else {
      networkSVG.lasso = this.initLasso();
    }
  }

  static initZoom() {
    const svg = d3.select('.graphd3');
    const zoom = d3.zoom().scaleExtent([1 / 4, 5]);
    svg.call(zoom.on('zoom', NetworkService.zoomed));
    return zoom;
  }

  static zoomed() {
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

  static updateSimulationParameters(simulation, parameters) {
    simulation.force('charge').strength(parameters.repulsion);
    simulation
      .force('link')
      .distance(l => (1.1 - l.weight) * parameters.edgeLength * 3);
    simulation
      .alphaDecay(1 - Math.pow(0.001, 1 / parameters.iterations))
      .alpha(0.5)
      .alphaTarget(0)
      .restart();
  }

  initSimulation(
    oldSimulation,
    nodes,
    edges,
    parameters,
    nodeTrixNode,
    nodeTrixEdges,
    nodeTrixBorderNodes
  ) {
    if (oldSimulation != null) {
      oldSimulation.stop();
    }
    d3.select('#graphd3').select('.lasso');
    return d3
      .forceSimulation(
        nodeTrixNode == null
          ? nodes
          : nodes.concat([nodeTrixNode]).concat(nodeTrixBorderNodes)
      )
      .force('charge', d3.forceManyBody().strength(parameters.repulsion))
      .force(
        'link',
        d3
          .forceLink(edges.concat(nodeTrixEdges))
          .id(l => l.name)
          .distance(l => (1.1 - l.weight) * 3 * parameters.edgeLength)
          .strength(function strength(link) {
            return link.name.startsWith('edge') ? 0.001 : 1;
          })
      )
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('forceCollide', d3.forceCollide().radius(d => d.radius))
      .alphaDecay(1 - Math.pow(0.001, 1 / parameters.iterations))
      .alpha(1)
      .on('tick', this.simulationUpdate.bind(this));
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
    d3.select('#nodeTrix-edges')
      .selectAll('line')
      .transition()
      .duration(this.centerTransitionTime)
      .ease(d3.easeCubicInOut)
      .attr('x2', center[0])
      .attr('y2', center[1]);
    d3.select('#node-container')
      .selectAll('.node')
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

    lasso.items().attr('fill', n =>
      d3
        .color(n.color)
        .darker(1)
        .toString()
    );
  }

  lassoDraw() {
    const lasso = store.getters.networkSVGElements.lasso;

    // Style the possible dots
    lasso.possibleItems().attr('fill', n =>
      d3
        .color(n.color)
        .darker(0.2)
        .toString()
    );

    // Style the not possible dot
    lasso.notPossibleItems().attr('fill', n =>
      d3
        .color(n.color)
        .darker(1)
        .toString()
    );
  }

  static lassoEnd() {
    // Reset the color of all dots
    const lasso = store.getters.networkSVGElements.lasso;
    lasso.items().attr('fill', n => n.color);

    if (!lasso.selectedItems().empty()) {
      const mzs = lasso
        .selectedItems()
        .data()
        .map(d => d.mzs)
        .flat();

      store.commit('CLEAR_IMAGES');
      this.highlightNodesByName(
        store.getters.networkNodes,
        lasso
          .selectedItems()
          .data()
          .map(d => d.name)
      );
      store.dispatch('mzlistUpdateHighlightedMz', mzs);
      const hierarchies = lasso
        .selectedItems()
        .data()
        .map(n => NetworkService.hierarchyOfNodeName(n.name));
      const firstParent = lasso.selectedItems().data()[0].parent;
      // check if all nodes are from the same hierarchy
      if (
        hierarchies.length > 1 &&
        hierarchies.reduce((acc, val) => acc && val === hierarchies[0], true)
      ) {
        // check if cluster split is possible
        if (
          lasso
            .selectedItems()
            .data()
            .reduce(
              (acc, val) =>
                acc && val.parent != null && val.parent === firstParent,
              true
            )
        ) {
          const inverseNodes = d3
            .select('#graph-container')
            .selectAll('.node')
            .data()
            .filter(node => {
              return (
                NetworkService.hierarchyOfNodeName(node.name) ===
                  hierarchies[0] &&
                node.parent === firstParent &&
                !node.selected
              );
            });
          if (
            inverseNodes.length > 0 &&
            hierarchies.reduce((acc, val) => acc && val > 0, true)
          ) {
            store.commit('NETWORK_SPLIT_CLUSTER_POSSIBLE', [
              lasso.selectedItems().data(),
              inverseNodes,
            ]);
          }
        } else {
          if (hierarchies[0] > 0) {
            // assignment change possible
            store.commit(
              'NETWORK_ASSIGNMENT_CHANGE_POSSIBLE',
              lasso.selectedItems().data()
            );
          }
          if (hierarchies[0] < store.getters.meta.maxHierarchy) {
            // node merge possible
            store.commit(
              'NETWORK_MERGE_NODES_POSSIBLE',
              lasso.selectedItems().data()
            );
          }
        }
      }
    }
  }

  initLasso() {
    const svg = d3.select('.graphd3');
    const lasso = d3lasso
      .lasso()
      .closePathSelect(true)
      .closePathDistance(100)
      .items(NetworkService.getLassoSVGNodes())
      .targetArea(svg)
      .on('start', this.lassoStart)
      .on('draw', this.lassoDraw)
      .on('end', NetworkService.lassoEnd.bind(this));

    svg.call(lasso);
    return lasso;
  }

  splitCluster(graph, newGroup, oldGroup) {
    const childHierarchy = NetworkService.hierarchyOfNodeName(newGroup[0].name);
    const parentHierarchy = childHierarchy - 1;
    const oldParent =
      graph['hierarchy' + parentHierarchy].nodes[
        'h' + parentHierarchy + 'n' + newGroup[0].parent
      ];

    // construct new parent one hierarchy higher
    const newParentIndex =
      Math.max(
        ...Object.keys(graph['hierarchy' + parentHierarchy].nodes).map(
          nodeKey => parseInt(nodeKey.split('n')[1], 10)
        )
      ) + 1;
    const newParentName = 'h' + parentHierarchy + 'n' + newParentIndex;
    const newParentChilds = newGroup.map(n =>
      parseInt(n.name.split('n')[1], 10)
    );
    const newParentMzs = newGroup.map(n => n.mzs).flat();
    oldParent.childs = oldParent.childs.filter(
      c => !newParentChilds.includes(c)
    );
    oldParent.mzs = oldParent.mzs.filter(mz => !newParentMzs.includes(mz));
    const newParent = {
      index: newParentIndex,
      name: newParentName,
      childs: newParentChilds,
      mzs: newParentMzs,
    };
    if (parentHierarchy > 0) {
      const newParentParent = oldParent.membership;
      graph['hierarchy' + (parentHierarchy - 1)].nodes[
        'h' + (parentHierarchy - 1) + 'n' + newParentParent
      ].childs.push(newParentIndex);
      newParent['membership'] = newParentParent;
    }
    graph['hierarchy' + parentHierarchy].nodes[newParentName] = newParent;
    for (const node of newGroup) {
      node.parent = newParentIndex;
      graph['hierarchy' + childHierarchy].nodes[
        node.name
      ].membership = newParentIndex;
    }

    // inspect edges from oldGroup and newGroup
    let newGroupEdges = [];
    let oldGroupEdges = [];
    for (const edgeKey of Object.keys(
      graph['hierarchy' + childHierarchy].edges
    )) {
      // search for edges between newGroup and every other group
      const edge = graph['hierarchy' + childHierarchy].edges[edgeKey];
      const sourceIndexNewGroup = newGroup.findIndex(
        node => node.name === edge.source
      );
      const targetIndexNewGroup = newGroup.findIndex(
        node => node.name === edge.target
      );
      if (sourceIndexNewGroup > -1 && targetIndexNewGroup === -1) {
        newGroupEdges.push({
          parent:
            graph['hierarchy' + childHierarchy].nodes[edge.target].membership,
          weight: edge.weight,
        });
      } else if (sourceIndexNewGroup === -1 && targetIndexNewGroup > -1) {
        newGroupEdges.push({
          parent:
            graph['hierarchy' + childHierarchy].nodes[edge.source].membership,
          weight: edge.weight,
        });
      }

      // search for edges between oldGroup and every other group except newGroup
      if (sourceIndexNewGroup === -1 && targetIndexNewGroup === -1) {
        const sourceIndexOldGroup = oldGroup.findIndex(
          node => node.name === edge.source
        );
        const targetIndexOldGroup = oldGroup.findIndex(
          node => node.name === edge.target
        );
        if (sourceIndexOldGroup > -1 && targetIndexOldGroup === -1) {
          oldGroupEdges.push({
            parent:
              graph['hierarchy' + childHierarchy].nodes[edge.target].membership,
            weight: edge.weight,
          });
        } else if (sourceIndexOldGroup === -1 && targetIndexOldGroup > -1) {
          oldGroupEdges.push({
            parent:
              graph['hierarchy' + childHierarchy].nodes[edge.source].membership,
            weight: edge.weight,
          });
        }
      }
    }
    newGroupEdges = NetworkService.aggregateWeightsByParent(newGroupEdges);
    oldGroupEdges = NetworkService.aggregateWeightsByParent(oldGroupEdges);

    // update edges from oldParent
    for (const edgeKey of Object.keys(
      graph['hierarchy' + parentHierarchy].edges
    )) {
      const edge = graph['hierarchy' + parentHierarchy].edges[edgeKey];
      if (edge.source === oldParent.name || edge.target === oldParent.name) {
        const index = oldGroupEdges.findIndex(
          aggregatedEdge =>
            'h' + parentHierarchy + 'n' + aggregatedEdge.parent ===
              edge.target ||
            'h' + parentHierarchy + 'n' + aggregatedEdge.parent === edge.source
        );
        if (index > -1) {
          graph['hierarchy' + parentHierarchy].edges[edgeKey].weight =
            oldGroupEdges[index].weight;
        } else {
          delete graph['hierarchy' + parentHierarchy].edges[edgeKey];
        }
      }
    }

    // insert new edges from newParent
    let maxEdgeIndex = Math.max(
      ...Object.keys(graph['hierarchy' + childHierarchy].edges).map(edgeKey =>
        parseInt(edgeKey.split('e')[1], 10)
      )
    );
    for (const edge of newGroupEdges) {
      graph['hierarchy' + parentHierarchy].edges[
        'h' + parentHierarchy + 'e' + maxEdgeIndex
      ] = {
        index: maxEdgeIndex,
        name: 'h' + parentHierarchy + 'e' + maxEdgeIndex,
        weight: edge.weight,
        source: newParentName,
        target: 'h' + parentHierarchy + 'n' + edge.parent,
      };
      maxEdgeIndex++;
    }
    if (parentHierarchy === 0) {
      store.dispatch('changeGraph', store.getters.stateOptionsGraph);
    }
  }

  static aggregateWeightsByParent(edges) {
    // the mean is the aggregate function
    // edges = [{parent: number, weight: number}]
    const aggregatedEdges = [];
    edges.sort((a, b) => (a.parent > b.parent ? 1 : -1));
    for (let i = 0; i < edges.length; i++) {
      const currentParent = edges[i].parent;
      let counter = 1;
      let sum = edges[i].weight;
      while (
        edges[i + counter] != null &&
        edges[i + counter].parent === currentParent
      ) {
        sum += edges[i + counter].weight;
        counter++;
      }
      aggregatedEdges.push({
        parent: currentParent,
        weight: sum / counter,
      });
      counter--;
      i += counter;
    }
    return aggregatedEdges;
  }

  changeNodesAssignment(data, nodes, newParentIndex) {
    const graph = data.graph;
    const dataMzs = data.mzs;
    const nodeHierarchy = NetworkService.hierarchyOfNodeName(nodes[0].name);
    const parentHierarchy = nodeHierarchy - 1;
    const newColor = nodes.find(n => n.parent === newParentIndex).color;
    const newNodesMzs = [];
    const newNodesIndices = [];
    const nodesToDelete = [];
    for (const node of nodes) {
      if (node.parent !== newParentIndex) {
        const nodeIndex = parseInt(node.name.split('n')[1], 10);
        newNodesMzs.push(...node.mzs);
        newNodesIndices.push(nodeIndex);

        // update the nodes parent on every hierarchy
        let hierarchyCounter = 0;
        let parent = node.parent;
        let lastIndex = nodeIndex;
        let deleteParent = true;
        // update childs and mzs
        while (parentHierarchy - hierarchyCounter > -1) {
          const currentHierarchy = parentHierarchy - hierarchyCounter;
          const localNode =
            graph['hierarchy' + currentHierarchy].nodes[
              'h' + currentHierarchy + 'n' + parent
            ];
          if (deleteParent) {
            localNode.childs = localNode.childs.filter(n => n !== lastIndex);
          }
          if (localNode.childs.length === 0) {
            nodesToDelete.push(localNode.name);
            delete graph['hierarchy' + currentHierarchy].nodes[localNode.name];
          } else {
            deleteParent = false;
            localNode.mzs = localNode.mzs.filter(mz => !node.mzs.includes(mz));
          }
          lastIndex = parent;
          hierarchyCounter++;
          parent = localNode.membership;
        }

        // update the specific nodes parent and color
        node.parent = newParentIndex;
        graph['hierarchy' + nodeHierarchy].nodes[
          node.name
        ].membership = newParentIndex;
        node.color = newColor;
        d3.select('#graph-container')
          .select('#' + node.name)
          .attr('fill', node.color);
        if (store.getters.networkNodeTrixActive) {
          d3.select('#matrix-nodes')
            .selectAll(`[orgName='${node.name}']`)
            .attr('fill', node.color);
        }
      }
    }

    // update the new parent node on every hierarchy
    let hierarchyCounter = 0;
    let parent = newParentIndex;
    while (parentHierarchy - hierarchyCounter > -1) {
      const currentHierarchy = parentHierarchy - hierarchyCounter;
      const localNode =
        graph['hierarchy' + currentHierarchy].nodes[
          'h' + currentHierarchy + 'n' + parent
        ];
      if (hierarchyCounter === 0) {
        localNode.childs.push(...newNodesIndices);
      }
      localNode.mzs.push(...newNodesMzs);
      for (const mz of newNodesMzs) {
        dataMzs[mz.toString()]['hierarchy' + currentHierarchy] = localNode.name;
      }
      parent = localNode.membership;
      hierarchyCounter++;
    }

    // delete edges of deleted nodes
    const hierarchiesOfDeletedNodes = nodesToDelete.map(n =>
      NetworkService.hierarchyOfNodeName(n)
    );
    NetworkService.removeSimpleDuplicatesFromArray(hierarchiesOfDeletedNodes);
    for (const hierarchy of hierarchiesOfDeletedNodes) {
      const nodesToInvestigate = nodesToDelete.filter(n => NetworkService.hierarchyOfNodeName(n) === hierarchy);
      for (const edgeKey of Object.keys(graph['hierarchy' + hierarchy].edges)) {
        const edge = graph['hierarchy' + hierarchy].edges[edgeKey];
        if (
          nodesToInvestigate.includes(edge.source) || nodesToInvestigate.includes(edge.target)
        ) {
          delete graph['hierarchy' + hierarchy].edges[edgeKey]
        }
      }
    }
  }

  static removeSimpleDuplicatesFromArray(array) {
    array.sort((a, b) => (a > b ? 1 : -1));
    array.forEach((item, index) => {
      while (array[index + 1] != null && item === array[index + 1]) {
        array.splice(index + 1, 1);
      }
    });
  }

  static hierarchyOfNodeName(name) {
    return parseInt(name.split('n')[0].slice(1), 10);
  }

  computeNodeTrix(graph, nodes, edges, deepestHierarchy, colorScale) {
    const selNodeTrixNodes = [];
    if (!d3.select('#nodeTrix-container').empty()) {
      selNodeTrixNodes.push(...NetworkService.getSelectedNodeTrixNodes());
      this.resetNodeTrix(nodes, edges);
    }
    const gradientContainer = d3
      .select('.graphd3')
      .append('g')
      .attr('id', 'gradient-container');

    this.computeGradient(colorScale);

    gradientContainer
      .append('text')
      .attr('id', 'minWeight')
      .attr('x', this.gradientScale.x)
      .attr('fill', this.annotationColor)
      .attr('y', this.gradientScale.y + this.gradientScale.height + 20)
      .attr('cursor', 'default')
      .text(this.gradientScale.minWeight.toFixed(2));
    gradientContainer
      .append('text')
      .attr('id', 'maxWeight')
      .attr('x', this.gradientScale.x + this.gradientScale.width - 30)
      .attr('fill', this.annotationColor)
      .attr('y', this.gradientScale.y + this.gradientScale.height + 20)
      .attr('cursor', 'default')
      .text(this.gradientScale.maxWeight.toFixed(2));

    gradientContainer
      .append('rect')
      .attr('id', 'color-gradient')
      .attr('x', this.gradientScale.x)
      .attr('y', this.gradientScale.y)
      .attr('width', this.gradientScale.width)
      .attr('height', this.gradientScale.height)
      .style('stroke', 'black')
      .style('stroke-width', 1)
      .style('fill', 'url(#linear-gradient)');

    const sel = NetworkService.getSelectedNodes(nodes, true);

    d3.select('#node-container')
      .selectAll("[active='true']")
      .remove();

    const oldElements = store.getters.networkNodeTrixOldElements;
    oldElements.oldNodes = sel;
    NetworkService.removeEdgesFromNodes(edges, sel.map(n => n.name));
    sel.push(...selNodeTrixNodes);
    let deepNodes = [];
    // compute nodes of the deepest hierarchy of selected nodes
    for (const node of sel) {
      const nodeHierarchy = NetworkService.hierarchyOfNodeName(node.name);
      if (nodeHierarchy === deepestHierarchy) {
        deepNodes.push({
          name: node.name,
          color: node.color,
          selected: node.selected,
          mzs: node.mzs,
          x: null,
          y: null,
          radius: this.smallestNodeRadius,
          parent: node.parent,
        });
      } else {
        let childs = [...node.childs];
        let hierarchyCounter = 1;
        // eslint-disable-next-line no-constant-condition
        while (nodeHierarchy + hierarchyCounter < deepestHierarchy) {
          const investigatesNodePrefix =
            'h' + (nodeHierarchy + hierarchyCounter) + 'n';
          childs = childs.map(c => {
            return graph['hierarchy' + (nodeHierarchy + hierarchyCounter)]
              .nodes[investigatesNodePrefix + c].childs;
          });
          childs = childs.flat();
          hierarchyCounter++;
        }
        const deepestHierarchyPrefix = 'h' + deepestHierarchy + 'n';
        deepNodes.push(
          ...childs.map(c => {
            return {
              name: deepestHierarchyPrefix + c,
              color: node.color,
              selected: node.selected,
              mzs:
                graph['hierarchy' + deepestHierarchy].nodes[
                  deepestHierarchyPrefix + c
                ].mzs,
              x: null,
              y: null,
              radius: this.smallestNodeRadius,
              parent:
                graph['hierarchy' + deepestHierarchy].nodes[
                  deepestHierarchyPrefix + c
                ].membership,
            };
          })
        );
      }
    }
    // remove duplicated nodes
    deepNodes.sort((a, b) => (a.name > b.name ? 1 : -1));
    deepNodes.forEach((item, index) => {
      if (
        deepNodes[index + 1] != null &&
        item.name === deepNodes[index + 1].name
      ) {
        deepNodes.splice(index, 1);
      }
    });
    deepNodes.sort((a, b) => {
      if (a.color === b.color) {
        return a.parent > b.parent ? 1 : -1;
      } else {
        return a.color > b.color ? 1 : -1;
      }
    });
    const map = {};
    let heatmap = [];
    // construct empty heatmap and data structure to map from node name to index in heatmap
    for (let i = 0; i < deepNodes.length; i++) {
      map[deepNodes[i].name] = i;
      const tempArray = [];
      for (let j = 0; j < deepNodes.length - i; j++) {
        tempArray.push(0);
      }
      heatmap.push(tempArray);
    }
    heatmap = heatmap.reverse();
    const edgeKeys = Object.keys(
      graph['hierarchy' + deepestHierarchy]['edges']
    );
    // compute heatmap
    for (const edge of edgeKeys) {
      const sourceIndex =
        map[graph['hierarchy' + deepestHierarchy]['edges'][edge].source];
      const targetIndex =
        map[graph['hierarchy' + deepestHierarchy]['edges'][edge].target];
      if (sourceIndex != null && targetIndex != null) {
        const weight =
          graph['hierarchy' + deepestHierarchy]['edges'][edge].weight;
        if (sourceIndex <= targetIndex) {
          heatmap[targetIndex][sourceIndex] = weight;
        } else {
          heatmap[sourceIndex][targetIndex] = weight;
        }
      }
    }
    const heatMapSVG = d3
      .select('#graph-container')
      .append('g')
      .attr('id', 'nodeTrix-container')
      .append('g')
      .attr('id', 'matrix')
      .on('mouseenter', () => {
        this.nodeTrixMouseInContainer(colorScale);
      })
      .on('mouseleave', () => {
        this.nodeTrixMouseOutContainer(colorScale);
      });
    const size = this.smallestNodeRadius * 2.4;
    const center = [
      this.width * 0.6,
      0.5 * (this.height - (deepNodes.length + 2) * size),
    ];
    for (let i = 0; i < heatmap.length; i++) {
      const tempArray = [];
      for (let j = 0; j < heatmap.length; j++) {
        tempArray.push({
          row: i,
          column: j,
          weight: 0,
          source: deepNodes[i].name,
          target: deepNodes[j].name,
        });
        if (i < j) {
          tempArray[j].weight = heatmap[j][i];
        } else {
          tempArray[j].weight = heatmap[i][j];
        }
      }
      heatMapSVG
        .selectAll('newHeatCells')
        .data(tempArray)
        .enter()
        .append('rect')
        .attr('class', 'nodeTrixCell')
        .attr('x', n => center[0] + n.column * size)
        .attr('y', n => center[1] + n.row * size)
        .attr('row', n => n.row)
        .attr('column', n => n.column)
        .attr('width', size - 3)
        .attr('height', size - 3)
        .attr('stroke', n => colorScale(n.weight))
        .attr('stroke-width', 3)
        .attr('fill', n => colorScale(n.weight))
        .on('mouseenter', n => {
          this.nodeTrixMouseInCell(n, colorScale);
        })
        .on('mouseleave', n => {
          this.nodeTrixMouseOutCell(n, colorScale);
        });
    }

    const forbiddenNodeIndices = [];

    for (const name of deepNodes.map(n => n.name)) {
      forbiddenNodeIndices.push(parseInt(name.split('n')[1], 10));
    }

    const newEdges = [];
    // normal edges to border nodes
    Object.keys(graph['hierarchy' + deepestHierarchy]['edges']).forEach(l => {
      let sourceIndex = deepNodes.findIndex(d => {
        return (
          d.name === graph['hierarchy' + deepestHierarchy]['edges'][l].source
        );
      });
      if (sourceIndex >= 0) {
        const targetIndex = nodes.findIndex(d => {
          return (
            d.name === graph['hierarchy' + deepestHierarchy]['edges'][l].target
          );
        });
        if (targetIndex >= 0) {
          newEdges.push({
            source: deepNodes[sourceIndex],
            target: nodes[targetIndex],
            name: graph['hierarchy' + deepestHierarchy].edges[l]['name'],
            weight: graph['hierarchy' + deepestHierarchy].edges[l]['weight'],
          });
        }
      } else {
        sourceIndex = nodes.findIndex(d => {
          return (
            d.name === graph['hierarchy' + deepestHierarchy]['edges'][l].source
          );
        });
        if (sourceIndex >= 0) {
          const targetIndex = deepNodes.findIndex(d => {
            return (
              d.name ===
              graph['hierarchy' + deepestHierarchy]['edges'][l].target
            );
          });
          if (targetIndex >= 0) {
            newEdges.push({
              source: deepNodes[targetIndex],
              target: nodes[sourceIndex],
              name: graph['hierarchy' + deepestHierarchy].edges[l]['name'],
              weight: graph['hierarchy' + deepestHierarchy].edges[l]['weight'],
            });
          }
        }
      }
    });

    // hybrid edges to left border node
    for (const node of nodes) {
      const nodeHierarchy = NetworkService.hierarchyOfNodeName(node.name);
      let hierarchyCounter = 1;
      if (nodeHierarchy < deepestHierarchy) {
        let childs = [...node.childs];
        // eslint-disable-next-line no-constant-condition
        while (true) {
          // hierarchy of current node is still less than hierarchy of newNodes
          // go one hierarchy deeper
          const investigatesNodePrefix =
            'h' + (nodeHierarchy + hierarchyCounter) + 'n';
          if (nodeHierarchy + hierarchyCounter < deepestHierarchy) {
            childs = childs.map(c => {
              return graph['hierarchy' + (nodeHierarchy + hierarchyCounter)]
                .nodes[investigatesNodePrefix + c].childs;
            });
            childs = childs.flat();
            hierarchyCounter++;
          } else {
            // current hierarchy is equal with hierarchy of newNodes
            const edgeKeys = Object.keys(
              graph['hierarchy' + deepestHierarchy]['edges']
            );
            for (const l of edgeKeys) {
              for (const deepNode of deepNodes) {
                // search all edges where source or target is a newNode
                if (
                  graph['hierarchy' + deepestHierarchy]['edges'][l].target ===
                    deepNode.name ||
                  graph['hierarchy' + deepestHierarchy]['edges'][l].source ===
                    deepNode.name
                ) {
                  for (const c of childs) {
                    if (forbiddenNodeIndices.includes(c)) {
                      continue;
                    }
                    // search all edges where source or target is a child of current node in current hierarchy
                    if (
                      graph['hierarchy' + deepestHierarchy]['edges'][l]
                        .target ===
                        investigatesNodePrefix + c ||
                      graph['hierarchy' + deepestHierarchy]['edges'][l]
                        .source ===
                        investigatesNodePrefix + c
                    ) {
                      newEdges.push({
                        source: deepNode,
                        target: node,
                        name: 'edge' + this.hybridEdgeCounter,
                        weight: 0.1,
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
      }
    }

    // render nodes on border of nodesTrix
    const length = deepNodes.length;
    for (let i = 0; i < length; i++) {
      // left column
      deepNodes[i]['position'] = 'L';
      deepNodes[i]['column'] = -1;
      deepNodes[i]['row'] = i;
      deepNodes[i].selected = false;
      deepNodes[i].x = center[0] - 0.5 * size;
      deepNodes[i].y = center[1] + 0.5 * size + i * size;
      deepNodes[i].fx = center[0] - 0.5 * size;
      deepNodes[i].fy = center[1] + 0.5 * size + i * size;

      // right column
      const right = _.cloneDeep(deepNodes[i]);
      right.position = 'R';
      right.x = center[0] + size * (length + 0.5);
      right.column = length;
      deepNodes.push(right);

      // top row
      const top = _.cloneDeep(deepNodes[i]);
      top.position = 'T';
      top.x = center[0] + 0.5 * size + i * size;
      top.y = center[1] - 0.5 * size;
      top.row = -1;
      top.column = i;
      deepNodes.push(top);

      // bottom row
      const bottom = _.cloneDeep(top);
      top.position = 'B';
      top.y = center[1] + size * (0.5 + length);
      top.row = length;
      top.column = i;
      deepNodes.push(bottom);
    }
    NetworkService.removeDuplicatedEdges(newEdges);
    store.getters.networkNodeTrixNewElements.newNodes = deepNodes;
    store.getters.networkNodeTrixNewElements.newEdges = newEdges;
    const nodeTrixSize = heatmap.length * size;
    store.getters.networkNodeTrixNewElements.nodeTrixNode = {
      x: center[0] + 0.5 * nodeTrixSize,
      y: center[1] + 0.5 * nodeTrixSize,
      fx: center[0] + 0.5 * nodeTrixSize,
      fy: center[1] + 0.5 * nodeTrixSize,
      radius: nodeTrixSize * Math.pow(2, -0.5),
    };

    d3.select('#nodeTrix-container')
      .append('g')
      .attr('id', 'nodeTrix-edges')
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

    d3.select('#nodeTrix-container')
      .append('g')
      .attr('id', 'matrix-nodes')
      .selectAll('newNodes')
      .data(deepNodes)
      .enter()
      .append('rect')
      .attr('x', n => n.x - n.radius)
      .attr('y', n => n.y - n.radius)
      .attr('rx', n => (n.selected ? 0 : n.radius))
      .attr('ry', n => (n.selected ? 0 : n.radius))
      .attr('id', n => n.name + n.position)
      .attr('orgName', n => n.name)
      .attr('class', n => (n.position === 'L' ? 'node' : ''))
      .attr('cursor', 'pointer')
      .attr('row', n => n.row)
      .attr('column', n => n.column)
      .attr('width', n => 2 * n.radius)
      .attr('height', n => 2 * n.radius)
      .attr('pos', n => n.position)
      .attr('fill', n => n.color)
      .attr('numMz', n => n.mzs)
      .on('click', this.nodeTrixNodeClick.bind(this))
      .on('mouseover', this.mouseOverNodeTrixCell.bind(this))
      .on('mouseout', NetworkService.mouseOut);

    d3.select('#matrix-nodes').raise();
    d3.select('#nodeTrix-edges').lower();
    d3.select('#nodeTrix-container').lower();
    store.commit('NETWORK_SIMULATION_INIT');
  }

  nodeTrixNodeClick(n) {
    const isMzLassoSelectionActive = store.getters.isMzLassoSelectionActive;
    store.commit('MZLIST_UPDATE_HIGHLIGHTED_MZ', n.mzs);
    const newNodes = store.getters.networkNodeTrixNewElements.newNodes;
    if (!n.selected) {
      const nodeIndex = newNodes.findIndex(node => node.name === n.name);
      NetworkService.changeSelectedStatusNodeTrixNodes(
        newNodes,
        nodeIndex,
        true
      );
      if (!isMzLassoSelectionActive) {
        d3.select('#matrix-nodes')
          .selectAll(`[orgName='${n.name}']`)
          .transition()
          .duration(250)
          .attr('rx', 0)
          .attr('ry', 0)
          .attrTween('transform', NetworkService.simple90DegreeRotation)
          .on('end', function() {
            d3.select(this)
              .attr('transform', null)
              .attr('active', 'true');
          });
      }
    }

    for (let i = 0; i < newNodes.length / 4; i++) {
      if (newNodes[i].name === n.name) {
        continue;
      }
      this.clearHighlightNodeTrixNode(newNodes, i);
    }
    for (let i = 0; i < store.getters.networkNodes.length; i++) {
      if (store.getters.networkNodes[i]['selected']) {
        store.getters.networkNodes[i]['selected'] = false;
        if (!isMzLassoSelectionActive) {
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
              d3.select(this)
                .attr('transform', null)
                .attr('active', 'false');
            });
        }
      }
    }
  }

  resetNodeTrix(nodes, edges) {
    d3.select('#nodeTrix-container').remove();
    d3.select('#gradient-container').remove();
    store.getters.networkNodeTrixNewElements.newEdges = [];
    store.getters.networkNodeTrixNewElements.newNodes = [];
    store.getters.networkNodeTrixNewElements.nodeTrixNode = null;
    const hiddenNodes = store.getters.networkNodeTrixOldElements.oldNodes;
    this.filterNodesForResetNodeTrix(
      store.getters.getGraph,
      nodes,
      hiddenNodes
    );
    const newNodes = hiddenNodes.splice(0, hiddenNodes.length);
    const newEdges = this.computeEdgesForResetNodeTrix(
      store.getters.getGraph,
      nodes,
      newNodes
    );
    NetworkService.removeDuplicatedEdges(newEdges);
    nodes.push(...newNodes);
    edges.push(...newEdges);
    this.addNodes(newNodes, newEdges);
  }

  computeEdgesForResetNodeTrix(graph, visibleNodes, hiddenNodes) {
    const newEdges = [];
    for (let i = 0; i < hiddenNodes.length; i++) {
      const currentNodeHierarchy = NetworkService.hierarchyOfNodeName(
        hiddenNodes[i].name
      );
      for (const node of visibleNodes.concat(
        NetworkService.spliceToNewArray(hiddenNodes, i)
      )) {
        const nodeHierarchy = NetworkService.hierarchyOfNodeName(node.name);
        let hierarchyCounter = 1;
        // hierarchy of current node is less than hierarchy of next node
        if (nodeHierarchy < currentNodeHierarchy) {
          let childs = [...node.childs];
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const investigatesNodePrefix =
              'h' + (nodeHierarchy + hierarchyCounter) + 'n';
            // hierarchy of current node is still less than hierarchy of next node
            // go one hierarchy deeper
            if (nodeHierarchy + hierarchyCounter < currentNodeHierarchy) {
              childs = childs.map(c => {
                return graph['hierarchy' + (nodeHierarchy + hierarchyCounter)]
                  .nodes[investigatesNodePrefix + c].childs;
              });
              childs = childs.flat();
              hierarchyCounter++;
            } else {
              // current hierarchy is equal with hierarchy of nextNode
              let hit = false;
              const edgeKeys = Object.keys(
                graph['hierarchy' + currentNodeHierarchy]['edges']
              );
              for (const l of edgeKeys) {
                if (hit) break;
                // search all edges where source or target is nextNode
                if (
                  graph['hierarchy' + currentNodeHierarchy]['edges'][l]
                    .target === hiddenNodes[i].name ||
                  graph['hierarchy' + currentNodeHierarchy]['edges'][l]
                    .source === hiddenNodes[i].name
                ) {
                  for (const c of childs) {
                    // search all edges where source or target is a child of current node in current hierarchy
                    if (
                      graph['hierarchy' + currentNodeHierarchy]['edges'][l]
                        .target ===
                        investigatesNodePrefix + c ||
                      graph['hierarchy' + currentNodeHierarchy]['edges'][l]
                        .source ===
                        investigatesNodePrefix + c
                    ) {
                      /// draw hybrid edge
                      newEdges.push({
                        source: node,
                        target: hiddenNodes[i],
                        name: 'edge' + this.hybridEdgeCounter,
                        weight: 0.1,
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
        } else if (nodeHierarchy > currentNodeHierarchy) {
          let childs = [...hiddenNodes[i].childs];
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const investigatesNodePrefix =
              'h' + (currentNodeHierarchy + hierarchyCounter) + 'n';
            // hierarchy of nextNode is still less than hierarchy of current node
            // go one hierarchy deeper
            if (currentNodeHierarchy + hierarchyCounter < nodeHierarchy) {
              childs = childs.map(c => {
                return graph[
                  'hierarchy' + (currentNodeHierarchy + hierarchyCounter)
                ].nodes[investigatesNodePrefix + c].childs;
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
                        target: hiddenNodes[i],
                        name: 'edge' + this.hybridEdgeCounter,
                        weight: 0.1,
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
        } else if (nodeHierarchy === currentNodeHierarchy) {
          Object.keys(graph['hierarchy' + currentNodeHierarchy].edges).forEach(
            l => {
              const currentEdge =
                graph['hierarchy' + currentNodeHierarchy].edges[l];
              if (
                currentEdge.source === hiddenNodes[i].name &&
                currentEdge.target === node.name
              ) {
                newEdges.push({
                  source: hiddenNodes[i],
                  target: node,
                  name: currentEdge.name,
                  weight: currentEdge.weight,
                });
              } else if (
                currentEdge.target === hiddenNodes[i].name &&
                currentEdge.source === node.name
              ) {
                newEdges.push({
                  source: node,
                  target: hiddenNodes[i],
                  name: currentEdge.name,
                  weight: currentEdge.weight,
                });
              }
            }
          );
        }
      }
    }
    NetworkService.removeDuplicatedEdges(newEdges);
    return newEdges;
  }

  static spliceToNewArray(array, index) {
    const newArray = [...array];
    newArray.splice(index, 1);
    return newArray;
  }

  static removeDuplicatedEdges(edges) {
    edges.sort((a, b) => {
      if (a.source.name === b.source.name) {
        return a.target.name > b.target.name ? 1 : -1;
      } else {
        return a.source.name > b.source.name ? 1 : -1;
      }
    });
    edges.forEach((edge, index) => {
      while (
        edges[index + 1] != null &&
        edge.source.name === edges[index + 1].source.name &&
        edge.target.name === edges[index + 1].target.name
      ) {
        edges.splice(index + 1, 1);
      }
    });
  }

  filterNodesForResetNodeTrix(graph, visibleNodes, hiddenNodes) {
    const visibleHigherNodes = visibleNodes.filter(node => {
      return (
        store.getters.meta.maxHierarchy >
        NetworkService.hierarchyOfNodeName(node.name)
      );
    });
    for (let i = hiddenNodes.length - 1; i >= 0; i--) {
      const nodeHierarchy = NetworkService.hierarchyOfNodeName(
        hiddenNodes[i].name
      );
      let parent = 'h' + (nodeHierarchy - 1) + 'n' + hiddenNodes[i].parent;
      for (
        let hierarchyCounter = 1;
        hierarchyCounter <= nodeHierarchy;
        hierarchyCounter++
      ) {
        const nodeIndex = visibleHigherNodes.findIndex(n => n.name === parent);
        const nodeIndex2 = hiddenNodes.findIndex(n => n.name === parent);
        if (nodeIndex > -1 || nodeIndex2 > -1) {
          hiddenNodes.splice(i, 1);
          break;
        }
        parent =
          'h' +
          (nodeHierarchy - hierarchyCounter - 1) +
          'n' +
          graph['hierarchy' + (nodeHierarchy - hierarchyCounter)].nodes[parent]
            .membership;
      }
    }
  }

  nodeTrixMouseInContainer(colorScale) {
    d3.select('#gradient-container')
      .append('g')
      .attr('id', 'gradient-annotation-group')
      .style('pointer-events', 'none');
    const container = d3.select('#nodeTrix-container');
    container
      .append('g')
      .attr('id', 'nodeTrix-annotation-group')
      .style('pointer-events', 'none');
    container
      .selectAll('rect')
      .attr('fill', n =>
        d3
          .color(n.radius != null ? n.color : colorScale(n.weight))
          .darker(this.darkCoefficient)
          .toString()
      )
      .attr('stroke', n =>
        n.radius != null
          ? null
          : d3
              .color(colorScale(n.weight))
              .darker(this.darkCoefficient)
              .toString()
      );
  }

  nodeTrixMouseOutContainer(colorScale) {
    d3.select('#gradient-annotation-group').remove();
    const container = d3.select('#nodeTrix-container');
    container.select('#nodeTrix-annotation-group').remove();
    container
      .selectAll('rect')
      .attr('fill', n => (n.radius != null ? n.color : colorScale(n.weight)))
      .attr('stroke', n => (n.radius != null ? null : colorScale(n.weight)));
  }

  nodeTrixMouseInCell(n, colorScale) {
    if (n.weight > 0) {
      const annotations = [
        {
          note: {
            label: n.weight.toFixed(2),
            // create a newline whenever you read this symbol
            wrapSplitter: '\n',
          },
          x:
            this.gradientScale.x +
            this.gradientScale.linearScaler(n.weight) *
              this.gradientScale.width,
          y: this.gradientScale.y + this.gradientScale.height,
          dx: 0,
          dy: 30,
          color: this.annotationColor,
          type: d3annotate.annotationCalloutElbow,
        },
      ];

      d3.select('#gradient-annotation-group').call(
        d3annotate.annotation().annotations(annotations)
      );
    }

    const container = d3.select('#nodeTrix-container');
    const annotations = [];
    if (n.column <= n.row) {
      const bottom = d3
        .select('#matrix-nodes')
        .selectAll(`[column='${n.column}']`)
        .data()[0];
      const left = d3
        .select('#matrix-nodes')
        .selectAll(`[row='${n.row}']`)
        .data()[0];
      annotations.push({
        note: {
          label: 'mz Value: ' + bottom.mzs[0] + '\n' + bottom.name,
          // create a newline whenever you read this symbol
          wrapSplitter: '\n',
        },
        subject: {
          radius: bottom.radius + 5,
        },
        x: bottom.x,
        y: bottom.y,
        dx: bottom.radius + 20,
        dy: bottom.radius + 20,
        color: this.annotationColor,
        type: d3annotate.annotationCalloutCircle,
      });
      annotations.push({
        note: {
          label: 'mz Value: ' + left.mzs[0] + '\n' + left.name,
          // create a newline whenever you read this symbol
          wrapSplitter: '\n',
        },
        subject: {
          radius: left.radius + 5,
        },
        x: left.x,
        y: left.y,
        dx: -(left.radius + 20),
        dy: -(left.radius + 20),
        color: this.annotationColor,
        type: d3annotate.annotationCalloutCircle,
      });
    } else {
      const top = d3
        .select('#matrix-nodes')
        .selectAll(`[column='${n.column}']`)
        .data()[1];
      const right = d3
        .select('#matrix-nodes')
        .selectAll(`[row='${n.row}']`)
        .data()[1];
      annotations.push({
        note: {
          label: 'mz Value: ' + right.mzs[0] + '\n' + right.name,
          // create a newline whenever you read this symbol
          wrapSplitter: '\n',
        },
        subject: {
          radius: right.radius + 5,
        },
        x: right.x,
        y: right.y,
        dx: right.radius + 20,
        dy: right.radius + 20,
        color: this.annotationColor,
        type: d3annotate.annotationCalloutCircle,
      });
      annotations.push({
        note: {
          label: 'mz Value: ' + top.mzs[0] + '\n' + top.name,
          // create a newline whenever you read this symbol
          wrapSplitter: '\n',
        },
        subject: {
          radius: top.radius + 5,
        },
        x: top.x,
        y: top.y,
        dx: -(top.radius + 20),
        dy: -(top.radius + 20),
        color: this.annotationColor,
        type: d3annotate.annotationCalloutCircle,
      });
    }
    d3.select('#nodeTrix-annotation-group').call(
      d3annotate.annotation().annotations(annotations)
    );
    container
      .selectAll(`[row='${n.row}']`)
      .filter(d => {
        if (n.row > n.column) {
          return d.column <= n.column;
        } else {
          return d.column >= n.column;
        }
      })
      .attr('stroke', n => (n.radius != null ? null : 'white'))
      .attr('fill', n => (n.radius != null ? n.color : colorScale(n.weight)));
    container
      .selectAll(`[row='${n.column}']`)
      .filter(d => {
        if (n.row > n.column) {
          return d.column >= n.row;
        } else {
          return d.column <= n.row;
        }
      })
      .attr('stroke', n => (n.radius != null ? null : 'white'))
      .attr('fill', n => (n.radius != null ? n.color : colorScale(n.weight)));
    container
      .selectAll(`[column='${n.column}']`)
      .filter(d => {
        if (n.row > n.column) {
          return d.row >= n.row;
        } else {
          return d.row <= n.row;
        }
      })
      .attr('stroke', n => (n.radius != null ? null : 'white'))
      .attr('fill', n => (n.radius != null ? n.color : colorScale(n.weight)));
    container
      .selectAll(`[column='${n.row}']`)
      .filter(d => {
        if (n.row > n.column) {
          return d.row <= n.column;
        } else {
          return d.row >= n.column;
        }
      })
      .attr('stroke', n => (n.radius != null ? null : 'white'))
      .attr('fill', n => (n.radius != null ? n.color : colorScale(n.weight)));
  }

  nodeTrixMouseOutCell(n, colorScale) {
    d3.select('#gradient-container')
      .select('.annotations')
      .remove();
    const container = d3.select('#nodeTrix-container');
    container.select('.annotations').remove();
    container
      .selectAll(`[row='${n.row}']`)
      .attr('stroke', n =>
        n.radius != null
          ? null
          : d3
              .color(colorScale(n.weight))
              .darker(this.darkCoefficient)
              .toString()
      )
      .attr('fill', n =>
        d3
          .color(n.radius != null ? n.color : colorScale(n.weight))
          .darker(this.darkCoefficient)
          .toString()
      );
    container
      .selectAll(`[row='${n.column}']`)
      .attr('stroke', n =>
        n.radius != null
          ? null
          : d3
              .color(colorScale(n.weight))
              .darker(this.darkCoefficient)
              .toString()
      )
      .attr('fill', n =>
        d3
          .color(n.radius != null ? n.color : colorScale(n.weight))
          .darker(this.darkCoefficient)
          .toString()
      );
    container
      .selectAll(`[column='${n.column}']`)
      .attr('stroke', n =>
        n.radius != null
          ? null
          : d3
              .color(colorScale(n.weight))
              .darker(this.darkCoefficient)
              .toString()
      )
      .attr('fill', n =>
        d3
          .color(n.radius != null ? n.color : colorScale(n.weight))
          .darker(this.darkCoefficient)
          .toString()
      );

    container
      .selectAll(`[column='${n.row}']`)
      .attr('stroke', n =>
        n.radius != null
          ? null
          : d3
              .color(colorScale(n.weight))
              .darker(this.darkCoefficient)
              .toString()
      )
      .attr('fill', n =>
        d3
          .color(n.radius != null ? n.color : colorScale(n.weight))
          .darker(this.darkCoefficient)
          .toString()
      );
  }

  computeColorScale(colorScaleString, minWeight = 0, maxWeight = 1) {
    const linearScale = d3
      .scaleLinear()
      .domain([minWeight, maxWeight])
      .range([0.2, 1]);
    const colorScale = d3.scaleSequential(d3[colorScaleString]);
    this.gradientScale.minWeight = minWeight;
    this.gradientScale.maxWeight = maxWeight;
    this.gradientScale.linearScaler = d3
      .scaleLinear()
      .domain([minWeight, maxWeight])
      .range([0, 1]);
    return t => (t > 0 ? colorScale(linearScale(t)) : colorScale(t));
  }

  computeGradient(colorScale, ticks = 15) {
    let linearGradient = d3
      .select('#gradient-container')
      .append('defs')
      .append('linearGradient')
      .attr('id', 'linear-gradient');

    const delta =
      (this.gradientScale.maxWeight - this.gradientScale.minWeight) / ticks;
    let counter = this.gradientScale.minWeight;
    for (let j = 0; j <= ticks; j++) {
      linearGradient
        .append('stop')
        .attr('offset', (j * 100) / ticks + '%')
        .attr('stop-color', colorScale(counter));
      counter = counter + delta;
    }
  }

  static findMinMaxWeight(edges) {
    let minWeight = 1;
    let maxWeight = 0;
    for (const edgeKey of Object.keys(edges)) {
      if (edges[edgeKey].weight < minWeight) {
        minWeight = edges[edgeKey].weight;
      }
      if (edges[edgeKey].weight > maxWeight) {
        maxWeight = edges[edgeKey].weight;
      }
    }
    return [minWeight, maxWeight];
  }

  redrawNodeTrix(colorScale) {
    const container = d3.select('#matrix');
    if (container.empty()) {
      return;
    }

    d3.select('#linear-gradient').remove();
    this.computeGradient(colorScale);

    d3.select('#color-gradient').attr('fill', 'url(#linear-gradient)');

    container
      .on('mouseenter', () => {
        this.nodeTrixMouseInContainer(colorScale);
      })
      .on('mouseleave', () => {
        this.nodeTrixMouseOutContainer(colorScale);
      });
    container
      .selectAll('.nodeTrixCell')
      .attr('stroke', n => colorScale(n.weight))
      .attr('fill', n => colorScale(n.weight))
      .on('mouseenter', n => {
        this.nodeTrixMouseInCell(n, colorScale);
      })
      .on('mouseleave', n => {
        this.nodeTrixMouseOutCell(n, colorScale);
      });
  }

  nodeClick(n) {
    store.commit('CLEAR_IMAGES');
    let isMzLassoSelectionActive = store.getters.isMzLassoSelectionActive;
    if (
      (d3.event.ctrlKey || d3.event.metaKey) &&
      d3.event.shiftKey &&
      !isMzLassoSelectionActive
    ) {
      store.commit('NETWORK_SHRINK_NODE', n);
    } else if (
      (d3.event.ctrlKey || d3.event.metaKey) &&
      !isMzLassoSelectionActive
    ) {
      store.commit('NETWORK_EXPAND_NODE', n);
    } else {
      if (!isMzLassoSelectionActive) {
        NetworkService.clearHighlightNodeTrixNodes();
      }
      for (let i = 0; i < store.getters.networkNodes.length; i++) {
        if (store.getters.networkNodes[i].name === n.name) {
          store.commit('MZLIST_UPDATE_HIGHLIGHTED_MZ', n.mzs);
          if (!n.selected) {
            n.selected = true;
            if (!isMzLassoSelectionActive) {
              d3.select('#' + n.name)
                .transition()
                .duration(250)
                .attr('rx', 0)
                .attrTween('transform', NetworkService.simple90DegreeRotation)
                .attr('ry', 0)
                .on('end', function() {
                  d3.select(this)
                    .attr('transform', null)
                    .attr('active', 'true');
                });
            }
          }
        } else {
          if (store.getters.networkNodes[i]['selected']) {
            store.getters.networkNodes[i]['selected'] = false;
            if (!isMzLassoSelectionActive) {
              d3.select('#' + store.getters.networkNodes[i].name)
                .transition()
                .duration(250)
                .attr('rx', store.getters.networkNodes[i].radius)
                .attr('ry', store.getters.networkNodes[i].radius)
                .attrTween(
                  'transform',
                  NetworkService.simpleNegative90DegreeRotation
                )
                .on('end', function() {
                  d3.select(this)
                    .attr('transform', null)
                    .attr('active', 'false');
                });
            }
          }
        }
      }
    }

    store.commit('IMAGE_DATA_UPDATE_FROM_SELECTED_NODES');
  }

  shrinkNode(graph, oldNode, nodes, edges) {
    d3.select('#node-annotation-group').remove();
    const previousHierarchy =
      NetworkService.hierarchyOfNodeName(oldNode.name) - 1;
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
        const nodeHierarchy = NetworkService.hierarchyOfNodeName(nodes[i].name);
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

    NetworkService.removeEdgesFromNodes(edges, nodesToRemove);

    const newEdges = [];

    // hybrid edges
    // go through all nodes
    for (const node of nodes) {
      const nodeHierarchy = NetworkService.hierarchyOfNodeName(node.name);
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
            childs = childs.map(c => {
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
                      weight: 0.1,
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
                      weight: 0.1,
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
            weight: graph['hierarchy' + previousHierarchy].edges[l]['weight'],
          });
        }
      }
    });
    NetworkService.removeDuplicatedEdges(newEdges);
    edges.push(...newEdges);

    // if nodeTrix is active, update the edges to the border of the matrix
    if (store.getters.networkNodeTrixNewElements.newNodes.length > 0) {
      const oldEdges = NetworkService.removeEdgesFromNodes(
        store.getters.networkNodeTrixNewElements.newEdges,
        nodesToRemove
      );
      const newNodeTrixEdges = [];
      for (const e of oldEdges) {
        if (
          newNodeTrixEdges.findIndex(
            edge =>
              e.source.name === edge.source.name &&
              e.target.name === edge.target.name
          ) === -1
        ) {
          newNodeTrixEdges.push({
            source: e.source,
            target: nextNode,
            name: 'edge' + this.hybridEdgeCounter,
            weight: 0.1,
          });
          this.hybridEdgeCounter += 1;
        }
      }
      NetworkService.removeDuplicatedEdges(newNodeTrixEdges);
      store.getters.networkNodeTrixNewElements.newEdges.push(
        ...newNodeTrixEdges
      );
      d3.select('#nodeTrix-edges')
        .selectAll('newEdges')
        .data(newNodeTrixEdges)
        .enter()
        .append('line')
        .attr('class', 'edge')
        .attr('id', l => l.name)
        .attr('stroke-dasharray', 4)
        .attr('stroke', this.hybridEdgeColor);
    }
    this.addNodes([nextNode], newEdges);
  }

  expandNode(graph, oldNode, nodes, edges) {
    const index = nodes.findIndex(d => d.name === oldNode.name);

    // remove old node from datastructure and svg
    nodes.splice(index, 1);
    d3.select('#node-annotation-group').remove();
    d3.select('#' + oldNode.name).remove();
    const newNodes = [];
    const nextHierarchy = NetworkService.hierarchyOfNodeName(oldNode.name) + 1;
    const maxH = store.getters.meta.maxHierarchy;

    const forbiddenNodeIndices = [];

    for (const name of store.getters.networkNodeTrixNewElements.newNodes.map(
      n => n.name
    )) {
      forbiddenNodeIndices.push(parseInt(name.split('n')[1], 10));
    }

    // add nodes to datastructure
    for (let child of oldNode.childs) {
      if (forbiddenNodeIndices.includes(child)) {
        continue;
      }
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
    NetworkService.removeEdgesFromNodes(edges, [oldNode.name]);

    const newEdges = [];

    // hybrid edges
    // go through all nodes
    for (const node of nodes) {
      const nodeHierarchy = NetworkService.hierarchyOfNodeName(node.name);
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
                        weight: 0.1,
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
              childs = childs.map(c => {
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
                        weight: 0.1,
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
            weight: graph['hierarchy' + nextHierarchy].edges[l]['weight'],
          });
        }
      }
    });
    NetworkService.removeDuplicatedEdges(newEdges);
    edges.push(...newEdges);

    if (store.getters.networkNodeTrixNewElements.newNodes.length > 0) {
      const oldEdges = NetworkService.removeEdgesFromNodes(
        store.getters.networkNodeTrixNewElements.newEdges,
        [oldNode.name]
      );
      const deepestHierarchy = store.getters.meta.maxHierarchy;
      if (oldEdges.length > 0) {
        const newNodeTrixEdges = [];
        const borderNodes = oldEdges.map(e => e.source);
        if (nextHierarchy < deepestHierarchy) {
          // hybrid edges
          for (const node of newNodes) {
            let hierarchyCounter = 1;
            let childs = [...node.childs];
            // eslint-disable-next-line no-constant-condition
            while (true) {
              // hierarchy of current node is still less than hierarchy of newNodes
              // go one hierarchy deeper
              const investigatesNodePrefix =
                'h' + (nextHierarchy + hierarchyCounter) + 'n';
              if (nextHierarchy + hierarchyCounter < deepestHierarchy) {
                childs = childs.map(c => {
                  return graph['hierarchy' + (nextHierarchy + hierarchyCounter)]
                    .nodes[investigatesNodePrefix + c].childs;
                });
                childs = childs.flat();
                hierarchyCounter++;
              } else {
                // current hierarchy is equal with hierarchy of newNodes
                const edgeKeys = Object.keys(
                  graph['hierarchy' + deepestHierarchy]['edges']
                );
                for (const l of edgeKeys) {
                  for (const deepNode of borderNodes) {
                    // search all edges where source or target is a newNode
                    if (
                      graph['hierarchy' + deepestHierarchy]['edges'][l]
                        .target === deepNode.name ||
                      graph['hierarchy' + deepestHierarchy]['edges'][l]
                        .source === deepNode.name
                    ) {
                      for (const c of childs) {
                        if (forbiddenNodeIndices.includes(c)) {
                          continue;
                        }
                        // search all edges where source or target is a child of current node in current hierarchy
                        if (
                          graph['hierarchy' + deepestHierarchy]['edges'][l]
                            .target ===
                            investigatesNodePrefix + c ||
                          graph['hierarchy' + deepestHierarchy]['edges'][l]
                            .source ===
                            investigatesNodePrefix + c
                        ) {
                          newNodeTrixEdges.push({
                            source: deepNode,
                            target: node,
                            name: 'edge' + this.hybridEdgeCounter,
                            weight: 0.1,
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
          }
        } else {
          // normal edges to border nodes
          Object.keys(graph['hierarchy' + deepestHierarchy]['edges']).forEach(
            l => {
              let sourceIndex = borderNodes.findIndex(node => {
                return (
                  node.name ===
                  graph['hierarchy' + deepestHierarchy]['edges'][l].source
                );
              });
              if (sourceIndex >= 0) {
                const targetIndex = newNodes.findIndex(d => {
                  return (
                    d.name ===
                    graph['hierarchy' + deepestHierarchy]['edges'][l].target
                  );
                });
                if (targetIndex >= 0) {
                  newNodeTrixEdges.push({
                    source: borderNodes[sourceIndex],
                    target: newNodes[targetIndex],
                    name:
                      graph['hierarchy' + deepestHierarchy].edges[l]['name'],
                    weight:
                      graph['hierarchy' + deepestHierarchy].edges[l]['weight'],
                  });
                }
              } else {
                sourceIndex = newNodes.findIndex(d => {
                  return (
                    d.name ===
                    graph['hierarchy' + deepestHierarchy]['edges'][l].source
                  );
                });
                if (sourceIndex >= 0) {
                  const targetIndex = borderNodes.findIndex(d => {
                    return (
                      d.name ===
                      graph['hierarchy' + deepestHierarchy]['edges'][l].target
                    );
                  });
                  if (targetIndex >= 0) {
                    newNodeTrixEdges.push({
                      source: borderNodes[targetIndex],
                      target: newNodes[sourceIndex],
                      name:
                        graph['hierarchy' + deepestHierarchy].edges[l]['name'],
                      weight:
                        graph['hierarchy' + deepestHierarchy].edges[l][
                          'weight'
                        ],
                    });
                  }
                }
              }
            }
          );
        }
        NetworkService.removeDuplicatedEdges(newNodeTrixEdges);
        store.getters.networkNodeTrixNewElements.newEdges.push(
          ...newNodeTrixEdges
        );
        d3.select('#nodeTrix-edges')
          .selectAll('newEdges')
          .data(newNodeTrixEdges)
          .enter()
          .append('line')
          .attr('class', 'edge')
          .attr('id', l => l.name)
          .attr('stroke-dasharray', l => (l.name.startsWith('edge') ? 4 : 0))
          .attr('stroke', l =>
            l.name.startsWith('edge')
              ? this.hybridEdgeColor
              : this.normalEdgeColor
          );
      }
    }

    this.addNodes(newNodes, newEdges);
  }

  highlightNodesByName(nodes, nodeNames) {
    this.clearHighlight(nodes);
    for (let i = 0; i < nodes.length; i++) {
      const nodeNamesIndex = nodeNames.indexOf(nodes[i].name);
      if (nodeNamesIndex >= 0) {
        nodeNames.splice(nodeNamesIndex, 1);
        this.highlightNode(nodes[i]);
        if (nodeNames.length === 0) {
          break;
        }
      }
    }
    if (store.getters.networkNodeTrixActive) {
      NetworkService.clearHighlightNodeTrixNodes();
      const nodeTrixNodes = store.getters.networkNodeTrixNewElements.newNodes;
      for (let i = 0; i < nodeTrixNodes.length / 4; i++) {
        if (nodeNames.length === 0) {
          break;
        }
        const nodeNamesIndex = nodeNames.indexOf(nodeTrixNodes[i].name);
        if (nodeNamesIndex >= 0) {
          nodeNames.splice(nodeNamesIndex, 1);
          this.highlightNodeTrixNode(nodeTrixNodes, i);
        }
      }
    }
  }

  highlightNodesByMz(nodes, mzValuesStrings) {
    let mzValuesFloats = mzValuesStrings.map(mz => parseFloat(mz));
    if (mzValuesFloats.length > 0) {
      const nodeTrixNodes = store.getters.networkNodeTrixNewElements.newNodes;
      const quarterLength = nodeTrixNodes.length / 4;
      for (let i = 0; i < quarterLength; i++) {
        let hit = false;
        for (let j = 0; j < mzValuesFloats.length; j++) {
          if (nodeTrixNodes[i].mzs[0] === mzValuesFloats[j]) {
            // remove all mz values in the array which are from the current node
            mzValuesFloats.splice(j, 1);
            hit = true;
            break;
          }
        }
        if (hit) {
          this.highlightNodeTrixNode(nodeTrixNodes, i);
        } else {
          this.clearHighlightNodeTrixNode(nodeTrixNodes, i);
        }
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      let hit = false;
      for (let j = 0; j < mzValuesFloats.length; j++) {
        if (nodes[i].mzs.findIndex(mz => mz === mzValuesFloats[j]) > -1) {
          // remove all mz values in the array which are from the current node
          mzValuesFloats.splice(j, 1);
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
            .attrTween(
              'transform',
              NetworkService.simpleNegative90DegreeRotation
            )
            .on('end', function() {
              d3.select(this)
                .attr('transform', null)
                .attr('active', 'false');
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
        .ease(function(t) {
          // quadratic easing
          return d3.easePolyIn(t, 2);
        })
        .attr('rx', node.radius * 0.5)
        .attr('ry', node.radius * 0.5)
        .attrTween('transform', NetworkService.growingRotation.bind(this));

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
        .attrTween('transform', NetworkService.shrinkingRotation.bind(this))
        .on('end', function() {
          d3.select(this)
            .attr('transform', null)
            .attr('active', 'true');
        });
    }
  }

  highlightNodeTrixNode(nodes, index) {
    if (!nodes[index].selected) {
      NetworkService.changeSelectedStatusNodeTrixNodes(nodes, index, true);
      const selection = d3
        .select('#matrix-nodes')
        .selectAll(`[orgName='${nodes[index].name}']`);
      selection
        .transition()
        .duration(250)
        .ease(function(t) {
          // quadratic easing
          return d3.easePolyIn(t, 2);
        })
        .attr('rx', n => n.radius * 0.5)
        .attr('ry', n => n.radius * 0.5)
        .attrTween('transform', NetworkService.growingRotation.bind(this));

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
        .attrTween('transform', NetworkService.shrinkingRotation.bind(this))
        .on('end', function() {
          d3.select(this)
            .attr('transform', null)
            .attr('active', 'true');
        });
    }
  }

  clearHighlightNodeTrixNode(nodes, index) {
    if (nodes[index].selected) {
      NetworkService.changeSelectedStatusNodeTrixNodes(nodes, index, false);
      if (!store.getters.isMzLassoSelectionActive) {
        d3.select('#matrix-nodes')
          .selectAll(`[orgName='${nodes[index].name}']`)
          .transition()
          .duration(250)
          .attr('rx', nodes[index].radius)
          .attr('ry', nodes[index].radius)
          .attrTween('transform', NetworkService.simpleNegative90DegreeRotation)
          .on('end', function() {
            d3.select(this)
              .attr('transform', null)
              .attr('active', 'false');
          });
      }
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
          .attrTween('transform', NetworkService.simpleNegative90DegreeRotation)
          .on('end', function() {
            d3.select(this)
              .attr('transform', null)
              .attr('class', 'node')
              .attr('active', 'false');
          });
      }
    }
  }

  static clearHighlightNodeTrixNodes() {
    const newNodes = store.getters.networkNodeTrixNewElements.newNodes;
    if (newNodes.length > 0) {
      const quarterLength = newNodes.length / 4;
      for (let i = 0; i < quarterLength; i++) {
        if (newNodes[i].selected) {
          NetworkService.changeSelectedStatusNodeTrixNodes(newNodes, i, false);
          d3.select('#matrix-nodes')
            .selectAll(`[orgName='${newNodes[i].name}']`)
            .transition()
            .duration(250)
            .attr('rx', newNodes[i].radius)
            .attr('ry', newNodes[i].radius)
            .attrTween(
              'transform',
              NetworkService.simpleNegative90DegreeRotation
            )
            .on('end', function() {
              d3.select(this)
                .attr('transform', null)
                .attr('active', 'false');
            });
        }
      }
    }
  }

  static getSelectedNodes(nodes, removeNodes) {
    let nodesSelected = [];
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].selected) {
        nodesSelected.push(_.cloneDeep(nodes[i]));
        if (removeNodes) {
          nodesSelected[nodesSelected.length - 1].selected = false;
          nodes.splice(i, 1);
        }
      }
    }
    return nodesSelected;
  }

  static getSelectedNodeTrixNodes() {
    const nodesSelected = [];
    const nodeTrixNodes = store.getters.networkNodeTrixNewElements.newNodes;
    for (let i = 0; i < nodeTrixNodes.length / 4; i++) {
      if (nodeTrixNodes[i].selected) {
        nodesSelected.push(_.cloneDeep(nodeTrixNodes[i]));
      }
    }
    return nodesSelected;
  }

  static getParentNodeFromNode(node, graph) {
    if (node.parent) {
      const nodeHierarchy = NetworkService.hierarchyOfNodeName(node.name);
      const nodeParent = 'h' + (nodeHierarchy - 1) + 'n' + node.parent;
      return graph['hierarchy' + (nodeHierarchy - 1)].nodes[nodeParent];
    } else if (node.membership) {
      const nodeHierarchy = NetworkService.hierarchyOfNodeName(node.name);
      const nodeParent = 'h' + (nodeHierarchy - 1) + 'n' + node.membership;
      return graph['hierarchy' + (nodeHierarchy - 1)].nodes[nodeParent];
    } else {
      return null;
    }
  }

  static getRootParentNodeFromNode(node, graph) {
    let lastParent = null;
    let parent = node;
    do {
      lastParent = parent;
      parent = NetworkService.getParentNodeFromNode(parent, graph);
    } while (parent !== null);
    return lastParent;
  }

  addNodes(nodes, edges) {
    // add new edges to svg
    d3.select('#link-container')
      .selectAll('newEdges')
      .data(edges)
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
      .data(nodes)
      .enter()
      .append('rect')
      .attr('class', 'node')
      .attr('rx', n => (n.selected ? 0 : n.radius))
      .attr('id', n => n.name)
      .attr('ry', n => (n.selected ? 0 : n.radius))
      .attr('width', n => 2 * n.radius)
      .attr('height', n => 2 * n.radius)
      .attr('cursor', 'grab')
      .attr('fill', n => n.color)
      .attr('numMz', n => n.mzs)
      .attr('childs', n => n.childs)
      .on('click', this.nodeClick)
      .on('mouseover', this.mouseOver.bind(this))
      .on('mouseout', NetworkService.mouseOut)
      .call(
        d3
          .drag()
          .on('start', this.dragstarted)
          .on('drag', this.dragged)
          .on('end', NetworkService.dragEnded)
      );
    store.getters.networkSVGElements.nodeElements = d3
      .select('#node-container')
      .selectAll('rect');
    store.commit('NETWORK_SIMULATION_INIT');
  }

  static removeEdgesFromNodes(edges, nodeNames) {
    const removedEdges = [];
    for (let i = edges.length - 1; i >= 0; i--) {
      if (
        nodeNames.findIndex(name => name === edges[i].source.name) >= 0 ||
        nodeNames.findIndex(name => name === edges[i].target.name) >= 0
      ) {
        d3.select('#' + edges[i].name).remove();
        removedEdges.push(...edges.splice(i, 1));
      }
    }
    return removedEdges;
  }

  static changeSelectedStatusNodeTrixNodes(nodes, index, selected) {
    const quarterLength = nodes.length / 4;
    nodes[index].selected = selected;
    nodes[quarterLength + index].selected = selected;
    nodes[quarterLength + index + 1].selected = selected;
    nodes[quarterLength + index + 2].selected = selected;
  }

  static simple90DegreeRotation(n) {
    return d3.interpolateString(
      'rotate(0 ' + n.x + ' ' + n.y + ')',
      'rotate(90 ' + n.x + ' ' + n.y + ')'
    );
  }

  static simpleNegative90DegreeRotation(n) {
    return d3.interpolateString(
      'rotate(0 ' + n.x + ' ' + n.y + ')',
      'rotate(-90 ' + n.x + ' ' + n.y + ')'
    );
  }

  static growingRotation(node) {
    const scalingConstant = this.biggestNodeRadius + 10;
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
  }

  static shrinkingRotation(node) {
    const scalingConstant = this.biggestNodeRadius + 10;
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
  }

  static getLassoSVGNodes() {
    return d3.select('#graph-container').selectAll('.node');
  }
}
export default NetworkService;
