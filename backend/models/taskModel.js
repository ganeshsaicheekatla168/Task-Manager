import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      minlength: [5, 'Title must be min than 5 characters'],
      maxlength: [50, 'Title must be less than 50 characters']
    },
    description: {
      type: String,
      maxlength: 100,
      required: false,
    },
    assignedTo: {
      type: String,
      required: [true, 'Assigned person is required']
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: '{VALUE} is not a valid priority. It should be either low, medium, or high.'
      },
      required: [true, 'Priority is required']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed'],
        message: '{VALUE} is not a valid status. It should be either pending, in-progress, or completed.'
      },
      required: [true, 'Status is required']
    },
    isRead: {
      type: Boolean,
      default: false, // Defaults to false if not provided
    },
    isDelete:{
      type: Boolean,
      default: false, // Defaults to false if not provided
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const Task = mongoose.model('Task', taskSchema,'tasks');

export default Task;
