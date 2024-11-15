const fs = require('fs');
const User = require('./../models/userModel.js');

const catchAsync = require('./../utils/catchAsync.js');

exports.tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`), //tours-simple.json file accessed here
);

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  //SEND RESPONSE
  res.status(200).json({
    //jsend format used below
    status: 'success',
    results: users.length, //additional field
    data: {
      users: users, //2nd tours is tours variable above, 1st tours is from url /api/v1/tours
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined yet',
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined yet',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined yet',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined yet',
  });
};
