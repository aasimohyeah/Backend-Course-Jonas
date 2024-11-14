//Application setup and server connection done here
//Everything related to server is in server.js file

const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION. Shutting down application...');
  console.log(err.name, err.message);
  process.exit(1); //0-success, 1-uncalled exception
});

dotenv.config({ path: './config.env' }); //loads variables from a .env file to process.env

const app = require('./app');

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

const port = process.env.PORT || 3000; //process.env.PORT defined in config.env
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION. Shutting down application...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1); //0-success, 1-uncalled exception
  });
});
