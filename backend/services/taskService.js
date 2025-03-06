import connectDB from '../config/databaseconfig.js';
import { validateTaskData } from '../validations/taskValidations.js';
import { ObjectId } from 'mongodb';
 
const getTasksCollection = async () => {
  try{
      const db = await connectDB();  // Get the database instance
      return db.collection('tasks');  // Access the tasks collection
    }
    catch(err){
      console.log(err);
    }
};
const getUsersCollection = async () => {
  try{
    const db = await connectDB();  // Get the database instance
    return db.collection('users');  // Access the users collection
   }catch(err){
    console.log(err);
   }
};
 
export const createTaskService = async (taskData) => {
  try {
 
    taskData.createdAt = new Date().toISOString()
    taskData.updatedAt = new Date().toISOString()
    validateTaskData(taskData);
    let userIds = [];
    for (let ids of taskData.assignedToUserId) {
 
      userIds.push(new ObjectId(ids));
    }
    delete taskData.assignedToUserId;
    taskData.assignedToUserId = userIds;
 
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
 
    for (let task of tasks) {
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
    console.log("deleting task id",id);
    const tasksCollection = await getTasksCollection();
    const result = await tasksCollection.findOne({ _id: new ObjectId(id) });
    result.isDelete = true;

    console.log(result,"Above task delete successfully");
    await tasksCollection.updateOne({ _id: new ObjectId(id) }, { $set: result });
    return result// Return true if a task was deleted
  } catch (err) {
    throw err;
  }
};
 
export const updateTaskService = async (id, taskData) => {
  try {
    console.log(`checking id in update task service ${id}`)
    taskData.updatedAt = new Date().toISOString()
    let userIds = [];
    console.log(taskData.assignedToUserId);
    for (let ids of taskData.assignedToUserId) {
      userIds.push(new ObjectId(ids));
    }
    delete taskData.assignedToUserId;
    taskData.assignedToUserId = userIds;
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
 
const getResultBasedOnAssginedToUserNameFirstThenTaskFilters = async (assignedToUser, taskFilters, page, limit) => {
  const tasksCollection = await getTasksCollection();
  const usersCollection = await getUsersCollection();
 
  // Step 1: Get unique task IDs assigned to the matching user(s)
  let tasksAggregation = await usersCollection.aggregate([
    {
      $match: {
        first_name: { $regex: assignedToUser, $options: "i" }
      }
    },
    {
      $lookup: {
        from: "tasks",
        localField: "_id",
        foreignField: "assignedToUserId",
        as: "tasks"
      }
    },
    {
      $group: {
        _id: null,
        uniqueTaskIds: { $addToSet: "$tasks._id" } // Collect unique task IDs
      }
    },
    {
      $project: {
        _id: 0,
        uniqueTaskIds: { $reduce: { input: "$uniqueTaskIds", initialValue: [], in: { $setUnion: ["$$value", "$$this"] } } }
      }
    }
  ]).toArray();
 
  const taskIds = tasksAggregation.length ? tasksAggregation[0].uniqueTaskIds : [];
 
  // Step 2: Fetch and join additional data for the filtered tasks
  tasksAggregation = await tasksCollection.aggregate([
    {
      $match: {
        _id: { $in: taskIds },
        ...taskFilters
      } // Filter only retrieved task IDs
    },
    {
      $sort: { updatedAt: -1 } // Sort before pagination
    },
    {
      $skip: (page - 1) * limit // Skip for pagination
    },
    {
      $limit: limit // Limit the number of results
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedToUserId",
        foreignField: "_id",
        as: "assignedTo"
      }
    },
    {
      $project: {
        title: 1,
        description: 1,
        assignedToUsers: {
          $map: {
            input: "$assignedTo",
            as: "user",
            in: {
              userId: "$$user._id",
              firstName: "$$user.first_name"
            }
          }
        },
        dueDate: 1,
        priority: 1,
        status: 1,
        isRead: 1,
        isDelete: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]).toArray();
 
  const totalCount = await tasksCollection.countDocuments({
 
    _id: { $in: taskIds },
    ...taskFilters
    // Filter only retrieved task IDs
  }); // Total count is already known from the first aggregation
 
 
  return { tasks: tasksAggregation, totalCount };
 
}
 
 
const getResultBasedOnTaskFilterFirstThenUserIds = async(assignedToUser , taskFilters,page , limit)=>{
  const tasksCollection = await getTasksCollection();
  const usersCollection = await getUsersCollection();
 
  //  Get filtered users first
  const filteredUsers = await usersCollection.find({
    first_name: { $regex: assignedToUser, $options: 'i' }
  }, { _id: 1 }).toArray();
 
  // Extract user IDs
  const userIds = filteredUsers.map(user => user._id);
  // Filter tasks and join with filtered users
  let tasksAggregation = await tasksCollection.aggregate([
    {
      $match: {
        ...taskFilters,
        assignedToUserId: { $in: userIds }  // Only tasks assigned to filtered users
      }
    },
    {
      $sort: { updatedAt: -1 } // Sort before pagination
    },
    {
      $skip: (page - 1) * limit // Skip before limit
    },
    {
      $limit: limit // Apply limit
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedToUserId",
        foreignField: "_id",
        as: "assignedTo"
      }
    },
    {
      $project: {
        title: 1,
        description: 1,
        assignedToUsers: {
          $map: {
            input: "$assignedTo",
            as: "user",
            in: {
              userId: "$$user._id",
              firstName: "$$user.first_name"
            }
          }
        },
        dueDate: 1,
        priority: 1,
        status: 1,
        isRead: 1,
        isDelete: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]).toArray();
 
 
  const totalCount = await tasksCollection.countDocuments({
    ...taskFilters,
    assignedToUserId: { $in: userIds }
  });
 
  return { tasks: tasksAggregation, totalCount };
 
}
 
export const getPaginatedTasksService = async (page, limit, priority, status, title, assignedToUser) => {
  console.log("in get paginated task service");
  try {
    const tasksCollection = await getTasksCollection();
    const usersCollection = await getUsersCollection();
 
    const filter = { isDelete: false };
 
    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (title) {
      filter.title = { $regex: title, $options: 'i' };
    }
   
 
    return getResultBasedOnTaskFilterFirstThenUserIds(assignedToUser,filter,page,limit);
     
   
  } catch (err) {
    throw err;
  }
};
 