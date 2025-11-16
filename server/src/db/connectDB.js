import mongoose from "mongoose";

export default async function connectDB() {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/borrowdb"
    );
    if (conn.connection.host !== "localhost") {
      console.log("Connected to Cloud Database");
    } else {
      console.log("Connected to Local Database");
    }
  } catch (error) {
    console.log(`Failed to connect to database: ${error.message}`);
    process.exit(1);
  }
}
