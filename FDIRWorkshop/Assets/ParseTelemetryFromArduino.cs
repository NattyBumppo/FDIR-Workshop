using UnityEngine;
using System.Collections;
using System;
using System.IO.Ports;
using System.Text;


public class ParseTelemetryFromArduino : MonoBehaviour {

    public SerialPort mySerialPort = new SerialPort("COM8", 9600);

    public volatile float[] accelerometerTelemVector;
    public volatile float distanceSensorTelem;

    public volatile int telemChannelCount;

	// Use this for initialization
	void Start()
    {
	    // Initialize telemetry values
        accelerometerTelemVector = new float[3];
        for (int i = 0; i < accelerometerTelemVector.Length; i++)
        {
            accelerometerTelemVector[i] = 0.0f;
        }
        distanceSensorTelem = 0.0f;
        
        // Serial port initialization
        mySerialPort.Parity = Parity.None;
        mySerialPort.StopBits = StopBits.One;
        mySerialPort.DataBits = 8;
        mySerialPort.DtrEnable = true;

        // Open serial port
        try
        {
            mySerialPort.Open();
        }
        catch (Exception e)
        {
            print("Error opening serial port: " + e.ToString());
        }
	}
	
	// Update is called once per frame
	void Update()
    {
        if (mySerialPort.IsOpen)
        {
            parseSerialData();
        }
        
	}

    private void parseSerialData()
    {
        // Read one packet from incoming serial data        
        string rawDataPacket = mySerialPort.ReadTo("::::::");
        
        // Split into values
        string[] values = rawDataPacket.Split(':');

        // Parse values (this ultimately ought to be codified in some config file...)
        if (values.Length != telemChannelCount)
        {
            // Do nothing; this data is obviously no good because it doesn't match the number of telemetry channels
        }
        else
        {
            // The count of telemetry channels is correct, so let's parse them
            accelerometerTelemVector[0] = float.Parse(values[0]);
            accelerometerTelemVector[1] = float.Parse(values[1]);
            accelerometerTelemVector[2] = float.Parse(values[2]);

            distanceSensorTelem = float.Parse(values[3]);
        }
    }

    void OnDestroy()
    {
        mySerialPort.Close();
    }
}
