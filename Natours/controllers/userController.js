const fs = require('fs');
const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`), //tours-simple.json file accessed here
);

exports.getAllUsers = factory.getAll(User);

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   //SEND RESPONSE
//   res.status(200).json({
//     //jsend format used below
//     status: 'success',
//     results: users.length, //additional field
//     data: {
//       users: users, //2nd tours is tours variable above, 1st tours is from url /api/v1/tours
//     },
//   });
// });

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1. Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400,
      ),
    );
  }

  //2. Filter out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  //3. Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

//This function does not delete entry from the db, it only hides it by setting active
//to false, which gets checked beforehand by find middleware (.pre)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = factory.getOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined. Use /signup instead',
  });
};

//Do not update passwords with .updateUser, because findByIdAndUpdate
//does not run the middleware
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
