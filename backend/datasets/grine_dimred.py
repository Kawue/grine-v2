import numpy as np
import pandas as pd
import umap as uumap
import sklearn.decomposition as skd
import matplotlib.pyplot as plt

def write_dimvis_rgb(dframe,red_ch, green_ch, blue_ch, method_name):
        colorscale_boundary=(0,100)
        scaling="single"
        cmap=plt.cm.viridis
        grid_x = np.array(dframe.index.get_level_values("grid_x")).astype(int)
        grid_y = np.array(dframe.index.get_level_values("grid_y")).astype(int)
        height = grid_y.max() + 1
        width = grid_x.max() + 1
        colormap = plt.cm.ScalarMappable(plt.Normalize(), cmap=cmap)
        # Use matplotlibs reverse gray colormap to scale intensities in colorscale boundary
        tmp_cm = plt.cm.ScalarMappable(plt.Normalize(), cmap=plt.cm.Greys_r)
        tmp_cm.set_clim(np.percentile(red_ch, colorscale_boundary))
        r_intens = tmp_cm.to_rgba(red_ch)[:, 0]
        tmp_cm.set_clim(np.percentile(green_ch, colorscale_boundary))
        g_intens = colormap.to_rgba(green_ch)[:, 0]
        tmp_cm.set_clim(np.percentile(blue_ch, colorscale_boundary))
        b_intens = colormap.to_rgba(blue_ch)[:, 0]
        
        rgb_img = np.zeros((height, width, 3))
        rgb_img[(grid_y, grid_x, 0)] = r_intens
        rgb_img[(grid_y, grid_x, 1)] = g_intens
        rgb_img[(grid_y, grid_x, 2)] = b_intens

        colormap.set_clim(np.percentile(red_ch, colorscale_boundary))
        r_img = np.zeros((height, width))
        r_img[(grid_y, grid_x)] = colormap.to_rgba(red_ch)[:, 0]
        
        colormap.set_clim(np.percentile(green_ch, colorscale_boundary))
        g_img = np.zeros((height, width))
        g_img[(grid_y, grid_x)] = colormap.to_rgba(green_ch)[:, 0]
        
        colormap.set_clim(np.percentile(blue_ch, colorscale_boundary))
        b_img = np.zeros((height, width))
        b_img[(grid_y, grid_x)] = colormap.to_rgba(blue_ch)[:, 0]

        plt.figure()
        plt.imshow(rgb_img)
        plt.figure()
        plt.imshow(r_img)
        plt.figure()
        plt.imshow(g_img)
        plt.figure()
        plt.imshow(b_img)
        


# barley = pd.read_hdf("C:\\Users\\kwuellems\\Desktop\\grinev2test\\barley101GrineV2.h5")
# kidney = pd.read_hdf("C:\\Users\\kwuellems\\Desktop\\grinev2test\\kidneyGrineV2.h5")
# vibrissae = pd.read_hdf("C:\\Users\\kwuellems\\Desktop\\grinev2test\\vibrissaeGrineV2.h5")

barley = pd.read_hdf("barley101GrineV2.h5")
kidney = pd.read_hdf("kidneyGrineV2.h5")
vibrissae = pd.read_hdf("vibrissaeGrineV2.h5")

#barley = pd.read_hdf(argv[1])
#kidney = pd.read_hdf(argv[2])
#vibrissae = pd.read_hdf(argv[3])



pca = skd.PCA(n_components=3, whiten=False)
barley_pca = pca.fit_transform(barley)
kidney_pca = pca.fit_transform(kidney)
vibrissae_pca = pca.fit_transform(vibrissae)


umap = uumap.UMAP(n_components=3, metric="euclidean", n_neighbors=15, min_dist=0.1)
barley_umap = umap.fit_transform(barley)
kidney_umap = umap.fit_transform(kidney)
vibrissae_umap = umap.fit_transform(vibrissae)

data = np.array([
    np.concatenate([barley_pca[:,0],vibrissae_pca[:,0],kidney_pca[:,0]]),
    np.concatenate([barley_pca[:,1],vibrissae_pca[:,1],kidney_pca[:,1]]),
    np.concatenate([barley_pca[:,2],vibrissae_pca[:,2],kidney_pca[:,2]]),
    np.concatenate([barley_umap[:,0],vibrissae_umap[:,0],kidney_umap[:,0]]),
    np.concatenate([barley_umap[:,1],vibrissae_umap[:,1],kidney_umap[:,1]]),
    np.concatenate([barley_umap[:,2],vibrissae_umap[:,2],kidney_umap[:,2]])
    ]).T
print(barley_pca.shape)
print(data.shape)
gx = list(barley.index.get_level_values("grid_x")) + list(kidney.index.get_level_values("grid_x")) + list(vibrissae.index.get_level_values("grid_x"))
gy = list(barley.index.get_level_values("grid_y")) + list(kidney.index.get_level_values("grid_y")) + list(vibrissae.index.get_level_values("grid_y"))
dn = ["barley101GrineV2"]*len(list(barley.index.get_level_values("grid_y"))) + ["kidneyGrineV2"]*len(list(kidney.index.get_level_values("grid_y"))) + ["vibrissaeGrineV2"]*len(list(vibrissae.index.get_level_values("grid_y")))

idx = pd.MultiIndex.from_tuples(zip(gx,gy,dn), names=["grid_x","grid_y","dataset"])
dframe = pd.DataFrame(data, index = idx, columns=["pcaR","pcaG","pcaB","umapR","umapG","umapB"])
dframe.to_hdf("./dimreduce_example.h5", key="dimreduce_example", complib="blosc", complevel=9)

idx = np.where(dframe.index.get_level_values("dataset")=="barley101GrineV2")[0]
f = dframe.iloc[idx]
write_dimvis_rgb(f, f["pcaR"], f["pcaG"], f["pcaB"], "pca")
write_dimvis_rgb(f, f["umapR"], f["umapG"], f["umapB"], "umap")
plt.show()

idx = np.where(dframe.index.get_level_values("dataset")=="kidneyGrineV2")[0]
f = dframe.iloc[idx]
write_dimvis_rgb(f, f["pcaR"], f["pcaG"], f["pcaB"], "pca")
write_dimvis_rgb(f, f["umapR"], f["umapG"], f["umapB"], "umap")
plt.show()

idx = np.where(dframe.index.get_level_values("dataset")=="vibrissaeGrineV2")[0]
f = dframe.iloc[idx]
write_dimvis_rgb(f, f["pcaR"], f["pcaG"], f["pcaB"], "pca")
write_dimvis_rgb(f, f["umapR"], f["umapG"], f["umapB"], "umap")
plt.show()
