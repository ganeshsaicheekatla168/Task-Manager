import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    maxlength: 35,
    validate: {
      validator(value) {
        return /^[A-Za-z]/.test(value);
      },
      message: "First name must start with an alphabet."
    }
  },
  last_name: {
    type: String,
    required: true,
    maxlength: 35,
    validate: {
      validator(value) {
        return /^[A-Za-z]/.test(value);
      },
      message: "Last name must start with an alphabet."
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdDate: {
    type: String,
    default: () => new Date().toISOString() // UTC format for created date
  },
  updatedDate: {
    type: String,
    default: () => new Date().toISOString() // UTC format for updated date
  }
});



// Create the model
const User = mongoose.model('User', userSchema, 'users');

// Export the model
export default User;
