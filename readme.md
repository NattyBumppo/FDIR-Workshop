# Summary

This is a networked JavaScript application (and accompanying Arduino application for real data, and Python data simulator for synthesized data) that allows the visualization, within a 2D/3D interface, of data sent from another device.

# Development Notes

## Setup

The server is [flask](http://flask.pocoo.org/), which can be installed minimally using:

    pip install flask

## Running

To run the visualization server/client combo, in the root directory either run:

    flask -a viz --debug run # Requires Flask 1.0, I believe (?)

or:

    python viz.py # Using python -m viz might be preferable, if we can get that working with flask

This will start a [localhost server](http://localhost:5000) on port 5000.

The first command requires Flask 1.0, I believe, but handles restarting the server for new code in a more reliable way.

Using python -m viz might be preferable to the second case, but might require some finagling to get working.
