class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //BUILD QUERY
    //1A. FILTERING
    const queryObj = { ...this.queryString }; // ... splits all parameters in the url, {} makes them in an obj
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1B. ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // regex used here

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    //2. SORTING
    //we are checking below if sort parameter exists in req.query
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); //split using ',' join back using ' '
      this.query = this.query.sort(sortBy);
    } else {
      //this block is executed if there is no sort parameters in url
      this.query = this.query.sort('-createdAt'); // sorted acc to 'createdAt' field in the db
    }
    return this;
  }

  limitFields() {
    //3. FIELD LIMITING
    //field limiting is used to hide/prevent certain fields from being sent to user
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    //4. PAGINATION
    const page = this.queryString.page * 1 || 1; // *1 to convert string to int, || define limit
    const limit = this.queryString.limit * 1 || 100; // *1 to convert string to int, || define limit
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
