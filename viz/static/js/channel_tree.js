(function(channel_tree, $, undefined) {
  var tree_area;
  var width;
  var height;
  var tree;
  var root;
  var vis;

  var margins = [20, 120, 20, 120];
  var diagonal = d3.svg.diagonal().projection(
    function(d) {
      return [d.y, d.x];
    }
  );
  var counter = 0;

  channel_tree.bind = function(selector) {
    tree_area = $(selector);
  }

  channel_tree.setup = function(w, h) {
    width = w;
    height = h;
    tree = d3.layout.tree().size(
      [
        height - margins[0] - margins[2],
        width - margins[1] - margins[3]
      ]
    );
  }

  channel_tree.display = function(time) {
    data_store.getChannels(display_cb);
  }

  function display_cb(data) {
    draw_tree(data);// As in corr matrix case, may want to condense this
  }

  // This is modified code based somewhat on code from
  // mbostock.github.io/d3/talk/20111018/tree.html
  function draw_tree(data) {
    // Create main svg canvas
    vis = d3.select(tree_area[0]).append('svg');
    vis.attr(
      {
        width: width,
        height: height
      }
    );

    // Add a group to translate for margins
    var vis_group = vis.append('g');
    vis_group.attr(
      {
        transform: 'translate(' + margins[3] + ',' + margins[0] + ')'
      }
    );

    root = data;

    root.x0 = height / 2;
    root.y0 = 0;

    root.children.forEach(toggleAll);

    update(root);
  }

  // Recursively toggle element and its children, if any
  function toggleAll(d) {
    if(d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
    }
  }

  // Toggle an individual node
  function toggle(d) {
    if(d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
  }

  function update(source) {
    var duration = d3.event && d3.event.altKey ? 5000 : 500;

    var nodes = tree.nodes(root).reverse();

    // Fixing y-offset based on depth
    nodes.forEach(
      function(d) {
        d.y = d.depth * 180;
      }
    );

    var node = vis.selectAll('g.node').data(
      nodes,
      function(d) {
        return d.id || (d.id = ++counter);
      }
    );

    var node_enter = node.enter().append('g').attr(
      {
        'class': 'node',
        'transform': function(d) {
          return 'translate(' + source.y0 + ',' + source.x0 + ')';
        }
      }
    ).on(
      'click',
      function(d) {
        toggle(d);
        update(d);
      }
    );

    node_enter.append('circle').attr('r', 1e-6).style(
      'fill',
      function(d) {
        return d._children ? '#92CF8F' : '#FFF';
      }
    );

    node_enter.append('text').attr(
      {
        x: function(d) {
          return d.children || d._children ? -10 : 10;
        },
        dy: '.35em',
        'text-anchor': function(d) {
          return d.children || d._children ? 'end' : 'start';
        }
      }
    ).text(
      function(d) {
        return d.category || d.display_name;
      }
    ).style('fill-opacity', 1e-6);

    var node_update = node.transition().duration(duration).attr(
      'transform',
      function(d) {
        return 'translate(' + d.y + ',' + d.x + ')';
      }
    );

    node_update.select('circle').attr('r', 4.5).style(
      'fill',
      function(d) {
        return d._children ? '#92CF8F' : '#FFF';
      }
    );

    node_update.select('text').style('fill-opacity', 1);

    var node_exit = node.exit().transition().duration(duration).attr(
      'transform',
      function(d) {
        return 'translate(' + source.y + ',' + source.x + ')';
      }
    ).remove();

    node_exit.select('circle').attr('r', 1e-6);

    node_exit.select('text').style('fill-opacity', 1e-6);

    var link = vis.selectAll('path.link').data(
      tree.links(nodes),
      function(d) {
        return d.target.id;
      }
    );

    link.enter().insert('path', 'g').attr(
      {
        'class': 'link',
        'd': function(d) {
          var o = {
            x: source.x0,
            y: source.y0
          };

          return diagonal(
            {
              source: o,
              target: o
            }
          );
        }
      }
    ).transition().duration(duration).attr('d', diagonal);

    link.transition().duration(duration).attr('d', diagonal);

    link.exit().transition().duration(duration).attr(
      'd',
      function(d) {
        var o = {
          x: source.x,
          y: source.y
        };
        return diagonal(
          {
            source: o,
            target: o
          }
        );
      }
    ).remove();

    // Store old positions
    nodes.forEach(
      function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
      }
    );
  }

}(window.channel_tree = window.channel_tree || {}, jQuery));
