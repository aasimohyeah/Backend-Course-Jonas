class AppError extends Error {
  //Constructor is called each time a new object of this class is created
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;

    //checking if status code starts with 4
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    this.isOperational = true; //To classify this as an Operational error
    //All errors will have isOperational property as true

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
