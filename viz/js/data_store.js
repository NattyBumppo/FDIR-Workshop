// We may not need jQuery here
(function(data_store, $, undefined) {
  var temp_index = 0;
  var data = {
    sample_1: [
      ['x', 5, 10, 15, 20, 25, 30],
      ['data1', 50, 80, 100, 200, 50, 100]
    ],
    sample_2: [
      ['x', 5, 10, 15, 20, 25, 30],
      ['data2', 35, 220, 10, 45, 170, 25],
    ],
  }

  data_store.getData = function(channel) {
    return {
      x: 'x',
      columns: data[channel]
    };
  }

}(window.data_store = window.data_store || {}, jQuery));
