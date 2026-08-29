const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");

require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store every connected driver's latest location
const drivers = {};
app.set("drivers", drivers);

// Make Socket.IO and drivers available inside routes
app.set("io", io);


// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
  })
);
app.use(express.json());

// Static Uploads Folder
app.use("/uploads", express.static("uploads"));

// =======================
// Socket Connection
// =======================

io.on("connection", (socket) => {

  console.log("🚗 Driver Connected:", socket.id);

  // Receive driver's GPS location
socket.on("driver-location", (location) => {

  drivers[socket.id] = {

    vehicleId: location.vehicleId,

    latitude: location.latitude,

    longitude: location.longitude,

    status: "Online",

    lastSeen: new Date().toLocaleTimeString(),

  };

  console.log(
    "📍 Vehicle Updated:",
    drivers[socket.id]
  );

  // Send updated vehicle list to all connected clients
  io.emit("vehicle-list", Object.values(drivers));

});

socket.on("disconnect", () => {

  console.log(
    "❌ Vehicle Disconnected:",
    socket.id
  );

  delete drivers[socket.id];

  // Notify all clients with the updated online vehicle list
  io.emit("vehicle-list", Object.values(drivers));

});

});

// =======================
// Routes
// =======================

const potholeRoutes = require("./routes/potholeRoutes");

app.use("/api/potholes", potholeRoutes);

app.use("/api/auth", authRoutes);

// =======================
// MongoDB
// =======================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

// =======================
// Test Route
// =======================

app.get("/", (req, res) => {
  res.send("Pothole Detection API Running");
});

// =======================
// Start Server
// =======================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});