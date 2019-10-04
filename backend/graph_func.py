import math
import numpy as np
import networkx as nx

G = nx.Graph()
calculated_ranks = {}

'''
    Initialise graph from similarity matrix and threshold and connect subgraphs
'''
def graph_initialisation(similarity_matrix, threshold):
    global G
    global calculated_ranks
    calculated_ranks = {
        'centrality': [],
        'eccentricity': [],
        'degree': [],
        'cluster_coefficient': [],
        'avg_edge_weight': [],
    }
    distance_matrix = 1 - similarity_matrix
    distance_matrix[distance_matrix < 0.001] = 0.001
    adjacency_matrix = distance_matrix.copy()
    adjacency_matrix[adjacency_matrix > (1 - threshold)] = 0
    np.fill_diagonal(adjacency_matrix, 0)
    G.clear()
    G = nx.from_numpy_matrix(adjacency_matrix)
    del adjacency_matrix
    while len(list(nx.connected_components(G))) > 1:
        sub_components = list(map(lambda x: np.array(list(x)), list(nx.connected_components(G))))
        for idx, node_list in enumerate(sub_components):
            complement_node_list = [node for i, sub_list in enumerate(sub_components) if i != idx for node in sub_list]
            local_dist = distance_matrix.copy()
            local_dist[node_list[:, np.newaxis], complement_node_list] -= 20
            edge_to_add = np.unravel_index(np.argmin(local_dist), local_dist.shape)
            G.add_edge(edge_to_add[0], edge_to_add[1], weight=distance_matrix[edge_to_add[0], edge_to_add[1]])
    del distance_matrix


'''
    update the cluster membership for each node
'''
def update_graph(node_cluster):
    global G
    temp_dict = {}
    for idx, cluster in enumerate(node_cluster):
        temp_dict[idx] = cluster
    nx.set_node_attributes(G, temp_dict, 'cluster')


'''
    calculate the centrality and sort nodes by high centrality
'''
def betweenness_centrality():
    global G, calculated_ranks
    if len(calculated_ranks['centrality']) == 0:
        centrality_per_node = list(nx.betweenness_centrality(G, weight='weight').items())
        centrality_per_node.sort(key=lambda x: x[1], reverse=True)
        calculated_ranks['centrality'] = map_tupel_list_to_name(centrality_per_node)
    return calculated_ranks['centrality']


'''
    calculate the eccentricity and sort nodes by high eccentricity
'''
def eccentricity():
    global G, calculated_ranks
    if len(calculated_ranks['eccentricity']) == 0:
        sorted_arg = np.argsort(nx.floyd_warshall_numpy(G).A.max(axis=0))
        node_list = list(G.nodes())
        calculated_ranks['eccentricity'] = [node_list[sorted_arg[i]] for i in range(len(node_list))]
    return calculated_ranks['eccentricity']


'''
    sort nodes by high degree
'''
def degree():
    global G, calculated_ranks
    if len(calculated_ranks['degree']) == 0:
        degree_per_node = list(G.degree())
        degree_per_node.sort(key=lambda x: x[1], reverse=True)
        calculated_ranks['degree'] = map_tupel_list_to_name(degree_per_node)
    return calculated_ranks['degree']


'''
    calculate the cluster coefficient and sort nodes by high eccentricity
'''
def cluster_coefficient():
    global G, calculated_ranks
    if len(calculated_ranks['cluster_coefficient']) == 0:
        cluster_coeff_per_node = list(nx.square_clustering(G).items())
        degree_per_node = list(G.degree())
        degree_per_node.sort(key=lambda x: x[0])
        cluster_coeff_per_node.sort(key=lambda x: x[0])
        adj_cluster_coeff_per_node = [
            (degree_per_node[i][0], math.log(degree_per_node[i][1]) * cluster_coeff_per_node[i][1]) for i in
            range(len(degree_per_node))]
        adj_cluster_coeff_per_node.sort(key=lambda x: x[1], reverse=True)
        calculated_ranks['cluster_coefficient'] = map_tupel_list_to_name(adj_cluster_coeff_per_node)
    return calculated_ranks['cluster_coefficient']


'''
    calculate the between group degree and sort by high bg degree
'''
def between_group_degree(G):
    b_degree = []
    for node in G.nodes():
        counter = 0
        for neighbor in G.neighbors(node):
            if G.nodes[node]['cluster'] != G.nodes[neighbor]['cluster']:
                counter += G.get_edge_data(neighbor, node)['weight']
        b_degree.append((node, counter / sum_edge_weights(G, node)))
    b_degree.sort(key=lambda x: x[1], reverse=True)
    return map_tupel_list_to_name(b_degree)


'''
    calculate the within group degree and sort by high wg degree
'''
def within_group_degree(G):
    w_degree = between_group_degree(G)
    w_degree.reverse()
    return w_degree


'''
    calculate the average weight per edge fropm each node and sort by high value
'''
def average_weight_per_edge():
    global G, calculated_ranks
    if len(calculated_ranks['cluster_coefficient']) == 0:
        degree_per_node = list(map(lambda x: (x[0], sum_edge_weights(G, x[0]) / x[1]), list(G.degree())))
        degree_per_node.sort(key=lambda x: x[1])
        calculated_ranks['cluster_coefficient'] = map_tupel_list_to_name(degree_per_node)
    return calculated_ranks['cluster_coefficient']


'''
    calculate the sum off all connected edge weights
'''
def sum_edge_weights(G, node):
    return sum([G[node][i]['weight'] for i in G[node]])


'''
    map a tupel list to one value
'''
def map_tupel_list_to_name(l):
    return list(map(lambda x: x[0], l))
