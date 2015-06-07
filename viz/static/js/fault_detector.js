(function(fault_detector, $, undefined) {

  fault_detector.getFaults = function(time) {
    data_store.getFaults(time, handleFaults);
  }

  function handleFaults(faults) {
    var channel_regex = /c\['([a-zA-Z_0-9]*)'\]/g;
    var highlight_channel;
    for(var i=0;i<faults.length;i++) {
      var matches = [];
      var m;
      do {
        m = channel_regex.exec(faults[i].trigger);
        if(m) {
          matches.push(m[1]);
        }
      } while(m);

      for(var j=0;j<matches.length;j++) {
        channel_tree.markFaulted(matches[j], faults[i]);
        highlight_channel = matches[j];
      }
    }

    // Set one of the faulted channels to be focused in the CV
    correlation_vector.setChannel(highlight_channel);
  }

}(window.fault_detector = window.fault_detector || {}, jQuery));
