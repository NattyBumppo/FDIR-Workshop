# Metafiles

Two types of metafiles: one to hold information about data channels, their properties and their interrelationships, and another file for faults, including more complicated residual calculations

The data channel metafile might be formatted like so:

    HierarchySymbol(s) Name, Datatype, Units, Mean, StdDev

...and could also have headers for categories. Units would be used for display, but not really for calculations. Mean and standard deviation are for simulation purposes, and can be left as '-' if simulation is not occurring.

We could potentially utilize them for calculations by building a map of conversion ratios, and then allowing calculations to implicitly use that.

Example file:

    Electrical System
    * Left Motor
    ** Left motor current draw, float, A, 5.0, 1.0
    * Left motor voltage, float, V, 7.0, 0.5
    * Right Motor
    ** Right motor current draw, float, A, 5.0, 1.0
    * Right motor voltage, float, V, 7.0, 0.5
    Main CPU
    * Cores in use, int, -, 4, 0.4
    * Total CPU usage %, float, %, 50, 5
    * Total used RAM, float, MB, 500, 10
    * Current FSM state, string, -, -, -
    * Internal health metric, float, -, 80, 8
    Inertial Sensors
    * Gyroscope
    ** Gyroscope x-rotation, float, degrees, 0, 0.3
    ** Gyroscope y-rotation, float, degrees, 0, 0.3
    ** Gyroscope z-rotation, float, degrees, 0, 0.3
    * Accelerometer
    ** X acceleration, float, g, 0, 0.2
    ** Y acceleration, float, g, 0, 0.2
    ** Z acceleration, float, g, 0, 0.2

The file for defining fault conditions could depict basic mathematical rules for residual calculations, formatted something like this:

    Operation, Channel1, Channel2, ... , ChannelN, Comparator, ComparedValue, TriggeredFault

Operations could be things like Sum, Average, Difference, Max, Min, and Value (for a single value), and comparators could be >, >=, <, <=, and ==.

To show an example, the following would mean "Trigger a 'High motor voltage' fault if the left motor or right motor voltages exceed 10V, trigger an 'Overacceleration' fault if the average acceleration exceeds 5g."

    Value, Left motor voltage, >, 10, High motor voltage
    Value, Right motor voltage, >, 10, High motor voltage
    Average, X acceleration, Y acceleration, Z acceleration, >, 5, Overacceleration

**It would also be nice to support multiple conditions for a certain fault to occur (AND operator)**

These files can be read by our artificial data simulation script to generate values (and maybe even generate faults), and can also be read by our GUI to detect and properly display faults and channel relationships.

# Ideas for screen layout

* 2D plots on Unity GUI panels
* Split-screen with 2D on one side and 3D on another, or perhaps picture-in-picture view, or perhaps just panels overlaid on 3D (we'll have to figure out what looks best)
* Navigation of channels might be best implemented as a degree-of-interest tree

# 3D Usage ideas

* Certain special channels might have hooks in the GUI to affect 3D object positioning/orientation or creation/deletion, such as accelerometer data being used to rotate a piece of geometry or depth camera data being used to update knowledge of obstacles in the world. We can hard-code these relationships (for now anyway).
