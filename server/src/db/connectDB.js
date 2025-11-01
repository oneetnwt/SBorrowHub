import mongoose from "mongoose";

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Successfully connected to database`);
  } catch (error) {
    console.log(`Failed to connect to database: ${error.message}`);
  }
}
