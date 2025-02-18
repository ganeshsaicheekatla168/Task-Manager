import { createTaskService,getAllTasksService,getTaskByIdService,deleteTaskService,updateTaskService ,getPaginatedTasksService } from '../services/taskService.js';

export const addTask = async (req, res) => {
  const { title, description, assignedTo, dueDate, priority, status, isRead } = req.body;

  try {
    // Call the service layer to create a new task
    const newTask = await createTaskService({ title, description, assignedTo, dueDate, priority, status, isRead });

    // Send a response back with the newly created task
    return res.status(200).json({
      success: true,
      data: newTask,
      error: null,
    });
  } catch (err) {
     // If the error is a validation error
     if (err.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          data: null,
          error: err.message
        });
      }
  
      // For other types of errors
      return res.status(500).json({
        success: false,
        data: null,
        error: 'Internal Server Error'
      });
    }
  
};

// Controller to fetch all tasks
export const getAllTasks = async (req, res) => {
    try {
      const tasks = await getAllTasksService();
      console.log(tasks);  // Fetch all tasks from the database
      return res.status(200).json({
        success: true,
        data: tasks,
        error: null
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: null,
        error: err.message
      });
    }
  };
  
  // Controller to fetch a task by its ID
  export const getTaskById = async (req, res) => {
    const { id } = req.params;  // Get task ID from URL params
    try {
      const task = await getTaskByIdService(id);  // Find the task by its ID
      if (!task) {
        return res.status(404).json({
          success: false,
          data: null,
          error: 'Task not found'
        });
      }
      return res.status(200).json({
        success: true,
        data: task,
        error: null
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: null,
        error: err.message
      });
    }
  };


  // Controller to delete a task by its ID
export const deleteTask = async (req, res) => {
    const { id } = req.params;  // Get task ID from URL params
    try {
      const task = await deleteTaskService (id);  // Find and delete task by ID
      if (!task) {
        return res.status(404).json({
          success: false,
          data: null,
          error: 'Task not found'
        });
      }
      return res.status(200).json({
        success: true,
        data: null,
        error: null
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: null,
        error: err.message
      });
    }
  };


  // Controller to update a task by its ID
export const updateTask = async (req, res) => {
    const { id } = req.params;  // Get task ID from URL params
    const taskData = req.body;  // Get task data to update from request body
  
    try {
      // Find the task by its ID and update with the new data
      const updatedTask = await updateTaskService (id, taskData);
  
      if (!updatedTask) {
        return res.status(404).json({
          success: false,
          data: null,
          error: 'Task not found'
        });
      }
  
      return res.status(200).json({
        success: true,
        data: updatedTask,
        error: null
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        data: null,
        error: err.message
      });
    }
  };


   // Function to handle paginated tasks API call
export const getPaginatedTasks = async (req, res) => {
  
  try {
    // Extract parameters from request (page, limit, filters)
    let page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to limit 10
    const priority = req.query.priority || ''; // Filter by priority (optional)
    const status = req.query.status || ''; // Filter by status (optional)
    const title = req.query.title || '';
    // Get paginated tasks
    const { tasks, totalCount } = await getPaginatedTasksService(page, limit, priority, status,title);

    // Return the response in the desired format
    return res.json({
      success: true,
      data: {
        tasks,
        totalCount
      },
      error: '',
    });
  } catch (error) {
    console.error('Error in paginated tasks API:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Error fetching tasks',
    });
  }
};

