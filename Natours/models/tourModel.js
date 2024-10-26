const mongoose = require('mongoose');

// Mongoose Schema (its like a blueprint/class for the model)
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Error: Missing name'],
    unique: true, //instruction for name string to be unique
  },
  rating: {
    type: Number,
    default: 4.5, //default value
  },
  price: {
    type: Number,
    required: [true, 'Error: Missing price'],
  },
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
