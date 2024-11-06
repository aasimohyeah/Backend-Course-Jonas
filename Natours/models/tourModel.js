const mongoose = require('mongoose');
const slugify = require('slugify');
//Custom Validator package(from npm) for String manipulation below
const validator = require('validator');

// Mongoose Schema (its like a blueprint/class for the model)
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Error: Missing name'], //this is a Validator
      unique: true, //instruction for name string to be unique
      trim: true,
      maxlength: [40, 'Name should be less than 40 chars'],
      minlength: [10, 'Name should be more than 40 chars'],
      //validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    slug: String,
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
      enum: {
        //enum means only given types of values allowed in difficulty
        values: ['easy', 'medium', 'difficult'],
        message: 'easy, medium, hard only',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5, //default value
      min: [1, 'Rating should be above 1.0'],
      max: [5, 'Rating should be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0, //default value
    },
    price: {
      type: Number,
      required: [true, 'Error: Missing price'],
    },
    priceDiscount: {
      type: Number,
      //Custom Validator
      validate: {
        validator: function (val) {
          //If a new doc is created/current doc is updated,
          //this will still point to original doc and not new one
          return val < this.price;
        },
        message: 'Discount price {VALUE} should be less than regular price',
      },
    },
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
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//Virtual Property(i.e schema property that user can define)
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Mongoose middlewares->
//1.DOCUMENT MIDDLEWARE (used for data manipulation)
//pre document middleware: it runs before .save() & .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.pre('save', (next) => {
  //console.log('Will save document');
  next();
});
//post document middleware: it runs after .save() & .create()
tourSchema.post('save', (doc, next) => {
  //console.log(doc);
  next();
});

//2.QUERY MIDDLEWARE
//pre middleware
//tourSchema.pre('find', (next) => { <- Normal non regex syntax

//Below we use normal function instead of arrow becuase this keyword dont work with arrow
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});
tourSchema.pre(/^find/, (docs, next) => {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
});

//3.AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', (next) => {
  //inserting a $match condition at top of pipeline using unshift
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
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
