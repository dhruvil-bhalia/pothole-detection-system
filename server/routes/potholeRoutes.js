const express = require("express");

console.log("ROUTES FILE LOADED");

const router = express.Router();

const Pothole = require("../models/Pothole");
const upload = require("../middleware/upload");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371000;

    const dLat =
        (lat2 - lat1) * Math.PI / 180;

    const dLon =
        (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;

}

function calculatePriority(severity, detectionCount) {

  // ==========================
  // HIGH SEVERITY
  // ==========================
  if (severity === "High") {

    if (detectionCount >= 5)
      return "Critical";

    return "High";
  }

  // ==========================
  // MEDIUM SEVERITY
  // ==========================
  if (severity === "Medium") {

    if (detectionCount >= 5)
      return "High";

    return "Medium";
  }

  // ==========================
  // LOW SEVERITY
  // ==========================
  if (severity === "Low") {

    if (detectionCount >= 10)
      return "High";

    if (detectionCount >= 5)
      return "Medium";

    return "Low";
  }

  return "Low";
}

// ==============================
// IMAGE UPLOAD
// ==============================
router.post(
  "/upload",
  upload.single("image"),
  async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        imageUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ==============================
// CREATE POTHOLE
// ==============================
router.post("/add", async (req, res) => {

  console.log("========== ADD ROUTE EXECUTED ==========");
  console.log(req.body);

  try {

    const vehicleId = req.body.vehicleId || "Unknown Vehicle";

console.log("🚗 Vehicle ID:", vehicleId);

    console.log("REQ BODY:");
    console.log(req.body);

// ======================================
// Check for Existing Pothole
// ======================================

const allPotholes = await Pothole.find();

let pothole = null;

for (const existing of allPotholes) {

  const distance = calculateDistance(

    Number(req.body.latitude),
    Number(req.body.longitude),

    Number(existing.latitude),
    Number(existing.longitude)

  );

  if (distance <= 8) {

    pothole = existing;

    break;

  }

}

// ======================================
// Existing Pothole Found
// ======================================

if (pothole) {

  pothole.detectionCount += 1;

  pothole.detectedBy =
    req.body.detectedBy || pothole.detectedBy;

  pothole.vehicleId = vehicleId;

  pothole.confidence =
    req.body.confidence || pothole.confidence;

  pothole.imageUrl =
    req.body.imageUrl || pothole.imageUrl;

  pothole.history.push({
    vehicleId: vehicleId,
    detectedBy: req.body.detectedBy || "AI System",
    confidence: req.body.confidence || 0,
    detectedAt: new Date(),
  });

  pothole.priority = calculatePriority(
    pothole.severity,
    pothole.detectionCount
  );

  await pothole.save();

  pothole.priority = calculatePriority(

    pothole.severity,

    pothole.detectionCount

  );

  await pothole.save();
  

  console.log(
    "♻ Existing pothole updated"
  );

}

// ======================================
// New Pothole
// ======================================

else {

pothole = await Pothole.create({

    latitude: req.body.latitude,

    longitude: req.body.longitude,

    severity: req.body.severity,

    confidence: req.body.confidence || 0,

    imageUrl: req.body.imageUrl || "",

detectedBy: req.body.detectedBy || "AI System",

vehicleId: vehicleId,

detectionCount: 1,

    priority: calculatePriority(
        req.body.severity,
        1
    ),

    status: "Pending",

history: [

  {

    vehicleId: vehicleId,

    detectedBy:
        req.body.detectedBy || "AI System",

    confidence:
        req.body.confidence || 0,

    detectedAt: new Date(),

  },

],

});

  console.log(
    "🆕 New pothole created"
  );

}

    // ==============================
    // SOCKET.IO REAL-TIME ALERT
    // ==============================
    const io = req.app.get("io");
const drivers = req.app.get("drivers");

// Notify only nearby drivers
Object.keys(drivers).forEach((socketId) => {

const driver = drivers[socketId];

// Skip the vehicle that reported the pothole
if (driver.vehicleId === pothole.detectedBy) {

    console.log(
        `⏩ Skipping ${driver.vehicleId} (Reporting Vehicle)`
    );

    return;

}

  // Distance (approx.)
const distance = calculateDistance(

    Number(pothole.latitude),
    Number(pothole.longitude),

    Number(driver.latitude),
    Number(driver.longitude)

);



  console.log(
    `Distance to ${socketId}: ${Math.round(distance)} meters`
  );

  console.log({
  potholeLat: pothole.latitude,
  potholeLng: pothole.longitude,
  driverLat: driver.latitude,
  driverLng: driver.longitude,
  distance: Math.round(distance),
});

  // Alert only if driver is within 100 meters
  if (distance <= 100) {

    io.to(socketId).emit("new-pothole", {
      _id: pothole._id,
      latitude: pothole.latitude,
      longitude: pothole.longitude,
      severity: pothole.severity,
      confidence: pothole.confidence,
      imageUrl: pothole.imageUrl,
      detectedBy: pothole.detectedBy,
      createdAt: pothole.createdAt,
      distance: Math.round(distance),
    });

    console.log(
      `✅ Alert sent to ${socketId}`
    );

  } else {

    console.log(
      `❌ ${socketId} is too far away`
    );

  }

});

    console.log("SAVED POTHOLE:");
    console.log(pothole);

    res.status(201).json({
      success: true,
      data: pothole,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==============================
// GET ALL POTHOLES
// ==============================
router.get("/", async (req, res) => {
  try {
    const potholes = await Pothole.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: potholes.length,
      data: potholes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==============================
// GET SINGLE POTHOLE
// ==============================
router.get("/:id", async (req, res) => {
  try {
    const pothole = await Pothole.findById(req.params.id);

    if (!pothole) {
      return res.status(404).json({
        success: false,
        message: "Pothole not found",
      });
    }

    res.status(200).json({
      success: true,
      data: pothole,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==============================
// UPDATE POTHOLE
// ==============================
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {

    try {

      // If status becomes Repaired,
      // automatically save completion time
      if (req.body.status === "Repaired") {

        req.body.completedAt = new Date();

      }

      // If changed back from Repaired,
      // clear completion date
      else if (req.body.status) {

        req.body.completedAt = null;

      }

      const pothole = await Pothole.findByIdAndUpdate(

        req.params.id,

        req.body,

        {
          new: true,
          runValidators: true,
        }

      );

      if (!pothole) {

        return res.status(404).json({

          success: false,

          message: "Pothole not found",

        });

      }

      res.status(200).json({

        success: true,

        data: pothole,

      });

    }

    catch (error) {

      res.status(500).json({

        success: false,

        message: error.message,

      });

    }

});

// ==============================
// DELETE POTHOLE
// ==============================
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
  try {
    const pothole = await Pothole.findByIdAndDelete(req.params.id);

    if (!pothole) {
      return res.status(404).json({
        success: false,
        message: "Pothole not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Pothole deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;