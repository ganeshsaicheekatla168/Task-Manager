# Task Management System

This is a Task Management System that provides CRUD operations to manage tasks efficiently. The application allows users to create, view, update, and delete tasks with various filtering, searching,pagination, securing using jwt token, user login  and user registration features.

## Table of Contents
1. [Overview](#overview)
2. [Schema](#schema)
3. [Features](#features)
4. [Validation Rules](#validation-rules)
5. [CRUD Operations](#crud-operations)
6. [Error Handling](#error-handling)

## Overview

This application allows users to manage tasks with an easy-to-use interface. It includes features like pagination, search, and filtering to keep tasks organized. The backend ensures secure and valid user authentication and data handling.

## Schema

### User Schema

The backend user schema is defined as follows:

```json
{
  "first_name": "string", // Required, Max length 35, Should start with alphabets only  
  "last_name": "string", // Required, Max length 35, Should start with alphabets only  
  "email": "string", // Required, Unique, Must follow standard email validation  
  "password": "string", // Required, Hashed, Must have at least one uppercase, one special character, one number, and max length 8  
  "createdDate": "string", // Stored in UTC format  
  "updatedDate": "string" // Stored in UTC format
}
```

###  Task Schema
The backend task schema is defined as follows:
```json
{
  "title": "string",  Required, Max length 50  
  "description": "string",  Optional, Max length 100  
  "assignedTo": "string",  Required, Name of the assignee  
  "dueDate": "date",  Required, Deadline for task completion  
  "priority": "low" | "medium" | "high",Required, Defines task urgency  
  "status": "pending" | "in-progress" | "completed", Required, Task status  
  "isRead": "boolean" Optional, Marks whether the task has been read
}
```


## Features

- **Pagination**: Displays only 10 tasks per page to avoid overwhelming users with too many tasks at once.
- **Search**: Users can search tasks by title to easily find a specific task.
- **Filters**: Allows filtering by task priority (`low`, `medium`, `high`) and status (`pending`, `in-progress`, `completed`).
- **CRUD Operations**:
  - **Create**: Add new tasks with title, description, assignee, due date, priority, and status.
  - **Read**: View task details in a list with pagination.
  - **Update**: Edit task details, including title, description, due date, priority, and status.
  - **Soft Delete**: Tasks are not physically removed from the database but are hidden from the list. They can be restored if needed.
- **Confirmation Popups**: Show a confirmation popup when deleting a task with options "Yes" (confirm) and "No" (cancel).

## Validation Rules

### Frontend Validation

#### User Registration:
- Ensure all fields are filled before submission.
- Validate email format (e.g., `test@example.com`).
- Validate password complexity:
  - Must have at least one uppercase letter.
  - Must have one special character.
  - Must have one number.
  - Max length: 8 characters.
- Check if the email is unique before allowing registration.

#### Login:
- Both email and password must be correct for successful login.
- Empty fields should trigger validation before submission.
- If email or password is incorrect, display an error message.

### Backend Validation
- Enforce the same validation rules as the frontend.
- Hash and store the password securely.
- Return appropriate error messages for duplicate emails.



## Authentication and Authorization

### Authentication Rules
- **Email** is not case-sensitive (e.g., `test@example.com` and `Test@Example.com` are considered the same).
- **Password** is case-sensitive (e.g., `Password123` and `password123` are different).

### Password Security
- Store passwords securely using **hashing algorithms** like bcrypt to ensure that passwords are never stored in plain text.
- Ensure password hashing occurs both during user registration and login for comparison.

## CRUD OPERATIONS

### Create Task
- Endpoint: POST /tasks
- Request Body:
```
{
  "title": "Task Title",
  "description": "Task description",
  "assignedTo": "John Doe",
  "dueDate": "2025-03-01T00:00:00Z",
  "priority": "high",
  "status": "pending"
}
```
### Response:
```
{
  "success": true,
  "data": { "task_id": "task_123", "title": "Task Title" },
  "error": null
}
```
### Read Task (List)
- Endpoint: GET /tasks
- Query Parameters: page=1&priority=high&status=pending
- Response:
```
{
  "success": true,
  "data": [
    { "task_id": "task_123",
      "title": "Task Title",
      "status": "pending",
      "description": "Updated description",
      "assignedTo": "Jane Doe",
      "dueDate": "2025-04-01T00:00:00Z",
      "priority": "medium",
    }
  ],
  "error": null
}
```
### Update Task
- Endpoint: PUT /tasks/{task_id}
- Request Body:
```
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "assignedTo": "Jane Doe",
  "dueDate": "2025-04-01T00:00:00Z",
  "priority": "medium",
  "status": "in-progress"
}
```
### Soft Delete Task
- Endpoint: DELETE /tasks/{task_id}
- Response:
```
{
  "success": true,
  "data": null,
  "error": null
}
```


## Date Format Handling
- Store Dates in UTC format in the database (except dob).
- Display Dates in MM/DD/YYYY format on the frontend for better user readability.


## Error Handling

- **Display user-friendly error messages** on the UI.
- **Use appropriate HTTP status codes**:
  - `200` for success responses.
  - `400` for client errors (e.g., invalid input).
  - `401` for unauthorized access (e.g., invalid login credentials).
  - `500` for server errors (e.g., database issues).
- **Log errors in the backend** for debugging purposes and to track issues.


