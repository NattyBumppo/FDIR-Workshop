// We may not need jQuery here
(function(data_store, $, undefined) {
  var temp_index = 0;
  var data = {
    sample_1: [
      ['data1', 30, 200, 100, 400, 150, 250],
      ['data1', 300, 20, 150, 40, 15, 200],
      ['data1', 50, 80, 100, 200, 50, 100]
    ],
    sample_2: [
      ['data2', 35, 220, 10, 45, 170, 25],
      ['data2', 130, 200, 180, 30, 120, 20],
      ['data2', 20, 60, 170, 100, 40, 60]
    ],
  }

  data_store.getData = function(channel) {
    return {
      columns: [
        data[channel][(temp_index++) % data[channel].length]
      ]
    };
  }

}(window.data_store = window.data_store || {}, jQuery));
