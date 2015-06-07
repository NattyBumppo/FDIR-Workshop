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
        data: {
          x: 'x',
          columns: []
        },
        transition: {
          duration: 0
        },
        interaction: {
          enabled: false
        },
        axis: {
          x: {
            tick: {
              format: function(x) { return (x / 1000.0).toFixed(2); }
            }
          },
          y: {
            tick: {
              format: function(y) { return y.toFixed(2); }
            }
          }
        },
        point: {
          r: 1
        }
      }
    );

    graphs.push(
      {
        chart: chart,
        channel: channel,
        last_loaded: timer.getTime() - 1// Sometime in the 'past' to force update
      }
    );
  }

  graph.updateGraphs = function(time) {
    for(var i=0;i<graphs.length;i++) {
      updateGraph(graphs[i], time);
    }
  }

  function updateGraph(info, time) {
    data_store.getData(
      info.channel,
      time,
      generateDataCallback(info.chart)
    );
  }

  function generateDataCallback(chart) {
    return function(data) {
      chart.load(data);
    }
  }

  // This function handles updating all the graphs

}(window.graph_drawer = window.graph_drawer || {}, jQuery, c3));
