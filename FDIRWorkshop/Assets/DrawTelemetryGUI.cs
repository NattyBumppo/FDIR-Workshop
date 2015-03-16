using UnityEngine;
using System.Collections;

public class DrawTelemetryGUI : MonoBehaviour {

    public ParseTelemetryFromArduino parsedTelem;
    public GUIStyle style;

	// Use this for initialization
	void Start()
    {
	   
	}
	
	// Update is called once per frame
	void Update()
    {
	
	}

    void OnGUI()
    {

        GUI.Box(new Rect(100, 100, 100, 100), "AccX: " 
            + parsedTelem.accelerometerTelemVector[0] 
            + "\nAccY: " + parsedTelem.accelerometerTelemVector[1] 
            + "\nAccZ: " + parsedTelem.accelerometerTelemVector[2] 
            + "\nDistance: " + parsedTelem.distanceSensorTelem, style);

    }
}
