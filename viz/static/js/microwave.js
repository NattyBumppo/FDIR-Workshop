(function(microwave, $, undefined) {

  // Setup variables
  // var microwave_area;
  var width;
  var height;

  // The channels that will be displayed (digitally)
  // in the view windows. These will eventually be obtained
  // dynamically from the UI but for now they're hard-coded.
  var viewWindowChannelNames = ['left_motor_current_draw', 'cores_in_use', 'x_acceleration', 'y_acceleration', 'z_acceleration', 'x_rotation', 'y_rotation', 'z_rotation'];
  var viewWindowChannelMap = {};

  // Describes whether a fault has occurred
  var isFaulted;

  microwave.bind = function(selector)
  {
    // microwave_area = $(selector);
  }

  microwave.setup = function(w, h)
  {
    width = w;
    height = h;
    // x = d3.scale.ordinal().rangeBands([0, width]);
    isFaulted = false;

    // Update (initialize) viewWindowChannelMap
    var time = timer.getTime();
    updateViewWindowChannelValues(time);

  }

  microwave.display = function(time)
  {
    updateViewWindowChannelValues(time);
    draw_microwave(time);
  }

  microwave.hide = function() {
    microwave_area.empty();
  }

  updateViewWindowChannelValues = function(time)
  {
    // Update viewWindowChannelMap
    for (var i = 0; i < viewWindowChannelNames.length; i++)
    {
      var channelName = viewWindowChannelNames[i];
      data_store.getData(channelName, time, updateViewWindowChannelValue);
    }
  }

  updateViewWindowChannelValue = function(data)
  {
    var channelName = data.columns[0][0];
    var channelValue = data.columns[0][1];
    viewWindowChannelMap[channelName] = channelValue;
  }

  // This function draws the main "microwave" interface
  function draw_microwave(time) {
    drawTime(time);
    drawViewWindows();
    drawStatusLED();
    drawFaultInfo();
  }

  function drawTime(time)
  {
    var timeDisplayElement = document.getElementById('time_display');
    timeDisplayElement.innerHTML = (time/1000.0).toFixed(2) + " sec";
  }

  function drawViewWindows()
  {
    for (var i = 0; i < Object.keys(viewWindowChannelMap).length; i++)
    {
      channelName = Object.keys(viewWindowChannelMap)[i];
      channelValue = viewWindowChannelMap[channelName];
      var channelNameElement = document.getElementById('channelName' + i);
      var channelValueElement = document.getElementById('channelValue' + i);
      channelNameElement.innerHTML = channelName;
      channelValueElement.value = channelValue.toFixed(4);
      // Also set div behavior (clicking on the value will cause the plot to appear)
      channelValueElement.cursor = 'pointer';
      channelValueElement.onclick = function() {
        var id = this.id;
        var index = id[id.length - 1];
        var internalName = viewWindowChannelNames[index];
        controller.focus(internalName);
      };
    }
  }

  // Switches the LED image depending on fault state
  function drawStatusLED()
  {
    if (isFaulted)
    {
      // Set LED to red
      image = document.getElementById('status_led');
      image.src = 'static/images/red_light_bordered.png';
    }
    else
    {
      // Set LED to green
      image = document.getElementById('status_led');
      image.src = 'static/images/green_light_bordered.png';
    }
  }

  function drawFaultInfo()
  {

  }

  function viewWindowMouseover(p)
  {
    d3.selectAll('.cm-row text').classed('active', function(d, i) { return i == p.y; });
    d3.selectAll('.cm-column text').classed('active', function(d, i) { return i == p.x; });
  }

  function viewWindowMouseout()
  {
    d3.selectAll('text').classed('active', false);
  }


}(window.microwave = window.microwave || {}, jQuery));