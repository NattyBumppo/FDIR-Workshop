// We may be able to drop the first param, but I'm leaving it for now
// It could be useful to allow us to kick a procedure off via the console
// by adding methods onto the controller object. Most of the stuff here
// will be automatic, on events, though
(function(controller, $, undefined) {
  $(document).ready(initAll);

  // Sets focus on a specific channel
  controller.focus = function(channel) {
    correlation_vector.setChannel(channel);
    graph_drawer.addGraph(channel);
  }

  function initAll() {
    setupChannelTree();
    setupGraphs();
    setupCorrelationVector();
    setupCorrelationMatrix();
    setupFaultDetection();
    setupMicrowave();

    setupPauseControl();

    timer.start(1000);
  }

  function setupFaultDetection() {
    timer.registerUpdater(fault_detector.getFaults, 1000);
  }

  function setupChannelTree() {
    channel_tree.bind('#channel_tree');
    channel_tree.setup(800, 500);
    channel_tree.display(5000);// Right now this time is ignored
  }

  function setupPauseControl() {
    $('#pause_control').click(handlePauseControl);
  }

  function handlePauseControl() {
    var control = $('#pause_control');
    if(timer.isRunning()) {
      timer.pause();
      control.text('Restart');
    } else {
      timer.unpause();
      control.text('Pause');
    }
  }

  function setupGraphs() {
    graph_drawer.bind('#detail_graphs');

    timer.registerUpdater(graph_drawer.updateGraphs, 1000);
  }

  function setupCorrelationVector() {
    correlation_vector.bind('#correlation_vector');

    correlation_vector.setChannel('sample_1');

    timer.registerUpdater(correlation_vector.display, 10000);
  }

  function setupCorrelationMatrix() {
    correlation_matrix.bind('#correlation_matrix');
    correlation_matrix.setSize(720, 720);

    timer.registerUpdater(correlation_matrix.display, 10000);
  }

  function setupMicrowave() {
    microwave.bind('#microwave');
    // microwave.setSize(720, 720);
    microwave.setup(600, 600);
    timer.registerUpdater(microwave.display, 1000);
  }


}(window.controller = window.controller || {}, jQuery));
