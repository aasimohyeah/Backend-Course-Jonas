const Tour = require('./../models/tourModel.js');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    /*
    console.log(req.query); // shows all parameters included in the URL
    
    //BUILD QUERY
    //1A. FILTERING
    const queryObj = { ...req.query }; // ... splits all parameters in the url, {} makes them in an obj
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1B. ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // regex used here

    let query = Tour.find(JSON.parse(queryStr));
    
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy',
    // });
    
    //2. SORTING
    //we are checking below if sort parameter exists in req.query
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' '); //split using ',' join back using ' '
      query = query.sort(sortBy);
    } else {
      //this block is executed if there is no sort parameters in url
      query = query.sort('-createdAt'); // sorted acc to 'createdAt' field in the db
    }
    
    //3. FIELD LIMITING
    //field limiting is used to hide/prevent certain fields from being sent to user
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    //4. PAGINATION
    const page = req.query.page * 1 || 1; // *1 to convert string to int, || define limit
    const limit = req.query.limit * 1 || 100; // *1 to convert string to int, || define limit
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }*/

    //EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

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

//MongoDB Aggregation pipelines can be used to get insights from our data, eg: avg, total, max, min etc
exports.getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
