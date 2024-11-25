//Factory function is a function that returns another function
//Here for eg. Everything after 'Model =>' is returned

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document find with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //findByIdAndUpdate causes middleware to not run
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document find with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body); //req.body will contain data that came as response from the post request

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    /*
    console.log(req.params);
    const id = req.params.id * 1; //convert string to number by multiplying with 1
    console.log(id);
    const tour = tours.find((el) => el.id === id);*/

    let query = Model.findById(req.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
      //^.populate(popOptions) for virtual populate
    }
    const doc = await query;

    if (!doc) {
      return next(new AppError('No Document found with that ID', 404));
    }

    res.status(200).json({
      //jsend format used below
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
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

    //To allow for nested GET reviews on tour (hacky way)
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId }; //filter will be used below
    }
    //EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    //SEND RESPONSE
    res.status(200).json({
      //jsend format used below
      status: 'success',
      results: doc.length, //additional field
      data: {
        data: doc, //2nd tours is tours variable above, 1st tours is from url /api/v1/tours
      },
    });
  });
