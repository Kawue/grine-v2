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
      .style('fill', d => d.color)
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
        lasso: this.initLasso(lNode),
      };
    } else {
      return {
        svg: lSvg,
        nodeElements: lNode,
        linkElements: lLink,
        lasso: this.initLasso(lNode),
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
      networkSVG.lasso = this.initLasso(networkSVG.nodeElements);
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

  static lassoEnd() {
    // Reset the color of all dots
    const lasso = store.getters.networkSVGElements.lasso;
    lasso.items().style('fill', n => n.color);

    if (!lasso.selectedItems().empty()) {
      const mzs = lasso
        .selectedItems()
        .data()
        .map(d => d.mzs)
        .flat();

      lasso.selectedItems().attr('class', 'node nodeTrix');
      lasso.notSelectedItems().attr('class', 'node');
      store.commit('CLEAR_IMAGES');
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
      .on('end', NetworkService.lassoEnd);

    svg.call(lasso);
    return lasso;
  }

  computeNodeTrix(graph, nodes, edges, deepestHierarchy, colorScale) {
    if (!d3.select('#nodeTrix-container').empty()) {
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
    oldElements.oldEdges = NetworkService.removeEdgesFromNodes(
      edges,
      sel.map(n => n.name)
    );
    let deepNodes = [];
    // compute nodes of the deepest hierarchy of selected nodes
    for (const node of sel) {
      const nodeHierarchy = parseInt(node.name.split('n')[0].slice(1), 10);
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
    const center = [this.width * 0.5, this.height * 0.5];
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
            });
          }
        }
      }
    });

    // hybrid edges to left border node
    for (const node of nodes) {
      const nodeHierarchy = parseInt(node.name.split('n')[0].slice(1), 10);
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
    store.getters.networkNodeTrixNewElements.newNodes = deepNodes;
    store.getters.networkNodeTrixNewElements.newEdges = newEdges;

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
      .attr('cursor', 'pointer')
      .attr('row', n => n.row)
      .attr('column', n => n.column)
      .attr('width', n => 2 * n.radius)
      .attr('height', n => 2 * n.radius)
      .attr('pos', n => n.position)
      .attr('fill', n => n.color)
      .attr('numMz', n => n.mzs)
      .on('click', this.nodeTrixNodeClick)
      .on('mouseover', this.mouseOverNodeTrixCell.bind(this))
      .on('mouseout', NetworkService.mouseOut);
  }

  nodeTrixNodeClick(n) {
    const isMzLassoSelectionActive = store.getters.isMzLassoSelectionActive;
    store.commit('MZLIST_UPDATE_HIGHLIGHTED_MZ', n.mzs);
    const newNodes = store.getters.networkNodeTrixNewElements.newNodes;
    const quarterLength = newNodes.length / 4;
    if (!n.selected) {
      n.selected = true;
      const nodeIndex = newNodes.findIndex(node => node.name === n.name);
      newNodes[quarterLength + nodeIndex].selected = true;
      newNodes[quarterLength + nodeIndex + 1].selected = true;
      newNodes[quarterLength + nodeIndex + 2].selected = true;
      if (!isMzLassoSelectionActive) {
        d3.select('#matrix-nodes')
          .selectAll(`[orgName='${n.name}']`)
          .transition()
          .duration(250)
          .attr('rx', 0)
          .attr('ry', 0)
          .attrTween('transform', function(node) {
            return d3.interpolateString(
              'rotate(0 ' + node.x + ' ' + node.y + ')',
              'rotate(90 ' + node.x + ' ' + node.y + ')'
            );
          })
          .on('end', function() {
            d3.select(this)
              .attr('transform', null)
              .attr('active', 'true');
          });
      }
    }

    for (let i = 0; i < quarterLength; i++) {
      if (newNodes[i].name === n.name) {
        continue;
      }
      if (newNodes[i].selected) {
        newNodes[i].selected = false;
        newNodes[quarterLength + i].selected = false;
        newNodes[quarterLength + i + 1].selected = false;
        newNodes[quarterLength + i + 2].selected = false;
        if (!isMzLassoSelectionActive) {
          d3.select('#matrix-nodes')
            .selectAll(`[orgName='${newNodes[i].name}']`)
            .transition()
            .duration(250)
            .attr('rx', newNodes[i].radius)
            .attr('ry', newNodes[i].radius)
            .attrTween('transform', function(node) {
              return d3.interpolateString(
                'rotate(0 ' + node.x + ' ' + node.y + ')',
                'rotate(-90 ' + node.x + ' ' + node.y + ')'
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
    const oldElements = store.getters.networkNodeTrixOldElements;
    const newNodes = oldElements.oldNodes.splice(
      0,
      oldElements.oldNodes.length
    );
    const newEdges = oldElements.oldEdges.splice(
      0,
      oldElements.oldEdges.length
    );
    nodes.push(...newNodes);
    edges.push(
      ...newEdges.map(e => {
        e.source = nodes[nodes.findIndex(n => n.name === e.source.name)];
        e.target = nodes[nodes.findIndex(n => n.name === e.target.name)];
        return e;
      })
    );
    this.addNodes(newNodes, newEdges);
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
                .attrTween('transform', function() {
                  return d3.interpolateString(
                    'rotate(0 ' + n.x + ' ' + n.y + ')',
                    'rotate(90 ' + n.x + ' ' + n.y + ')'
                  );
                })
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
    }

    store.commit('IMAGE_DATA_UPDATE_FROM_SELECTED_NODES');
  }

  shrinkNode(graph, oldNode, nodes, edges) {
    d3.select('#node-annotation-group').remove();
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

    NetworkService.removeEdgesFromNodes(edges, nodesToRemove);

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
          });
          this.hybridEdgeCounter += 1;
        }
      }
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

      // update hidden edges
      if (
        NetworkService.removeEdgesFromNodes(
          store.getters.networkNodeTrixOldElements.oldEdges,
          nodesToRemove
        ).length > 0
      ) {
        const updatedOldEdges = [];
        const oldNodes = store.getters.networkNodeTrixOldElements.oldNodes;

        // normal edges
        Object.keys(graph['hierarchy' + previousHierarchy]['edges']).forEach(
          l => {
            if (
              graph['hierarchy' + previousHierarchy]['edges'][l].source ===
              nextNode.name
            ) {
              const targetIndex = oldNodes.findIndex(d => {
                return (
                  d.name ===
                  graph['hierarchy' + previousHierarchy]['edges'][l].target
                );
              });
              if (targetIndex >= 0) {
                updatedOldEdges.push({
                  source: nextNode,
                  target: oldNodes[targetIndex],
                  name: graph['hierarchy' + previousHierarchy].edges[l]['name'],
                });
              }
            } else {
              const sourceIndex = oldNodes.findIndex(d => {
                return (
                  d.name ===
                  graph['hierarchy' + previousHierarchy]['edges'][l].source
                );
              });
              if (sourceIndex >= 0) {
                if (
                  graph['hierarchy' + previousHierarchy]['edges'][l].target ===
                  nextNode.name
                ) {
                  updatedOldEdges.push({
                    source: oldNodes[sourceIndex],
                    target: nextNode,
                    name:
                      graph['hierarchy' + previousHierarchy].edges[l]['name'],
                  });
                }
              }
            }
          }
        );

        // hybrid edges
        for (const node of oldNodes) {
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
                    graph['hierarchy' + previousHierarchy]['edges'][l]
                      .target === nextNode.name ||
                    graph['hierarchy' + previousHierarchy]['edges'][l]
                      .source === nextNode.name
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
                        updatedOldEdges.push({
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
                  return graph[
                    'hierarchy' + (previousHierarchy + hierarchyCounter)
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
                        graph['hierarchy' + nodeHierarchy]['edges'][l]
                          .target ===
                          investigatesNodePrefix + c ||
                        graph['hierarchy' + nodeHierarchy]['edges'][l]
                          .source ===
                          investigatesNodePrefix + c
                      ) {
                        //draw hybrid edge
                        updatedOldEdges.push({
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
        store.getters.networkNodeTrixOldElements.oldEdges.push(
          ...updatedOldEdges
        );
      }
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
    NetworkService.removeEdgesFromNodes(edges, [oldNode.name]);

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
                    });
                  }
                }
              }
            }
          );
        }
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
      // update hidden edges only if there was a hidden edge between the old node and a hidden node
      if (
        NetworkService.removeEdgesFromNodes(
          store.getters.networkNodeTrixOldElements.oldEdges,
          [oldNode.name]
        ).length > 0
      ) {
        // update hidden edges
        const updatedOldEdges = [];
        const oldNodes = store.getters.networkNodeTrixOldElements.oldNodes;

        // normal edges
        Object.keys(graph['hierarchy' + nextHierarchy]['edges']).forEach(l => {
          let sourceIndex = newNodes.findIndex(d => {
            return (
              d.name === graph['hierarchy' + nextHierarchy]['edges'][l].source
            );
          });
          if (sourceIndex >= 0) {
            const targetIndex = oldNodes.findIndex(d => {
              return (
                d.name === graph['hierarchy' + nextHierarchy]['edges'][l].target
              );
            });
            if (targetIndex >= 0) {
              updatedOldEdges.push({
                source: newNodes[sourceIndex],
                target: oldNodes[targetIndex],
                name: graph['hierarchy' + nextHierarchy].edges[l]['name'],
              });
            }
          } else {
            sourceIndex = oldNodes.findIndex(d => {
              return (
                d.name === graph['hierarchy' + nextHierarchy]['edges'][l].source
              );
            });
            if (sourceIndex >= 0) {
              const targetIndex = newNodes.findIndex(d => {
                return (
                  d.name ===
                  graph['hierarchy' + nextHierarchy]['edges'][l].target
                );
              });
              if (targetIndex >= 0) {
                updatedOldEdges.push({
                  source: oldNodes[sourceIndex],
                  target: newNodes[targetIndex],
                  name: graph['hierarchy' + nextHierarchy].edges[l]['name'],
                });
              }
            }
          }
        });

        // hybrid edges
        for (const node of store.getters.networkNodeTrixOldElements.oldNodes) {
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
                          graph['hierarchy' + nextHierarchy]['edges'][l]
                            .target ===
                            investigatesNodePrefix + c ||
                          graph['hierarchy' + nextHierarchy]['edges'][l]
                            .source ===
                            investigatesNodePrefix + c
                        ) {
                          updatedOldEdges.push({
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
                  childs = childs.map(c => {
                    return graph[
                      'hierarchy' + (nextHierarchy + hierarchyCounter)
                    ].nodes[investigatesNodePrefix + c].childs;
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
                          graph['hierarchy' + nodeHierarchy]['edges'][l]
                            .target ===
                            investigatesNodePrefix + c ||
                          graph['hierarchy' + nodeHierarchy]['edges'][l]
                            .source ===
                            investigatesNodePrefix + c
                        ) {
                          // draw hybrid edge
                          updatedOldEdges.push({
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
        store.getters.networkNodeTrixOldElements.oldEdges.push(
          ...updatedOldEdges
        );
      }
    }

    this.addNodes(newNodes, newEdges);
  }

  highlightNodesByName(nodes, nodeNames) {
    this.clearHighlight(nodes);
    this.clearHighlightNodeTrixNodes();
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
          d3.select(this)
            .attr('transform', null)
            .attr('active', 'true');
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
            d3.select(this)
              .attr('transform', null)
              .attr('class', 'node')
              .attr('active', 'false');
          });
      }
    }
  }

  clearHighlightNodeTrixNodes() {
    const newNodes = store.getters.networkNodeTrixNewElements.newNodes;
    if (newNodes.length > 0) {
      const quarterLength = newNodes.length / 4;
      for (let i = 0; i < quarterLength; i++) {
        if (newNodes[i].selected) {
          newNodes[i].selected = false;
          newNodes[quarterLength + i].selected = false;
          newNodes[quarterLength + i + 1].selected = false;
          newNodes[quarterLength + i + 2].selected = false;
          d3.select('#matrix-nodes')
            .selectAll(`[orgName='${newNodes[i].name}']`)
            .transition()
            .duration(250)
            .attr('rx', newNodes[i].radius)
            .attr('ry', newNodes[i].radius)
            .attrTween('transform', function(node) {
              return d3.interpolateString(
                'rotate(0 ' + node.x + ' ' + node.y + ')',
                'rotate(-90 ' + node.x + ' ' + node.y + ')'
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

  static getSelectedNodes(nodes, removeNodes) {
    let nodesSelected = [];
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].selected === true) {
        nodesSelected.push(_.cloneDeep(nodes[i]));
        if (removeNodes) {
          nodesSelected[nodesSelected.length - 1].selected = false;
          nodes.splice(i, 1);
        }
      }
    }
    return nodesSelected;
  }

  static getParentNodeFromNode(node, graph) {
    if (node.parent) {
      const nodeHierarchy = parseInt(node.name.split('n')[0].slice(1), 10);
      const nodeParent = 'h' + (nodeHierarchy - 1) + 'n' + node.parent;
      return graph['hierarchy' + (nodeHierarchy - 1)].nodes[nodeParent];
    } else if (node.membership) {
      const nodeHierarchy = parseInt(node.name.split('n')[0].slice(1), 10);
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
      .style('fill', n => n.color)
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
}
export default NetworkService;
