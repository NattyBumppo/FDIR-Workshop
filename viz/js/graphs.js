(function(graph, $, c3, undefined) {
  // This will later be used when graphs change
  var graphs = [];

  // This function creates a graph to be added to the document
  // container_id: id of element to add this to
  // channel: This is the channel to get data from
  // This may change in wrapper-ness
  //
  // We could set individual update loops here
  graph.createLineGraph = function(container_id, channel) {
    var chart = c3.generate(
      {
        bindto: '#' + container_id,
        x: 'x',
        data: data_store.getData(channel)// This will probably change in format
      }
    );

    graphs.push(
      {
        chart: chart,
        channel: channel
      }
    );
  }

  graph.updateGraphs = function() {
    for(var i=0;i<graphs.length;i++) {
      graphs[i].chart.load(
          data_store.getData(graphs[i].channel)
      );
    }
  }

  // This function handles updating all the graphs

}(window.graph_drawer = window.graph_drawer || {}, jQuery, c3));
