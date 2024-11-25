const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   //SEND RESPONSE
//   res.status(200).json({
//     //jsend format used below
//     status: 'success',
//     results: tours.length, //additional field
//     data: {
//       tours: tours, //2nd tours is tours variable above, 1st tours is from url /api/v1/tours
//     },
//   });
// });

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// exports.getTour = catchAsync(async (req, res, next) => {
//   /*
//   console.log(req.params);
//   const id = req.params.id * 1; //convert string to number by multiplying with 1
//   console.log(id);
//   const tour = tours.find((el) => el.id === id);*/

//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   //(NEWER)^.populate('reviews') for virtual populate
//   //^ .populate('guides') was added above to fill data in REFERENCED field
//   //^ moved to tourModel in a pre middleware

//   if (!tour) {
//     return next(new AppError('No tour find with that ID', 404));
//   }

//   res.status(200).json({
//     //jsend format used below
//     status: 'success',
//     data: {
//       tours: tour,
//     },
//   });
// });

//next() is needed below in the parameters, so that error can be sent to the globalErrorHandler using it
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body); //req.body will contain data that came as response from the post request

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('No tour find with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: tour, //2nd one is tour variable from above
//     },
//   });
// });

exports.deleteTour = factory.deleteOne(Tour); //passed the tour model as parameter

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour find with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

//MongoDB Aggregation pipelines can be used to get insights from our data, eg: avg, total, max, min etc
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, //to sort below values acc to difficulty
        numTours: { $sum: 1 }, //increment by 1 for every entry that go through pipeline
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, //1 here means ascending order
    },
    // {
    //   $match: { _id: { $ne: 'easy' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats, //2nd one is stats variable from above
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0, //0 means dont show _id
      },
    },
    {
      $sort: { numTourStarts: -1 }, //-1 means descending
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan, //2nd one is plan variable from above
    },
  });
});

// export.<fn_name> is used because multiple functions are being exported
// module.exports is used when only one function is exported
