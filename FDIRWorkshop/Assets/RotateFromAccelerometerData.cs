using UnityEngine;
using System.Collections;

public class RotateFromAccelerometerData : MonoBehaviour {

    public ParseTelemetryFromArduino parsedTelem;
    public Vector3 rollPitchYaw;


	// Use this for initialization
	void Start ()
    {
	
	}
	
	// Update is called once per frame
	void Update ()
    {
	    // Get accelerometer values and make them into gravity vector

        // Accelerometer axes:
        // x: forward (+) and back (-)... corresponds to z and -z for object axes
        // y: right (+) and left (-)... corresponds to -x and x for object axes
        // z: bottom (+) and top (-)... corresponds to -y and y for object axes

        rollPitchYaw = new Vector3(parsedTelem.accelerometerTelemVector[1], parsedTelem.accelerometerTelemVector[2], parsedTelem.accelerometerTelemVector[0]);
        rollPitchYaw.Normalize();

        transform.eulerAngles = rollPitchYaw * 90.0f;

        // Rotate parent according to gravity vector
        // Vector3 forward = new Vector3(-gravityVector.y, gravityVector.x, gravityVector.z);
        //Quaternion objectRotation = new Quaternion(0.f, 0.f, 0.f, 1.f);
        //objectRotation.y = 
        //transform.rotation = new Quaternion(

	}

}
