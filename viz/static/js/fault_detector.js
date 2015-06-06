(function(fault_detector, $, undefined) {

  fault_detector.getFaults = function(time) {
    data_store.getFaults(time, handleFaults);
  }

  function handleFaults(faults) {
    var channel_regex = /c\['([a-zA-Z_0-9]*)'\]/g;
    for(var i=0;i<faults.length;i++) {
      var matches = [];
      var m;
      do {
        m = channel_regex.exec(faults[i].trigger);
        if(m) {
          matches.push(m[1]);
        }
      } while(m);

      matches.forEach(channel_tree.markFaulted);
    }
  }

}(window.fault_detector = window.fault_detector || {}, jQuery));
