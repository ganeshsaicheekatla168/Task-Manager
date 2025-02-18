import Task from '../models/taskModel.js';

export const createTaskService = async (taskData) => {
  try {
    // Create a new task using the provided data
    const newTask = new Task({
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedTo,
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      status: taskData.status,
      isRead: taskData.isRead,
    });

    // Save the task to the database
    await newTask.save();

    // Return the newly created task
    return newTask;
  } catch (err) {
   
    throw err;
  }
};

// Fetch all tasks
export const getAllTasksService = async () => {
    return Task.find({isDelete:false});  // Returns all tasks
  };
  
  // Fetch a task by its ID
  export const getTaskByIdService = async (id) => {
    return Task.findById(id);  // Returns task by ID
  };

  // Delete a task by its ID
export const deleteTaskService = async (id) => {
    return Task.findByIdAndDelete(id);  // Deletes the task by ID
  };

  // Update a task by its ID
export const updateTaskService = async (id, taskData) => {
    return Task.findByIdAndUpdate(id, taskData, { new: true });
  };

  // Function to get paginated tasks with filters for priority and status
export const getPaginatedTasksService = async (page, limit, priority, status,title) => {
  try {
    // Build the filter query
    const filter = {isDelete:false};
    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (title) {
      // Perform a case-insensitive partial match for the title using regular expression
      filter.title = { $regex: title, $options: 'i' }; // 'i' option for case-insensitive search
    }

    // Calculate the total count of tasks matching the filters
    const totalCount = await Task.countDocuments(filter);

    // Check if the requested page exceeds the total available pages
    const totalPages = Math.ceil(totalCount / limit);
    if (page > totalPages && totalPages > 0) {
      page = 1; // Reset to page 1 if the requested page is greater than total pages
    }

    // Calculate the skip for pagination (based on page and limit)
    const skip = (page - 1) * limit;

    // Fetch paginated tasks with filters
    const tasks = await Task.find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    return { tasks, totalCount};
  } catch (error) {
    throw new Error('Error fetching paginated tasks');
  }
};



 