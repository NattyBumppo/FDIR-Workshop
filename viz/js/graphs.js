(function(graph, $, c3, undefined) {
  // This will later be used when graphs change
  var graphs = [];
  var graph_area;

  graph.bind = function(selector) {
    graph_area = $(selector);
  }

  // This function creates a graph to be added to the document
  // channel: This is the channel to get data from
  //
  graph.addGraph = function(channel) {
    var div = $(document.createElement('div'));
    div.addClass('detail_chart');

    graph_area.append(div);

    var chart = c3.generate(
      {
        bindto: div[0],
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

  graph.updateGraphs = function(time) {
    for(var i=0;i<graphs.length;i++) {
      graphs[i].chart.load(
          data_store.getData(graphs[i].channel, time)
      );
    }
  }

  // This function handles updating all the graphs

}(window.graph_drawer = window.graph_drawer || {}, jQuery, c3));
