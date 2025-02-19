import dotenv from 'dotenv';  // Import dotenv package
dotenv.config();  // Load the .env file and set variables in process.env
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import connectDB from './config/databaseconfig.js';
import taskRoutes from './routes/taskRoutes.js';
//connect to db
await connectDB();
//start the server
const app = express()
app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST','PUT','DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
app.use(express.json())
app.use('/api/users', userRoutes);
app.use('/api/tasks',taskRoutes);


app.listen(process.env.PORT, () => {
    console.log("server running at http://localhost:3000");
})