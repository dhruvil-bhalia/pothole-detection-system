const mongoose = require("mongoose");

const potholeSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },

    confidence: {
      type: Number,
      default: 0,
    },

    imageUrl: {
      type: String,
      default: "",
    },

    detectedBy: {
      type: String,
      default: "AI System",
    },

    detectionCount: {
      type: Number,
      default: 1,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Repaired"],
      default: "Pending",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    history: [
      {
        detectedBy: {
          type: String,
        },

        confidence: {
          type: Number,
          default: 0,
        },

        detectedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Pothole",
  potholeSchema
);