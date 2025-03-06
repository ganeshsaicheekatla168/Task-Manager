 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import CustomException from '../exceptionHandling/CustomException.js';
dotenv.config(); // Load the .env file
import connectDB from "../config/databaseconfig.js"
import { validateUserData } from '../Validations/userValidations.js';
import { ObjectId } from 'mongodb';
 
 
const getDb = async () => {
  try{
    return await connectDB();
   }
   catch(err){
    return await connectDB();
   }
};
 
export const createUserService = async ({ first_name, last_name, email, password }) => {
  try {
    const db = await getDb();
    const users = db.collection('users');
 
    // Validate user data before proceeding
    email = email.toLowerCase();
 
    validateUserData({ first_name, last_name, email, password });
 
 
 
    // Check if the user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      throw new CustomException('Email already exists', 409);  // Conflict error if the email already exists
    }
 
 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
 
    const newUser = {
      first_name,
      last_name,
      email,
      password: hashedPassword,
    };
 
    await users.insertOne(newUser);
    return newUser;  // Return the created user
  } catch (error) {
    throw error;  // Re-throw the error for handling in the controller
  }
};
// Function to check if the email exists in the database
export const checkEmailExistenceService = async (email) => {
  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email: email.toLowerCase() });
    return user ? user._id : null;
  } catch (error) {
    throw new Error('Error checking email existence');
  }
};
 
export const authenticateUser = async (email, password, rememberme) => {
  try {
    const db = await getDb();
    const users = db.collection('users');
 
    email = email.toLowerCase();
 
    const user = await users.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }
 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
 
    let token;
    if (!rememberme) {
      token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    } else {
      token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET_KEY);
    }
 
    return { user, token };
  } catch (error) {
    throw new Error('Login failed: ' + error.message);
  }
};
 
 
// Fetch all users (excluding password field)
export const getAllUsersNameAndIDService = async () => {
  const db = await getDb();
  const users = db.collection('users');
  const result = await users.find({}, { projection: { first_name: 1, _id: 1 } }).toArray();
  return result;
};
 
// Forgot password functionality
export const forgotPasswordService = async (email) => {
  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ email });
    if (!user) {
      return {
        success: false,
        errorMessage: "User not found with the given email"
      };
    }
 
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5m' });
    const resetLink = `http://localhost:4200/taskManager/reset-password?token=${token}`;
 
    // Set up email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bujjipillamgolla6@gmail.com",
        pass: "wuke htco bemp tktr"
      }
    });
 
    const mailOptions = {
      from: "bujjipillamgolla6@gmail.com",
      to: email,
      subject: "Password Reset Link",
      text: `Click on the link to reset your password: ${resetLink}`
    };
 
    transporter.sendMail(mailOptions);
 
    return {
      success: true,
      user: { _id: user._id, email: user.email }
    };
  } catch (error) {
    return {
      success: false,
      errorMessage: 'Error during the password reset process'
    };
  }
};
 
// Reset password functionality
export const resetPasswordService = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ _id: decoded.id });
 
    if (!user) {
      return { success: false, errorMessage: 'User not found' };
    }
 
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await users.updateOne({ _id: decoded.id }, { $set: { password: hashedPassword } });
 
    return { success: true, user: { _id: user._id, email: user.email } };
  } catch (error) {
    return { success: false, errorMessage: 'Invalid or expired token' };
  }
};
 
 
export const getUserNameByID = async (id) => {
  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ _id: new ObjectId(id) }, { projection: { first_name: 1 } });
    return user ? user.first_name : null;
  } catch (error) {
    console.log(error);
    throw new Error('Error checking email existence');
  }
}
 
// Fetch users with pagination & search
export const getUsersBySearchService = async (start, limit, search) => {
  const db = await getDb();
  const usersCollection = db.collection('users');
 
  let query = {};
  if (search) {
    query = { first_name: { $regex: search, $options: "i" } }; // Case-insensitive search
  }
 
 
  const users = await usersCollection
    .find(query, { projection: { first_name: 1, _id: 1 } })
    .collation({ locale: 'en', strength: 2 })
    .sort({ first_name: 1 })
    .skip(start)
    .limit(limit)
    .toArray();
 
 
  return { users };
}
 
export const addTaskIdToUser = async (userId, taskId) => {
 
  const db = await getDb();
  const userCollection = await db.collection("users");
  const user = await userCollection.find({ _id: userId });
 
  if (user.assignedToTasksId) {
    user.assignedToTasksId.push(new ObjectId(taskId));
  }
  else {
    user.assignedToTasksId = [];
    user.assignedToTasksId.push(new ObjectId(taskId));
  }
 
  await userCollection.updateOne({ _id: userId }, user);
 
}
 
 