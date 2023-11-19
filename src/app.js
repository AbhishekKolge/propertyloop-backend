require('dotenv').config();
require('express-async-errors');

const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const cloudinary = require('cloudinary').v2;

const whitelist = [process.env.FRONT_END_ORIGIN];

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const connectDB = require('./db/connect');

const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

const authRouter = require('./routes/authRoutes');
const propertyRouter = require('./routes/propertyRoutes');
const applicationRouter = require('./routes/applicationRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(xss());
app.use(express.json());
app.use(
  mongoSanitize({
    allowDots: true,
  })
);
app.use(cookieParser(process.env.JWT_SECRET));
const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = {
      origin: req.header('Origin'),
      optionsSuccessStatus: 204,
      credentials: true,
    };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};
app.use(cors(corsOptionsDelegate));
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(morgan('tiny'));
// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000,
//     max: 60,
//   })
// );

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/property', propertyRouter);
app.use('/api/v1/application', applicationRouter);
app.use('/api/v1/users', userRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (err) {
    console.log(`Server could not start with error: ${err.message}`);
  }
};

start();
