const fs = require('fs');
const Tour = require('./../models/tourModel.js');

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();

    res.status(200).json({
      //jsend format used below
      status: 'success',
      results: tours.length, //additional field
      data: {
        tours: tours, //2nd tours is tours variable above, 1st tours is from url /api/v1/tours
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  /*
  console.log(req.params);
  const id = req.params.id * 1; //convert string to number by multiplying with 1
  console.log(id);
  const tour = tours.find((el) => el.id === id);*/
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      //jsend format used below
      status: 'success',
      data: {
        tours: tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body); //req.body will contain data that came as response from the post request

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent',
    });
  }
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Placeholder data>',
    },
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
