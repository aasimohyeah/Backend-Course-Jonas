//Application setup and server connection done here
//Everything related to server is in server.js file

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' }); //loads variables from a .env file to process.env

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  });

// Mongoose Schema (its like a blueprint/class for the model)
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Error: Missing name'],
    unique: true, //instruction for name string to be unique
  },
  rating: {
    type: Number,
    default: 4.5, //default value
  },
  price: {
    type: Number,
    required: [true, 'Error: Missing price'],
  },
});
// Mongoose model
const Tour = mongoose.model('Tour', tourSchema);

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

const port = process.env.PORT || 3000; //process.env.PORT defined in config.env
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
