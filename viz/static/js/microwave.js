(function(microwave, $, undefined) {

  // Setup variables
  // var microwave_area;
  var width;
  var height;

  // The channels that will be displayed (digitally)
  // in the view windows. These will eventually be obtained
  // dynamically from the UI but for now they're hard-coded.
  var viewWindowChannelNames = ['left_motor_current_draw', 'right_motor_current_draw', 'cores_in_use', 'x_acceleration', 'y_acceleration', 'z_acceleration'];
  var viewWindowChannelMap = {};

  // Describes whether a fault has occurred
  var isFaulted;

  // var margin = {top: 80, right: 0, bottom: 10, left: 80};
  // var margin = {top: 100, right: 0, bottom: 10, left: 100}

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

    // Add status LED (don't set image to make visible yet)
    var image = document.createElement('img');
    image.id = 'status_led';
    var microwaveEl = document.getElementById('microwave');
    microwaveEl.appendChild(image);

    // Get time

    // Update (initialize) viewWindowChannelMap
    var time = timer.getTime();
    updateViewWindowChannelValues(time);

  }

  microwave.display = function(time)
  {

    draw_microwave();

    // Get channels first (hard-coded at first)
    // data_store.getMicrowaveData(channels);
  }

    // Callback function that handles displaying the results
  function display_cb(data) {
    // First update the values to display
    updateViewWindowChannelValues();


    draw_microwave(data);// May want to condense these, as this is currently unnecessary
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
  function draw_microwave(data) {
    // console.log(viewWindowChannels);

    // Clear microwave windows for redraw
    var microwaveEl = document.getElementById('microwave');
    microwaveEl.innerHTML = '';

    drawTime();
    drawViewWindows();
    // drawStatusLED();
    drawFaultInfo();
  }

  function drawTime()
  {
    var microwaveEl = document.getElementById('microwave');
    microwaveEl.innerHTML += '<strong>Time:</strong> ';
    var time = timer.getTime();
    microwaveEl.innerHTML += time + '<br>';
  }

  function drawViewWindows()
  {
    var microwaveEl = document.getElementById('microwave');
    microwaveEl.innerHTML += '<strong>Channels</strong><br>';

    for (var i = 0; i < Object.keys(viewWindowChannelMap).length; i++)
    {
      channelName = Object.keys(viewWindowChannelMap)[i];
      channelValue = viewWindowChannelMap[channelName];
      var microwaveEl = document.getElementById('microwave');
      microwaveEl.innerHTML += '<strong>' + channelName + '</strong>: ' + channelValue + '<br>';
    }
  }

  function drawStatusLED()
  {
    if (isFaulted)
    {
      // Set LED to red
      image = document.getElementById('status_led');
      image.src = 'static/data/images/red_light.png';
    }
    else
    {
      // Set LED to green
      image = document.getElementById('status_led');
      image.src = 'static/data/images/green_light.png';
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