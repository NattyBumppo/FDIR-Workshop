// We will need to add in a global timekeeping system that will track the current intervals
// and times that we are interested in, that can be queried here, so we don't need
// to pass it around over and over


// We may not need jQuery here
(function(data_store, $, undefined) {
  var temp_index = 0;
  var detail_data = {
    sample_1: {
      name: 'data1',
      time_start: 0,
      time_span: 1000,
      values: [50, 80, 100, 200, 50, 100]
    },
    sample_2: {
      name: 'data2',
      time_start: 0,
      time_span: 1000,
      values: [35, 220, 10, 45, 170, 25],
    }
  };

  var correlation_data = {};
  var display_size = 6;

  data_store.getData = function(channel, time, display_cb) {
    // Check if there is any data for this
    if(detail_data[channel] == undefined) {
      // No data, thus need to fetch
      fetchData(channel, {include_time: time}, time);
    } else {
      // We have some, but need to check if we have it for this time

      // If it exists already, just call the callback
      var index = indexOfTime(detail_data[channel], time);
      if(isDisplayableIndex(detail_data[channel], index)) {
        // Then we have the data
        display_cb(getDetailData(detail_data[channel], index));
      } else {
        // Fetch data
        var params = {
          include_time: time,
          start_time: getLastDataTime(channel),
          exclude_start: 'True'
        };

        fetch_data(channel, params, time);
      }
  }

  data_store.getCorrelated = function(channel, display_cb) {
    var range = {
      start: 'start_date',
      end: 'end_date'
    };

    $.get('/static/data/correlation_temp.json', range, makeCorrelatedHandler(display_cb), 'json');
  }

  function getLastDataTime(channel) {
    var info = detail_data[channel];

    return (info.values.length * info.time_span) + info.time_start;
  }

  function fetchData(channel, params, time) {
    $.get('/data/' + channel, params, makeDetailDataHandler(channel, time), 'json');
  }

  function makeDetailDataHandler(channel, time) {
    return function(data) {
      if(data.status == 'ERROR') {
        return false;
      }

      if(detail_data[channel] == undefined) {
        // Need to add all the data
        detail_data[channel] = data;
      } else {
        // Just need to append, if this is the newest known request
        if(time > detail_data[channel].last_updated) {
          // Need to add on the values
          detail_data[channel].values.concat(data.values);

          // We shouldn't need to worry about race conditions here
          // I believe, because eventing of same origin stuff should
          // be single thread. I'm not certain how this applies to
          // AJAX, but will look further to make certain we're good.
          detail_data[channel].last_modified = time;
        } else {
          return false; // Ignore becasue a newer request already arrived
        }
      }

      // Now we need to fire the callback
    }
  }

  // Helper function to get the data at and prior to the
  // given index. Assumes this is a displayable index
  function getDetailData(info, index) {
    var cols = [];

    var start_index = Math.max(index - display_size + 1, 0);

    // Get subset of values
    cols.push(
      info.values.slice(start_index, index + 1)
    );

    // Get array mapping those to indices
    cols.push(
      cols[0].map(function(val, i) {
        return (i + start_index) * info.time_span + info.time_start;
      })
    );

    // Prepend column names
    cols[0].unshift(info.name);
    cols[1].unshift('x');

    return {
      columns: cols
    };
  }

  // Helper function to calculate the index for a given time
  function indexOfTime(info, time) {
    return Math.ceil((time - info.time_start) / info.time_span);
  }

  // Helper function to determine if we have enough data
  // to display a certain time of data
  //
  // Maybe not necessary, now that we don't check for
  // a complete span...
  function isDisplayableIndex(info, index) {
    return index >= -1 && index < info.values.length;
  }

  // This function could easily be made general, or
  // be replaced by an anonymous function in place
  function makeCorrelatedHandler(display_cb) {
    return function(data) {
      // Here's where the data will be cached, potentially
      display_cb(data);
    };
  }

}(window.data_store = window.data_store || {}, jQuery));
