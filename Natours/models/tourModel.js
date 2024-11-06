const mongoose = require('mongoose');
const slugify = require('slugify');

// Mongoose Schema (its like a blueprint/class for the model)
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Error: Missing name'],
      unique: true, //instruction for name string to be unique
      trim: true,
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
//pre document middleware: it runs after .save() & .create()
tourSchema.post('save', (doc, next) => {
  //console.log(doc);
  next();
});

//2.QUERY MIDDLEWARE
//pre middleware
//tourSchema.pre('find', (next) => {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});
//post middleware
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
