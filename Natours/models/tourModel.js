const mongoose = require('mongoose');

// Mongoose Schema (its like a blueprint/class for the model)
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Error: Missing name'],
    unique: true, //instruction for name string to be unique
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'Error: Missing duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'Error: Specify group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'Error: Specify difficulty'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5, //default value
  },
  ratingsQuantity: {
    type: Number,
    default: 0, //default value
  },
  price: {
    type: Number,
    required: [true, 'Error: Missing price'],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true, //for whitespace trim
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'Error: Missing description'],
  },
  imageCover: {
    type: String,
    required: [true, 'Error: Missing cover image'],
  },
  images: [String], //an array of strings
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
});
// Mongoose model
const Tour = mongoose.model('Tour', tourSchema);

/*
//for testing the schema
const testTour = new Tour({
  name: 'The forest hiker',
  price: 4.7,
  price: 497,
});

testTour
  .save()
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.log('Error: ', err);
  });
*/

module.exports = Tour;
