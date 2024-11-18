const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel.js');
const catchAsync = require('./../utils/catchAsync.js');
const AppError = require('./../utils/appError.js');

// const signToken = (id) => {
//   return jwt.sign({ id: id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRES_IN,
//   });
// };
const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  //payload,secretKey parameters passed below
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  //const email=req.body.email
  //const password=req.body.password
  //Written below in simpler way
  const { email, password } = req.body;

  //1. Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Provide email and password', 400));
  }

  //2. Check if user exists and password is correct
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  //3. If everything ok, send token to client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1. Getting token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    //Authorization is name(key value) of the header
    //'Bearer' is written before any headers in the url as a convention
    token = req.headers.authorization.split(' ')[1];
    //^getting the text after Bearer in the header value
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access', 401),
    );
  }

  //2. Verification of JWT token

  //Promisification is the process of converting a function that uses callbacks
  //into a function that returns a promise.
  //jwt.verify is a fn but is being promsified so it is in brackets before fn parameters
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //decoded- contains body with {id,iat,exp} iat-issued at; exp- expiry

  //3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User belonging to token no longer exists', 401));
  }

  //4. Check if user changed password after JWT token was issued
  //'iat' means issued at
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401),
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

//(...roles) creates an array of data contained in roles variable
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //eg for reference: roles ['admin', 'lead-guide]; role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403),
      );
    }
    next();
  };

exports.forgotPassword = (req, res, next) => {};

exports.resetPassword = (req, res, next) => {};
