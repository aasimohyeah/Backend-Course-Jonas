const fs = require('fs');
const express = require('express');
const app = express();
//middleware
app.use(express.json());
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

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    //jsend format used below
    status: 'success',
    results: tours.length, //additional field
    data: {
      tours: tours, //2nd tours is json.parsed file above, 1st tours is from url /api/v1/tours
    },
  });
});

app.post('/api/v1/tours', (req, res) => {
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
});

app.get('/api/v1/tours/:id', (req, res) => {
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
});

app.patch('/api/v1/tours/:id', (req, res) => {
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
});

app.delete('/api/v1/tours/:id', (req, res) => {
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
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
