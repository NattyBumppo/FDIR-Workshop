(function(correlation, $, undefined) {
  var correlation_area;

  // Settings
  var num_cols = 3;
  var col_divisions = 12; // Bootstrap setting
  var channel;
  var positive_color = [255, 127, 14];
  var negative_color = [31, 119, 180];

  correlation.bind = function(selector) {
    correlation_area = $(selector);
  }

  correlation.setChannel = function(channel_name) {
    var is_changed = (channel != channel_name);
    channel = channel_name;

    if(is_changed) {
      correlation.display(timer.getTime());
    }
  }

  correlation.display = function(time) {
    if(channel != undefined) {
      data_store.getCorrelated(channel, time, display_cb);
    }// else display helper message later
  }

  correlation.clear = function() {
    // Before emptying, we want to save the height, to avoid a flicker
    correlation_area.height(correlation_area.height());

    correlation_area.empty();
  }

  // Callback function that handles displaying the results
  function display_cb(data) {
    // First reset everything, in case existing drawing
    correlation.clear();

    $('#cv_channel_title').text(channel);
    var corr_vector = data.correlation_vector;
    for(var i=0;i<corr_vector.length;i++) {
      if(i % num_cols == 0) {
        correlation_area.append(
          $(document.createElement('div')).addClass('row')
        );
      }

      correlation_area.children().last().append(createCorrelationTile(corr_vector[i]));
    }

    // Now clear the height
    correlation_area.height('');
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

    var marker_color = (info.correlation >= 0) ? positive_color : negative_color;
    marker.css('background', 'rgba(' + marker_color.join(', ') + ', ' + Math.pow(Math.abs(info.correlation),0.65) + ')');

    var label = $(document.createElement('div'));

    label.addClass('correlation_label col-md-8');
    label.html(info.display_name);

    marker_container.append(marker);

    tile.append(marker_container);
    tile.append(label);

    return tile;
  }

}(window.correlation_vector = window.correlation_vector || {}, jQuery));
