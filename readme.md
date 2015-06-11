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

## Research and Development Process

The research behind this project actually dates back to the beginning of 2015, when Nathaniel started researching Fault Detection, Isolation, and Recovery (FDIR) system design as part of his graduate research in Aeronautics & Astronautics. Prior to this, he had worked on code and testing related to FDIR systems at SpaceX, and had used a few different telemetry monitoring and analysis tools. The tools that he used informed his work and some of the early design decisions that were made on this project.

After the project kicked into gear and Nick joined the effort, the two of them began to look into other aerospace industry systems, as well as read academic research into how to solve many of the problems related to the display and analysis of thousands of slightly-related channels of data. They were inspired by methods of graphically showing cross-correlations which were described by [Yairi et al](http://ieeexplore.ieee.org/xpl/login.jsp?tp=&arnumber=1659593&url=http%3A%2F%2Fieeexplore.ieee.org%2Fiel5%2F11019%2F34750%2F01659593), as well as by techniques for packing in large amounts of status-related data into a small space that were originally described by [Cancro et al](http://ieeexplore.ieee.org/xpl/login.jsp?tp=&arnumber=4161690&url=http%3A%2F%2Fieeexplore.ieee.org%2Fxpls%2Fabs_all.jsp%3Farnumber%3D4161690).

As development continued, they iterated on design decisions and improved the overall interface and its ability to quickly and clearly convey data. That iteration continues.

## Division of Labor

The major tasks within this project were distributed as follows:

* **Nathaniel**: Data simulation, fault detection system, monitoring panel, correlation backend, metafile format design and parsing, server-client communication
* **Nick**: channel hierarchy window, correlation matrix frontend, channel correlation vector frontend, plot, server-client communication

(However, there was quite a bit of crossover as well as pair-programming.)
