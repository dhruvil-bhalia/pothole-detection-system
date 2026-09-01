const mongoose = require("mongoose");

const Pothole = require("./models/Pothole");

const LOCAL_URI = "mongodb://127.0.0.1:27017/potholeDB";

// PUT YOUR RENDER MONGO_URI HERE
const ATLAS_URI = "mongodb+srv://2303051050232_db_user:2303051050232@cluster0.q3gwcmn.mongodb.net/?appName=Cluster0";

async function migrate() {
  try {
    // Connect to local database
    await mongoose.connect(LOCAL_URI);

    console.log("✅ Connected to LOCAL MongoDB");

    const potholes = await Pothole.find().lean();

    console.log(`📦 Found ${potholes.length} potholes locally`);

    if (potholes.length === 0) {
      console.log("❌ No potholes found.");
      process.exit(1);
    }

    // Disconnect local
    await mongoose.disconnect();

    // Connect to Atlas
    await mongoose.connect(ATLAS_URI);

    console.log("✅ Connected to MONGODB ATLAS");

    const existing = await Pothole.countDocuments();

    console.log(`📊 Atlas currently has ${existing} potholes`);

    if (existing > 0) {
      console.log("⚠️ Atlas already contains potholes. Nothing imported.");
      process.exit(0);
    }

    await Pothole.insertMany(potholes);

    console.log(`🎉 Successfully migrated ${potholes.length} potholes!`);

    await mongoose.disconnect();

  } catch (error) {
    console.error("❌ MIGRATION ERROR:");
    console.error(error);
    process.exit(1);
  }
}

migrate();