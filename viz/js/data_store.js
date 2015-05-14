// We may not need jQuery here
(function(data_store, $, undefined) {
  var temp_index = 0;
  var vals = [
      ['data1', 30, 200, 100, 400, 150, 250],
      ['data1', 300, 20, 150, 40, 15, 200],
      ['data1', 50, 80, 100, 200, 50, 100]
  ];

  data_store.getData = function(channel) {
    return {
      columns: [
        vals[(temp_index++) % vals.length]
      ]
    };
  }

}(window.data_store = window.data_store || {}, jQuery));
