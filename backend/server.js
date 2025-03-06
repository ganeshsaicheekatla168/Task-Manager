
import dotenv from 'dotenv';  // Import dotenv package
dotenv.config();  // Load the .env file and set variables in process.env
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import connectDB from './config/databaseconfig.js';  // Import the database connection using MongoDB native driver
import taskRoutes from './routes/taskRoutes.js';

const app = express();

// Connect to DB using MongoDB Native Driver
const connectToDB = async () => {
  try {
    await connectDB(); // Ensure that DB connection is established before starting the server
  } catch (err) {
    console.error('Error while connecting to the database:', err.message);
    process.exit(1); // Exit the application if connection fails
  }
};

// CORS setup
app.use(cors({
  origin: `${process.env.ORIGIN_URL}${process.env.ORIGIN_PORT}`,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse incoming JSON requests
app.use(express.json());

// Set up routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Start the server after ensuring the DB connection is successful
const startServer = async () => {
  await connectToDB();
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
  });
};

startServer();
