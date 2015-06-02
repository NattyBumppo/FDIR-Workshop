(function(correlation, $, undefined) {
  var correlation_area;
  var nodes;
  var matrix;
  var width;
  var height;

  // x will set a range marker from 0 to width
  // z sets the domain to [0, 4]
  // c makes a range of 10 colored categories
  var x;
  var z = d3.scale.linear().domain([0, 1]).clamp(true);
  var c = d3.scale.category10().domain(d3.range(10));

  var margin = {top: 80, right: 0, bottom: 10, left: 80}
  var margin = {top: 100, right: 0, bottom: 10, left: 100}

  correlation.bind = function(selector) {
    correlation_area = $(selector);
  }

  correlation.setup = function(w, h) {
    width = w;
    height = h;
    x = d3.scale.ordinal().rangeBands([0, width]);
  }

  correlation.display = function(time) {
    data_store.getCorrelationMatrix(time, display_cb);
  }

  correlation.hide = function() {
    correlation_area.empty();
  }

  // Callback function that handles displaying the results
  function display_cb(data) {
    draw_matrix(data);// May want to condense these, as this is currently unnecessary
  }

  // This function draw the matrix. It is closely based on the sample
  // code from Mike Bostock at http://bost.ocks.org/mike/miserables/
  // It is currently being adapted to work with our data
  function draw_matrix(data) {
    var svg = d3.select(correlation_area[0]).append("svg");
    svg.attr(
      {
        'width': width + margin.left + margin.right,
        'height': height + margin.top + margin.bottom
      }
    );

    svg.style(
      {
        'margin-left': -margin.left + 'px'
      }
    );

    var svg_group = svg.append("g");
    svg_group.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var dimensionality = data.channel_names.length;
    var matrix = [];

    // First, we're going to make a more complex structure of node info
    nodes = data.channel_names.map(
      function(channel_name, ind, arr) {
        // Here we can add various properties to later sort on
        // If we don't add any, we can just use the original array
        return {
          name: channel_name,
          index: ind
        };
      }
    );

    // Now we're going set up the matrix, with cells of data
    for(var i=0;i<data.channel_names.length;i++) {
      matrix[i] = [];

      for(var j=0;j<data.channel_names.length;j++) {
        matrix[i][j] = {
          x: j,
          y: i,
          z: 0,
          correlation: data.correlation_matrix[i][j] // Order shouldn't matter here
        };
      }
    }

    // Various sorting comparators
    var orders = {
      name: d3.range(dimensionality).sort(
        function(a, b) {
          return d3.ascending(nodes[a].name, nodes[b].name);
        }
      )
    };

    // Set default order
    x.domain(orders.name);

    var bg = svg_group.append('rect');
    bg.attr('class', 'cm-background');
    bg.style('width', width);
    bg.style('height', height);

    // Add rows with a weird pattern, that adds rows for all data entries
    // As the selectAll returns an empty set
    var row = svg_group.selectAll('.cm-row').data(matrix).enter().append('g').attr(
      {
        'class': 'cm-row',
        'transform': function(d, i) {
          return 'translate(0,' + x(i) + ')';
        }
      }
    ).each(setupRow);

    row.append("line").attr('x2', width);

    // Add text elements for the row labels
    row.append('text').attr(
      {
        'x': -6,
        'y': x.rangeBand() / 2,
        'dy': '.32em',
        'text-anchor': 'end'
      }
    ).text(
      function(d, i) {
        return nodes[i].name;
      }
    );

    // Now add columns with the same pattern
    var column = svg_group.selectAll('.cm-column').data(matrix).enter().append('g').attr(
      {
        'class': 'cm-column',
        'transform': function(d, i) {
          return 'translate(' + x(i) + ')rotate(-90)';
        }
      }
    );

    column.append('line').attr('x1', -width);// Check if this should technically be height?

    column.append('text').attr(
      {
        'x': 6,
        'y': x.rangeBand() / 2,
        'dy': '.32em',
        'text-anchor': 'start'
      }
    ).text(
      function(d, i) {
        return nodes[i].name;
      }
    );

  }

  function setupRow(row) {
    var cell = d3.select(this).selectAll(".cm-cell").data(
      row.filter(
        function(d) {
          return d.correlation;
        }
      )
    ).enter().append('rect').attr(
      {
        'class': 'cm-cell',
        'x': function(d) {
          return x(d.x);
        },
        'width': x.rangeBand(),
        'height': x.rangeBand()
      }
    ).style(
      {
        'fill-opacity': function(d) {
          return z(Math.abs(d.correlation));
        },
        'fill': function(d) {
          return (d.correlation >= 0) ? c(1) :  c(0);
        }
      }
    ).on('mouseover', cellMouseover).on('mouseout', cellMouseout);
  }

  function cellMouseover(p) {
    d3.selectAll('.cm-row text').classed('active', function(d, i) { return i == p.y; });
    d3.selectAll('.cm-column text').classed('active', function(d, i) { return i == p.x; });
  }

  function cellMouseout() {
    d3.selectAll('text').classed('active', false);
  }

  function order(order_type) {
    x.domain(orders[order_type]);

    var t = svg_group.transition().duration(2500);

    t.selectAll('.cm-row').delay(
      function(d, i) {
        return x(i) * 4;
      }
    ).attr('transform', function(d, i) {
      return 'translate(0,' + x(i) + ')';
    }).selectAll('.cm-cell').delay(
      function(d) {
        return x(d.x) * 4;
      }
    ).attr('x', function(d) {
      return x(d.x);
    });

    t.selectAll('.cm-column').delay(
      function(d, i) {
        return x(i) * 4;
      }
    ).attr('transform', function(d, i) {
      return 'translate(' + x(i) + ')rotate(-90)';
    });
  }

}(window.correlation_matrix = window.correlation_matrix || {}, jQuery));
