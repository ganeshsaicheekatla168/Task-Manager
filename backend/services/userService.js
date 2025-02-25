// import User from '../models/userModel.js'; // Adjust path as necessary
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';  // Import dotenv package
// import bcrypt from 'bcrypt'; // ES6 import (if your Node.js supports it)
// import nodemailer from "nodemailer";
// dotenv.config();  // Load the .env file and set variables in process.env
//  export const createUserService = async ({ first_name, last_name, email, password }) => {
//   try {
//     // Check if the user already exists
//     const existingUser = await User.findOne({ email });
  
//     if( ! (/[A-Za-z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password))){
//       throw new Error('Invalid Password');
//     }
//     //converting user email to smaller case letters
//      email = email.toLowerCase();
//     //  // Hash the password before saving
//      // Generate a salt
//      const salt = await bcrypt.genSalt(10);
//      const hashedPassword = await bcrypt.hash(password, salt);
//      console.log(hashedPassword);
//    const newUser = new User({
//       first_name,
//       last_name,
//       email,
//       password:hashedPassword
//     });
//     console.log(newUser);
//     await newUser.save();
//     return newUser;
//   } catch (error) {
//     throw new Error(error.message || 'Error while creating the user');
//   }
// };

// // Function to check if the email exists in the database
// export const checkEmailExistenceService = async (email) => {
//     try {
//       //converting user email to smaller case letters
//       email = email.toLowerCase();
//       const user = await User.findOne({ email: email });
//       return true;  // Return true if user exists, false otherwise
//     } catch (error) {
//       return false;
//     }
//   };


// // Method to authenticate user during login
// export const authenticateUser = async(email, password,rememberme) => {
//     try {
//        //converting user email to smaller case letters
//        email = email.toLowerCase();
//       // Find the user by email
//       const user = await User.findOne({ email });
  
//       if (!user) {
//         throw new Error('Invalid credentials');  // If the user doesn't exist, return an error
//       }
    
//       // Compare the provided password with the hashed password in the database
//       const isMatch = await bcrypt.compare(password, user.password);
    
//       if (!isMatch) {
//         throw new Error('Invalid credentials');  // If the password doesn't match
//       }
//       let token;
//       if(!rememberme){
        
//            token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
//       }
//       else{
//          token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET_KEY);
//         console.log("hi");
//       }
//       return { user, token };  
//     } catch (error) {
//       throw new Error('Login failed:' + error.message);
//     }
//   }


//   // Fetch all tasks
// export const getAllUsersNameAndIDService = async () => {
//   return User.find().select('first_name _id');  // Exclude password field for security
// };

// export const forgotPasswordService = async (email) => {
//   try {
//       console.log(`We have to send the mail to ${email} to update the password`);

//       // Find the user by email
//       const user = await User.findOne({ email });
     
//       if (!user) {
        
//           return {
//               success: false,
//               errorMessage: "User not found with the given email"
//           };
//       }

//       console.log(`User ID: ${user._id}`,process.env.JWT_SECRET_KEY);

//       // Create a JWT token
//       const token = jwt.sign({ id: user._id },  process.env.JWT_SECRET_KEY, { expiresIn: '5m' });

//       const resetLink = `http://localhost:4200/reset-password?token=${token}`;

//       // Set up email transporter
//       const transporter = nodemailer.createTransport({
//           service: "gmail",
//           auth: {
//               user: "bujjipillamgolla6@gmail.com",
//               pass: "wuke htco bemp tktr"  // Remember to securely store this (use environment variables)
//           }
//       });
      
//       // Mail options
//       const mailOptions = {
//           from: "bujjipillamgolla6@gmail.com",
//           to: email,
//           subject: "Ingore the mail if not you. Password reset link it will expired in 5min ",
//           text: `Click on the link to reset your password: ${resetLink}`
//       };
     
//       // Send email
//       transporter.sendMail(mailOptions, (error, info) => {
//           if (error) {
//               console.log(error);
//               return {
//                   success: false,
//                   errorMessage: 'Failed to send email'
//               };
//           }
//       });
  
//       return {
//         success: true,
//         user: { _id: user._id, email: user.email }
//      };
//   } catch (error) {
//       console.log(error);
//       return {
//           success: false,
//           errorMessage: error.message || 'An error occurred during the password reset process'
//       };
//   }
// };

// export const resetPasswordService = async (token, newPassword) => {
//   try {
//       console.log(`Token in backend to reset password: ${token}`);

//       // Verifying the JWT token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);  
//       const user = await User.findById(decoded.id);

//       if (!user) {
//           return {
//               success: false,
//               errorMessage: 'User not found'
//           };
//       }

//       console.log("While updating in database");

//       // Hashing the new password
//       const hashedPassword = await bcrypt.hash(newPassword, 10);
//       user.password = hashedPassword;

//       // Saving the updated user with the new password
//       await user.save();

//       return {
//           success: true,
//           user: { _id: user._id, email: user.email }
//       };
//   } catch (error) {
//       console.log(error);
//       return {
//           success: false,
//           errorMessage: 'Invalid or expired token'
//       };
//   }
// };







import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import CustomException from '../exceptionHandling/CustomException.js';
dotenv.config(); // Load the .env file
import  ConnectDb from "../config/databaseconfig.js"
import { validateUserData } from '../Validations/userValidations.js';
import { ObjectId } from 'mongodb';


const getDb = async () => {
  return await ConnectDb();
};

export const createUserService = async ({ first_name, last_name, email, password }) => {
  try {
    // Validate user data before proceeding
    email = email.toLowerCase();
    validateUserData({ first_name, last_name, email, password });
    
    const db = await getDb();
    const users = db.collection('users');
    
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
    const resetLink = `http://localhost:4200/reset-password?token=${token}`;

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


export const getUserNameByID = async(id) =>{
  try {
    const db = await getDb();
    const users = db.collection('users');
    const user = await users.findOne({ _id: new ObjectId(id) },{projection : {first_name:1}});
    return user ? user.first_name : null;
  } catch (error) {
    console.log(error);
    throw new Error('Error checking email existence');
  }
}


  
