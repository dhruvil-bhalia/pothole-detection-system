require("dotenv").config();

const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const fs = require("fs");

const Pothole = require("./models/Pothole");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MONGO_URI = process.env.MONGO_URI;

async function uploadImages() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("✅ Connected to MongoDB Atlas");

    const potholes = await Pothole.find();

    console.log(`📦 Found ${potholes.length} potholes`);

    let uploaded = 0;

    for (const pothole of potholes) {

      if (!pothole.imageUrl) {
        console.log(`⏩ No image for ${pothole._id}`);
        continue;
      }

      const filename = path.basename(pothole.imageUrl);

      const localPath = path.join(
        __dirname,
        "uploads",
        filename
      );

      if (!fs.existsSync(localPath)) {
        console.log(`❌ File not found: ${filename}`);
        continue;
      }

      console.log(`☁️ Uploading: ${filename}`);

      const result = await cloudinary.uploader.upload(
        localPath,
        {
          folder: "pothole-detection",
        }
      );

      pothole.imageUrl = result.secure_url;

      await pothole.save();

      uploaded++;

      console.log(`✅ Uploaded ${uploaded}: ${filename}`);
    }

    console.log("");
    console.log("🎉 IMAGE MIGRATION COMPLETE!");
    console.log(`✅ Images uploaded: ${uploaded}`);
    console.log(`📦 Total potholes: ${potholes.length}`);

  } catch (error) {

    console.error("❌ ERROR:", error.message);

  } finally {

    await mongoose.disconnect();

  }
}

uploadImages();