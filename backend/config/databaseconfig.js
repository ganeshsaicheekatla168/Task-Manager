// import mongoose from 'mongoose';
// import dotenv from 'dotenv';  // Import dotenv package
// dotenv.config();  // Load the .env file and set variables in process.env
// const connectDB = async (retries = process.env.DBCONNECT_RETRY, delay = process.env.DBCONNECT_DELAY) => {  // retries and delay are configurable
//   let attempt = 0;
//   while (attempt < retries) {
//     try {
//       await mongoose.connect(process.env.MONGODB_URL, {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//       });
//       console.log('DB connected');
//       return; // Exit the function once connected
//     } catch (err) {
//       attempt += 1;
//       console.error(`Attempt ${attempt} failed to connect to DB: ${err}`);
      
//       if (attempt < retries) {
//         console.log(`Retrying in ${delay / 1000} seconds...`);
//         await new Promise(resolve => setTimeout(resolve, delay));  // Wait for the specified delay before retrying
//       } else {
//         console.error('Max retry attempts reached. Could not connect to DB.');
//         process.exit(1);  // Optionally exit if max retries are reached, or you can handle it differently
//       }
//     }
//   }
// };

// export default connectDB;
import { MongoClient } from 'mongodb'; // MongoClient from MongoDB native
import dotenv from 'dotenv';  // dotenv package to manage environment variables

dotenv.config();  // Load the .env file
let isConnected = false ;
let dbInstance = null;

const connectDB = async (retries = process.env.DBCONNECT_RETRY, delay = process.env.DBCONNECT_DELAY) => {
  if(isConnected){
    return dbInstance;
  }
  let attempt = 0;
  const uri = process.env.MONGODB_URL;  // MongoDB URI from environment variables
  const client = new MongoClient(uri);

  while (attempt < retries) {
    try {
      await client.connect();  // Try connecting to MongoDB
      console.log('DB connected');
      isConnected = true
      dbInstance = client.db();  // Return the database instance once connected
      return dbInstance
    } catch (err) {
      attempt += 1;
      console.error(`Attempt ${attempt} failed to connect to DB: ${err}`);

      if (attempt < retries) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));  // Wait for the specified delay before retrying
      } else {
        console.error('Max retry attempts reached. Could not connect to DB.');
        process.exit(1);  // Exit if max retries are reached
      }
    }
  }
};

export default connectDB;



