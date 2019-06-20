class NetworkService {
  loadGraph(graph) {
    const tupel = [[], []];
    const nodeNames = Object.keys(graph['hierarchy0'].nodes);
    nodeNames.forEach(nodeKey => {
      tupel[0].push({
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
          childs: graph['hierarchy0'].nodes[nodeKey].childs,
          mzs: graph['hierarchy0'].nodes[nodeKey].mzs,
        },
      });
    });
    Object.keys(graph).forEach(hierarchy => {
      Object.keys(graph[hierarchy]['edges']).forEach(edgeKey => {
        tupel[1].push({
          source: graph[hierarchy].edges[edgeKey]['source'],
          target: graph[hierarchy].edges[edgeKey]['target'],
          value: graph[hierarchy].edges[edgeKey]['weight'],
        });
      });
    });
    return tupel;
  }

  shrinkNode(graph, oldNode) {
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
          return params.data.category.toString();
        },
      },
      symbolSize: 50 - (30 / 3) * previousHierarchy,
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
    }
    return nextNode;
  }

  expandNode(graph, oldNode) {
    const nextHierarchy = parseInt(oldNode.name.split('n')[0].slice(1), 10) + 1;
    const nextNodes = [];
    for (let child of oldNode.value.childs) {
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
        symbolSize: 50 - (30 / 3) * nextHierarchy,
        category: oldNode.category,
        value: {
          mzs: graph['hierarchy' + nextHierarchy].nodes[nextNodeName].mzs,
          parent:
            graph['hierarchy' + nextHierarchy].nodes[nextNodeName][
              'membership'
            ],
        },
      };
      if (nextHierarchy < 3) {
        nextNode.value['childs'] =
          graph['hierarchy' + nextHierarchy].nodes[nextNodeName].childs;
      }
      nextNodes.push(nextNode);
    }
    return nextNodes;
  }
}
export default NetworkService;
