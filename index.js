// A graph data structure with depth-first search and topological sort.
module.exports = function Graph(serialized){

  // The returned graph instance.
  var graph = {
    addNode: addNode,
    removeNode: removeNode,
    nodes: nodes,
    adjacent: adjacent,
    addEdge: addEdge,
    removeEdge: removeEdge,
    depthFirstSearch: depthFirstSearch,
    topologicalSort: topologicalSort,
    serialize: serialize,
    deserialize: deserialize
  };

  
  // The adjacency list of the graph.
  // Keys are node ids.
  // Values are adjacent node id arrays.
  var edges = {};

  // If a serialized graph was passed into the constructor, deserialize it.
  if(serialized){
    deserialize(serialized);
  }

  // Adds a node to the graph.
  // If node was already added, this function does nothing.
  // If node was not already added, this function sets up an empty adjacency list.
  function addNode(node){
    edges[node] = adjacent(node);
    return graph;
  }

  // Removes a node from the graph.
  // Also removes incoming and outgoing edges.
  function removeNode(node){
    
    // Remove incoming edges.
    Object.keys(edges).forEach(function (u){
      edges[u].forEach(function (v){
        if(v === node){
          removeEdge(u, v);
        }
      });
    });

    // Remove outgoing edges (and signal that the node no longer exists).
    delete edges[node];

    return graph;
  }

  // Gets the list of nodes that have been added to the graph.
  function nodes(){
    var nodeSet = {};
    Object.keys(edges).forEach(function (u){
      nodeSet[u] = true;
      edges[u].forEach(function (v){
        nodeSet[v] = true;
      });
    });
    return Object.keys(nodeSet);
  }

  // Gets the adjacent node list for the given node.
  // Returns an empty array for unknown nodes.
  function adjacent(node){
    return edges[node] || [];
  }

  // Adds an edge from node u to node v.
  // Implicitly adds the nodes if they were not already added.
  function addEdge(u, v){
    addNode(u);
    addNode(v);
    adjacent(u).push(v);
    return graph;
  }

  // Removes the edge from node u to node v.
  // Does not remove the nodes.
  // Does nothing if the edge does not exist.
  function removeEdge(u, v){
    if(edges[u]){
      edges[u] = adjacent(u).filter(function (_v){
        return _v !== v;
      });
    }
    return graph;
  }

  // Depth First Search algorithm, inspired by
  // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 604
  // This variant includes an additional option 
  // `includeSourceNodes` to specify whether to include or
  // exclude the source nodes from the result (true by default).
  // If `sourceNodes` is not specified, all nodes in the graph
  // are used as source nodes.
  function depthFirstSearch(sourceNodes, includeSourceNodes){

    if(!sourceNodes){
      sourceNodes = nodes();
    }

    if(typeof includeSourceNodes !== "boolean"){
      includeSourceNodes = true;
    }

    var visited = {};
    var nodeList = [];

    function DFSVisit(node){
      if(!visited[node]){
        visited[node] = true;
        adjacent(node).forEach(DFSVisit);
        nodeList.push(node);
      }
    }

    if(includeSourceNodes){
      sourceNodes.forEach(DFSVisit);
    } else {
      sourceNodes.forEach(function (node){
        visited[node] = true;
      });
      sourceNodes.forEach(function (node){
        adjacent(node).forEach(DFSVisit);
      });
    }

    return nodeList;
  }

  // The topological sort algorithm yields a list of visited nodes
  // such that for each visited edge (u, v), u comes before v in the list.
  // Amazingly, this comes from just reversing the result from depth first search.
  // Cormen et al. "Introduction to Algorithms" 3rd Ed. p. 613
  function topologicalSort(sourceNodes, includeSourceNodes){
    return depthFirstSearch(sourceNodes, includeSourceNodes).reverse();
  }

  // Serializes the graph.
  function serialize(){
    var serialized = {
      nodes: nodes(),
      links: []
    };

    var indices = {};
    serialized.nodes.forEach(function (node, i){
      indices[node] = i;
    });

    serialized.nodes.forEach(function (u, i){
      adjacent(u).forEach(function (v){
        serialized.links.push({
          source: i,
          target: indices[v]
        });
      });
    });

    return serialized;
  }

  // Deserializes the given serialized graph.
  function deserialize(serialized){
    serialized.nodes.forEach(addNode);
    serialized.links.forEach(function (link){
      var u = serialized.nodes[link.source];
      var v = serialized.nodes[link.target];
      addEdge(u, v);
    });
    return graph;
  }
  
  return graph;
}
