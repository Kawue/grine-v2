import math
import numpy as np
import networkx as nx

G = nx.Graph()


def graph_initialisation(similarity_matrix, threshold):
    global G
    distance_matrix = 1 - similarity_matrix
    distance_matrix[distance_matrix < 0.001] = 0.001
    adjacency_matrix = distance_matrix.copy()
    adjacency_matrix[adjacency_matrix > (1 - threshold)] = 0
    np.fill_diagonal(adjacency_matrix, 0)
    G.clear()
    G = nx.from_numpy_matrix(adjacency_matrix)
    while len(list(nx.connected_components(G))) > 1:
        sub_components = list(map(lambda x: np.array(list(x)), list(nx.connected_components(G))))
        for idx, node_list in enumerate(sub_components):
            complement_node_list = [node for i, sub_list in enumerate(sub_components) if i != idx for node in sub_list]
            local_dist = distance_matrix.copy()
            local_dist[node_list[:, np.newaxis], complement_node_list] -= 20
            edge_to_add = np.unravel_index(np.argmin(local_dist), local_dist.shape)
            G.add_edge(edge_to_add[0], edge_to_add[1], weight=distance_matrix[edge_to_add[0], edge_to_add[1]])
    del adjacency_matrix
    del distance_matrix


def update_graph(node_cluster):
    global G
    temp_dict = {}
    for idx, cluster in enumerate(node_cluster):
        temp_dict[idx] = cluster
    nx.set_node_attributes(G, temp_dict, 'cluster')


"""
    first node has high centrality
"""


def betweenness_centrality():
    global G
    centrality_per_node = list(nx.betweenness_centrality(G, weight='weight').items())
    centrality_per_node.sort(key=lambda x: x[1], reverse=True)
    return map_tupel_list_to_name(centrality_per_node)


"""
    first node has low eccentricity
"""


def eccentricity(G):
    sorted_arg = np.argsort(nx.floyd_warshall_numpy(G).A.max(axis=0))
    node_list = list(G.nodes())
    return [node_list[sorted_arg[i]] for i in range(len(node_list))]


def remove_isolates(G):
    G.remove_nodes_from(list(nx.isolates(G)))


"""
    first node has high degree
"""


def degree():
    global G
    degree_per_node = list(G.degree())
    degree_per_node.sort(key=lambda x: x[1], reverse=True)
    return map_tupel_list_to_name(degree_per_node)


"""
    first node has high cluster coefficient
"""


def cluster_coefficient():
    global G
    cluster_coeff_per_node = list(nx.square_clustering(G).items())
    degree_per_node = list(G.degree())
    degree_per_node.sort(key=lambda x: x[0])
    cluster_coeff_per_node.sort(key=lambda x: x[0])
    adj_cluster_coeff_per_node = [
        (degree_per_node[i][0], math.log(degree_per_node[i][1]) * cluster_coeff_per_node[i][1]) for i in
        range(len(degree_per_node))]
    adj_cluster_coeff_per_node.sort(key=lambda x: x[1], reverse=True)
    return map_tupel_list_to_name(adj_cluster_coeff_per_node)


"""
    first node has high between group degree and low within group degree
"""


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


"""
    first node has high within group degree and low between group degree
"""


def within_group_degree(G):
    w_degree = between_group_degree(G)
    w_degree.reverse()
    return w_degree


"""
    first node has low average weight per connected edge
"""


def average_weight_per_edge(G):
    degree_per_node = list(G.degree())
    degree_per_node = list(map(lambda x: (x[0], sum_edge_weights(G, x[0]) / x[1]), degree_per_node))
    degree_per_node.sort(key=lambda x: x[1])
    return map_tupel_list_to_name(degree_per_node)


def sum_edge_weights(G, node):
    return sum([G[node][i]['weight'] for i in G[node]])


def map_tupel_list_to_name(l):
    return list(map(lambda x: x[0], l))
