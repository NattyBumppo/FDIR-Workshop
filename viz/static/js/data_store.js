// We will need to add in a global timekeeping system that will track the current intervals
// and times that we are interested in, that can be queried here, so we don't need
// to pass it around over and over


// We may not need jQuery here
(function(data_store, $, undefined) {
  var detail_data = {};

  var correlation_data = {};
  var display_size = 60; // Number of data points to show on the graph
  var max_empty_requests = 5; // Max requests with empty results before stopping requesting
  var max_num_correlated = 20; // Max number of channels to show for correlation vector

  data_store.temp = function() {
    return detail_data;
  }

  data_store.getFaults = function(time, fault_cb) {
    var params = {
      time: time
    };

    $.get('/get_faults', params, makeFaultHandler(fault_cb), 'json');
  }

  data_store.getData = function(channel, time, display_cb) {
    proxyDataRequest(channel, time, display_cb, getDetailData);
  }

  data_store.getDatum = function(channel, time, display_cb) {
    proxyDataRequest(channel, time, display_cb, getDetailDatum);
  }

  function proxyDataRequest(channel, time, display_cb, extractor) {
    // Check if there is any data for this
    if(detail_data[channel] == undefined) {
      // No data, thus need to fetch
      fetchData(channel, {include_time: time}, time, display_cb, extractor);
    } else {
      // If it exists already, just call the callback
      var index = indexOfTime(detail_data[channel], time);
      var last_known_time = getLastDataTime(channel);

      // Check if there has been no new data for a while
      // because then we should not request more
      // This may be better handled differently once we have a
      // better idea of the architecture
      if(detail_data[channel].consecutive_empty_fetches > max_empty_requests && time > last_known_time) {
        return false;
      }

      // We have some, but need to check if we have it for this time
      if(isDisplayableIndex(detail_data[channel], index)) {
        // Then we have the data
        display_cb(extractor(detail_data[channel], index));
      } else {
        // Fetch data
        var start_time = last_known_time;
        var params = {
          include_time: time
        };

        if(start_time < time) {
          params.start_time = start_time;
          params.exclude_start = 'True';
        }

        fetchData(channel, params, time, display_cb, extractor);
      }
    }
  }

  data_store.getCorrelated = function(channel, time, display_cb) {
    var params = {
      time: time,
      limit: max_num_correlated
    };

    $.get('/correlation_vector/' + channel, params, makeCorrelatedHandler(display_cb, true), 'json');
  }

  data_store.getCorrelationMatrix = function(time, display_cb) {
    var params = {
      time: time
    };

    $.get('/correlation_matrix', params, makeCorrelatedHandler(display_cb, true), 'json');
  }

  // This may later take a time, and also include returning the
  // channel statuses, as well.
  data_store.getChannels = function(display_cb) {
    $.get('/static/data/channels.json', {}, makeCorrelatedHandler(display_cb, false), 'json');
  }

  function getLastDataTime(channel) {
    var info = detail_data[channel];

    return ((info.values.length - 1) * info.time_span) + info.time_start;
  }

  function fetchData(channel, params, time, display_cb, extractor) {
    $.get('/data/' + channel, params, makeDetailDataHandler(channel, time, display_cb, extractor), 'json');
  }

  function makeDetailDataHandler(channel, time, display_cb, extractor) {
    return function(data) {
      if(data.status == 'ERROR') {
        return false;
      }

      if(detail_data[channel] == undefined) {
        // Need to add all the data
        detail_data[channel] = data;

        // This tracks to ensure requests are ignored if
        // a newer one arrives first
        detail_data[channel].last_updated = time;

        // This tracks to see when there is no more data
        // for the channel. Semi-hacky way of stopping
        // requesting for now.
        detail_data[channel].consecutive_empty_fetches = 0;
      } else {
        // Just need to append, if this is the newest known request
        if(time > detail_data[channel].last_updated) {
          // Need to add on the values
          detail_data[channel].values = detail_data[channel].values.concat(data.values);

          // We shouldn't need to worry about race conditions here
          // I believe, because eventing of same origin stuff should
          // be single thread. I'm not certain how this applies to
          // AJAX, but will look further to make certain we're good.
          detail_data[channel].last_updated = time;

          if(data.values.length == 0) {
            detail_data[channel].consecutive_empty_fetches++;
          } else {
            detail_data[channel].consecutive_empty_fetches = 0;
          }
        } else {
          return false; // Ignore because a newer and superseding request already arrived
        }
      }

      // Now we need to fire the callback
      // This could potentially be refactored with the original method
      // but putting it here for now. It does have a difference to
      // handle the case where there is no data for the current time
      var index = Math.min(
        indexOfTime(detail_data[channel], time),
        detail_data[channel].values.length - 1
      );

      if(isDisplayableIndex(detail_data[channel], index)) {
        // Then we have the data
        display_cb(extractor(detail_data[channel], index));
      } // Else there is no data for the channel
    };
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
    cols[0].unshift(info.display_name);
    cols[1].unshift('x');

    return {
      columns: cols
    };
  }

  // Helper function to get a single datum at the given index
  // Assumes this is a displayable index
  function getDetailDatum(info, index) {
    return info.values[index];
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
    return index > -1 && index < info.values.length;
  }

  // This function could easily be made general, or
  // be replaced by an anonymous function in place
  function makeCorrelatedHandler(display_cb, check_status) {
    return function(data) {
      if(!check_status || data.status == 'SUCCESS') {
        // Here's where the data will be cached, potentially
        display_cb(data);
      }
    };
  }

  // Wrapper for the fault callback
  function makeFaultHandler(fault_cb) {
    return function(data) {
      if(data.status == 'SUCCESS' && data.faults.length > 0) {
        // We have faults
        fault_cb(data.faults);
      }
    }
  }

}(window.data_store = window.data_store || {}, jQuery));
