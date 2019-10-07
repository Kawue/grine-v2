import math
import numpy as np
import networkx as nx

G = nx.Graph()
calculated_ranks = {}


def graph_initialisation(similarity_matrix, threshold):
    """
        Initialise graph from similarity matrix and threshold and connect subgraphs
    """
    global G
    global calculated_ranks
    calculated_ranks = {
        'centrality': [],
        'eccentricity': [],
        'degree': [],
        'cluster_coefficient': [],
        'avg_edge_weight': [],
        'between_group_degree': [],
        'spanning_degree': [],
        'avg_neighbor_degree': []
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


def update_graph(node_cluster):
    """
        update the cluster membership for each node
    """
    global G, calculated_ranks
    calculated_ranks['between_group_degree'] = []
    temp_dict = {}
    for idx, cluster in enumerate(eval(node_cluster)):
        temp_dict[idx] = cluster
    nx.set_node_attributes(G, temp_dict, 'cluster')


def betweenness_centrality():
    """
        calculate the centrality and sort nodes by high centrality
        :return: sorted list of nodes
    """
    global G, calculated_ranks
    if len(calculated_ranks['centrality']) == 0:
        centrality_per_node = list(nx.betweenness_centrality(G, weight='weight').items())
        calculated_ranks['centrality'] = sort_and_map_tuple_list_to_name(centrality_per_node)
    return calculated_ranks['centrality']


def eccentricity():
    """
        calculate the eccentricity and sort nodes by high eccentricity
        :return: sorted list of nodes
    """
    global G, calculated_ranks
    if len(calculated_ranks['eccentricity']) == 0:
        sorted_arg = np.argsort(nx.floyd_warshall_numpy(G).A.max(axis=0))
        node_list = list(G.nodes())
        calculated_ranks['eccentricity'] = [node_list[sorted_arg[i]] for i in range(len(node_list))]
    return calculated_ranks['eccentricity']


def degree():
    """
        sort nodes by high degree
        :return: sorted list of nodes
    """
    global G, calculated_ranks
    if len(calculated_ranks['degree']) == 0:
        degree_per_node = list(G.degree())
        calculated_ranks['degree'] = sort_and_map_tuple_list_to_name(degree_per_node)
    return calculated_ranks['degree']


def cluster_coefficient():
    """
        calculate the cluster coefficient and sort nodes by high eccentricity
        :return: sorted list of nodes
    """
    global G, calculated_ranks
    if len(calculated_ranks['cluster_coefficient']) == 0:
        cluster_coeff_per_node = list(nx.square_clustering(G).items())
        degree_per_node = list(G.degree())
        degree_per_node.sort(key=lambda x: x[0])
        cluster_coeff_per_node.sort(key=lambda x: x[0])
        adj_cluster_coeff_per_node = [
            (degree_per_node[i][0], math.log(degree_per_node[i][1]) * cluster_coeff_per_node[i][1]) for i in
            range(len(degree_per_node))]
        calculated_ranks['cluster_coefficient'] = sort_and_map_tuple_list_to_name(adj_cluster_coeff_per_node)
    return calculated_ranks['cluster_coefficient']


def between_group_degree():
    """
        calculate the between group degree and sort by high bg degree
        :return: sorted list of nodes
    """
    global G, calculated_ranks
    if len(calculated_ranks['between_group_degree']) == 0:
        b_degree = []
        for node in G.nodes():
            counter = 0
            for neighbor in G.neighbors(node):
                if G.nodes[node]['cluster'] != G.nodes[neighbor]['cluster']:
                    counter += G.get_edge_data(neighbor, node)['weight']
            b_degree.append((node, counter / sum_edge_weights(G, node)))
        calculated_ranks['between_group_degree'] = sort_and_map_tuple_list_to_name(b_degree)
    return calculated_ranks['between_group_degree']


def within_group_degree():
    """
        calculate the within group degree and sort by high wg degree
        :return: sorted list of nodes
    """
    global G
    w_degree = between_group_degree()
    w_degree.reverse()
    return w_degree


def average_weight_per_edge():
    """
        calculate the average weight per edge fropm each node and sort by high value
        :return: sorted list of nodes
    """
    global G, calculated_ranks
    if len(calculated_ranks['cluster_coefficient']) == 0:
        degree_per_node = list(map(lambda x: (x[0], sum_edge_weights(G, x[0]) / x[1]), list(G.degree())))
        calculated_ranks['cluster_coefficient'] = sort_and_map_tuple_list_to_name(degree_per_node, False)
    return calculated_ranks['cluster_coefficient']


def minimal_spanning_tree_degree():
    """
        calculate the minimal spanning and then the degree for every node
        :return: sorted list of nodes
    """
    global G, calculated_ranks
    if len(calculated_ranks['spanning_degree']) == 0:
        degree_per_node = list(nx.minimum_spanning_tree(G).degree())
        calculated_ranks['spanning_degree'] = sort_and_map_tuple_list_to_name(degree_per_node)
    return calculated_ranks['spanning_degree']


def avg_neighbor_degree():
    global G, calculated_ranks
    if len(calculated_ranks['avg_neighbor_degree']) == 0:
        b_degree = []
        degrees = G.degree()
        for node in G.nodes():
            neighbor_degrees = []
            for n in G.neighbors(node):
                neighbor_degrees.append(degrees[n])
            b_degree.append((node, sum(neighbor_degrees)/len(neighbor_degrees)))
        calculated_ranks['avg_neighbor_degree'] = sort_and_map_tuple_list_to_name(b_degree)
    return calculated_ranks['avg_neighbor_degree']


def sum_edge_weights(G, node):
    """
        calculate the sum off all connected edge weights
    """
    return sum([G[node][i]['weight'] for i in G[node]])


def sort_and_map_tuple_list_to_name(l, reverse=True):
    """
        sort and map a tuple list to one value
        :return: sorted list of nodes
    """
    l.sort(key=lambda x: x[1], reverse=reverse)
    return list(map(lambda x: x[0], l))
