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

    setupDebugKeyListener();

    timer.start(17);
  }

  function setupFaultDetection() {
    timer.registerUpdater(fault_detector.getFaults, 1000);
  }

  function setupChannelTree() {
    channel_tree.bind('#channel_tree');
    channel_tree.setup(800, 500);
    channel_tree.display();// Right now this time is ignored
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

    timer.registerUpdater(graph_drawer.updateGraphs, 68);
  }

  function setupCorrelationVector() {
    correlation_vector.bind('#correlation_vector');

    timer.registerUpdater(correlation_vector.display, 10000);
  }

  function setupCorrelationMatrix() {
    correlation_matrix.bind('#correlation_matrix');
    correlation_matrix.setSize(400, 400);

    timer.registerUpdater(correlation_matrix.display, 10000);
  }

  function setupMicrowave() {
    microwave.bind('#microwave');
    // microwave.setSize(720, 720);
    microwave.setup(600, 600);
    timer.registerUpdater(microwave.display, 102);
  }

  function setupDebugKeyListener()
  {
    $(document).keypress(function(e)
      {
        var checkWebkitandIE=(e.which==102);
        var checkMoz=(e.which==102);

        if (checkWebkitandIE || checkMoz)
        {
          var fault = [{"notes":"Could just be transient due to an electromagnetic field change; check value over time.","trigger":"c['left_motor_voltage'][i] > 10.0","name":"High motor voltage","time":17527}];
          fault_detector.injectFault(fault);
        }
    });
  }

}(window.controller = window.controller || {}, jQuery));
