//Everything related to express is in app.js file
const path = require('path'); //used for manipulating path names
const express = require('express');

const app = express();

//PUG setup
//Pug templates are called 'views' in express
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//morgan returns info regarding the type of request made, error code etc.
//eg : GET /api/.. 404 500ms
const morgan = require('morgan'); //http logger midleware

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controllers/errorController.js');
const tourRouter = require('./routes/tourRoutes.js');
const userRouter = require('./routes/userRoutes.js');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

//1.global middlewares
//Serving static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

//Set security HTTP headers
app.use(helmet());

//Development logging
if (process.env.NODE_ENV === 'development') {
  //returns details about the request; eg : GET /api/.. 404 500ms
  app.use(morgan('dev')); //'dev' is a predefined parameter for morgan, we didnt set it
}

//Limit requests from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, try again in 1 hour',
});
app.use('/api', limiter);

//Body parser: it reads data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against XSS
app.use(xss());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

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

//2.routes

//pug routes
//shifted to viewRoutes.js
app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//handling unhandled/undefined routes
//app.all is a routing function
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

//Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;

//3.server start
//moved to server.js
