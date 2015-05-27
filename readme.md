# Summary

This is a networked JavaScript application (and accompanying Arduino application for real data, and Python data simulator for synthesized data) that allows the visualization, within a 2D/3D interface, of data sent from another device.

# Development Notes

## Setup

The server is [flask](http://flask.pocoo.org/), which can be installed minimally using:

    pip install flask

## Running

To run the visualization server/client combo:

    cd viz
    python viz.py

This will start a [localhost server](http://localhost:5000) on port 5000.
