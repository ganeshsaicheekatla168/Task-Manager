// import Task from '../models/taskModel.js';

// export const createTaskService = async (taskData) => {
//   try {
//     // Create a new task using the provided data
//     const newTask = new Task({
//       title: taskData.title,
//       description: taskData.description,
//       assignedTo: taskData.assignedTo,
//       dueDate: taskData.dueDate,
//       priority: taskData.priority,
//       status: taskData.status,
//       isRead: taskData.isRead,
//     });

//     // Save the task to the database
//     await newTask.save();

//     // Return the newly created task
//     return newTask;
//   } catch (err) {
   
//     throw err;
//   }
// };

// // Fetch all tasks
// export const getAllTasksService = async () => {
//     return Task.find({isDelete:false});  // Returns all tasks
//   };
  
//   // Fetch a task by its ID
//   export const getTaskByIdService = async (id) => {
//     return Task.findById(id);  // Returns task by ID
//   };

//   // Delete a task by its ID
// export const deleteTaskService = async (id) => {
//     return Task.findByIdAndDelete(id);  // Deletes the task by ID
//   };

//   // Update a task by its ID
// export const updateTaskService = async (id, taskData) => {
//     return Task.findByIdAndUpdate(id, taskData, { new: true });
//   };

//   // Function to get paginated tasks with filters for priority and status
// export const getPaginatedTasksService = async (page, limit, priority, status,title) => {
//   try {
//     // Build the filter query
//     const filter = {isDelete:false};
//     if (priority) filter.priority = priority;
//     if (status) filter.status = status;
//     if (title) {
//       // Perform a case-insensitive partial match for the title using regular expression
//       filter.title = { $regex: title, $options: 'i' }; // 'i' option for case-insensitive search
//     }

//     // Calculate the total count of tasks matching the filters
//     const totalCount = await Task.countDocuments(filter);

//     // Check if the requested page exceeds the total available pages
//     const totalPages = Math.ceil(totalCount / limit);
//     if (page > totalPages && totalPages > 0) {
//       page = 1; // Reset to page 1 if the requested page is greater than total pages
//     }

//     // Calculate the skip for pagination (based on page and limit)
//     const skip = (page - 1) * limit;

//     // Fetch paginated tasks with filters
//     const tasks = await Task.find(filter)
//       .sort({createdAt:-1})
//       .skip(skip)
//       .limit(limit)
//       .exec();

//     return { tasks, totalCount};
//   } catch (error) {
//     throw new Error('Error fetching paginated tasks');
//   }
// };


import connectDB from '../config/databaseconfig.js';
import { validateTaskData } from '../validations/taskValidations.js';
import { ObjectId } from 'mongodb';
import { getUserNameByID } from './userService.js';

const getTasksCollection = async () => {
  const db = await connectDB();  // Get the database instance
  return db.collection('tasks');  // Access the tasks collection
};




export const createTaskService = async (taskData) => {
  try {
    
    taskData.createdAt = new Date().toISOString()
    taskData.updatedAt = new Date().toISOString()
    validateTaskData(taskData);
    const tasksCollection = await getTasksCollection();
    const result = await tasksCollection.insertOne(taskData);
    return taskData;
  } catch (err) {
    console.log(`error in create task : ${err}`)
    throw err;
  }
};

export const getAllTasksService = async () => {
  try {
    const tasksCollection = await getTasksCollection();
    console.log(`task collection : ${tasksCollection}`)
    const tasks = await tasksCollection.find({}).toArray();
   
    for (let task of tasks){
      const assignedTo = await getUserNameByID(task.assignedToUserId);
      delete task.assignedToUserId;
      task.assignedTo = assignedTo;
    }

    return tasks;
  } catch (err) {
    throw err;
  }
};

export const getTaskByIdService = async (id) => {
  try {
    const tasksCollection = await getTasksCollection();
    const task = await tasksCollection.findOne({ _id: new ObjectId(id), isDelete: false });
    return task;
  } catch (err) {
    throw err;
  }
};

export const deleteTaskService = async (id) => {
  try {
    const tasksCollection = await getTasksCollection();
    const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;  // Return true if a task was deleted
  } catch (err) {
    throw err;
  }
};

export const updateTaskService = async (id, taskData) => {
  try {
    console.log(`checking id in update task service ${id}`)
    taskData.updatedAt = new Date().toISOString()
    const { _id, ...updateData } = taskData;
    const tasksCollection = await getTasksCollection();
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return result.modifiedCount > 0;  // Return true if a task was updated
  } catch (err) {
    console.log(`printing error ${err}`)
    throw err;
  }
};

export const getPaginatedTasksService = async (page, limit, priority, status, title) => {
  try {
    console.log("in get paginated task service")
    const tasksCollection = await getTasksCollection();
    const filter = { isDelete: false };

    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }

    const totalCount = await tasksCollection.countDocuments(filter);
    const tasks = await tasksCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

      for (let task of tasks){
        const assignedTo = await getUserNameByID(task.assignedToUserId);
        delete task.assignedToUserId;
        task.assignedTo = assignedTo;
      }
      
    return { tasks, totalCount };
  } catch (err) {
    throw err;
  }
};
