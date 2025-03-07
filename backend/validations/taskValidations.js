import CustomException from '../exceptionHandling/CustomException.js';
export const validateTaskData = (taskData) => {
  const { title, description, assignedToUserId, dueDate, priority, status } = taskData;
  let errorMessage = '';


  // Title validation
  if (!title || title.length < 5) {
    errorMessage += 'Title must be at least 5 characters long. ';
  }
  if (title.length > 50) {
    errorMessage += 'Title must be less than 50 characters. ';
  }

  // Description validation
  if (description && description.length > 100) {
    errorMessage += 'Description must be less than 100 characters. ';
  }

  // AssignedTo validation
  if (!assignedToUserId) {
    errorMessage += 'Assigned person is required. ';
  }

  // DueDate validation
  if (!dueDate || isNaN(new Date(dueDate).getTime())) {
    errorMessage += 'Due date is required and should be a valid date. ';
  }

  // Priority validation
  if (!['low', 'medium', 'high'].includes(priority)) {
    errorMessage += 'Priority must be low, medium, or high. ';
  }

  // Status validation
  if (!['pending', 'in-progress', 'completed'].includes(status)) {
    errorMessage += 'Status must be pending, in-progress, or completed. ';
  }

  // Throw an error if any validation failed
  if (errorMessage.length > 0) {
    throw new CustomException(errorMessage, 400);
  }
};