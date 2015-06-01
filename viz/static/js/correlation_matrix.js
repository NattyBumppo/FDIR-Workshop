(function(correlation, $, undefined) {
  var correlation_area;

  correlation.bind = function(selector) {
    correlation_area = $(selector);
  }

  correlation.display = function(time) {
    // We may want to make this a callback controlled system for the display?
    data_store.getCorrelationMatrix(time, display_cb);
  }

  correlation.hide = function() {
    correlation_area.empty();
  }

  // Callback function that handles displaying the results
  function display_cb(data) {
    return false; // Will handle display here next
  }

}(window.correlation_matrix = window.correlation_matrix || {}, jQuery));
