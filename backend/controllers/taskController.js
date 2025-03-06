import { createTaskService, getAllTasksService, getTaskByIdService, deleteTaskService, updateTaskService, getPaginatedTasksService } from '../services/taskService.js';
import CustomException from '../exceptionHandling/CustomException.js';
 
 
export const addTask = async (req, res) => {
  console.log(req);
  const { title, description, assignedToUserId, dueDate, priority, status, isRead } = req.body;
 
  try {
    const newTask = await createTaskService({ title, description, assignedToUserId, dueDate, priority, status, isRead, isDelete: false });
    return res.status(200).json({
      success: true,
      data: { task_id: newTask._id },
      error: null,
    });
  } catch (err) {
    // If the error is an instance of CustomException, use the statusCode and message
    if (err instanceof CustomException) {
      return res.status(err.statusCode).json({
        success: false,
        data: null,
        error: err.message
      });
    }
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Internal Server Error'
    });
  }
};
 
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await getAllTasksService();
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
 
export const getTaskById = async (req, res) => {
  const { id } = req.params;
  console.log(`printing task id ${id}`)
  try {
    const task = await getTaskByIdService(id);
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
 
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const taskDeleted = await deleteTaskService(id);
    if (!taskDeleted) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Task not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: { message: 'deleted Successfully' },
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
 
export const updateTask = async (req, res) => {
  console.log("getting task id")
  const { id } = req.params;
  const taskData = req.body;
  console.log(`printing id and task ${id},${taskData}`)
  try {
    const updatedTask = await updateTaskService(id, taskData);
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
 
export const getPaginatedTasks = async (req, res) => {
  try {
    console.log("getting paginated tasks")
    let page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const priority = req.query.priority || '';
    const status = req.query.status || '';
    const title = req.query.title || '';
    const assignedToUser = req.query.assignedToUser || '';
    console.log(page, limit, priority, status, title, assignedToUser)
 
    const { tasks, totalCount } = await getPaginatedTasksService(page, limit, priority, status, title, assignedToUser);
    return res.status(200).json({
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