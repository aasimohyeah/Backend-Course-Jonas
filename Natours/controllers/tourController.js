const fs = require('fs');
const Tour = require('./../models/tourModel.js');

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    //BUILD QUERY
    //1. FILTERING
    const queryObj = { ...req.query }; // ... splits all parameters in the url, {} makes them in an obj
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //2. ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // regex used here

    const query = Tour.find(JSON.parse(queryStr));
    /*
    const tours = await Tour.find({
      duration: 5,
      difficulty: 'easy',
    });*/

    //EXECUTE QUERY
    const tours = await query;

    //SEND RESPONSE
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
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour, //2nd one is tour variable from above
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
