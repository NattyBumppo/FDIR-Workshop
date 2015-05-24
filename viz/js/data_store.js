// We will need to add in a global timekeeping system that will track the current intervals
// and times that we are interested in, that can be queried here, so we don't need
// to pass it around over and over


// We may not need jQuery here
(function(data_store, $, undefined) {
  var temp_index = 0;
  var detail_data = {
    sample_1: [
      ['x', 5, 10, 15, 20, 25, 30],
      ['data1', 50, 80, 100, 200, 50, 100]
    ],
    sample_2: [
      ['x', 5, 10, 15, 20, 25, 30],
      ['data2', 35, 220, 10, 45, 170, 25],
    ],
  };

  var correlation_data = {
    sample_correlation: [
      {
        name: 'Super similar',
        score: 0.97
      },
      {
        name: 'Pretty close',
        score: 0.94
      },
      {
        name: 'Hall Thruster Voltage',
        score: 0.90
      },
      {
        name: 'Random Related Channel',
        score: 0.87
      },
      {
        name: 'Sort of Connected',
        score: 0.85
      },
      {
        name: 'Related a Bit',
        score: 0.84
      },
      {
        name: 'Semi-close',
        score: 0.77
      },
      {
        name: 'A Bit Further',
        score: 0.65
      },
      {
        name: 'Pretty Dissimilar',
        score: 0.43
      },
      {
        name: 'Not Very Close',
        score: 0.32
      },
      {
        name: 'Decently Dissimilar',
        score: 0.30
      },
      {
        name: 'Even more so',
        score: 0.31
      },
      {
        name: 'I am now',
        score: 0.28
      },
      {
        name: 'Running out of',
        score: 0.27
      },
      {
        name: 'Clever example',
        score: 0.26
      },
      {
        name: 'Names to use',
        score: 0.25
      },
      {
        name: 'But I think',
        score: 0.20
      },
      {
        name: 'The point',
        score: 0.15
      },
      {
        name: 'Is pretty self',
        score: 0.12
      },
      {
        name: 'Evident',
        score: 0.10
      }
    ]
  };

  data_store.getData = function(channel) {
    return {
      x: 'x',
      columns: detail_data[channel]
    };
  }

  data_store.getCorrelated = function(channel, display_cb) {
    // This will wrap to the server via a cb later
    display_cb(correlation_data[channel]);
  }

}(window.data_store = window.data_store || {}, jQuery));
