const AppError = require('./../utils/appError.js');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: '${value}' Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError('Invalid token. Please log in again', 401);
//^no need to type return above cuz ES6 feature

const handleJWTExpiredError = (err) =>
  new AppError('Token expired. Please log in again', 401);
//^no need to type return above cuz ES6 feature

const sendErrorDev = (err, req, res) => {
  //API
  // req.originalUrl returns the url minus the host
  if (req.originalUrl.startsWith('./api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //RENDERED WEBSITE
  console.error('ERROR', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went Wrong',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //1) API
  if (req.originalUrl.startsWith('/api')) {
    //Operational error, trusted: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //Programming error or other unknown error: dont show error details to client
    //1.Log error
    console.error('ERROR', err);

    //2.Send generic message
    return res.status(500).json({
      status: 'error',
      message: '1Something went wrong!',
    });
  }

  //2) RENDERED WEBSITE
  //Operational error, trusted: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: '2Something went Wrong!',
      msg: err.message,
    });
  }
  //Programming error or other unknown error: dont show error details to client
  //1.Log error
  console.error('ERROR', err);

  //2.Send generic message
  return res.status(err.statusCode).render('error', {
    title: '3Something went Wrong!',
    msg: 'Please try again later',
  });
};

//GLOBAL ERROR HANDLING MIDDLEWARE HAS 4 PARAMETERS:
//(err,req,res,next).
//THATS HOW EXPRESS KNOWS
//THAT IT IS AN ERROR HANDLING MIDDLEWARE
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  //console.log('XXX', err.name);
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    //console.log('production yes');
    let error = { ...err }; //... means node destructuring: i.e unpacking all values in an array
    //console.log('YYY', error);
    error.message = err.message;

    //Handling some errors below which have defined names. eg:CastError
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }
    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(error);
    }

    sendErrorProd(error, req, res);
  }
};
