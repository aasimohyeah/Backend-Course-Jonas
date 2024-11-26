const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel.js');
//Custom Validator package(from npm) for String manipulation below
const validator = require('validator'); // no use of this here

// Mongoose Schema (its like a blueprint/class for the model)
const tourSchema = new mongoose.Schema(
  {
    //1.SCHEMA DEFINITION
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
    //Geospatial data (GeoJSON format)
    //EMBEDDED DOCUMENT
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    //for EMBEDDING
    //guides: Array,

    //for REFERENCING
    guides: [
      {
        type: mongoose.Schema.ObjectId, //means data type is mongodb id's
        ref: 'User', //referencing User model here
      },
    ],
  },
  //2.SCHEMA OPTIONS
  {
    //when result of schema get outputted as json, set virtual property to true
    toJSON: { virtuals: true },
    //when result of schema get outputted as Object, set virtual property to true
    toObject: { virtuals: true },
  },
);

//INDEX SETTING
//tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });

//Virtual Property(i.e schema property that user can define)
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//Virtual POPULATE
tourSchema.virtual('reviews', {
  ref: 'Review', //name of model to be referenced
  foreignField: 'tour', //name of the field in the other model(Review)
  //where reference to current model(Tour) is stored
  localField: '_id', //name of field which we need from this current model
});

//Mongoose middlewares->
//1.DOCUMENT MIDDLEWARE (used for data manipulation)
//pre document middleware: it runs before .save() & .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//CODE FOR EMBEDDING guides DATA into SCHEMA
/*
tourSchema.pre('save', async function (next) {
  //promises being returned in below line
  const guidesPromises = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});*/

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
  //^find regex used above, so that all functions/commands with 'find' in the name are detected
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  //^regex for all functions/commands with find in the name
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt', //dont show these in the entry
  });
  //^ .populate('guides') was added above to fill data in REFERENCED field
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

//3.AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  //inserting a $match condition at start of pipeline using unshift
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// Mongoose model
// Mongoose models have a convention to have name with first letter as capital
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
