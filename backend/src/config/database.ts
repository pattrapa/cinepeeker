import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase(): Promise<void> {
  console.log("Connecting to MongoDB...");

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log("MongoDB connected successfully.");
}