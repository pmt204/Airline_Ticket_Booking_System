const mongoose = require("mongoose");

async function connectDB(mongoUri = process.env.MONGO_URI) {
  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(mongoUri);
  console.log("✅ Đã kết nối thành công với MongoDB!");
  return mongoose.connection;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("🛑 Đã ngắt kết nối MongoDB!");
  }
}

module.exports = {
  connectDB,
  disconnectDB,
};