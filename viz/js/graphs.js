(function(graph, $, c3, undefined) {
  // This will later be used when graphs change
  var graphs = [];

  // This function creates a graph to be added to the document
  // container_id: id of element to add this to
  // size: number of columns to span (out of 12)
  // data: data source. Undetermined format as of yet.
  graph.createGraph = function(container_id, data) {
    c3.generate(
      {
        bindto: '#' + container_id,
        data: {
          columns: [
            ['test1', 30, 200, 100, 40, 8, 10],
            ['data2', 400, 2, 5, 50, 100, 50]
          ]
        }
      }
    );
  }

}(window.graph_drawer = window.graph_drawer || {}, jQuery, c3));
