import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import connectDB from './config/databaseconfig.js'; 
import taskRoutes from './routes/taskRoutes.js';


const app = express();

const connectToDB = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Error while connecting to the database:', err.message);
    throw err;
  }
};



// CORS setup
app.use(cors({
  origin: `${process.env.ORIGIN_URL}${process.env.ORIGIN_PORT}`,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

app.server = app.listen(process.env.PORT, async () => {
  await connectToDB();
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});

app.server.on('error', (err) => {
  console.error('HTTP Server Error:', err);
});


