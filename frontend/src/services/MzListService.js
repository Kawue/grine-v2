class MzListService {
  sortMzList(data, asc) {
    if (asc) {
      return data.sort((a, b) => a.mz - b.mz);
    } else {
      return data.sort((a, b) => b.mz - a.mz);
    }
  }

  loadGraph(graphNumber, orgData) {
    const graphString = 'graph' + graphNumber;
    const numberOfLayers = Object.keys(orgData[graphString].graph).length - 1;
    const t = [];
    Object.keys(orgData[graphString].mzs).forEach(function(mz) {
      t.push({
        highlight: true,
        ...orgData[graphString].mzs[mz],
        name: orgData[graphString].graph['hierarchy' + numberOfLayers].nodes[
          orgData[graphString].mzs[mz]['hierarchy' + numberOfLayers]
        ].name.toString(),
        mz: mz,
      });
    });
    return t;
  }

  calculateVisibleMz(showAll, notVisibleMz, visibleMz, asc) {
    let localVisible = [];
    let localNotVisible = [];
    if (showAll) {
      localVisible.push(...visibleMz);
      if (notVisibleMz.length > 0) {
        localVisible.push(...notVisibleMz);
      }
      localVisible = this.sortMzList(localVisible, asc);
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

  resetHighlightedMz(visibleMz, notVisibleMz, showAll, asc) {
    const localMzlist = [...visibleMz];
    localMzlist.push(...notVisibleMz);
    for (const mzObject of localMzlist) {
      mzObject.highlight = true;
    }
    return this.calculateVisibleMz(showAll, [], localMzlist, asc);
  }

  updateHighlightedMz(visibleMz, notVisibleMz, mzValues, showAll, asc) {
    let localVisible = [...visibleMz];
    localVisible.push(...notVisibleMz);
    const mzValuesStrings = mzValues.map(mz => mz.toString());
    for (const mzObject of localVisible) {
      mzObject.highlight =
        mzValuesStrings.findIndex(mz => mz === mzObject.mz) > -1;
    }
    return this.calculateVisibleMz(showAll, [], localVisible, asc);
  }
}
export default MzListService;
