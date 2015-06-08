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

  microwave.bind = function(selector)
  {
    // microwave_area = $(selector);
  }

  microwave.setup = function(w, h)
  {
    width = w;
    height = h;
    // x = d3.scale.ordinal().rangeBands([0, width]);

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
      update_cb = makeUpdateWrapper(channelName);
      data_store.getDatum(channelName, time, update_cb);
    }
  }

  function makeUpdateWrapper(channelName) {
    return function(channelValue)
    {
      viewWindowChannelMap[channelName] = channelValue;
    }
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
      channelValueElement.value = channelValue.toFixed(4) + ' ' + channel_tree.getUnits(channelName);

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
    // Check faulted state
    var faultCount = Object.keys(fault_detector.getCurrentFaults()).length;
    if (faultCount > 0)
    {
      // Set LED to green
      image = document.getElementById('status_led');
      image.src = 'static/images/red_light.png';
    }
    else
    {
      image = document.getElementById('status_led');
      image.src = 'static/images/green_light.png';
    }
  }

  function drawFaultInfo()
  {
    // Draw the names, triggers, and descriptions for each fault
    var fault_box = document.getElementById('left_fault_info');
    fault_box.innerHTML = '';

    var fault_data = fault_detector.getCurrentFaults();
    var faults = Object.keys(fault_data);

    for (var i = 0; i < faults.length; i++)
    {
      var name = fault_data[faults[i]]['name'];
      var trigger = fault_data[faults[i]]['trigger'];
      var notes = fault_data[faults[i]]['notes']

      var fault_info_label = $(document.createElement('h4'));
      fault_info_label.attr('id', 'fault_info_label');
      fault_info_label.text('Fault Information:');

      var name_label = $(document.createElement('span'));
      name_label.addClass('mw_label');
      name_label.text('Name: ');

      var trigger_label = $(document.createElement('span'));
      trigger_label.addClass('mw_label');
      trigger_label.text('Trigger: ');

      var notes_label = $(document.createElement('span'));
      notes_label.addClass('mw_label');
      notes_label.text('Notes: ');

      var name_info = $(document.createElement('span'));
      name_info.addClass('mw_info');
      name_info.text(name);

      var trigger_info = $(document.createElement('span'));
      trigger_info.addClass('mw_info');
      trigger_info.text(trigger);

      var notes_info = $(document.createElement('span'));
      notes_info.addClass('mw_info');
      notes_info.text(notes);

      $(fault_box).append(fault_info_label);

      var name_div = $(document.createElement("div"));
      name_div.attr('id', 'fault_name');
      name_div.append(name_label, name_info);
      $(fault_box).append(name_div);

      var triggerDiv = $(document.createElement("div"));
      triggerDiv.attr('id', 'fault_trigger');
      triggerDiv.append(trigger_label, trigger_info);
      $(fault_box).append(triggerDiv);

      var notesDiv = $(document.createElement("div"));
      notesDiv.attr('id', 'notes');
      notesDiv.append(notes_label, notes_info);
      $(fault_box).append(notesDiv);
    }
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
