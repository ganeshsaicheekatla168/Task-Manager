import express from 'express';
import { addTask ,getAllTasks,getTaskById,deleteTask,updateTask,getPaginatedTasks} from '../controllers/taskController.js';
import jwt from 'jsonwebtoken';  // Ensure this is at the top of your file
const taskRoutes = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
      return res.status(403).json({ error: 'No token provided' });
    }
  
    // Remove 'Bearer ' from the token (because it's usually in the format 'Bearer <token>')
    const tokenWithoutBearer = token.split(' ')[1];
    console.log(tokenWithoutBearer);
    jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      console.log("jwt Token verified"+tokenWithoutBearer);
      next();  // Proceed to the next middleware or route handler
    });
  };
  
// Route to add a new task
taskRoutes.post('/add',verifyToken, addTask);

// Route for getting all tasks
taskRoutes.get('/all',verifyToken, getAllTasks);


// Define route for fetching paginated tasks with filters
taskRoutes.get('/paginatedTasks',verifyToken,getPaginatedTasks);

// Route for getting a task by its ID
taskRoutes.get('/:id',verifyToken, getTaskById);

// Route to delete a task by its ID
taskRoutes.delete('/:id',verifyToken, deleteTask);

// Route to update a task by its ID
taskRoutes.put('/update/:id',verifyToken, updateTask);  // Use PUT for full update (or PATCH for partial update)


export default taskRoutes;
