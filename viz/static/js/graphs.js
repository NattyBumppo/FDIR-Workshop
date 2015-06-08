(function(graph, $, c3, undefined) {
  // This will later be used when graphs change
  var graphs = {};
  var graph_area;

  graph.bind = function(selector) {
    graph_area = $(selector);
  }

  // This function creates a graph to be added to the document
  // channel: This is the channel to get data from
  //
  graph.addGraph = function(channel) {
    // Check if graph already exists
    if(graphs[channel] != undefined) {
      return false;
    }

    var container = $(document.createElement('div'));
    container.addClass('detail_chart_container');

    var x_button = $(document.createElement('a'));
    x_button.addClass('chart_close_button');
    x_button.text('X');

    var div = $(document.createElement('div'));
    div.addClass('detail_chart');

    container.append(x_button);
    container.append(div);

    graph_area.append(container);

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
              format: function(x) { return (x / 1000.0).toFixed(2); },
              count: 10
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

    graphs[channel] = {
      chart: chart,
      channel: channel,
      last_loaded: timer.getTime() - 1
    };

    // Add click handler to close it, now that we have the chart reference
    container.data('channel', channel);// Could pass via the event.data, but binding here for now
    x_button.click(closeChart);

  }

  graph.updateGraphs = function(time) {
    for(var channel in graphs) {
      updateGraph(graphs[channel], time);
    }
  }

  function closeChart() {
    var container = $(this).parent();
    var chart = graphs[container.data('channel')].chart;
    graphs[container.data('channel')] = undefined;
    chart.destroy(); // There was a race condition here... O.o Needs to still
                     // be looked into, to see if there is a guaranteed fix
    container.remove();
  }

  function updateGraph(info, time) {
    // Another race condition?!
    if(info != undefined) {
      data_store.getData(
        info.channel,
        time,
        generateDataCallback(info.channel)
      );
    }
  }

  function generateDataCallback(channel) {
    return function(info) {
      if(graphs[channel] != undefined) {
        var chart = graphs[channel].chart;
        chart.load(info.data);

        chart.axis.min(info.config.y.min);
        chart.axis.max(info.config.y.max);
      }
    }
  }

  // This function handles updating all the graphs

}(window.graph_drawer = window.graph_drawer || {}, jQuery, c3));
