const fs = require('fs');
const express = require('express');
const { create } = require('domain');
const app = express();
const morgan = require('morgan');

//1.middleware
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
  console.log('Custom Middleware');
  next();
});
/*
app.get('/', (req, res) => {
    res.status(200).send('Hello from the server');
});

app.post('/', (req, res) => {
    res.send('You can post to this url');
});
*/

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`) //tours-simple.json file accessed here
);

//2.route handlers
const getAllTours = (req, res) => {
  res.status(200).json({
    //jsend format used below
    status: 'success',
    results: tours.length, //additional field
    data: {
      tours: tours, //2nd tours is json.parsed file above, 1st tours is from url /api/v1/tours
    },
  });
};

const getTour = (req, res) => {
  //console.log(req.params);
  const id = req.params.id * 1; //convert string to number by multiplying with 1
  //console.log(id);

  if (id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  const tour = tours.find((el) => el.id === id);
  res.status(200).json({
    //jsend format used below
    status: 'success',
    data: {
      tours: tour,
    },
  });
};

const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Placeholder data>',
    },
  });
};

const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined yet',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined yet',
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined yet',
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined yet',
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined yet',
  });
};

//3.routes
/*
//v1 stands for version 1
app.get('/api/v1/tours', getAllTours);
app.get('/api/v1/tours/:id', getTour);
app.post('/api/v1/tours', createTour);
app.patch('/api/v1/tours/:id', updateTour);
app.delete('/api/v1/tours/:id', deleteTour);
*/
//^above code has been refactored below so commented out for better understanding

app.route('/api/v1/tours').get(getAllTours).post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.route('/api/v1/users').get(getAllUsers).post(createUser);

app.route('/api/v1/user/:id').get(getUser).patch(updateUser).delete(deleteUser);

//4.server start
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
