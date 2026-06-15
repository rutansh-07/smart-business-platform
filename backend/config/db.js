import mongoose from "mongoose";
import dns from "dns";

function configureDns() {
  try {
    const systemServers = dns.getServers();
    const fallbackServers = ["8.8.8.8", "1.1.1.1", "8.8.4.4"];
    dns.setServers([...new Set([...systemServers, ...fallbackServers])]);
  } catch {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
}

const connectDB = async (retries = 3) => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  configureDns();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(
          `MongoDB connection failed after ${retries} attempts: ${error.message}`
        );
      }
      console.warn(
        `MongoDB connection attempt ${attempt} failed, retrying in ${attempt * 2}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }
};

export default connectDB;
