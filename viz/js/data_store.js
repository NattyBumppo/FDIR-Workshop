// We will need to add in a global timekeeping system that will track the current intervals
// and times that we are interested in, that can be queried here, so we don't need
// to pass it around over and over


// We may not need jQuery here
(function(data_store, $, undefined) {
  var temp_index = 0;
  var detail_data = {
    sample_1: {
      name: 'data1',
      timings: [0, 5, 10, 15, 20, 25],
      values: [50, 80, 100, 200, 50, 100]
    },
    sample_2: {
      name: 'data2',
      timings: [0, 5, 10, 15, 20, 25],
      values: [35, 220, 10, 45, 170, 25],
    }
  };

  var correlation_data = {};

  data_store.getData = function(channel) {
    var cols = [];
    cols.push(
      ['x'].concat(
        detail_data[channel].timings
      )
    );

    cols.push(
      [detail_data[channel].name].concat(
        detail_data[channel].values
      )
    );

    return {
      x: 'x',
      columns: cols
    };
  }

  data_store.getCorrelated = function(channel, display_cb) {
    var range = {
      start: 'start_date',
      end: 'end_date'
    };

    $.get('/data/correlation_temp.json', range, makeCorrelatedHandler(display_cb), 'json');
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
