// We may be able to drop the first param, but I'm leaving it for now
// It could be useful to allow us to kick a procedure off via the console
// by adding methods onto the controller object. Most of the stuff here
// will be automatic, on events, though
(function(controller, $, undefined) {
  $(document).ready(initAll);

  function initAll() {
    var graph_2d_area = $('#col-2d');
    addGraph(graph_2d_area, 'test_graph', 12);
  }

  function addGraph(area, id, span) {
    var container = $(document.createElement('div'));

    container.attr('id', id);
    container.addClass('col-md-' + span);
    container.css(
      {
        height: '400px'
      }
    );

    area.append(container);

    graph_drawer.createGraph(id, 'blank_for_now');
  }

}(window.controller = window.controller || {}, jQuery));
