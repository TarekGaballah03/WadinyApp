// src/DB/connectionDB.js
import mongoose from "mongoose";

export const connectionDB = async () => {
  try {
    await mongoose.connect(process.env.URL);
    console.log(`✅ Connected to MongoDB on ${process.env.URL}`);
  } catch (err) {
    console.log("❌ Error connecting to MongoDB:", err);
  }
};

export default connectionDB;