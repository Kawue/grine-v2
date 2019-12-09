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
    def __init__(self, dframe, name):
        self.__mapping = MzMapping(list(dframe.columns))
        self.name = name
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

    def getCube(self):
        return self.__cube

    def getGrayImage(self, mzValues, method=np.mean):
        intensity = method(self.__cube[:,:,self.__mapping.getMultipleInverse(mzValues)], 2)
        mask = (~np.isnan(intensity))
        intensity[mask] = np.interp(intensity[mask], (np.nanmin(intensity), np.nanmax(intensity)), (0, 1))
        return intensity

    def getColorImage(self, mzValues, method=np.mean, cmap='viridis', bytes=True):
        colorMap = cm.get_cmap(cmap)
        colorMap.set_bad(color='white')
        return colorMap(np.ma.masked_invalid(self.getGrayImage(mzValues, method)), bytes=bytes)

    @staticmethod
    def generateImageObject(image):
        obj_list = []
        for x in range(image.shape[0]):
            for y in range(image.shape[1]):
                if image[x,y,:].sum() < 1020:
                    obj_list.append({
                        'x': x,
                        'y': y,
                        'color': list(image[x,y,:])
                    })
        return obj_list


class DimRedDataSet:
    def __init__(self, dframe):
        gx = dframe.index.get_level_values("grid_x").astype('int')
        gy = dframe.index.get_level_values("grid_y").astype('int')

        mzimgs = []

        for mz in dframe.columns:
            img = np.full((gy.max() + 1, gx.max() + 1), np.nan)
            img[(gy, gx)] = dframe[mz]
            mzimgs.append(img)

        self.__cube = np.moveaxis(np.dstack(np.array(mzimgs)[None, :]), 0, -1)[:, :, 3:6]
        localMask = (~np.isnan(self.__cube))
        self.__cube[localMask] = np.interp(
            self.__cube[localMask],
            (np.nanmin(self.__cube), np.nanmax(self.__cube)),
            (0, 254)
        )

    def getAbsoluteImage(self):
        return np.nan_to_num(self.__cube, nan=254).astype(np.uint8)

    def getRelativeImage(self, alpha):
        localCube = np.nan_to_num(self.__cube, nan=0)
        localMask = (localCube >= alpha*254)
        localCube[localMask] = 254
        localCube[~localMask] = 0
        return localCube.astype(np.uint8)
