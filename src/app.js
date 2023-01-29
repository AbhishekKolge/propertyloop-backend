//environment variables
require("dotenv").config();
//catch all async errors
require("express-async-errors");

//third party packages
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

//upload file configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//database connection function
const connectDB = require("./db/connect");

//custom middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

//routers
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const jobCategoryRouter = require("./routes/jobCategoryRoutes");
const jobRouter = require("./routes/jobRoutes");
const applicationRouter = require("./routes/applicationRoutes");

//initialize express app
const app = express();

//security middleware
//helps with ips behind proxies
app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(
  cors({
    origin: process.env.FRONT_END_ORIGIN,
    optionsSuccessStatus: 200,
  })
);
app.use(helmet());
app.use(xss());
app.use(
  mongoSanitize({
    allowDots: true,
  })
);

app.use(express.json());
app.use(express.static("public"));
//logging
app.use(morgan("tiny"));

app.use(
  fileUpload({
    useTempFiles: true,
  })
);

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/job-categories", jobCategoryRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/application", applicationRouter);

//custom middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    //connect to database
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (err) {
    console.log(`Server could not start with error: ${err.message}`);
  }
};

//initialize server
start();
