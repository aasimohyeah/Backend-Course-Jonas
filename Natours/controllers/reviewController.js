const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId }; //filter will be used below
  }

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user.id;
  }

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

// exports.getReview = catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.body.id);

//   //null is a falsy value
//   if (!review) {
//     return new AppError('Review not found', 404);
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       review,
//     },
//   });
// });
