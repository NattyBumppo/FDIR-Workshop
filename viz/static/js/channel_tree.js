(function(channel_tree, $, undefined) {
  var tree_area;
  var width;
  var height;
  var tree;
  var root;
  var vis;
  var node_map = {};

  var margins = [20, 120, 20, 120];// t r b l
  var diagonal = d3.svg.diagonal().projection(
    function(d) {
      return [d.y, d.x];
    }
  );
  var counter = 0;

  var light_green = '#92CF8F';
  var light_red = '#CF8F95';

  channel_tree.bind = function(selector) {
    tree_area = $(selector);
  }

  channel_tree.markFaulted = function(node_name, info) {
    if(node_map[node_name]) {
      node_map[node_name].faulted = true;

      node_map[node_name].fault_info = node_map[node_name].fault_info || []; // Should never be a false-y value

      node_map[node_name].fault_info.push(info.name);
      redraw();
    }
  }

  channel_tree.clearFaulted = function(node_name) {
    if(node_map[node_name]) {
      node_map[node_name].faulted = false;
      redraw();
    }
  }

  channel_tree.clearAllFaulted = function() {
    for(var node_name in node_map) {
      node_map[node_name].faulted = false;
      redraw();
    }
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

  channel_tree.display = function() {
    data_store.getChannels(display_cb);
  }

  function redraw() {
    update(root);
  }

  function display_cb(data) {
    build_node_map(data);
    draw_tree(data);// As in corr matrix case, may want to condense this
  }

  // This function builds up a node map from node names
  // so that we don't have to crawl the hierarchy every time we want
  // to find the node
  function build_node_map(node) {
    if(node.id_name) {
      node.faulted = false;
      node_map[node.id_name] = node;
    }

    // Technically these could be an if-else with the current setup,
    // but I don't want to necessarily make that assumption always, eventually

    if(node.children) {
      node.children.forEach(build_node_map);
    }
  }

  // Returns true if the node is a leaf node and faulted,
  // or if it has any faulted children
  function is_node_faulted(node) {
    if(node.children || node._children) {
      return (node.children || node._children).map(is_node_faulted).reduce(
        function(fault_status, child_status) {
          return fault_status || child_status;
        },
        false
      );
    } else {
      return node.faulted;
    }
  }

  // Gets a collected set of the fault information for a given node
  // This includes deduping it
  // Assumes the node is faulted. That can be checked with `is_node_faulted`
  function get_fault_info(node) {
    if(node.children || node._children) {
      // Get fault info from children
      var infos = (node.children || node._children).map(get_fault_info);

      // Now we need to merge it
      var merged_info = [];
      for(var i=0;i<infos.length;i++) {
        for(var j=0;j<infos[i].length;j++) {
          if(merged_info.indexOf(infos[i][j]) == -1) {
            // Then the name is not a duplicate
            merged_info.push(infos[i][j]);
          }
        }
      }

      return merged_info;
    } else {
      return node.fault_info || [];
    }
  }

  // Setup the tooltips for faulted elements
  function setupTooltips(nodes) {
    var elems = nodes[0];

    nodes.each(
      function(d, i) {
        if(is_node_faulted(d)) {
          $(this).qtip(
            {
              content: {
                text: generateFaultText(d)
              }
            }
          );
        }
      }
    );
  }

  // Generates the html for a fault tooltip
  function generateFaultText(node) {
    var fault_info = get_fault_info(node);
    return '<h4>Faults</h4><ul><li>' + fault_info.join('</li><li>') + '</li></ul>';
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

        // Will want to set a class here that we can target
        // to highlight the node
        if(d.id_name) {
          controller.focus(d.id_name);
        }
      }
    );

    node_enter.append('circle').attr(
      {
        'r': 1e-6,
        'class': function(d) {
          return is_node_faulted(d) ? 'faulted' : '';
        }
      }
    ).style(
      'fill',
      function(d) {
        var node_color = is_node_faulted(d) ? light_red : light_green;
        return d._children ? node_color : '#FFF';
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

    setupTooltips(node_enter);

    var node_update = node.transition().duration(duration).attr(
      'transform',
      function(d) {
        return 'translate(' + d.y + ',' + d.x + ')';
      }
    );

    node_update.select('circle').attr(
      {
        'r': 4.5,
        'class': function(d) {
          return is_node_faulted(d) ? 'faulted' : '';
        }
      }
    ).style(
      'fill',
      function(d) {
        var node_color = is_node_faulted(d) ? light_red : light_green;
        return d._children ? node_color : '#FFF';
      }
    );

    node_update.select('text').style('fill-opacity', 1);

    setupTooltips(node_update);

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
