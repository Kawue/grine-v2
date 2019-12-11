import numpy as np
from matplotlib import cm


class MzMapping:
    def __init__(self, mzList):
        self.inverse = { index: value for value, index in enumerate(mzList)}
        self.mzList = mzList

    def __len__(self):
        return len(self.mzList)

    def __iter__(self):
        return iter(self.mzList)

    def __getitem__(self, key):
        return self.mzList[key]

    def __str__(self):
        return ', '.join(["({}, {})".format(index, value) for value, index in enumerate(self.mzList)])

    def getMultipleInverse(self, mzValues):
        if type(mzValues) == list:
            return [self.inverse[i] for i in mzValues]
        else:
            return [self.inverse[mzValues]]


class MzDataSet:
    def __init__(self, dframe):
        self.__mapping = MzMapping(list(dframe.columns))
        gx = dframe.index.get_level_values("grid_x").astype('int')
        gy = dframe.index.get_level_values("grid_y").astype('int')

        mzimgs = []

        for mz in dframe.columns:
            img = np.full((gy.max()+1, gx.max()+1), np.nan)
            img[(gy, gx)] = dframe[mz]
            mzimgs.append(img)

        self.__cube = np.dstack(np.array(mzimgs)[None, :])
        self.__cube = np.moveaxis(self.__cube, 0, -1)

    def getMzValues(self):
        return self.__mapping.mzList

    def getMzIndex(self, mzValues):
        return self.__mapping.getMultipleInverse(mzValues)

    def getCube(self):
        return self.__cube

    def getRawImage(mzValues, method=np.mean):
        return method(self.__cube[:,:,self.__mapping.getMultipleInverse(mzValues)], 2)

    def getGreyImage(self, mzValues, method=np.mean):
        intensity = method(self.__cube[:,:,self.__mapping.getMultipleInverse(mzValues)], 2)
        mask = (~np.isnan(intensity))
        intensity[mask] = np.interp(intensity[mask], (np.nanmin(intensity), np.nanmax(intensity)), (0, 1))
        return intensity

    def getColorImage(self, mzValues, method=np.mean, cmap='viridis', bytes=True):
        colorMap = cm.get_cmap(cmap)
        colorMap.set_bad(color='white')
        return colorMap(np.ma.masked_invalid(self.getGreyImage(mzValues, method)), bytes=bytes)


class DimRedDataSet:
    def __init__(self, dframe):
        gx = dframe.index.get_level_values("grid_x").astype('int')
        gy = dframe.index.get_level_values("grid_y").astype('int')

        mzimgs = []

        for mz in dframe.columns:
            img = np.full((gy.max() + 1, gx.max() + 1), np.nan)
            img[(gy, gx)] = dframe[mz]
            mzimgs.append(img)

        self.__cube = np.moveaxis(np.dstack(np.array(mzimgs)[None, :]), 0, -1)
        localMask = (~np.isnan(self.__cube))
        self.__cube[localMask] = np.interp(
            self.__cube[localMask],
            (np.nanmin(self.__cube), np.nanmax(self.__cube)),
            (0, 254)
        )
        self.__cube = np.dstack([np.nan_to_num(self.__cube, False, nan=0),
                                 np.full((self.__cube.shape[0], self.__cube.shape[1]), 254)]).astype(np.uint8)

    def getImage(self):
        return self.__cube

    def getRelativeImage(self, intensity):
        localMask = (~np.isnan(intensity))
        intensity[localMask] = np.interp(
            intensity[localMask],
            (np.nanmin(intensity), np.nanmax(intensity)),
            (0, 254)
        )
        localCube = np.copy(self.__cube)
        localCube[:, :, 3] = np.nan_to_num(intensity, False, nan=0).astype(np.uint8)
        return localCube

    def getAbsoluteImage(self, intensity, alpha):
        localCube = np.copy(self.__cube)
        np.nan_to_num(intensity, nan=0)
        localMask = (intensity >= alpha)
        intensity[localMask] = 254
        intensity[~localMask] = 0
        localCube[:, :, 3] = intensity.astype(np.uint8)
        return localCube
