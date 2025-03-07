
class CustomException extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;

    // Capture the stack trace (useful for debugging)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomException;
