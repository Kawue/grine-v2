import * as d3 from 'd3';

class NetworkService {
  biggestNodeRadius = 25;
  smallestNodeRadius = 10;

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
