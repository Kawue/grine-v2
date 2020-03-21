import store from '@/store';

class MzListService {
  sortMzList(data) {
    if (store.getters.mzListOptionsAsc) {
      return data.sort((a, b) => a.mutableIndex - b.mutableIndex);
    } else {
      return data.sort((a, b) => b.mutableIndex - a.mutableIndex);
    }
  }

  loadGraph(graphNumber, orgData) {
    const graphString = 'graph' + graphNumber;
    const deepestHierarchy = store.getters.meta.maxHierarchy;
    const mzObjects = [];
    for (const mz of Object.keys(orgData[graphString].mzs)) {
      const node =
        orgData[graphString].graph['hierarchy' + deepestHierarchy].nodes[
          orgData[graphString].mzs[mz]['hierarchy' + deepestHierarchy]
        ];
      mzObjects.push({
        highlight: true,
        ...orgData[graphString].mzs[mz],
        annotation: node.annotation,
        originalIndex: node.index,
        mutableIndex: node.index,
        mz: parseFloat(mz),
        queryValue: 0,
      });
    }
    return mzObjects;
  }

  applyQueryPermutation(mutation, visibleMz, notVisibleMz) {
    const deepestHierarchy = 'hierarchy' + store.getters.meta.maxHierarchy;
    const namePrefix = `h${store.getters.meta.maxHierarchy}n`;
    for (let i = 0; i < mutation.length; i++) {
      const visibleIndex = visibleMz.findIndex(mzObject => {
        return (
          mzObject[deepestHierarchy] === namePrefix + mutation[i]['nodeIndex']
        );
      });
      if (visibleIndex > -1) {
        visibleMz[visibleIndex].queryValue = mutation[i]['value'];
        visibleMz[visibleIndex].mutableIndex = i;
      } else {
        const notVisibleIndex = notVisibleMz.findIndex(mzObject => {
          return (
            mzObject[deepestHierarchy] === namePrefix + mutation[i]['nodeIndex']
          );
        });
        notVisibleMz[notVisibleIndex].mutableIndex = i;
        notVisibleMz[notVisibleIndex].queryValue = mutation[i]['value'];
      }
    }
  }

  resetPermutation(visibleMz, notVisibleMz) {
    for (const mzObject of visibleMz) {
      mzObject.mutableIndex = mzObject.originalIndex;
      mzObject.queryValue = 0;
    }
    for (const mzObject of notVisibleMz) {
      mzObject.mutableIndex = mzObject.originalIndex;
      mzObject.queryValue = 0;
    }
  }

  calculateVisibleMz(showAll, notVisibleMz, visibleMz) {
    let localVisible = [];
    let localNotVisible = [];
    if (showAll) {
      localVisible.push(...visibleMz);
      if (notVisibleMz.length > 0) {
        localVisible.push(...notVisibleMz);
      }
      localVisible = this.sortMzList(localVisible);
    } else {
      for (let i = 0; i < visibleMz.length; i++) {
        if (visibleMz[i].highlight) {
          localVisible.push(visibleMz[i]);
        } else {
          localNotVisible.push(visibleMz[i]);
        }
      }
    }
    return [localVisible, localNotVisible];
  }

  resetHighlightedMz(visibleMz, notVisibleMz, showAll) {
    const localMzlist = [...visibleMz];
    localMzlist.push(...notVisibleMz);
    for (const mzObject of localMzlist) {
      mzObject.highlight = true;
    }
    return this.calculateVisibleMz(showAll, [], localMzlist);
  }

  updateHighlightedMz(visibleMz, notVisibleMz, mzValues, showAll) {
    let localVisible = [...visibleMz];
    localVisible.push(...notVisibleMz);
    for (const mzObject of localVisible) {
      mzObject.highlight = mzValues.findIndex(mz => mz === mzObject.mz) > -1;
    }
    return this.calculateVisibleMz(showAll, [], localVisible);
  }
}
export default MzListService;
