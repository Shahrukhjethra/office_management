const path = require ('path');
const express = require ('express');
const dotenv = require ('dotenv');
const morgan = require ('morgan');
const colors = require ('colors');

const mongoSanitize = require ('express-mongo-sanitize');
const helmet = require ('helmet');
const xss = require ('xss-clean');
const rateLimit = require ('express-rate-limit');
const hpp = require ('hpp');
const cors = require ('cors');
const errorHandler = require ('./middleware/error');
const connectDB = require ('./config/db');
const routePath = path.dirname(process.mainModule.filename)
const bodyParser = require('body-parser');
// Load env vars
dotenv.config ({path: './config/config.env'});

// Connect to database
connectDB ();

// Route files
const company = require('./routes/company');
const employee = require('./routes/employee');

const app = express ();

// Body parser

app.use(bodyParser.urlencoded({ extended: false }))

app.use (express.json ());





//app.use(express.urlencoded({ extended: true }));
// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use (morgan ('dev'));
}



// Sanitize data
app.use (mongoSanitize ());

// Set security headers
app.use (helmet ());

// Prevent XSS attacks
app.use (xss ());

// Rate limiting
const limiter = rateLimit ({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use (limiter);

// Prevent http param pollution
app.use (hpp ());

// Enable CORS
app.use (cors ());

// Set static folder
app.use (express.static (path.join (__dirname, 'public')));

// set view path 
app.set('views', path.join(routePath, '/views'));  

// Mount routers
//app.use ('/api/v1/users', users);

app.use('/company', company);
app.use('/employee', employee);

app.use (errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen (
  PORT,
  console.log (
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on ('unhandledRejection', (err, promise) => {
  console.log (`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
