import express from 'express';
import { addTask ,getAllTasks,getTaskById,deleteTask,updateTask,getPaginatedTasks} from '../controllers/taskController.js';
import { verifyToken } from '../middlewares/verifyauthToken.js';
const taskRoutes = express.Router();


  
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
