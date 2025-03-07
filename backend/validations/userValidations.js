import CustomException from '../exceptionHandling/CustomException.js';
export const validateUserData = (userData) => {
  const { first_name, last_name, email, password } = userData;
  let errorMessage = '';

  // Validate first_name and last_name
  if (!/^[A-Za-z]/.test(first_name) || first_name.length > 35) {
    errorMessage += 'First name must start with an alphabet and be less than 35 characters. ';
  }
  if (!/^[A-Za-z]/.test(last_name) || last_name.length > 35) {
    errorMessage += 'Last name must start with an alphabet and be less than 35 characters. ';
  }

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    errorMessage += 'Invalid email format. ';
  }

  // Validate password
  if (!(/[A-Za-z]/.test(password) && /[0-9]/.test(password) && /[!#$%^&*(),.?":{}|<>]/.test(password))) {
    errorMessage += 'Invalid Password. Password must contain letters, numbers, and special characters. ';
  }

  if (errorMessage.length > 0) throw new CustomException(errorMessage, 400);
};