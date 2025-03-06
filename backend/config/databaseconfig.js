import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();
 
 
const uri = process.env.MONGODB_URL;
const maxRetries = parseInt(process.env.DBCONNECT_RETRY) || 3;
const delay = parseInt(process.env.DBCONNECT_DELAY) || 5000;
 
let client;
let dbInstance;
let isConnected = false; // Track connection state
 
 
const connectDB = async () => {
  if (dbInstance && (await isMongoConnected())) {
    return dbInstance; // Return existing connection if still connected
  }
 
  let retryCount = 0;
  while (retryCount < maxRetries) {
    try {
     
      client = new MongoClient(uri, { monitorCommands: true });
 
      await client.connect();
      dbInstance = client.db();
      isConnected = true;
      console.log("✅ Database connected successfully");
 
      // Attach event listeners
      client.on("close", handleDisconnection);
      client.on("error", handleDisconnection);
      client.on("serverHeartbeatSucceeded",handleReconnection);
 
      return dbInstance;
    } catch (err) {
      retryCount++;
      console.error(`Attempt ${retryCount} failed to connect to DB: ${err.message}`);
 
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("Max retry attempts reached. Could not connect to DB.");
        throw new Error("Database connection failed after max retries.");
      }
    }
  }
};
 
// Function to check MongoDB connection status
const isMongoConnected = async () => {
  try {
    // Check if MongoDB connection is still alive
    if (!client || !client.topology || !client.topology.isConnected()) {
     
      return false;
    }
    await client.db().admin().ping(); // Send a ping command to verify the connection
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
 
// Function to handle disconnection
const handleDisconnection = async (err) => {
  if (!isConnected) return; // Prevent multiple triggers
  console.warn("MongoDB connection lost. Attempting to reconnect...", err?.message || "");
  isConnected = false;
  dbInstance = null;
  client?.removeAllListeners(); // Clean up old listeners
  await connectDB(); // Attempt reconnection
};
 
// Function to handle reconnection
const handleReconnection = async () => {
  // Check if the connection is actually available
 
  if (isConnected) return;
 
  console.log(" MongoDB connection restored!");
  const connected = await isMongoConnected();
  if (!connected) {
    console.warn(" Connection check failed! Reconnecting...");
    await connectDB();
    return;
  }
  isConnected = true;
};
 
// Gracefully close connection on app exit
process.on("SIGINT", async () => {
  console.log("Closing MongoDB connection...");
  client?.removeAllListeners(); // Remove old listeners
  await client?.close();
  process.exit(0);
});
 
 
export default connectDB;
 