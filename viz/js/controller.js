// We may be able to drop the first param, but I'm leaving it for now
// It could be useful to allow us to kick a procedure off via the console
// by adding methods onto the controller object. Most of the stuff here
// will be automatic, on events, though
(function(controller, $, undefined) {
  $(document).ready(initAll);

  function initAll() {
    setupGraphs();
    setupCorrelationVector();

    timer.start(1000);
  }

  function setupGraphs() {
    graph_drawer.bind('#detail_graphs');

    graph_drawer.addGraph('sample_1');
    graph_drawer.addGraph('sample_2');

    timer.registerUpdater(graph_drawer.updateGraphs);// Probably will move this into graph_drawer
  }

  function setupCorrelationVector() {
    correlation.bind('#correlation_vector');

    correlation.display('sample_correlation');
  }

}(window.controller = window.controller || {}, jQuery));
