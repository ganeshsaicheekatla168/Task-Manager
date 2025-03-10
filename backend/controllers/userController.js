
import { getUsersBySearchService, createUserService, checkEmailExistenceService, authenticateUser, getAllUsersNameAndIDService, forgotPasswordService, resetPasswordService } from '../services/userService.js'; // Adjust path as necessary
import CustomException from '../exceptionHandling/CustomException.js';


export const addUser = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    const newUser = await createUserService({ first_name, last_name, email, password });
    return res.status(201).json({
      success: true,
      data: {
        user_id: newUser._id,
        email: newUser.email,
        first_name: newUser.first_name
      },
      error: null
    });
  } catch (err) {
    console.error('Error during user creation:', err);
    // If the error is an instance of CustomException, use the statusCode and message
    if (err instanceof CustomException) {
      return res.status(err.statusCode).json({
        success: false,
        data: null,
        error: err.message
      });
    }

    // Handle unexpected errors (default to 500 if error is not a CustomException)
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Internal server error'
    });
  }
};


export const checkEmailExistence = async (req, res) => {
  const { email } = req.query;

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
      data: { id: userId },
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
    console.log(req.query.rememberme)

    const { user, token } = await authenticateUser(email, password, !req.query.rememberme);

    return res.status(200).json({
      success: true,
      data: { user_id: user._id, first_name: user.first_name, email: user.email, token },
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
    const users = await getAllUsersNameAndIDService();

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'No users found'
      });
    }

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

export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordService(email);

    if (result?.success) {
      res.status(200).json({
        success: true,
        data: { user_id: result.user._id, email: result.user.email },
        error: null
      });
    } else {
      res.status(404).json({
        success: false,
        data: null,
        error: { message: result?.errorMessage }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      data: null,
      error: { message: error.message || 'An unexpected error occurred' }
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPasswordService(token, newPassword);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: { user_id: result.user._id, email: result.user.email },
        error: null
      });
    } else {
      res.status(400).json({
        success: false,
        data: null,
        error: { message: result.errorMessage }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      data: null,
      error: { message: error.message || 'An unexpected error occurred' }
    });
  }
};

// Get Users with Pagination & Search
export const getUsersBySearch = async (req, res) => {

  try {
    let { start, limit, search } = req.query;
    start = parseInt(start) || 0;
    limit = parseInt(limit) || 10;
    search = search ? search.trim() : "";

    const { users } = await getUsersBySearchService(start, limit, search);

    res.status(200).json({
      success: true,
      data: users,
      error: ''
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
}



