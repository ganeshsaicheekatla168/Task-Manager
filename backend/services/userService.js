import User from '../models/userModel.js'; // Adjust path as necessary
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';  // Import dotenv package
import bcrypt from 'bcrypt'; // ES6 import (if your Node.js supports it)
import nodemailer from "nodemailer";
dotenv.config();  // Load the .env file and set variables in process.env
 export const createUserService = async ({ first_name, last_name, email, password }) => {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already exists');
    }
    if( ! (/[A-Za-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password))){
      throw new Error('Invalid Password');
    }
    //converting user email to smaller case letters
     email = email.toLowerCase();
    //  // Hash the password before saving
     // Generate a salt
     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(password, salt);
     console.log(hashedPassword);
   const newUser = new User({
      first_name,
      last_name,
      email,
      password:hashedPassword
    });
    console.log(newUser);
    await newUser.save();
    return newUser;
  } catch (error) {
    throw new Error(error.message || 'Error while creating the user');
  }
};

// Function to check if the email exists in the database
export const checkEmailExistenceService = async (email) => {
    try {
      //converting user email to smaller case letters
      email = email.toLowerCase();
      const user = await User.findOne({ email: email });
      return user.id;  // Return true if user exists, false otherwise
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw new Error('Error checking email existence');
    }
  };


// Method to authenticate user during login
export const authenticateUser = async(email, password,rememberme) => {
    try {
       //converting user email to smaller case letters
       email = email.toLowerCase();
      // Find the user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        throw new Error('Invalid credentials');  // If the user doesn't exist, return an error
      }
    
      // Compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
    
      if (!isMatch) {
        throw new Error('Invalid credentials');  // If the password doesn't match
      }
      let token;
      if(!rememberme){
           token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
      }
      else{
         token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET_KEY);
        console.log("hi");
      }
      return { user, token };  
    } catch (error) {
      throw new Error('Login failed:' + error.message);
    }
  }


  // Fetch all tasks
export const getAllUsersNameAndIDService = async () => {
  return User.find().select('first_name _id');  // Exclude password field for security
};

export const forgotPasswordService = async (email) => {
  try {
      console.log(`We have to send the mail to ${email} to update the password`);

      // Find the user by email
      const user = await User.findOne({ email });
     
      if (!user) {
        
          return {
              success: false,
              errorMessage: "User not found with the given email"
          };
      }

      console.log(`User ID: ${user._id}`,process.env.JWT_SECRET_KEY);

      // Create a JWT token
      const token = jwt.sign({ id: user._id },  process.env.JWT_SECRET_KEY, { expiresIn: '5m' });

      const resetLink = `http://localhost:4200/reset-password?token=${token}`;

      // Set up email transporter
      const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: "bujjipillamgolla6@gmail.com",
              pass: "wuke htco bemp tktr"  // Remember to securely store this (use environment variables)
          }
      });
      
      // Mail options
      const mailOptions = {
          from: "bujjipillamgolla6@gmail.com",
          to: email,
          subject: "Ingore the mail if not you. Password reset link it will expired in 5min ",
          text: `Click on the link to reset your password: ${resetLink}`
      };
     
      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log(error);
              return {
                  success: false,
                  errorMessage: 'Failed to send email'
              };
          }
      });
  
      return {
        success: true,
        user: { _id: user._id, email: user.email }
     };
  } catch (error) {
      console.log(error);
      return {
          success: false,
          errorMessage: error.message || 'An error occurred during the password reset process'
      };
  }
};

export const resetPasswordService = async (token, newPassword) => {
  try {
      console.log(`Token in backend to reset password: ${token}`);

      // Verifying the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);  
      const user = await User.findById(decoded.id);

      if (!user) {
          return {
              success: false,
              errorMessage: 'User not found'
          };
      }

      console.log("While updating in database");

      // Hashing the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      // Saving the updated user with the new password
      await user.save();

      return {
          success: true,
          user: { _id: user._id, email: user.email }
      };
  } catch (error) {
      console.log(error);
      return {
          success: false,
          errorMessage: 'Invalid or expired token'
      };
  }
};

  
