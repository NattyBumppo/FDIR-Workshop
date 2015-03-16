using UnityEngine;
using System.Collections;

public class ShowDistanceMarker : MonoBehaviour {

    public ParseTelemetryFromArduino parsedTelem;

    public GameObject distanceMarker;
    public bool objectSeenInSensor = false;

    private Vector3 initialOffset = new Vector3(-0.568f, 0.0f, 0.0f);

    private float distanceScalingFactor = 0.05f;

	// Use this for initialization
	void Start()
    {
        // Disable drawing of distance marker cube for now
        distanceMarker.GetComponent<MeshRenderer>().enabled = false;
        initialOffset = transform.localPosition;
	}
	
	// Update is called once per frame
	void Update()
    {
	    // Get current distance
        float currentDistance = parsedTelem.distanceSensorTelem;

        // Only trust this distance if it's less than 150cm
        if (currentDistance < 150.0f)
        {
            // Move distance marker to that distance away from the sensor,
            // in the direction that the sensor is pointing
            Vector3 back = new Vector3(-1, 0, 0);
            distanceMarker.transform.localPosition = initialOffset + currentDistance * distanceScalingFactor * back;
            distanceMarker.GetComponent<MeshRenderer>().enabled = true;
            objectSeenInSensor = true;
        }
        else if (distanceMarker.GetComponent<MeshRenderer>().enabled)
        {
            // Don't draw
            distanceMarker.GetComponent<MeshRenderer>().enabled = false;
            objectSeenInSensor = false;
        }
	}
}
