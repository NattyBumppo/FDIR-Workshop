// We may be able to drop the first param, but I'm leaving it for now
// It could be useful to allow us to kick a procedure off via the console
// by adding methods onto the controller object. Most of the stuff here
// will be automatic, on events, though
(function(controller, $, undefined) {
  $(document).ready(initAll);

  function initAll() {
    graph_drawer.setup('#col-2d');
    graph_drawer.addGraph('sample_1');
    graph_drawer.addGraph('sample_2');
    setInterval(graph_drawer.updateGraphs, 5000);
  }

}(window.controller = window.controller || {}, jQuery));
