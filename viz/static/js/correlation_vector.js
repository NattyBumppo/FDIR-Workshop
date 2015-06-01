(function(correlation, $, undefined) {
  var correlation_area;

  // Settings
  var num_cols = 3;
  var col_divisions = 12; // Bootstrap setting

  correlation.bind = function(selector) {
    correlation_area = $(selector);
  }

  correlation.display = function(channel, time) {
    // We may want to make this a callback controlled system for the display?
    data_store.getCorrelated(channel, time, display_cb);
  }

  correlation.hide = function() {
    correlation_area.empty();
  }

  // Callback function that handles displaying the results
  function display_cb(data) {
    var corr_vector = data.correlation_vector;
    for(var i=0;i<corr_vector.length;i++) {
      if(i % num_cols == 0) {
        correlation_area.append(
          $(document.createElement('div')).addClass('row')
        );
      }

      correlation_area.children().last().append(createCorrelationTile(corr_vector[i]));
    }
  }

  // Helper function to handle creating a correlation tile
  function createCorrelationTile(info) {
    var col_span = Math.floor(col_divisions / num_cols);

    var tile = $(document.createElement('div'));

    tile.addClass('correlation_tile col-md-' + col_span);

    var marker_container = $(document.createElement('div'));
    marker_container.addClass('col-md-4');

    var marker = $(document.createElement('div'));

    marker.addClass('correlation_marker');
    marker.css('background', 'rgba(211, 0, 0, ' + info.correlation + ')');

    var label = $(document.createElement('div'));

    label.addClass('correlation_label col-md-8');
    label.html(info.display_name);

    marker_container.append(marker);

    tile.append(marker_container);
    tile.append(label);

    return tile;
  }

}(window.correlation_vector = window.correlation_vector || {}, jQuery));
