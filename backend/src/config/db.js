import mongoose from "mongoose";
import { ENV } from "./env.js";
import { DATABASENAME } from "../constant.js";

// Optional: suppress strict query warnings in Mongoose 7+
mongoose.set("strictQuery", true);

// 🔹 Global flag to avoid multiple DB connections on cold starts
let isConnected = false;

const dbConnection = async () => {
  if (!ENV.MONGO_URI || !DATABASENAME) {
    console.error("❌ Database URI or name is missing");
    process.exit(1);
  }

  if (isConnected) {
    console.log("⚡ Using existing MongoDB connection");
    return;
  }

  try {
    const conn = await mongoose.connect(`${ENV.MONGO_URI}/${DATABASENAME}`);

    isConnected = conn.connections[0].readyState === 1;

    if (isConnected) {
      console.log(`✅ MongoDB connected at host: ${conn.connection.host}`);
    } else {
      console.log("❌ MongoDB not connected");
    }
  } catch (error) {
    console.error("❌ Database Connection Error", error);
    process.exit(1);
  }
};

export default dbConnection;
