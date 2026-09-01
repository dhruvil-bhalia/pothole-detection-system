import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import CameraCapture from "./components/CameraCapture";
import autoTable from "jspdf-autotable";
import Notification from "./components/Notification";
import PotholeChart from "./components/PotholeChart";
import "./App.css";
import CountUp from "react-countup";
import {
  getAllPotholes,
  addPothole,
  updatePothole,
  deletePothole,
  uploadImage,
} from "./services/potholeService";
import PotholeMap from "./components/PotholeMap";

import socket from "./socket";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ActivityFeed from "./components/ActivityFeed";
import VehicleNetwork from "./components/VehicleNetwork";

function App() {

    const token = localStorage.getItem("token");

    const role = localStorage.getItem("role");

    if (!token) {

      window.location.href = "/";

      return null;

    }

  const generatePDF = () => {
  const doc = new jsPDF({
  orientation: "landscape",
});

  doc.setFontSize(18);
  doc.text(
    "Pothole Detection Report",
    14,
    20
  );

  doc.setFontSize(12);

  doc.text(
    `Total Potholes: ${potholes.length}`,
    14,
    40
  );

  doc.text(
    `High Severity: ${highCount}`,
    14,
    50
  );

  doc.text(
    `Medium Severity: ${mediumCount}`,
    14,
    60
  );

  doc.text(
    `Low Severity: ${lowCount}`,
    14,
    70
  );

  autoTable(doc, {
    startY: 90,
head: [[
    "Latitude",
    "Longitude",
    "Severity",
    "Priority",
    "Status",
    "Detection Count",
    "Completed On",
    "Confidence",
    "Detected By",
]],
body: potholes.map((p) => [

      p.latitude,

      p.longitude,

      p.severity,

      p.priority,

      p.status,

      p.detectionCount ?? 1,

      p.completedAt
        ? new Date(p.completedAt).toLocaleString()
        : "-",

      p.confidence
        ? `${(p.confidence * 100).toFixed(1)}%`
        : "-",

      p.detectedBy,

]),
  });

let currentY =
  doc.lastAutoTable.finalY + 20;

doc.setFontSize(16);

doc.text(
  "Pothole Images",
  14,
  currentY
);

currentY += 10;

for (
  let i = 0;
  i < potholes.length;
  i++
) {
  const pothole =
    potholes[i];

  if (!pothole.imageUrl)
    continue;

  try {

doc.text(
  `Pothole ${i + 1}`,
  14,
  currentY
);

doc.text(
  `Latitude: ${pothole.latitude}`,
  14,
  currentY + 6
);

doc.text(
  `Longitude: ${pothole.longitude}`,
  14,
  currentY + 12
);

doc.text(
  `Severity: ${pothole.severity}`,
  14,
  currentY + 18
);

doc.text(
  `Priority: ${pothole.priority}`,
  14,
  currentY + 24
);

doc.text(
  `Status: ${pothole.status}`,
  14,
  currentY + 30
);

doc.text(
  `Detection Count: ${pothole.detectionCount}`,
  14,
  currentY + 36
);

doc.text(
  `Completed On: ${
    pothole.completedAt
      ? new Date(
          pothole.completedAt
        ).toLocaleString()
      : "-"
  }`,
  14,
  currentY + 48
);

doc.text(
  `Confidence: ${(
    (pothole.confidence || 0) * 100
  ).toFixed(2)}%`,
  14,
  currentY + 54
);

doc.addImage(

      pothole.imageUrl,

      "JPEG",

      14,

      currentY + 58,

      60,

      40

);

    currentY += 115;

    if (
      currentY > 250
    ) {
      doc.addPage();
      currentY = 20;
    }

  } catch (error) {
    console.error(error);
  }
}

doc.save(
  "Pothole_Report.pdf"
);
addActivity(
"📄",
"Authority Generated Report"
);
};

const generateExcel = () => {

const excelData = potholes.map((p, index) => ({

    "Sr No": index + 1,

    Latitude: p.latitude,

    Longitude: p.longitude,

    Severity: p.severity,

    Priority: p.priority,

    Status: p.status,

    "Detection Count": p.detectionCount ?? 1,

    Confidence:
      p.confidence
        ? `${(p.confidence * 100).toFixed(2)}%`
        : "N/A",

    "Detected By": p.detectedBy,

    Date:
      new Date(
        p.createdAt
      ).toLocaleString(),

      "Completed On":

p.completedAt

? new Date(

p.completedAt

).toLocaleString()

: "-",

}));

  const worksheet =
    XLSX.utils.json_to_sheet(
      excelData
    );

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Potholes"
  );

  const excelBuffer =
    XLSX.write(
      workbook,
      {
        bookType: "xlsx",
        type: "array",
      }
    );

  const data = new Blob(
    [excelBuffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  saveAs(
    data,
    "Pothole_Report.xlsx"
  );
addActivity(
"📊",
"Authority Exported Analytics"
);

};

  // -------------------------
// Vehicle Identity
// -------------------------

const [vehicleId] = useState(() => {

  let id = localStorage.getItem("vehicleId");

  if (!id) {
    id = "Vehicle-" + Math.floor(1000 + Math.random() * 9000);
    localStorage.setItem("vehicleId", id);
  }

  return id;

});

  const [potholes, setPotholes] = useState([]);
  const [capturedImage, setCapturedImage] = useState("");
  const [latitude, setLatitude] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [longitude, setLongitude] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState("");  
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [warning, setWarning] = useState("");
  const [nearestDistance, setNearestDistance] = useState(null);
  const [nearestPothole, setNearestPothole] = useState(null);
  const [showNotification, setShowNotification] =
  useState(false);

const [notificationTitle, setNotificationTitle] =
  useState("");

const [notificationMessage, setNotificationMessage] =
  useState("");

const [notificationSeverity, setNotificationSeverity] =
  useState("High");

  const [activities, setActivities] = useState([]);
  const [vehicles, setVehicles] = useState([]);

const addActivity = (
  icon,
  title
) => {

  const time = new Date().toLocaleTimeString();

  setActivities(prev => [

    {

      icon,

      title,

      time

    },

    ...prev.slice(0,9)

  ]);

}; 

const playAlarm = () => {

  const beep = (delay) => {

    setTimeout(() => {

      const audioContext =
        new (window.AudioContext ||
          window.webkitAudioContext)();

      const oscillator =
        audioContext.createOscillator();

      const gain =
        audioContext.createGain();

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.type = "square";
      oscillator.frequency.value = 1000;
      gain.gain.value = 0.5;

      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 180);

    }, delay);

  };

  beep(0);
  beep(250);
  beep(500);

};

useEffect(() => {

  fetchPotholes();

  // ===========================
  // Live Pothole Alert
  // ===========================

  socket.on("new-pothole", (newPothole) => {

    console.log("LIVE POTHOLE:", newPothole);

    fetchPotholes();

    addActivity(
      "🚨",
      `Driver Alert Broadcasted (${newPothole.severity})`
    );

    if (newPothole.severity !== "High") return;

    setNotificationTitle("🚨 DRIVER ALERT");

    setNotificationSeverity(newPothole.severity);

    setNotificationMessage(`
Distance : ${newPothole.distance} meters

Confidence : ${(newPothole.confidence * 100).toFixed(2)}%

Latitude : ${Number(newPothole.latitude).toFixed(5)}

Longitude : ${Number(newPothole.longitude).toFixed(5)}

⚠ Slow Down Immediately
`);

    playAlarm();

    const speech = new SpeechSynthesisUtterance(
      "Warning. High severity pothole ahead. Slow down immediately."
    );

    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.cancel();

    setTimeout(() => {
      window.speechSynthesis.speak(speech);
    }, 700);

    setShowNotification(true);

    addActivity(
      "📍",
      "Nearby Driver Notified"
    );

    setTimeout(() => {
      setShowNotification(false);
    }, 5000);

  });

  // ===========================
  // Receive Online Vehicle List
  // ===========================

socket.on("vehicle-list", (vehicleList) => {

  console.log("🚗🚗🚗 ONLINE VEHICLE COUNT:", vehicleList.length);

  console.table(vehicleList);

  setVehicles(vehicleList);

});

  // ===========================
  // Live GPS Tracking
  // ===========================

  const watchId = navigator.geolocation.watchPosition(

    (position) => {

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setLatitude(lat);
      setLongitude(lng);

      socket.emit("driver-location", {

        vehicleId,

        latitude: Number(lat),

        longitude: Number(lng),

      });

      // Temporary offset for testing
      const testLat = lat + 0.0005;
      const testLng = lng + 0.0005;

      checkNearbyPotholes(
        testLat,
        testLng
      );

    },

    (error) => {

      console.log(error);

    },

    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000,
    }

  );

  return () => {

    socket.off("new-pothole");

    socket.off("vehicle-list");

    navigator.geolocation.clearWatch(watchId);

  };

}, [vehicleId]);



