import Webcam from "react-webcam";
import { useRef, useState } from "react";
import axios from "axios";

function CameraCapture({

  vehicleId,

  setCapturedImage,

  fetchPotholes,

}) {
  const webcamRef = useRef(null);
  const [status, setStatus] = useState("Ready");

  const [statusColor, setStatusColor] =
  useState("success");

  const [detecting, setDetecting] =
  useState(false);

  const capture = async () => {
    setDetecting(true);

    setStatus("AI Detecting...");

    setStatusColor("warning");
    const imageSrc =
      webcamRef.current.getScreenshot();

      if (!imageSrc) {
  alert("Camera not ready");
  return;
}

    setCapturedImage(imageSrc);

    try {
      const blob = await fetch(
        imageSrc
      ).then((res) => res.blob());

      const formData =
        new FormData();

      formData.append(
        "image",
        blob,
        "capture.jpg"
      );

      const response =
        await axios.post(
          "http://127.0.0.1:5001/detect",
          formData
        );

       console.log(
        "BOXED IMAGE:",
          response.data.boxedImage
        );

      if (response.data.detected) {

        setStatus("Pothole Detected");

        setStatusColor("danger");

        navigator.geolocation.getCurrentPosition(
          async (position) => {

          const uploadedImageUrl =
            response.data.boxedImage;

            console.log("BOXED IMAGE:", response.data.boxedImage);

              console.log(
            "BOXED IMAGE:",
            response.data.boxedImage
          );

            const potholeData = {
              latitude:
                position.coords.latitude,

              longitude:
                position.coords.longitude,

              severity:
                response.data
                  .detections[0]
                  .severity,

              confidence:
                response.data
                  .detections[0] 
                  .confidence,

                  detectedBy:
                  vehicleId,

              imageUrl:
                uploadedImageUrl,
            };

console.log("Sending to Node...");
console.log(potholeData);

try {

  console.log("Sending to Node...");
  console.log(potholeData);

  const res = await axios.post(
    "http://localhost:5000/api/potholes/add",
    potholeData
  );

  console.log("✅ Node Response");
  console.log(res.data);

  await fetchPotholes();

} catch (err) {

  console.error("❌ Express Error");
  console.error(err);

  if (err.response) {
    console.log("Status:", err.response.status);
    console.log("Data:", err.response.data);
  }

}


          setTimeout(() => {
            setCapturedImage("");
          }, 2000);

          }
        );

      } else {

        setStatus("No Pothole Found");

        setStatusColor("success");

        alert("✅ No pothole detected");

      }

    } catch (error) {

      console.error(error);

setStatus("Server Offline");

setStatusColor("secondary");

alert("❌ Flask API not running");

    }

    setDetecting(false);

  };

return (

<div className="camera-ui">

<div className="camera-top">

<div>

<h4>
📷 {vehicleId}
</h4>

<p>
YOLOv8 Real-Time Detection
</p>

</div>

<span className="badge bg-success">

LIVE

</span>

</div>

<div className="camera-live">

<Webcam
  ref={webcamRef}
  audio={false}
  screenshotFormat="image/jpeg"
  onUserMedia={() => {
    console.log("✅ Camera Stream Started");
  }}
  onUserMediaError={(err) => {
    console.error("❌ Camera Error:", err);
  }}
  style={{
    width: "100%",
    height: "430px",
    objectFit: "cover",
    borderRadius: "18px",
    border: "3px solid #2563eb",
  }}
/>

</div>

<div className="camera-buttons">

<button
className="btn btn-success camera-capture-btn"

disabled={detecting}

onClick={capture}
>

{
detecting
?

<>
<span
className="spinner-border spinner-border-sm me-2">
</span>

Detecting...

</>

:

"📸 Capture & Detect"

}

</button>

</div>

<div className="camera-footer">

<div>

🟢 Camera Connected

</div>

<div>

🤖 YOLOv8 Model Loaded

</div>

<div>

Status :

<span
className={`badge bg-${statusColor} ms-2`}
>

{detecting

?

"Detecting..."

:

status}

</span>

</div>

</div>

</div>

);

}

export default CameraCapture;