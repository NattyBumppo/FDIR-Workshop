#include <SPI.h>
#include <ADXL362.h>
#include <glcd.h>
#include <fonts/allFonts.h>
#include <SoftwareSerial.h>

int distance_sensor_pin = A0;

ADXL362 accelerometer;

// XBee's DOUT (TX) is connected to pin 2 (Arduino's Software RX)
// XBee's DIN (RX) is connected to pin 3 (Arduino's Software TX)
SoftwareSerial XBee(2, 3); // RX, TX

int16_t xAcc, yAcc, zAcc, temp;

void setup()
{
    // Start serial comms
    Serial.begin(9600);
    // Start XBee radio
    XBee.begin(9600);
    // Start accelerometer with CS pin 53, then reset
    accelerometer.begin(53);
    // Set the SPI register bit that turns on measurement mode
    accelerometer.beginMeasure();

    // Set pinmode to read distance sensor
    pinMode(distance_sensor_pin, INPUT);
}

void loop()
{
    float avgXAcc, avgYAcc, avgZAcc, avgTemp;
    int16_t xAccSum, yAccSum, zAccSum, tempSum;
    xAccSum = 0;
    yAccSum = 0;
    zAccSum = 0;
    tempSum = 0;

    int samples = 3;

    for (int i = 0; i < samples; i++)
    {
        // Read acceleration on all three axes and temperature
        accelerometer.readXYZTData(xAcc, yAcc, zAcc, temp);
        
        // Add to running sums
        xAccSum += xAcc;
        yAccSum += yAcc;
        zAccSum += zAcc;
        tempSum += temp;
        delay(15);
    }

    // Calculate averages
    avgXAcc = (float)xAccSum / (float)samples;
    avgYAcc = (float)yAccSum / (float)samples;
    avgZAcc = (float)zAccSum / (float)samples;
    avgTemp = (float)tempSum / (float)samples;

    // Normalized acceleration values
    double normalizingFactor = sqrt(avgXAcc*avgXAcc + avgYAcc*avgYAcc + avgZAcc*avgZAcc);
    double xNorm = avgXAcc / normalizingFactor;
    double yNorm = avgYAcc / normalizingFactor;
    double zNorm = avgZAcc / normalizingFactor;

    // Read sensor to get distance voltage v
    float v = ((float)analogRead(distance_sensor_pin) / 1024.0) * 5.0;
    // Approximate distance in cm
    float distance = 306.439 + v * ( -512.611 + v * ( 382.268 + v * (-129.893 + v * 16.2537)));
    
    // Send telemetry packet over radio link
    String telemetryString = ":::" + (String)avgXAcc + ":"+ (String)avgYAcc + ":"+ (String)avgZAcc + ":"+ (String)distance + ":::";
    char telemetryCharArray[telemetryString.length()+1];
    telemetryString.toCharArray(telemetryCharArray, telemetryString.length()+1);
    XBee.write(telemetryCharArray);
        
    // Wait a tenth of a second
    delay(100);

}
