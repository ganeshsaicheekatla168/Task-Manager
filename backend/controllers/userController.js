import { createUserService,checkEmailExistenceService,authenticateUser,getAllUsersNameAndIDService } from '../services/userService.js'; // Adjust path as necessary

export const addUser = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
  
    try {
      const newUser = await createUserService({ first_name, last_name, email, password });
      return res.status(200).json({
        success: true,
        data: { user_id: newUser._id, email: newUser.email,first_name:newUser.first_name },  // Adjust fields as needed
        error: null
      });
    } catch (err) {
      console.error('Error during user creation:', err.message);
      return res.status(500).json({
        success: false,
        data: null,
        error: err.message
      });
    }
  };
  

// Controller function to handle checking email existence
export const checkEmailExistence = async (req, res) => {
    const { email } = req.query;  // Get email from query params
  
    if (!email) {
      return res.status(400).json({
        success: false,
        data: null,
        error: "Email is required"
      });
    }
  
    try {
      const userId = await checkEmailExistenceService(email);
      return res.status(200).json({
        success: true,
        data: { id:userId },  // Sending the "exists" status in data
        error: null
      });
    } catch (error) {
      console.error('Error in email existence check:', error);
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Internal server error'
      });
    }
  };
  
  export const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const { user, token } = await authenticateUser(email, password);
  
      return res.status(200).json({
        success: true,
        data: { user_id: user._id,first_name:user.first_name , email: user.email, token },
        error: ''
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        data: null,
        error: error.message
      });
    }
  };


export const getAllUsersNameAndID = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await getAllUsersNameAndIDService(); // Exclude password field for security

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'No users found'
      });
    }

    // Return the users data
    return res.status(200).json({
      success: true,
      data: users,
      error: ''
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      data: null,
      error: error.message
    });
  }
};

  