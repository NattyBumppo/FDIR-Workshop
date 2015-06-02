// We may be able to drop the first param, but I'm leaving it for now
// It could be useful to allow us to kick a procedure off via the console
// by adding methods onto the controller object. Most of the stuff here
// will be automatic, on events, though
(function(controller, $, undefined) {
  $(document).ready(initAll);

  function initAll() {
    setupGraphs();
    setupCorrelationVector();
    setupCorrelationMatrix();

    timer.start(1000);
  }

  function setupGraphs() {
    graph_drawer.bind('#detail_graphs');

    graph_drawer.addGraph('sample_1');
    graph_drawer.addGraph('sample_2');

    timer.registerUpdater(graph_drawer.updateGraphs);// Probably will move this into graph_drawer
  }

  function setupCorrelationVector() {
    correlation_vector.bind('#correlation_vector');

    correlation_vector.display('sample_1', 5000);
  }

  function setupCorrelationMatrix() {
    correlation_matrix.bind('#correlation_matrix');
    correlation_matrix.setup(720, 720);

    correlation_matrix.display(5000);
  }

}(window.controller = window.controller || {}, jQuery));