useEffect(() => {

  if (
    !latitude ||
    !longitude ||
    potholes.length === 0
  ) return;

  const driverLat =
    Number(latitude) + 0.0005;

  const driverLng =
    Number(longitude) + 0.0005;

  checkNearbyPotholes(
    driverLat,
    driverLng
  );

}, [
  potholes,
  latitude,
  longitude,
]);

  const fetchPotholes = async () => {
    try {
      const response = await getAllPotholes();
      setPotholes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

const getLocation = () => {

  if (!navigator.geolocation) {
    toast.error("❌ Geolocation is not supported by this browser.");
    return;
  }

  toast.info("📍 Getting your current location...");

  navigator.geolocation.getCurrentPosition(

    (position) => {

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      console.log("✅ CURRENT GPS LOCATION:", {
        latitude: lat,
        longitude: lng,
        accuracy: position.coords.accuracy,
      });

      // Replace manual values with actual GPS location
      setLatitude(lat);
      setLongitude(lng);

      toast.success(
        `📍 Location detected! Accuracy: ${Math.round(
          position.coords.accuracy
        )} m`
      );

    },

    (error) => {

      console.error("❌ GPS ERROR:", error);

      if (error.code === 1) {

        toast.error(
          "❌ Location permission denied. Please allow location access."
        );

      } else if (error.code === 2) {

        toast.error(
          "❌ Location unavailable. Check your GPS/location services."
        );

      } else if (error.code === 3) {

        toast.error(
          "⏱ Location request timed out. Try again."
        );

      } else {

        toast.error(
          "❌ Unable to get current location."
        );

      }

    },

    {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000,
    }

  );
};

const checkNearbyPotholes = (
  userLat,
  userLng
) => {

  if (potholes.length === 0) {
    setNearestPothole(null);
    setNearestDistance(null);
    setWarning("");
    return;
  }

  let nearest = null;
  let minDistance = Infinity;

potholes.forEach((p) => {

    // Ignore repaired potholes
    if (p.status === "Repaired") return;

    // Only High Severity potholes
    if (p.severity !== "High") return;

    const distance =
      Math.sqrt(
        Math.pow(
          Number(p.latitude) - Number(userLat),
          2
        ) +
        Math.pow(
          Number(p.longitude) - Number(userLng),
          2
        )
      ) * 111000;

    if (distance < minDistance) {
      minDistance = distance;
      nearest = p;
    }

});

  console.log("Driver:", {
    latitude: userLat,
    longitude: userLng,
  });

  console.log("Nearest:", nearest);

  console.log("Distance:", minDistance);

 if (nearest) {

    setNearestPothole(nearest);
    console.log(
  "SETTING NEAREST:",
  nearest
);

    setNearestDistance(
      Math.round(minDistance)
    );

    setWarning(
      "🚨 HIGH SEVERITY POTHOLE AHEAD"
    );

  } else {

    setNearestPothole(null);
    setNearestDistance(null);
    setWarning("");

  }

};

const handleImageUpload = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setImage(file);

  const formData = new FormData();

  formData.append(
    "image",
    file
  );

  try {
    const response =
      await uploadImage(formData);

    setImageUrl(
      response.imageUrl
    );

toast.success("📷 Image Uploaded Successfully");
addActivity(
"📷",
"Vehicle Camera Uploaded Detection"
);
  } catch (error) {
    console.error(error);
  }
};

const handleSubmit = async () => {
  try {

        console.log({
      latitude,
      longitude,
      severity,
      imageUrl,
    });
    
await addPothole({
  latitude: Number(latitude),
  longitude: Number(longitude),
  severity,
  imageUrl,
  vehicleId,
});

    setLatitude("");
    setLongitude("");
    setSeverity("Low");
    setImage(null);
    setImageUrl("");

    await fetchPotholes();

toast.success("🚧 Pothole Added Successfully");
addActivity(
"🚗",
"High Severity Pothole Detected"
);

    addActivity(
      "🚗",
      `Pothole Detected by ${vehicleId}`
    );

  } catch (error) {
    console.error(error);
  }
};
  const handleDelete = async (id) => {
    try {
      await deletePothole(id);
      await fetchPotholes();
      toast.success("🗑️ Pothole Deleted");
addActivity(
"🛠",
"Road Maintenance Record Removed"
);
    } catch (error) {
      console.error(error);
    }
  };

const handleSeverityChange = async (
  id,
  newSeverity
) => {

  const updated = potholes.map((p) =>
    p._id === id
      ? { ...p, severity: newSeverity }
      : p
  );

  setPotholes(updated);

  try {

    await updatePothole(id, {
      severity: newSeverity,
    });

  } catch (error) {

    console.error(error);

toast.error("Failed to update severity");

  }
};

const handleStatusChange = async (
  id,
  status
) => {

  const updated = potholes.map((p) =>
    p._id === id
      ? { ...p, status }
      : p
  );

  setPotholes(updated);

  try {

    await updatePothole(id, {
      status,
    });

    await fetchPotholes();

    toast.success("Status Updated");

    addActivity(
      "🛠",
      `Status changed to ${status}`
    );

  } catch (error) {

    console.error(error);

    toast.error("Failed to update status");

  }

};

const highCount =
potholes.filter(
(p)=>
p.status !== "Repaired" &&
p.severity==="High"
).length;

const mediumCount =
potholes.filter(
(p)=>
p.status !== "Repaired" &&
p.severity==="Medium"
).length;

const lowCount =
potholes.filter(
(p)=>
p.status !== "Repaired" &&
p.severity==="Low"
).length;

const pendingCount = potholes.filter(
  (p) => p.status === "Pending"
).length;

const progressCount = potholes.filter(
  (p) => p.status === "In Progress"
).length;

const repairedCount = potholes.filter(
  (p) => p.status === "Repaired"
).length;

const criticalCount =
potholes.filter(
(p)=>
p.priority==="Critical" &&
p.status!=="Repaired"
).length;

  const avgConfidence =
  potholes.length > 0
    ? (
        potholes.reduce(
          (sum, p) =>
            sum + (p.confidence || 0),
          0
        ) /
        potholes.length
      ) * 100
    : 0;
              
    const latestDetection =
  potholes.length > 0
    ? potholes.reduce(
        (latest, current) =>
          new Date(current.createdAt) >
          new Date(latest.createdAt)
            ? current
            : latest
      )
    : null;

    const confidenceChartData = {
  labels: potholes.map(
    (_, index) => `P${index + 1}`
  ),

  datasets: [
    {
      label: "Confidence %",
      data: potholes.map(
        (p) =>
          ((p.confidence || 0) * 100).toFixed(2)
      ),
      borderColor: "#6f42c1",
      backgroundColor:
        "rgba(111,66,193,0.2)",
      fill: true,
      tension: 0.4,
    },
  ],
};

return (
  <>

    <Notification
      show={showNotification}
      title={notificationTitle}
      message={notificationMessage}
      severity={notificationSeverity}
      onClose={() =>
        setShowNotification(false)
      }
    />

<nav
  className="navbar navbar-expand-lg shadow"
  style={{
    background: "#1e293b",
    padding: "15px 30px",
  }}
>
  <div className="container-fluid">

    <div className="d-flex align-items-center">

      <i
        className="bi bi-cone-striped"
        style={{
          color: "#ffc107",
          fontSize: "28px",
          marginRight: "12px",
        }}
      ></i>

      <div>

        <h4
          className="text-white m-0"
        >
          Pothole Detection System
        </h4>

        <small
          style={{
            color: "#94a3b8",
          }}
        >
          AI Powered Smart Road Monitoring
        </small>

      </div>

    </div>

    <div className="d-flex align-items-center">

<span
  className="badge bg-primary me-3 p-2"
>
  👤 {role === "admin" ? "Admin" : "Driver"}
</span>

      <button
        className="btn btn-danger"

        onClick={() => {

          localStorage.clear();

          window.location.href = "/";

        }}

      >
        <i className="bi bi-box-arrow-right"></i>
        {" "}
        Logout
      </button>

    </div>

  </div>
</nav>

{warning && (
  <div
    className="driver-alert text-center m-3"
    style={{
      fontWeight: "bold",
      animation: "blink 1s infinite",
      borderRadius: "15px",
    }}
  >
    <h3>🚨 DRIVER ALERT</h3>

    <h5>{warning}</h5>

    {nearestDistance && (
      <p>
        Distance:
        {" "}
        {nearestDistance}
        {" "}
        meters
      </p>
    )}

    <p>
      Reduce Speed Immediately
    </p>
  </div>
)}

<div className="dashboard-container">

<div className="row g-4 mb-4">

<div className="col-lg-2 col-md-4">

<div className="modern-card bg-primary">

<i className="bi bi-pin-map-fill icon"></i>

<h6>Total Potholes</h6>

<h2>
{
potholes.filter(
p=>p.status!=="Repaired"
).length
}
</h2>

</div>

</div>


<div className="col-lg-2 col-md-4">

<div className="modern-card bg-danger">

<i className="bi bi-exclamation-triangle-fill icon"></i>

<h6>High</h6>

<h2>{highCount}</h2>

</div>

</div>

<div className="col-lg-2 col-md-4">

<div className="modern-card bg-warning">

<i className="bi bi-cone-striped icon"></i>

<h6>Medium</h6>

<h2>{mediumCount}</h2>

</div>

</div>

<div className="col-lg-2 col-md-4">

<div className="modern-card bg-success">

<i className="bi bi-check-circle-fill icon"></i>

<h6>Low</h6>

<h2>{lowCount}</h2>


</div>

</div>

<div className="col-lg-4">

<div className="modern-card bg-dark">

<i className="bi bi-speedometer2 icon"></i>

<h6>Average Confidence</h6>

<h2>{avgConfidence.toFixed(2)}%</h2>

<small>

Latest:

{" "}

{latestDetection

?

new Date(

latestDetection.createdAt

).toLocaleString()

:

"No Data"}

</small>

</div>

</div>

</div>

<div className="municipal-dashboard mt-4 mb-5">

  <h3 className="mb-4">
    🏛 Municipal Road Maintenance Dashboard
  </h3>

  <div className="row g-3">

    <div className="col-lg-3 col-md-6">
      <div className="modern-card bg-warning">
        <i className="bi bi-hourglass-split icon"></i>
        <h6>Pending</h6>
        <h2>{pendingCount}</h2>
      </div>
    </div>

    <div className="col-lg-3 col-md-6">
      <div className="modern-card bg-info">
        <i className="bi bi-tools icon"></i>
        <h6>In Progress</h6>
        <h2>{progressCount}</h2>
      </div>
    </div>

    <div className="col-lg-3 col-md-6">
      <div className="modern-card bg-success">
        <i className="bi bi-check-circle-fill icon"></i>
        <h6>Repaired</h6>
        <h2>{repairedCount}</h2>
      </div>
    </div>

    <div className="col-lg-3 col-md-6">
      <div className="modern-card bg-dark">
        <i className="bi bi-exclamation-octagon-fill icon"></i>
        <h6>Critical</h6>
        <h2>{criticalCount}</h2>
      </div>
    </div>

  </div>

</div>

<div className="row g-4">

<div className="col-lg-8">

<div className="modern-form">

  <div className="d-flex justify-content-between align-items-center mb-4">

    <div>

      <h3 className="mb-1">
        ➕ Add New Pothole
      </h3>

      <p className="text-muted mb-0">
        Upload newly detected potholes into the AI database.
      </p>

    </div>

    <div>
      <span className="badge bg-primary fs-6">
        AI Detection
      </span>
    </div>

  </div>

  <div className="row">

    <div className="col-md-6 mb-3">

      <label className="form-label fw-bold">
        Latitude
      </label>

      <input
        type="number"
        className="form-control modern-input"
        placeholder="Enter Latitude"
        value={latitude}
        onChange={(e) =>
          setLatitude(e.target.value)
        }
      />

    </div>

    <div className="col-md-6 mb-3">

      <label className="form-label fw-bold">
        Longitude
      </label>

      <input
        type="number"
        className="form-control modern-input"
        placeholder="Enter Longitude"
        value={longitude}
        onChange={(e) =>
          setLongitude(e.target.value)
        }
      />

    </div>

    <div className="col-md-6 mb-3">

      <label className="form-label fw-bold">
        Severity
      </label>

      <select
        className="form-select modern-input"
        value={severity}
        onChange={(e) =>
          setSeverity(e.target.value)
        }
      >
        <option value="Low">🟢 Low</option>
        <option value="Medium">🟠 Medium</option>
        <option value="High">🔴 High</option>
      </select>

    </div>

    <div className="col-md-6 mb-3 d-flex align-items-end">

      <button
        className="btn btn-primary modern-btn w-100"
        onClick={getLocation}
      >
        📍 Get Current Location
      </button>

    </div>

    <div className="col-md-8 mb-3">

      <label className="form-label fw-bold">
        Upload Image
      </label>

      <input
        type="file"
        className="form-control modern-input"
        accept="image/*"
        onChange={handleImageUpload}
      />

    </div>

    <div className="col-md-4 mb-3 d-flex align-items-end">

      <button
        className="btn btn-success modern-btn w-100"
        onClick={handleSubmit}
      >
        🚀 Add Pothole
      </button>

    </div>

  </div>

</div>

</div>

<div className="col-lg-4">

    <ActivityFeed
        activities={activities}
    />


</div>

</div>

<div className="dashboard-container mt-4">

    <VehicleNetwork
        vehicles={vehicles}
    />

</div>

</div>

{imageUrl && (

<div className="preview-card">

  <h5>
    📷 Uploaded Image Preview
  </h5>

  <img
    src={imageUrl}
    alt="Preview"
  />

</div>

)}

<div className="row g-4 mb-4">

  <div className="col-lg-8">

    {/* existing content continues */}

  </div>

  <div className="col-lg-4">


  </div>

</div>

<div className="analytics-card compact-analytics">

<div className="analytics-header">

<div>

<h3>📊 Pothole Analytics</h3>

<p>
AI Generated Road Statistics
</p>

</div>

<div>

<span className="badge bg-success p-2">
LIVE
</span>

</div>

</div>

<div className="chart-wrapper">

<PotholeChart potholes={potholes} />

</div>

<div className="report-buttons">

{role === "admin" && (

<>

<button
className="btn btn-danger"
onClick={generatePDF}
>

<i className="bi bi-file-earmark-pdf"></i>

 Download PDF

</button>

<button
className="btn btn-success"
onClick={generateExcel}
>

<i className="bi bi-file-earmark-excel"></i>

 Download Excel

</button>

</>

)}

</div>

</div>

<div className="camera-dashboard">

<div className="camera-header">

<div>

<h3>
📷 AI Live Camera
</h3>

<p>
Real-Time YOLOv8 Detection System
</p>

</div>

<div>

<span className="badge bg-success p-2">

LIVE

</span>

</div>

</div>

<div className="camera-status">

<div>

🟢 Camera Connected

</div>

<div>

🤖 YOLOv8 Active

</div>

<div>

⚡ AI Detection Running

</div>

</div>

<div className="camera-box">

<CameraCapture
    vehicleId={vehicleId}
    setCapturedImage={setCapturedImage}
    fetchPotholes={fetchPotholes}
/>

</div>

</div>

<div className="map-dashboard">

<div className="map-header">

<div>

<h3>
🗺 Live Monitoring
</h3>

<p>
Real-Time Driver & Pothole Tracking
</p>

</div>

<div className="live-badge">

<span className="live-dot"></span>

LIVE

</div>

</div>

<PotholeMap
    potholes={potholes}

    vehicles={vehicles}

    driverLocation={{
        vehicleId,
        latitude: Number(latitude) + 0.0005,
        longitude: Number(longitude) + 0.0005,
    }}

    nearestPothole={nearestPothole}
/>

<div className="map-info">

<div>

🟢 Driver Connected

</div>

<div>

📍 GPS Active

</div>

<div>

⚠ High Alerts :
<b>
{" "}
{highCount}
</b>

</div>

<div>

🛣 Total :
<b>
{" "}
{potholes.length}
</b>

</div>

</div>

</div>


<div className="records-card">

<div className="records-header">

<div>

<h3>
📋 Pothole Records
</h3>

<p>
Manage detected potholes in real time.
</p>

</div>

<div>

<span className="badge bg-primary p-2">

Total :
{" "}
{potholes.length}

</span>

</div>

</div>
<div className="filter-buttons">

<button
className={`btn ${
filterSeverity==="All"
? "btn-dark"
: "btn-outline-dark"
}`}
onClick={() =>
setFilterSeverity("All")
}
>
All
</button>

<button
className={`btn ${
filterSeverity==="High"
? "btn-danger"
: "btn-outline-danger"
}`}
onClick={() =>
setFilterSeverity("High")
}
>
High
</button>

<button
className={`btn ${
filterSeverity==="Medium"
? "btn-warning"
: "btn-outline-warning"
}`}
onClick={() =>
setFilterSeverity("Medium")
}
>
Medium
</button>

<button
className={`btn ${
filterSeverity==="Low"
? "btn-success"
: "btn-outline-success"
}`}
onClick={() =>
setFilterSeverity("Low")
}
>
Low
</button>

</div>

  <div className="mb-3">
<div className="search-box">

<i className="bi bi-search"></i>

<input
type="text"
placeholder="Search by latitude, longitude, severity..."
value={searchTerm}
onChange={(e)=>
setSearchTerm(e.target.value)
}
/>

</div>
</div>

          <table className="table table-hover">
<thead className="table-dark">
  <tr>
    <th>Location</th>
    <th>Severity</th>
    <th>Priority</th>
    <th>Status</th>
    <th>Detection Count</th>
    <th>Confidence</th>
    <th>Detected By</th>
    <th>Image</th>
    <th>Date</th>
    <th>Completed On</th>
    <th>Actions</th>
  </tr>
</thead>

  <tbody>
    {potholes
      .filter((p) =>
        filterSeverity === "All"
          ? true
          : p.severity === filterSeverity
      )
      .filter((p) => {
        const text = `
          ${p.latitude}
          ${p.longitude}
          ${p.severity}
          ${p.confidence}
        `.toLowerCase();

        return text.includes(
          searchTerm.toLowerCase()
        );
      })
      .map((p) => (
                  <tr key={p._id}>
                    <td>
    <a
      href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
      target="_blank"
      rel="noreferrer"
    >
      View on Map
    </a>
  </td>

<td>
  {role === "admin" ? (
    <select
      className="form-select"
      value={p.severity}
      onChange={(e) =>
        handleSeverityChange(
          p._id,
          e.target.value
        )
      }
    >
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
    </select>
  ) : (
    <span
      className={
        p.severity === "High"
          ? "badge bg-danger"
          : p.severity === "Medium"
          ? "badge bg-warning text-dark"
          : "badge bg-success"
      }
    >
      {p.severity}
    </span>
  )}
</td>

{/* Priority */}
<td>
  <span
    className={
      p.priority === "Critical"
        ? "badge bg-dark"
        : p.priority === "High"
        ? "badge bg-danger"
        : p.priority === "Medium"
        ? "badge bg-warning text-dark"
        : "badge bg-success"
    }
  >
    {p.priority}
  </span>
</td>

<td>

  {role === "admin" ? (

    <select
      className="form-select"
      value={p.status || "Pending"}
      onChange={(e) =>
        handleStatusChange(
          p._id,
          e.target.value
        )
      }
    >

      <option value="Pending">
        Pending
      </option>

      <option value="In Progress">
        In Progress
      </option>

      <option value="Repaired">
        Repaired
      </option>

    </select>

  ) : (

    <span
      className={
        p.status === "Repaired"
          ? "badge bg-success"
          : p.status === "In Progress"
          ? "badge bg-warning text-dark"
          : "badge bg-danger"
      }
    >
      {p.status || "Pending"}
    </span>

  )}

</td>

{/* Detection Count */}
<td>
  <span className="badge bg-primary">
    {p.detectionCount ?? 1}
  </span>
</td>

{/* Confidence */}
<td>
  {p.confidence
    ? `${(p.confidence * 100).toFixed(2)}%`
    : "0%"}
</td>

{/* Detected By */}
<td>{p.detectedBy}</td>

{/* Image */}
<td>
  {p.imageUrl ? (
    <img
      src={p.imageUrl}
      alt="Pothole"
      width="80"
      height="60"
      style={{
        objectFit: "cover",
        borderRadius: "5px",
        cursor: "pointer",
      }}
      onClick={() =>
        setSelectedImage(p.imageUrl)
      }
    />
  ) : (
    "No Image"
  )}
</td>

  <td>
    {new Date(
      p.createdAt
    ).toLocaleString()}
  </td>

  <td>

  {p.completedAt
    ? new Date(
        p.completedAt
      ).toLocaleString()
    : "-"}

</td>

<td>

  {role === "admin" ? (

    <button
      className="btn btn-danger btn-sm"
      onClick={() =>
        handleDelete(p._id)
      }
    >
      Delete
    </button>

  ) : (

    <span
      className="text-muted"
    >
      No Access
    </span>

  )}

</td>
                </tr>
              ))}
</tbody>

</table>

<div className="records-footer">

Showing

<b>

{" "}
{potholes.length}
{" "}

</b>

Records

</div>

</div>

      {/* IMAGE PREVIEW MODAL */}

{selectedImage && (

<div
className="image-modal"
onClick={() => setSelectedImage("")}
>

<div
className="image-modal-content"
onClick={(e)=>e.stopPropagation()}
>

<div className="image-header">

<div>

<h3>
🖼 AI Detection Viewer
</h3>

<p>
Detected Pothole Image
</p>

</div>

<button
className="close-btn"
onClick={() => setSelectedImage("")}
>

✕

</button>

</div>

<div className="image-preview">

<img
src={selectedImage}
alt="Pothole"
/>

</div>

<div className="image-footer">

<div>

🤖 YOLOv8 Detection

</div>

<div>

🟢 Status :
Detected

</div>

<div>

📷 AI Camera

</div>

</div>

</div>

</div>

)}

{/* Toast Notification Container */}

<ToastContainer
position="top-right"
autoClose={2500}
hideProgressBar={false}
newestOnTop
closeOnClick
pauseOnHover
theme="colored"
/>

    </>
  );
}

export default App;
