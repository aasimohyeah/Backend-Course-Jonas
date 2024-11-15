class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;

    //checking if status code starts with 4
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    this.isOperational = true; //To classify this as an Operational error

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
